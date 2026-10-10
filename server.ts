import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini AI client with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const DEFAULT_MODEL = 'gemini-3.8-flash';

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Chat completion endpoint for persona / bot response
app.post('/api/chat', async (req, res) => {
  try {
    const { persona, messages, roomContext, currentUser, customInstruction } = req.body;

    if (!persona || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid payload: persona and messages are required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Graceful fallback if API key is temporarily absent
      const fallbackReplies: Record<string, string> = {
        ai: `Hello! I am ${persona.name}. I'm here in the channel with everyone! Let me know what you'd like to explore, build, or discuss together.`,
        human: `Hey ${currentUser?.name || 'there'}! Sounds interesting. What does everyone else in the group think about this?`,
      };
      return res.json({
        reply: persona.isAi ? fallbackReplies.ai : fallbackReplies.human,
        sender: persona,
        timestamp: new Date().toISOString(),
      });
    }

    // Build context prompt
    const recentMessages = messages.slice(-12);
    const chatLog = recentMessages
      .map((m: any) => `[${m.senderName} (${m.isAi ? 'AI Companion' : 'Community Member'})]: ${m.text}`)
      .join('\n');

    let systemPrompt = '';
    if (persona.isAi) {
      systemPrompt = `You are ${persona.name}, an AI companion in an active social chatroom with real people and AI peers.
Bio: ${persona.bio || ''}
Role: ${persona.role || 'AI Assistant'}
Tone/Personality: ${persona.personality || 'friendly, intelligent, engaging'}
Room: "${roomContext?.name || 'General'}" (Topic: ${roomContext?.topic || 'Open discussion'})
The user chatting with you is ${currentUser?.name || 'User'} (@${currentUser?.handle || 'user'}).

Instructions:
- Respond naturally as ${persona.name}. Keep your response concise (1-3 paragraphs max) unless an in-depth breakdown is asked.
- You can format code with markdown code blocks if discussing technical topics.
- Feel free to acknowledge both human members and other AI companions in the room.
- Be genuine, warm, and helpful. Never start with "As an AI...". Speak directly in character.`;
    } else {
      systemPrompt = `You are roleplaying as ${persona.name}, a human member in this social chat community.
Bio: ${persona.bio || ''}
Role/Profession: ${persona.role || 'Community Member'}
Personality/Tone: ${persona.personality || 'casual, enthusiastic, witty'}
Room: "${roomContext?.name || 'General'}" (Topic: ${roomContext?.topic || 'Open discussion'})
The current user speaking is ${currentUser?.name || 'User'} (@${currentUser?.handle || 'user'}).

Instructions:
- Write like a real person in a modern group chat (Slack / Discord / Telegram style).
- Keep it relatively brief (1 to 4 sentences), casual, authentic, and human.
- You can use natural punctuation, slang, emojis, or conversational humor where fitting.
- Never claim to be an AI model or language model. You are a real community member sharing your perspective.`;
    }

    if (customInstruction) {
      systemPrompt += `\nAdditional instruction: ${customInstruction}`;
    }

    const fullPrompt = `${systemPrompt}

Here is the recent conversation history in the room:
---
${chatLog}
---

Now respond as ${persona.name}. Provide ONLY your response text without prefixing your name.`;

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: fullPrompt,
    });

    const replyText = response.text?.trim() || `Hey! Good point, let's keep discussing.`;

    return res.json({
      reply: replyText,
      sender: persona,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate response',
      reply: `Sorry, I hit a slight connection hiccup. Let's try again in a second!`,
    });
  }
});

// Ambient chime-in endpoint: picks one or two participants in the room to react to the chat
app.post('/api/ambient', async (req, res) => {
  try {
    const { roomContext, messages, candidates, currentUser } = req.body;

    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ error: 'No candidate personas provided' });
    }

    // Pick a candidate who didn't send the very last message
    const lastSenderId = messages?.[messages.length - 1]?.senderId;
    const eligible = candidates.filter((c: any) => c.id !== lastSenderId && c.id !== currentUser?.id);
    const chosenPersona = eligible.length > 0
      ? eligible[Math.floor(Math.random() * eligible.length)]
      : candidates[0];

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        speaker: chosenPersona,
        reply: `That's an interesting point! What does everyone else think?`,
      });
    }

    const recentMessages = (messages || []).slice(-8);
    const chatLog = recentMessages
      .map((m: any) => `[${m.senderName}]: ${m.text}`)
      .join('\n');

    const prompt = `You are ${chosenPersona.name} (${chosenPersona.isAi ? 'an AI bot' : 'a human community member'}) in a chat room "${roomContext?.name}".
Personality: ${chosenPersona.personality}
Role: ${chosenPersona.role}
Recent chat:
${chatLog}

Generate a short, natural chime-in reaction (1-3 sentences) replying to the ongoing conversation or adding a fresh perspective.
Keep it authentic to your character. Provide ONLY the message content.`;

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
    });

    const replyText = response.text?.trim() || "Totally agree with that!";

    return res.json({
      speaker: chosenPersona,
      reply: replyText,
    });
  } catch (err: any) {
    console.error('Error in /api/ambient:', err);
    return res.status(500).json({ error: err.message || 'Ambient generation failed' });
  }
});

// Channel Discussion Summary Endpoint
app.post('/api/summarize', async (req, res) => {
  try {
    const { roomName, messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages are required to summarize' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        summary: `### Room Summary: ${roomName}\n- Active discussion with ${messages.length} messages.\n- Topics covered collaborative ideas between people and AI companions.`,
      });
    }

    const chatText = messages
      .slice(-25)
      .map((m: any) => `${m.senderName}: ${m.text}`)
      .join('\n');

    const prompt = `You are an AI community assistant in the chat room "${roomName}".
Analyze the following conversation between people and AI members:
${chatText}

Generate a crisp, beautifully formatted summary with:
1. 📌 **Key Topics Discussed** (2-3 bullet points)
2. 💡 **Main Insights or Shared Ideas**
3. 🎯 **Next Actions or Questions Raised**
Keep it engaging and concise.`;

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
    });

    return res.json({
      summary: response.text?.trim() || 'Summary could not be generated at this time.',
    });
  } catch (err: any) {
    console.error('Error in /api/summarize:', err);
    return res.status(500).json({ error: err.message || 'Failed to summarize' });
  }
});

// Icebreakers / Topic Suggestions Endpoint
app.post('/api/topics', async (req, res) => {
  try {
    const { roomName, topic } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        topics: [
          'What is a skill you think AI will help humans master 10x faster?',
          'If you could live in any sci-fi universe for one week, which would it be?',
          'What was the best creative breakthrough you had this year?',
        ],
      });
    }

    const prompt = `Generate 4 thought-provoking, fun, and engaging conversation starter questions for a room named "${roomName}" with topic "${topic}".
Each prompt should encourage debate and dialogue between humans and AI companions.
Return ONLY a valid JSON array of 4 strings, e.g. ["Topic 1?", "Topic 2?", "Topic 3?", "Topic 4?"] without markdown code fences.`;

    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
    });

    let text = response.text?.trim() || '[]';
    if (text.startsWith('```json')) text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    else if (text.startsWith('```')) text = text.replace(/^```\s*/, '').replace(/\s*```$/, '');

    try {
      const parsed = JSON.parse(text);
      return res.json({ topics: parsed });
    } catch {
      return res.json({
        topics: [
          `How will human-AI collaboration reshape our everyday creative workflows?`,
          `What's an underrated idea or tool that more people should try?`,
          `If you had an AI twin to handle 50% of your routine, what would you spend your time doing?`,
          `What's the most fascinating concept you've learned recently?`,
        ],
      });
    }
  } catch (err: any) {
    console.error('Error in /api/topics:', err);
    return res.status(500).json({
      topics: [
        'What project is everyone currently working on?',
        'How do you best collaborate between human teammates and AI agents?',
      ],
    });
  }
});

// Start server with Vite middleware in development or static in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nexus AI Chat server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
