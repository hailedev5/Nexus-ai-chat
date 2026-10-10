/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  INITIAL_USER,
  INITIAL_PERSONAS,
  INITIAL_ROOMS,
  INITIAL_MESSAGES,
} from './data/initialData';
import { Room, Persona, Message, UserProfile } from './types';
import { Sidebar } from './components/Sidebar';
import { ChatHeader } from './components/ChatHeader';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { RoomInfoSidebar } from './components/RoomInfoSidebar';
import { UserProfileModal } from './components/Modals/UserProfileModal';
import { CreateRoomModal } from './components/Modals/CreateRoomModal';
import { CreatePersonaModal } from './components/Modals/CreatePersonaModal';
import { SummaryModal } from './components/Modals/SummaryModal';
import { TopicPickerModal } from './components/Modals/TopicPickerModal';
import { AddParticipantModal } from './components/Modals/AddParticipantModal';
import { MessageSquare, Menu, Users, Sparkles, Bot, ShieldAlert } from 'lucide-react';

export default function App() {
  // Core State
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER);
  const [personas, setPersonas] = useState<Persona[]>(INITIAL_PERSONAS);
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [currentRoomId, setCurrentRoomId] = useState<string>('room_lounge');
  const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);

  // Active Chat State
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [typingParticipant, setTypingParticipant] = useState<Persona | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isLivingMode, setIsLivingMode] = useState<boolean>(true);
  const [isAmbientActive, setIsAmbientActive] = useState<boolean>(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearchBar, setShowSearchBar] = useState<boolean>(false);

  // Layout Drawers
  const [showMobileSidebar, setShowMobileSidebar] = useState<boolean>(false);
  const [showInfoSidebar, setShowInfoSidebar] = useState<boolean>(false);

  // Modals
  const [showUserProfileModal, setShowUserProfileModal] = useState<boolean>(false);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState<boolean>(false);
  const [showCreatePersonaModal, setShowCreatePersonaModal] = useState<boolean>(false);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [showTopicPickerModal, setShowTopicPickerModal] = useState<boolean>(false);
  const [showAddParticipantModal, setShowAddParticipantModal] = useState<boolean>(false);

  // Summary & Topics Async State
  const [summaryText, setSummaryText] = useState<string>('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);
  const [topicOptions, setTopicOptions] = useState<string[]>([]);
  const [isGeneratingTopic, setIsGeneratingTopic] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentRoom = rooms.find((r) => r.id === currentRoomId) || rooms[0];

  // Participants in current room
  const currentParticipants = personas.filter((p) =>
    currentRoom.participantIds.includes(p.id)
  );

  const currentRoomMessages = messages[currentRoomId] || [];

  // Filter messages by search query if any
  const displayedMessages = searchQuery.trim()
    ? currentRoomMessages.filter(
        (m) =>
          m.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.senderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.senderHandle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentRoomMessages;

  // Auto-scroll to bottom of messages
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [currentRoomId]);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages[currentRoomId]?.length, typingParticipant]);

  // Handle User Sending a Message
  const handleSendMessage = async (text: string, attachmentUrl?: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      roomId: currentRoomId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderHandle: currentUser.handle,
      senderAvatar: currentUser.avatar,
      isAi: false,
      isCurrentUser: true,
      text,
      timestamp,
      reactions: [],
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            senderName: replyingTo.senderName,
            text: replyingTo.text,
          }
        : undefined,
      attachmentUrl,
    };

    // Update message state
    setMessages((prev) => ({
      ...prev,
      [currentRoomId]: [...(prev[currentRoomId] || []), userMsg],
    }));

    setReplyingTo(null);

    // Identify mentioned personas in the message text
    const lowerText = text.toLowerCase();
    const mentionedPersonas = currentParticipants.filter((p) =>
      lowerText.includes(`@${p.handle.toLowerCase()}`)
    );

    // Determine who should formulate responses
    let responderList: Persona[] = [];

    if (mentionedPersonas.length > 0) {
      responderList = mentionedPersonas;
    } else if (currentRoom.isDirectMessage) {
      // In DM, reply from the other participant
      const dmPersona = personas.find((p) => p.id === currentRoom.dmParticipantId);
      if (dmPersona) {
        responderList = [dmPersona];
      }
    } else {
      // In group channel, pick an appropriate respondent:
      // Priority 1: Gemini AI companion if present
      // Priority 2: Another member
      const gemini = currentParticipants.find((p) => p.isAi && p.handle === 'gemini');
      const otherAi = currentParticipants.find((p) => p.isAi && p.id !== gemini?.id);
      const humanPeer = currentParticipants.find((p) => !p.isAi);

      if (gemini) {
        responderList.push(gemini);
      } else if (otherAi) {
        responderList.push(otherAi);
      } else if (humanPeer) {
        responderList.push(humanPeer);
      }

      // If living mode is active and we have peers, queue a second chime-in
      if (isLivingMode && humanPeer && responderList[0]?.id !== humanPeer.id) {
        responderList.push(humanPeer);
      }
    }

    if (responderList.length === 0) return;

    // Trigger sequential responses with natural typing delays
    triggerSequentialResponses(responderList, [...(messages[currentRoomId] || []), userMsg]);
  };

  const triggerSequentialResponses = async (
    responderList: Persona[],
    chatHistory: Message[]
  ) => {
    setIsStreaming(true);

    let ongoingHistory = [...chatHistory];

    for (let i = 0; i < responderList.length; i++) {
      const responder = responderList[i];

      // Delay before typing begins (feels like a real conversational pause)
      await new Promise((r) => setTimeout(r, i === 0 ? 600 : 2200));

      setTypingParticipant(responder);

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            persona: responder,
            messages: ongoingHistory,
            roomContext: {
              id: currentRoom.id,
              name: currentRoom.name,
              topic: currentRoom.topic,
            },
            currentUser,
          }),
        });

        const data = await response.json();
        const replyText = data.reply || `Hey! That's a great thought.`;

        // Natural typing duration simulation based on text length
        const typingDelay = Math.min(Math.max(replyText.length * 15, 800), 2200);
        await new Promise((r) => setTimeout(r, typingDelay));

        const replyMsg: Message = {
          id: `msg_${Date.now()}_${responder.id}`,
          roomId: currentRoomId,
          senderId: responder.id,
          senderName: responder.name,
          senderHandle: responder.handle,
          senderAvatar: responder.avatar,
          isAi: responder.isAi,
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          reactions: [],
        };

        ongoingHistory = [...ongoingHistory, replyMsg];

        setMessages((prev) => ({
          ...prev,
          [currentRoomId]: [...(prev[currentRoomId] || []), replyMsg],
        }));
      } catch (err) {
        console.error('Error fetching chat response:', err);
      } finally {
        setTypingParticipant(null);
      }
    }

    setIsStreaming(false);
  };

  // Trigger Ambient Chime-In manually or via button
  const handleTriggerAmbientReply = async () => {
    if (isAmbientActive || currentParticipants.length === 0) return;
    setIsAmbientActive(true);

    try {
      const response = await fetch('/api/ambient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomContext: currentRoom,
          messages: messages[currentRoomId] || [],
          candidates: currentParticipants,
          currentUser,
        }),
      });

      const data = await response.json();
      if (data.speaker && data.reply) {
        setTypingParticipant(data.speaker);
        await new Promise((r) => setTimeout(r, 1500));

        const newMsg: Message = {
          id: `ambient_${Date.now()}`,
          roomId: currentRoomId,
          senderId: data.speaker.id,
          senderName: data.speaker.name,
          senderHandle: data.speaker.handle,
          senderAvatar: data.speaker.avatar,
          isAi: data.speaker.isAi,
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          reactions: [],
        };

        setMessages((prev) => ({
          ...prev,
          [currentRoomId]: [...(prev[currentRoomId] || []), newMsg],
        }));
      }
    } catch (e) {
      console.error('Ambient response error:', e);
    } finally {
      setTypingParticipant(null);
      setIsAmbientActive(false);
    }
  };

  // Spark Topic feature
  const handleSparkTopic = async () => {
    setIsGeneratingTopic(true);
    setShowTopicPickerModal(true);
    try {
      const res = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: currentRoom.name,
          topic: currentRoom.topic,
        }),
      });
      const data = await res.json();
      setTopicOptions(data.topics || []);
    } catch (err) {
      console.error('Failed to get topics:', err);
      setTopicOptions([
        'How can AI best complement human emotional intelligence?',
        'What was the most surprising creative synergy you have experienced?',
        'If we colonized Mars, what should our first social charter say?',
      ]);
    } finally {
      setIsGeneratingTopic(false);
    }
  };

  // Summarize Room discussion
  const handleOpenSummary = async () => {
    setShowSummaryModal(true);
    setIsGeneratingSummary(true);
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: currentRoom.name,
          messages: currentRoomMessages,
        }),
      });
      const data = await res.json();
      setSummaryText(data.summary || 'Summary unavailable.');
    } catch (err) {
      console.error('Summarize error:', err);
      setSummaryText('Failed to generate summary. Please check your connection.');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Emoji Reactions
  const handleReact = (messageId: string, emoji: string) => {
    setMessages((prev) => {
      const roomMsgs = prev[currentRoomId] || [];
      const updated = roomMsgs.map((m) => {
        if (m.id !== messageId) return m;

        const existingReaction = m.reactions.find((r) => r.emoji === emoji);
        let nextReactions = [...m.reactions];

        if (existingReaction) {
          if (existingReaction.users.includes(currentUser.id)) {
            // Remove user reaction
            const newUsers = existingReaction.users.filter((u) => u !== currentUser.id);
            if (newUsers.length === 0) {
              nextReactions = nextReactions.filter((r) => r.emoji !== emoji);
            } else {
              nextReactions = nextReactions.map((r) =>
                r.emoji === emoji ? { ...r, count: r.count - 1, users: newUsers } : r
              );
            }
          } else {
            // Add user reaction
            nextReactions = nextReactions.map((r) =>
              r.emoji === emoji
                ? { ...r, count: r.count + 1, users: [...r.users, currentUser.id] }
                : r
            );
          }
        } else {
          // New emoji reaction
          nextReactions.push({
            emoji,
            count: 1,
            users: [currentUser.id],
          });
        }

        return { ...m, reactions: nextReactions };
      });

      return { ...prev, [currentRoomId]: updated };
    });
  };

  // Start 1-on-1 DM with a persona
  const handleStartDm = (personaId: string) => {
    const existingDm = rooms.find(
      (r) => r.isDirectMessage && r.dmParticipantId === personaId
    );

    if (existingDm) {
      setCurrentRoomId(existingDm.id);
    } else {
      const targetPersona = personas.find((p) => p.id === personaId);
      if (!targetPersona) return;

      const newDmRoom: Room = {
        id: `dm_${targetPersona.id}`,
        name: targetPersona.name,
        topic: `Direct chat with ${targetPersona.name}`,
        description: targetPersona.bio,
        icon: targetPersona.isAi ? '🤖' : '👤',
        isDirectMessage: true,
        dmParticipantId: targetPersona.id,
        participantIds: [targetPersona.id, currentUser.id],
      };

      setRooms((prev) => [...prev, newDmRoom]);
      setCurrentRoomId(newDmRoom.id);
    }

    setShowMobileSidebar(false);
  };

  // Create new Room handler
  const handleCreateRoom = (newRoom: Room) => {
    setRooms((prev) => [...prev, newRoom]);
    setMessages((prev) => ({
      ...prev,
      [newRoom.id]: [
        {
          id: `seed_${Date.now()}`,
          roomId: newRoom.id,
          senderId: 'ai_gemini',
          senderName: 'Gemini Core',
          senderHandle: 'gemini',
          senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
          isAi: true,
          text: `Welcome to #${newRoom.name}! I am ready to collaborate alongside everyone here. What should we tackle first?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          reactions: [{ emoji: '🚀', count: 1, users: ['current_user'] }],
        },
      ],
    }));
    setCurrentRoomId(newRoom.id);
  };

  // Create new Persona handler
  const handleCreatePersona = (newPersona: Persona) => {
    setPersonas((prev) => [...prev, newPersona]);
    handleStartDm(newPersona.id);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Mobile Drawer Backdrop */}
      {showMobileSidebar && (
        <div
          onClick={() => setShowMobileSidebar(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Left Navigation Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 lg:static lg:z-auto transition-transform duration-200 ease-in-out ${
          showMobileSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <Sidebar
          rooms={rooms}
          currentRoomId={currentRoomId}
          onSelectRoom={(id) => {
            setCurrentRoomId(id);
            setShowMobileSidebar(false);
          }}
          personas={personas}
          currentUser={currentUser}
          onOpenCreateRoom={() => setShowCreateRoomModal(true)}
          onOpenCreatePersona={() => setShowCreatePersonaModal(true)}
          onOpenUserProfile={() => setShowUserProfileModal(true)}
          isLivingMode={isLivingMode}
          onToggleLivingMode={() => setIsLivingMode(!isLivingMode)}
        />
      </div>

      {/* Main Chat Stage */}
      <main className="flex-1 flex flex-col h-full min-w-0 bg-slate-950/95 relative overflow-hidden">
        {/* Mobile Top Bar */}
        <div className="lg:hidden flex items-center justify-between px-3 py-2.5 bg-slate-900 border-b border-slate-800 shrink-0">
          <button
            onClick={() => setShowMobileSidebar(true)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5 font-bold text-sm">
            <span>{currentRoom.icon}</span>
            <span className="truncate">#{currentRoom.name}</span>
          </div>
          <button
            onClick={() => setShowInfoSidebar(!showInfoSidebar)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Users className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop Header */}
        <ChatHeader
          currentRoom={currentRoom}
          participants={currentParticipants}
          onOpenSummary={handleOpenSummary}
          onSparkTopic={handleSparkTopic}
          isGeneratingTopic={isGeneratingTopic}
          isGeneratingSummary={isGeneratingSummary}
          onTriggerAmbientReply={handleTriggerAmbientReply}
          isAmbientActive={isAmbientActive}
          onToggleLivingMode={() => setIsLivingMode(!isLivingMode)}
          isLivingMode={isLivingMode}
          showInfoSidebar={showInfoSidebar}
          onToggleInfoSidebar={() => setShowInfoSidebar(!showInfoSidebar)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showSearchBar={showSearchBar}
          onToggleSearchBar={() => {
            setShowSearchBar(!showSearchBar);
            if (showSearchBar) setSearchQuery('');
          }}
        />

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto px-2 sm:px-6 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          {/* Welcome Banner for the Room */}
          <div className="my-6 p-5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-indigo-950/30 to-slate-900/90 border border-slate-800 text-center max-w-xl mx-auto shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-2xl mb-3 shadow-inner">
              {currentRoom.icon}
            </div>
            <h2 className="text-base font-bold text-white mb-1">
              Welcome to #{currentRoom.name}!
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              {currentRoom.description || currentRoom.topic}
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {currentParticipants.length} participants (including Gemini AI & community members)
              </span>
            </div>
          </div>

          {/* List of Chat Messages */}
          {displayedMessages.map((msg) => {
            const senderPersona = personas.find((p) => p.id === msg.senderId);
            return (
              <ChatMessage
                key={msg.id}
                message={msg}
                currentUserId={currentUser.id}
                onReact={handleReact}
                onReply={(m) => setReplyingTo(m)}
                onMentionClick={(handle) => {
                  const p = personas.find(
                    (item) => item.handle.toLowerCase() === handle.toLowerCase()
                  );
                  if (p) handleStartDm(p.id);
                }}
                senderPersona={senderPersona}
              />
            );
          })}

          <div ref={messagesEndRef} className="h-2" />
        </div>

        {/* Chat Input Dock */}
        <ChatInput
          onSendMessage={handleSendMessage}
          participants={currentParticipants}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          typingParticipant={typingParticipant}
          isStreaming={isStreaming}
        />
      </main>

      {/* Right Drawer: Room Directory & Members */}
      {showInfoSidebar && (
        <RoomInfoSidebar
          room={currentRoom}
          participants={currentParticipants}
          currentUser={currentUser}
          onClose={() => setShowInfoSidebar(false)}
          onMention={(handle) => {
            // Mention persona in chat
            const inputArea = document.querySelector('textarea');
            if (inputArea) {
              inputArea.value = `${inputArea.value} @${handle} `;
              inputArea.focus();
            }
          }}
          onStartDm={(personaId) => handleStartDm(personaId)}
          onOpenAddParticipant={() => setShowAddParticipantModal(true)}
        />
      )}

      {/* Modals */}
      <UserProfileModal
        currentUser={currentUser}
        isOpen={showUserProfileModal}
        onClose={() => setShowUserProfileModal(false)}
        onSave={(updated) => setCurrentUser(updated)}
      />

      <CreateRoomModal
        isOpen={showCreateRoomModal}
        onClose={() => setShowCreateRoomModal(false)}
        personas={personas}
        currentUserId={currentUser.id}
        onCreateRoom={handleCreateRoom}
      />

      <CreatePersonaModal
        isOpen={showCreatePersonaModal}
        onClose={() => setShowCreatePersonaModal(false)}
        onCreatePersona={handleCreatePersona}
      />

      <SummaryModal
        isOpen={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        roomName={currentRoom.name}
        summaryText={summaryText}
        isLoading={isGeneratingSummary}
        onPostToChannel={(text) => handleSendMessage(text)}
      />

      <TopicPickerModal
        isOpen={showTopicPickerModal}
        onClose={() => setShowTopicPickerModal(false)}
        roomName={currentRoom.name}
        topics={topicOptions}
        isLoading={isGeneratingTopic}
        onRefresh={handleSparkTopic}
        onSelectTopic={(topic) => handleSendMessage(`💡 **Discussion Question:** ${topic}`)}
      />

      <AddParticipantModal
        isOpen={showAddParticipantModal}
        onClose={() => setShowAddParticipantModal(false)}
        room={currentRoom}
        allPersonas={personas}
        onUpdateParticipants={(newParticipantIds) => {
          setRooms((prev) =>
            prev.map((r) =>
              r.id === currentRoom.id ? { ...r, participantIds: newParticipantIds } : r
            )
          );
        }}
      />
    </div>
  );
}
