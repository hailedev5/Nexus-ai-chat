import React, { useState } from 'react';
import { X, Bot, User, Sparkles, Wand2 } from 'lucide-react';
import { Persona } from '../../types';

interface CreatePersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePersona: (persona: Persona) => void;
}

const AVATAR_PRESETS_AI = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=150&auto=format&fit=crop&q=80',
];

const AVATAR_PRESETS_HUMAN = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
];

export const CreatePersonaModal: React.FC<CreatePersonaModalProps> = ({
  isOpen,
  onClose,
  onCreatePersona,
}) => {
  const [isAi, setIsAi] = useState(true);
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [personality, setPersonality] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_PRESETS_AI[0]);

  if (!isOpen) return null;

  const handleTypeChange = (aiChoice: boolean) => {
    setIsAi(aiChoice);
    setAvatar(aiChoice ? AVATAR_PRESETS_AI[0] : AVATAR_PRESETS_HUMAN[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const formattedHandle = handle.trim().replace(/^@/, '') || name.toLowerCase().replace(/\s+/g, '_');

    const newPersona: Persona = {
      id: `${isAi ? 'ai' : 'human'}_${Date.now()}`,
      name: name.trim(),
      handle: formattedHandle,
      role: role.trim() || (isAi ? 'Custom AI Assistant' : 'Community Member'),
      bio: bio.trim() || (isAi ? 'A custom AI co-pilot created by Alex.' : 'A passionate community member.'),
      personality: personality.trim() || (isAi ? 'analytical, witty, and supportive' : 'friendly, casual, and energetic'),
      avatar: avatar.trim(),
      isAi,
      status: 'online',
      statusText: isAi ? 'Active and listening' : 'Exploring Nexus',
      badgeColor: isAi ? 'bg-indigo-500' : 'bg-emerald-500',
    };

    onCreatePersona(newPersona);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <h2 className="font-semibold text-base text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Create New Participant</span>
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
          {/* Persona Type Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Participant Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange(true)}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  isAi
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bot className="w-6 h-6 text-indigo-400" />
                <span className="font-semibold text-xs">AI Companion / Bot</span>
                <span className="text-[10px] text-slate-400 text-center">
                  Autonomous agent powered by Gemini
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange(false)}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  !isAi
                    ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-6 h-6 text-emerald-400" />
                <span className="font-semibold text-xs">Simulated Human Peer</span>
                <span className="text-[10px] text-slate-400 text-center">
                  Community member with lifelike tone
                </span>
              </button>
            </div>
          </div>

          {/* Name & Handle */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Name
              </label>
              <input
                type="text"
                required
                placeholder={isAi ? 'e.g. Scribe AI' : 'e.g. Jordan Lee'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Handle (@)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. scribe"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Role / Specialty
            </label>
            <input
              type="text"
              placeholder={isAi ? 'e.g. Creative Fiction Co-pilot' : 'e.g. Indie Game Developer'}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Personality / Tone Prompt */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Personality & Behavior Instructions
            </label>
            <textarea
              rows={2}
              placeholder={
                isAi
                  ? 'e.g. Poetic, concise, offers unexpected analogies, always constructive'
                  : 'e.g. Highly energetic, uses coffee emojis, loves debating indie games and cyberpunk'
              }
              value={personality}
              onChange={(e) => setPersonality(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Short Bio
            </label>
            <textarea
              rows={2}
              placeholder="Tell the community a little about this participant..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Avatar Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">
              Select Avatar
            </label>
            <div className="flex items-center gap-3">
              <img
                src={avatar}
                alt="Selected"
                className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500 shrink-0"
              />
              <div className="flex-1 space-y-1.5">
                <div className="flex gap-2">
                  {(isAi ? AVATAR_PRESETS_AI : AVATAR_PRESETS_HUMAN).map((url, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setAvatar(url)}
                      className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-transform hover:scale-105 shrink-0 ${
                        avatar === url ? 'border-indigo-400 scale-105' : 'border-transparent'
                      }`}
                    >
                      <img src={url} alt="Preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  placeholder="Or paste custom image URL..."
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
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
              Add Participant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
