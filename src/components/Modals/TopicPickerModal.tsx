import React from 'react';
import { X, Lightbulb, MessageSquarePlus, RefreshCw } from 'lucide-react';

interface TopicPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  topics: string[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelectTopic: (topic: string) => void;
}

export const TopicPickerModal: React.FC<TopicPickerModalProps> = ({
  isOpen,
  onClose,
  roomName,
  topics,
  isLoading,
  onRefresh,
  onSelectTopic,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-white">Spark Room Discussion</h2>
              <p className="text-[11px] text-slate-400">Gemini suggestions for #{roomName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body list of topics */}
        <div className="p-5 space-y-2.5">
          {isLoading ? (
            <div className="py-10 flex flex-col items-center justify-center gap-2 text-center">
              <div className="w-7 h-7 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
              <p className="text-xs text-slate-400">Crafting intriguing debate & discussion prompts...</p>
            </div>
          ) : (
            topics.map((topic, i) => (
              <button
                key={i}
                onClick={() => {
                  onSelectTopic(topic);
                  onClose();
                }}
                className="w-full p-3.5 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 rounded-xl text-left transition-all group flex items-start gap-3"
              >
                <span className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center justify-center text-xs font-semibold shrink-0 group-hover:bg-amber-500/20">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-xs text-slate-200 group-hover:text-white font-medium leading-relaxed">
                    "{topic}"
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] text-indigo-400 mt-1 opacity-80 group-hover:opacity-100">
                    <MessageSquarePlus className="w-3 h-3" /> Post as room icebreaker
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between bg-slate-950/40">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Regenerate new questions</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
