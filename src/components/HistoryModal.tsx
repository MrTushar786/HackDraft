import type { ProjectIdea } from '../types';
import { X, ExternalLink, Calendar, Trash2, Brain } from 'lucide-react';

interface HistoryModalProps {
  history: ProjectIdea[];
  onSelect: (idea: ProjectIdea) => void;
  onClose: () => void;
  onClear: () => void;
}

export function HistoryModal({ history, onSelect, onClose, onClear }: HistoryModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-[#0a0a0b] border border-white/10 shadow-2xl relative animate-in zoom-in duration-300">
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-accent/5 to-transparent">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 border border-accent/20">
               <Brain size={20} className="text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-syne font-black uppercase text-white tracking-widest">Architectural Vault</h3>
              <p className="font-mono text-[9px] text-gray-500 uppercase tracking-widest">Mission History & Past Identifications</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-600 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-6 space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-20 opacity-30">
              <p className="font-mono text-xs uppercase tracking-widest text-gray-500">History: Empty_Register</p>
            </div>
          ) : (
            history.map((idea, idx) => (
              <div 
                key={idea.id === "uuid-string-here" ? `hist-${idx}` : idea.id}
                className="group p-5 bg-white/[0.02] border border-white/5 hover:border-accent/40 transition-all cursor-pointer flex items-center gap-6"
                onClick={() => onSelect(idea)}
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h4 className="text-sm font-syne font-bold uppercase text-white group-hover:text-accent transition-colors">{idea.name}</h4>
                    <span className="text-[9px] font-mono px-2 py-0.5 border border-white/10 text-gray-500 uppercase">{idea.difficulty}</span>
                  </div>
                  <p className="text-[11px] font-mono text-gray-500 line-clamp-1">{idea.tagline}</p>
                </div>
                <div className="flex items-center gap-2 pr-2">
                   <div className="flex flex-col items-end mr-4">
                      <span className="text-[8px] font-mono text-gray-600 uppercase">Phase_Logged</span>
                      <span className="text-[9px] font-mono text-gray-400">07:AP:2024</span>
                   </div>
                   <ExternalLink size={16} className="text-gray-600 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 border-t border-white/10 flex justify-between items-center bg-black/50">
          <button 
            onClick={onClear}
            className="flex items-center gap-2 px-4 py-2 text-rose-500 hover:text-white transition-colors font-mono text-[10px] uppercase hover:bg-rose-500/10"
          >
            <Trash2 size={12} />
            Wipe Cache
          </button>
          
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white/5 border border-white/10 text-white font-mono text-[10px] font-bold uppercase hover:bg-white hover:text-black transition-all"
          >
            Return to Bridge
          </button>
        </div>
      </div>
    </div>
  );
}
