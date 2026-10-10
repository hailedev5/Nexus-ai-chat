import React, { useState } from 'react';
import {
  MessageSquare,
  Hash,
  Plus,
  Bot,
  Users,
  Search,
  Sparkles,
  Settings,
  Circle,
  Compass,
  Radio,
} from 'lucide-react';
import { Room, Persona, UserProfile } from '../types';

interface SidebarProps {
  rooms: Room[];
  currentRoomId: string;
  onSelectRoom: (roomId: string) => void;
  personas: Persona[];
  currentUser: UserProfile;
  onOpenCreateRoom: () => void;
  onOpenCreatePersona: () => void;
  onOpenUserProfile: () => void;
  isLivingMode: boolean;
  onToggleLivingMode: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  rooms,
  currentRoomId,
  onSelectRoom,
  personas,
  currentUser,
  onOpenCreateRoom,
  onOpenCreatePersona,
  onOpenUserProfile,
  isLivingMode,
  onToggleLivingMode,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'channels' | 'dms'>('all');

  // Channels
  const channelRooms = rooms.filter((r) => !r.isDirectMessage);
  // DMs
  const dmRooms = rooms.filter((r) => r.isDirectMessage);

  const getPersonaForDm = (room: Room) => {
    return personas.find((p) => p.id === room.dmParticipantId);
  };

  const filteredChannels = channelRooms.filter((r) =>
    r.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    r.topic.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const filteredDms = dmRooms.filter((r) => {
    const persona = getPersonaForDm(r);
    const searchName = persona ? persona.name : r.name;
    return searchName.toLowerCase().includes(filterQuery.toLowerCase());
  });

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full select-none shrink-0">
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white">Nexus</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                AI + People
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Social Intelligence Hub</p>
          </div>
        </div>

        <button
          onClick={onToggleLivingMode}
          title={isLivingMode ? "Living community active (members chime in)" : "Living community paused"}
          className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 text-xs ${
            isLivingMode
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-300'
          }`}
        >
          <Radio className={`w-3.5 h-3.5 ${isLivingMode ? 'animate-pulse text-emerald-400' : ''}`} />
        </button>
      </div>

      {/* Search and Tabs */}
      <div className="p-3 space-y-2 border-b border-slate-800/80">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search channels & people..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 transition-colors"
          />
        </div>

        <div className="flex items-center p-0.5 bg-slate-950/50 rounded-lg border border-slate-800/60 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-1 rounded text-center font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('channels')}
            className={`flex-1 py-1 rounded text-center font-medium transition-all ${
              activeTab === 'channels'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Rooms
          </button>
          <button
            onClick={() => setActiveTab('dms')}
            className={`flex-1 py-1 rounded text-center font-medium transition-all ${
              activeTab === 'dms'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Direct
          </button>
        </div>
      </div>

      {/* Scrollable Navigation List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {/* Channels Section */}
        {(activeTab === 'all' || activeTab === 'channels') && (
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 pb-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                Community Rooms
              </span>
              <button
                onClick={onOpenCreateRoom}
                className="hover:text-white p-0.5 rounded hover:bg-slate-800 transition-colors"
                title="Create new room"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {filteredChannels.map((room) => {
              const isSelected = room.id === currentRoomId;
              return (
                <button
                  key={room.id}
                  onClick={() => onSelectRoom(room.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all group ${
                    isSelected
                      ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/30'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm shrink-0">{room.icon}</span>
                    <span className="truncate">{room.name}</span>
                  </div>
                  {room.unreadCount ? (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500 text-white">
                      {room.unreadCount}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}

        {/* Direct Messages Section */}
        {(activeTab === 'all' || activeTab === 'dms') && (
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 pb-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                Direct Chats
              </span>
              <button
                onClick={onOpenCreatePersona}
                className="hover:text-white p-0.5 rounded hover:bg-slate-800 transition-colors"
                title="Add new persona or bot"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {filteredDms.map((room) => {
              const isSelected = room.id === currentRoomId;
              const persona = getPersonaForDm(room);
              const isAi = persona?.isAi ?? false;
              const status = persona?.status ?? 'online';

              return (
                <button
                  key={room.id}
                  onClick={() => onSelectRoom(room.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all group ${
                    isSelected
                      ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/30'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={persona?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                        alt={room.name}
                        className="w-6 h-6 rounded-full object-cover border border-slate-700"
                      />
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-slate-900 ${
                          status === 'online'
                            ? 'bg-emerald-400'
                            : status === 'idle'
                            ? 'bg-amber-400'
                            : 'bg-slate-500'
                        }`}
                      />
                    </div>
                    <div className="flex flex-col text-left truncate">
                      <div className="flex items-center gap-1 truncate">
                        <span className="truncate">{room.name}</span>
                        {isAi && (
                          <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            AI
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Current User Profile Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center justify-between">
          <button
            onClick={onOpenUserProfile}
            className="flex items-center gap-2.5 min-w-0 hover:opacity-90 text-left transition-opacity group"
          >
            <div className="relative shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-700 group-hover:border-indigo-500 transition-colors"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
              <p className="text-[11px] text-slate-400 truncate">@{currentUser.handle}</p>
            </div>
          </button>

          <button
            onClick={onOpenUserProfile}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            title="Edit profile & status"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
