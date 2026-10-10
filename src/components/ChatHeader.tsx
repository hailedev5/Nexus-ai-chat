import React from 'react';
import {
  Sparkles,
  FileText,
  Users,
  Search,
  Radio,
  Lightbulb,
  Info,
  Bot,
  UserCheck,
} from 'lucide-react';
import { Room, Persona } from '../types';

interface ChatHeaderProps {
  currentRoom: Room;
  participants: Persona[];
  onOpenSummary: () => void;
  onSparkTopic: () => void;
  isGeneratingTopic: boolean;
  isGeneratingSummary: boolean;
  onTriggerAmbientReply: () => void;
  isAmbientActive: boolean;
  onToggleLivingMode: () => void;
  isLivingMode: boolean;
  showInfoSidebar: boolean;
  onToggleInfoSidebar: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  showSearchBar: boolean;
  onToggleSearchBar: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  currentRoom,
  participants,
  onOpenSummary,
  onSparkTopic,
  isGeneratingTopic,
  isGeneratingSummary,
  onTriggerAmbientReply,
  isAmbientActive,
  onToggleLivingMode,
  isLivingMode,
  showInfoSidebar,
  onToggleInfoSidebar,
  searchQuery,
  onSearchChange,
  showSearchBar,
  onToggleSearchBar,
}) => {
  const aiCount = participants.filter((p) => p.isAi).length;
  const humanCount = participants.filter((p) => !p.isAi).length;

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 py-3 flex flex-col gap-2 shrink-0 z-10">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Room Title & Topic */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-lg shrink-0 shadow-inner">
            {currentRoom.icon}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-slate-100 text-base truncate flex items-center gap-1.5">
                {currentRoom.isDirectMessage ? '' : '#'}
                {currentRoom.name}
              </h1>
              {currentRoom.isDirectMessage && participants.find((p) => p.isAi) && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                  <Bot className="w-3 h-3" /> AI Companion
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 truncate max-w-md">
              {currentRoom.topic || currentRoom.description}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Spark Topic Button */}
          {!currentRoom.isDirectMessage && (
            <button
              onClick={onSparkTopic}
              disabled={isGeneratingTopic}
              title="Generate a conversation starter or debate topic with Gemini AI"
              className="px-2.5 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Lightbulb className={`w-3.5 h-3.5 ${isGeneratingTopic ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Spark Topic</span>
            </button>
          )}

          {/* AI Discussion Summary Button */}
          <button
            onClick={onOpenSummary}
            disabled={isGeneratingSummary}
            title="Summarize key points in this room using Gemini"
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <FileText className={`w-3.5 h-3.5 ${isGeneratingSummary ? 'animate-pulse text-indigo-400' : ''}`} />
            <span className="hidden sm:inline">Recap</span>
          </button>

          {/* Trigger ambient chime in */}
          {!currentRoom.isDirectMessage && (
            <button
              onClick={onTriggerAmbientReply}
              disabled={isAmbientActive}
              title="Have a room member (AI or human peer) chime into the conversation"
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <Radio className={`w-3.5 h-3.5 ${isAmbientActive ? 'animate-ping text-emerald-400' : ''}`} />
              <span className="hidden md:inline">Chime In</span>
            </button>
          )}

          {/* Search Toggle */}
          <button
            onClick={onToggleSearchBar}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              showSearchBar
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Search messages in this channel"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Participants / Room Info Drawer Toggle */}
          <button
            onClick={onToggleInfoSidebar}
            className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1.5 ${
              showInfoSidebar
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle room info & members list"
          >
            <Users className="w-4 h-4" />
            <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-400">
              <span className="text-indigo-400 font-semibold">{aiCount} AI</span>
              <span>•</span>
              <span className="text-slate-300 font-semibold">{humanCount} people</span>
            </div>
          </button>
        </div>
      </div>

      {/* Expandable Search Input Bar */}
      {showSearchBar && (
        <div className="pt-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter messages in this room by keyword or @mention..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              autoFocus
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60"
            />
          </div>
        </div>
      )}
    </header>
  );
};
