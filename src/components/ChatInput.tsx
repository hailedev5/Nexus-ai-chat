import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Smile,
  X,
  Bot,
  User,
  Sparkles,
  Image as ImageIcon,
  Mic,
  MicOff,
} from 'lucide-react';
import { Persona, Message } from '../types';

interface ChatInputProps {
  onSendMessage: (text: string, attachmentUrl?: string) => void;
  participants: Persona[];
  replyingTo: Message | null;
  onCancelReply: () => void;
  typingParticipant: Persona | null;
  isStreaming: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  participants,
  replyingTo,
  onCancelReply,
  typingParticipant,
  isStreaming,
}) => {
  const [inputText, setInputText] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionSelectedIndex, setMentionSelectedIndex] = useState(0);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Filter mentions
  const filteredParticipants = participants.filter(
    (p) =>
      p.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
      p.handle.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  // Check for speech recognition support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsRecording(false);
        };

        recognition.onerror = () => {
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech-to-text is not supported in this browser version. You can type normally!');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputText(value);

    // Check if the user just typed '@' or is typing a mention
    const cursor = e.target.selectionStart;
    const textBeforeCursor = value.slice(0, cursor);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setShowMentions(true);
      setMentionQuery(mentionMatch[1]);
      setMentionSelectedIndex(0);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (handle: string) => {
    if (!textareaRef.current) return;
    const cursor = textareaRef.current.selectionStart;
    const textBeforeCursor = inputText.slice(0, cursor);
    const textAfterCursor = inputText.slice(cursor);
    const updatedBefore = textBeforeCursor.replace(/@\w*$/, `@${handle} `);
    const nextText = updatedBefore + textAfterCursor;

    setInputText(nextText);
    setShowMentions(false);
    textareaRef.current.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions && filteredParticipants.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionSelectedIndex((prev) => (prev + 1) % filteredParticipants.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionSelectedIndex((prev) =>
          prev === 0 ? filteredParticipants.length - 1 : prev - 1
        );
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(filteredParticipants[mentionSelectedIndex].handle);
        return;
      }
      if (e.key === 'Escape') {
        setShowMentions(false);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!inputText.trim() && !attachmentUrl) return;
    onSendMessage(inputText.trim(), attachmentUrl ? attachmentUrl : undefined);
    setInputText('');
    setAttachmentUrl('');
    setShowAttachMenu(false);
    if (replyingTo) onCancelReply();
  };

  const addQuickPill = (handle: string) => {
    setInputText((prev) => {
      const prefix = prev.trim() ? `${prev.trim()} ` : '';
      return `${prefix}@${handle} `;
    });
    textareaRef.current?.focus();
  };

  return (
    <div className="p-3 bg-slate-900 border-t border-slate-800 shrink-0 relative">
      {/* Typing Indicator Bar */}
      {typingParticipant && (
        <div className="absolute -top-7 left-4 flex items-center gap-2 text-xs text-indigo-400 bg-slate-900/90 px-2.5 py-0.5 rounded-full border border-slate-800 shadow-sm animate-pulse">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
          <span>
            {typingParticipant.name} ({typingParticipant.isAi ? 'AI' : 'typing'}) is formulating a response...
          </span>
        </div>
      )}

      {/* Quoted Reply banner */}
      {replyingTo && (
        <div className="mb-2 px-3 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-lg flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2 truncate">
            <span className="text-indigo-400 font-semibold">Replying to @{replyingTo.senderHandle}:</span>
            <span className="truncate text-slate-400 italic">"{replyingTo.text}"</span>
          </div>
          <button
            onClick={onCancelReply}
            className="text-slate-400 hover:text-white p-0.5 rounded hover:bg-slate-700 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quick Mention Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-[11px]">
        <span className="text-slate-500 shrink-0 font-medium">Quick Tag:</span>
        {participants.slice(0, 5).map((p) => (
          <button
            key={p.id}
            onClick={() => addQuickPill(p.handle)}
            className="shrink-0 px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors flex items-center gap-1"
          >
            {p.isAi ? <Bot className="w-3 h-3 text-indigo-400" /> : <User className="w-3 h-3 text-emerald-400" />}
            <span>@{p.handle}</span>
          </button>
        ))}
      </div>

      {/* Autocomplete Mention Menu */}
      {showMentions && filteredParticipants.length > 0 && (
        <div className="absolute bottom-20 left-4 w-72 max-h-56 overflow-y-auto bg-slate-900 border border-slate-700 shadow-2xl rounded-xl p-1 z-30">
          <div className="px-2 py-1 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Mention Member or AI Bot
          </div>
          {filteredParticipants.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => insertMention(p.handle)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                idx === mentionSelectedIndex ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <img
                src={p.avatar}
                alt={p.name}
                className="w-5 h-5 rounded-full object-cover border border-slate-700"
              />
              <div className="min-w-0 flex-1 truncate">
                <span className="font-semibold">{p.name}</span>{' '}
                <span className="text-[11px] opacity-75">@{p.handle}</span>
              </div>
              {p.isAi ? (
                <span className="text-[9px] px-1 rounded bg-indigo-500/30 text-indigo-200">AI</span>
              ) : (
                <span className="text-[9px] px-1 rounded bg-slate-700 text-slate-300">Human</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Attachment popover */}
      {showAttachMenu && (
        <div className="mb-2 p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-200 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-indigo-400" /> Attach Image URL
            </span>
            <button
              onClick={() => setShowAttachMenu(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <input
            type="url"
            placeholder="Paste image URL (e.g. https://...)..."
            value={attachmentUrl}
            onChange={(e) => setAttachmentUrl(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
          {attachmentUrl && (
            <div className="w-16 h-16 rounded overflow-hidden border border-slate-600">
              <img src={attachmentUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      )}

      {/* Input container */}
      <div className="relative flex items-end gap-2 bg-slate-950 border border-slate-800 rounded-2xl p-2 focus-within:border-indigo-500/60 transition-colors shadow-sm">
        {/* Attach file / image button */}
        <button
          onClick={() => setShowAttachMenu(!showAttachMenu)}
          className={`p-2 rounded-xl transition-colors ${
            showAttachMenu || attachmentUrl
              ? 'text-indigo-400 bg-indigo-500/10'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="Attach image link"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Message room or @mention someone (e.g. @gemini or @sarah_design)..."
          rows={1}
          className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 resize-none max-h-32 min-h-[38px] py-1.5 focus:outline-none scrollbar-none leading-relaxed"
        />

        {/* Voice dictation button */}
        <button
          onClick={toggleRecording}
          className={`p-2 rounded-xl transition-colors ${
            isRecording
              ? 'text-rose-400 bg-rose-500/20 animate-pulse'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title={isRecording ? 'Stop listening' : 'Voice dictation'}
        >
          {isRecording ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={(!inputText.trim() && !attachmentUrl) || isStreaming}
          className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-30 disabled:hover:bg-indigo-600 transition-colors shadow-md shadow-indigo-600/20 flex items-center justify-center shrink-0"
          title="Send message (Enter)"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between mt-1 px-1 text-[11px] text-slate-500">
        <span>Use <strong>@</strong> to mention bots or people</span>
        <span>Enter to send • Shift+Enter for new line</span>
      </div>
    </div>
  );
};
