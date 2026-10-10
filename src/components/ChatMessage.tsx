import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Reply,
  Copy,
  Check,
  Smile,
  Bot,
  User,
  Sparkles,
} from 'lucide-react';
import { Message, Persona } from '../types';
import { FormattedMessage } from '../utils/markdown';
import { speakMessage, stopSpeaking } from '../utils/speech';

interface ChatMessageProps {
  message: Message;
  currentUserId: string;
  onReact: (messageId: string, emoji: string) => void;
  onReply: (message: Message) => void;
  onMentionClick: (handle: string) => void;
  senderPersona?: Persona;
}

const COMMON_EMOJIS = ['👍', '❤️', '🔥', '💡', '😂', '🚀', '👏'];

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  currentUserId,
  onReact,
  onReply,
  onMentionClick,
  senderPersona,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const isCurrentUser = message.senderId === currentUserId;

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const started = speakMessage(
        message.text,
        message.isAi,
        () => setIsPlayingAudio(false),
        () => setIsPlayingAudio(false)
      );
      if (!started) {
        setIsPlayingAudio(false);
      }
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`group relative flex gap-3 px-4 py-2.5 transition-colors hover:bg-slate-800/40 rounded-xl my-0.5 ${
        isCurrentUser ? 'bg-indigo-950/20' : ''
      }`}
    >
      {/* Sender Avatar */}
      <div className="relative shrink-0 pt-0.5">
        <img
          src={message.senderAvatar}
          alt={message.senderName}
          className="w-9 h-9 rounded-full object-cover border border-slate-700/80 shadow-sm"
        />
        {message.isAi ? (
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 border border-slate-900 flex items-center justify-center text-[9px] text-white">
            <Sparkles className="w-2.5 h-2.5" />
          </span>
        ) : (
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
        )}
      </div>

      {/* Message Body */}
      <div className="flex-1 min-w-0">
        {/* Header: Name, Handle, Badge, Timestamp */}
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="font-semibold text-xs text-slate-100 hover:underline cursor-pointer">
            {message.senderName}
          </span>

          <span className="text-[11px] text-slate-400">@{message.senderHandle}</span>

          {/* Badges */}
          {message.isAi ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30">
              <Bot className="w-2.5 h-2.5" /> AI Companion
            </span>
          ) : isCurrentUser ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <User className="w-2.5 h-2.5" /> You
            </span>
          ) : senderPersona?.role ? (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
              {senderPersona.role}
            </span>
          ) : (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
              Member
            </span>
          )}

          <span className="text-[11px] text-slate-500 ml-auto sm:ml-0">{message.timestamp}</span>
        </div>

        {/* Quoted Reply context if any */}
        {message.replyTo && (
          <div className="mb-1.5 pl-2.5 border-l-2 border-indigo-500/50 bg-slate-800/30 py-1 pr-2 rounded text-xs text-slate-400 flex items-center gap-1.5">
            <Reply className="w-3 h-3 text-indigo-400 shrink-0" />
            <span className="font-medium text-slate-300">@{message.replyTo.senderName}:</span>
            <span className="truncate italic">{message.replyTo.text}</span>
          </div>
        )}

        {/* Formatted Content */}
        <FormattedMessage content={message.text} onMentionClick={onMentionClick} />

        {/* Attachment preview if any */}
        {message.attachmentUrl && (
          <div className="mt-2 max-w-sm rounded-lg overflow-hidden border border-slate-700">
            <img
              src={message.attachmentUrl}
              alt="Attachment"
              className="w-full h-auto object-cover max-h-60"
            />
          </div>
        )}

        {/* Reactions List */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {message.reactions.map((reaction, i) => {
              const hasReacted = reaction.users.includes(currentUserId);
              return (
                <button
                  key={`${reaction.emoji}-${i}`}
                  onClick={() => onReact(message.id, reaction.emoji)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors border ${
                    hasReacted
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-200'
                      : 'bg-slate-800/70 border-slate-700/70 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>{reaction.emoji}</span>
                  <span className="text-[11px] font-semibold">{reaction.count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Menu on hover */}
      <div className="absolute right-3 -top-3 hidden group-hover:flex items-center gap-1 bg-slate-900 border border-slate-700/80 shadow-lg rounded-lg p-1 z-10">
        {/* Emoji Reaction Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Add reaction"
          >
            <Smile className="w-3.5 h-3.5" />
          </button>

          {/* Quick Reaction Popup */}
          {showEmojiPicker && (
            <div className="absolute right-0 top-7 bg-slate-900 border border-slate-700 shadow-xl rounded-lg p-1.5 flex items-center gap-1 z-20">
              {COMMON_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReact(message.id, emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="hover:scale-125 transition-transform p-1 text-sm rounded hover:bg-slate-800"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Audio TTS Readout */}
        <button
          onClick={handleToggleAudio}
          className={`p-1 rounded transition-colors ${
            isPlayingAudio
              ? 'text-pink-400 bg-pink-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title={isPlayingAudio ? 'Stop reading' : 'Read aloud with AI voice'}
        >
          {isPlayingAudio ? (
            <VolumeX className="w-3.5 h-3.5 animate-pulse" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Quote Reply */}
        <button
          onClick={() => onReply(message)}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Quote reply"
        >
          <Reply className="w-3.5 h-3.5" />
        </button>

        {/* Copy text */}
        <button
          onClick={handleCopyText}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Copy message"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
