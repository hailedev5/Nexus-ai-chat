import React, { useState } from 'react';
import { X, UserPlus, Bot, User, Check } from 'lucide-react';
import { Persona, Room } from '../../types';

interface AddParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room;
  allPersonas: Persona[];
  onUpdateParticipants: (newParticipantIds: string[]) => void;
}

export const AddParticipantModal: React.FC<AddParticipantModalProps> = ({
  isOpen,
  onClose,
  room,
  allPersonas,
  onUpdateParticipants,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(room.participantIds);

  if (!isOpen) return null;

  const togglePersona = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    onUpdateParticipants(selectedIds);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-indigo-400" />
            <h2 className="font-semibold text-sm text-white">Manage #{room.name} Members</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of personas */}
        <div className="p-4 space-y-2 overflow-y-auto flex-1">
          <p className="text-xs text-slate-400 mb-2">
            Select which AI companions and community peers can participate in this channel:
          </p>
          {allPersonas.map((persona) => {
            const isSelected = selectedIds.includes(persona.id);
            return (
              <button
                key={persona.id}
                type="button"
                onClick={() => togglePersona(persona.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-indigo-600/15 border-indigo-500/40 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={persona.avatar}
                    alt={persona.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-700"
                  />
                  <div className="min-w-0 truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-xs text-white truncate">{persona.name}</span>
                      {persona.isAi ? (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
                          AI
                        </span>
                      ) : (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-300">
                          Human
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{persona.role}</p>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'border-slate-700 bg-slate-900'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-end gap-2 bg-slate-950/40">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-md shadow-indigo-600/20"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
