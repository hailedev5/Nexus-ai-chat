import React, { useState } from 'react';
import { X, Hash, Bot, User, Check } from 'lucide-react';
import { Persona, Room } from '../../types';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  personas: Persona[];
  currentUserId: string;
  onCreateRoom: (room: Room) => void;
}

const EMOJI_OPTIONS = ['💬', '🚀', '✨', '☕', '🧠', '🎨', '🔥', '📚', '⚡', '🌐', '🎮', '💡'];

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  personas,
  currentUserId,
  onCreateRoom,
}) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('💬');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPersonaIds, setSelectedPersonaIds] = useState<string[]>(
    personas.map((p) => p.id) // by default all
  );

  if (!isOpen) return null;

  const togglePersona = (id: string) => {
    setSelectedPersonaIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const formattedName = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-');

    const newRoom: Room = {
      id: `room_${Date.now()}`,
      name: formattedName,
      icon,
      topic: topic.trim() || 'Open community chat',
      description: description.trim() || 'A new collaborative space for AI and people.',
      isDirectMessage: false,
      participantIds: Array.from(new Set([...selectedPersonaIds, currentUserId])),
    };

    onCreateRoom(newRoom);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <h2 className="font-semibold text-base text-white flex items-center gap-2">
            <Hash className="w-4 h-4 text-indigo-400" />
            <span>Create New Room</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Room Name & Icon */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Room Name & Icon
            </label>
            <div className="flex gap-2">
              {/* Icon dropdown or selector */}
              <div className="relative">
                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-base text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {EMOJI_OPTIONS.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-mono">
                  #
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. ai-ethics-lab, music-jam"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Room Topic / Discussion Focus
            </label>
            <input
              type="text"
              placeholder="What will people and AI discuss here?"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Participants Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Select Members & AI Bots
              </label>
              <span className="text-[11px] text-indigo-400 font-medium">
                {selectedPersonaIds.length} invited
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-950/60 rounded-xl border border-slate-800">
              {personas.map((persona) => {
                const isSelected = selectedPersonaIds.includes(persona.id);
                return (
                  <button
                    type="button"
                    key={persona.id}
                    onClick={() => togglePersona(persona.id)}
                    className={`flex items-center gap-2.5 p-2 rounded-lg text-left transition-all border ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500/40 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={persona.avatar}
                        alt={persona.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px]">
                          <Check className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 truncate">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-xs truncate">{persona.name}</span>
                        {persona.isAi && (
                          <span className="text-[8px] px-1 rounded bg-indigo-500/20 text-indigo-300">
                            AI
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{persona.role}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-md shadow-indigo-600/20"
            >
              Create Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
