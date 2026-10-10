import React from 'react';
import {
  X,
  Bot,
  User,
  Sparkles,
  MessageSquare,
  AtSign,
  Plus,
  Shield,
  Lightbulb,
} from 'lucide-react';
import { Room, Persona, UserProfile } from '../types';

interface RoomInfoSidebarProps {
  room: Room;
  participants: Persona[];
  currentUser: UserProfile;
  onClose: () => void;
  onMention: (handle: string) => void;
  onStartDm: (personaId: string) => void;
  onOpenAddParticipant: () => void;
}

export const RoomInfoSidebar: React.FC<RoomInfoSidebarProps> = ({
  room,
  participants,
  currentUser,
  onClose,
  onMention,
  onStartDm,
  onOpenAddParticipant,
}) => {
  const aiMembers = participants.filter((p) => p.isAi);
  const humanMembers = participants.filter((p) => !p.isAi);

  return (
    <aside className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full shrink-0 select-none overflow-hidden">
      {/* Drawer Header */}
      <div className="h-14 px-4 border-b border-slate-800 flex items-center justify-between shrink-0">
        <h2 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
          <span>Room Directory</span>
        </h2>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
        {/* Room Info Card */}
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{room.icon}</span>
            <div>
              <h3 className="font-semibold text-xs text-white">#{room.name}</h3>
              <p className="text-[11px] text-slate-400">{room.description}</p>
            </div>
          </div>
          {room.topic && (
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Topic
              </span>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{room.topic}</p>
            </div>
          )}
        </div>

        {/* AI Companions Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <Bot className="w-3.5 h-3.5" /> AI Companions ({aiMembers.length})
            </span>
          </div>

          <div className="space-y-1.5">
            {aiMembers.map((persona) => (
              <div
                key={persona.id}
                className="p-2.5 bg-slate-800/40 hover:bg-slate-800/70 border border-slate-800 rounded-xl transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={persona.avatar}
                        alt={persona.name}
                        className="w-8 h-8 rounded-full object-cover border border-indigo-500/40"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-indigo-600 flex items-center justify-center text-[8px] text-white">
                        <Sparkles className="w-2 h-2" />
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-white truncate">
                          {persona.name}
                        </span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                          AI
                        </span>
                      </div>
                      <p className="text-[11px] text-indigo-300/80 truncate">{persona.role}</p>
                    </div>
                  </div>

                  {/* Quick actions */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={() => onMention(persona.handle)}
                      title={`Tag @${persona.handle} in chat`}
                      className="p-1 rounded text-slate-400 hover:text-indigo-300 hover:bg-slate-700 transition-colors"
                    >
                      <AtSign className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onStartDm(persona.id)}
                      title={`Direct message with ${persona.name}`}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {persona.bio}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Human Community Members Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-slate-300">
              <User className="w-3.5 h-3.5 text-emerald-400" /> People ({humanMembers.length + 1})
            </span>
          </div>

          <div className="space-y-1.5">
            {/* Current user entry */}
            <div className="p-2.5 bg-indigo-950/20 border border-indigo-900/40 rounded-xl">
              <div className="flex items-center gap-2.5">
                <div className="relative shrink-0">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border border-emerald-500/50"
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-slate-900" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs text-white">{currentUser.name}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-medium">
                      You
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{currentUser.statusText}</p>
                </div>
              </div>
            </div>

            {/* Other human community members */}
            {humanMembers.map((persona) => (
              <div
                key={persona.id}
                className="p-2.5 bg-slate-800/40 hover:bg-slate-800/70 border border-slate-800 rounded-xl transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={persona.avatar}
                        alt={persona.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-700"
                      />
                      <span
                        className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-slate-900 ${
                          persona.status === 'online'
                            ? 'bg-emerald-400'
                            : persona.status === 'idle'
                            ? 'bg-amber-400'
                            : 'bg-slate-500'
                        }`}
                      />
                    </div>

                    <div className="min-w-0">
                      <span className="font-semibold text-xs text-white truncate block">
                        {persona.name}
                      </span>
                      <p className="text-[11px] text-slate-400 truncate">{persona.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={() => onMention(persona.handle)}
                      title={`Tag @${persona.handle} in chat`}
                      className="p-1 rounded text-slate-400 hover:text-indigo-300 hover:bg-slate-700 transition-colors"
                    >
                      <AtSign className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onStartDm(persona.id)}
                      title={`Direct message with ${persona.name}`}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {persona.bio}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Invite / Add Participant button */}
        <button
          onClick={onOpenAddParticipant}
          className="w-full py-2 px-3 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500/50 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/5 text-xs font-medium flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Member or Bot to Room</span>
        </button>

        {/* Pro Tips Box */}
        <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-xl space-y-1.5 text-xs text-indigo-200">
          <div className="flex items-center gap-1.5 font-semibold text-indigo-300">
            <Lightbulb className="w-3.5 h-3.5" /> Nexus Collaboration Tip
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Tag multiple participants in one message (e.g. <em>"@gemini and @sarah_design what do you think?"</em>) to spark multifaceted dialogues between AI and humans!
          </p>
        </div>
      </div>
    </aside>
  );
};
