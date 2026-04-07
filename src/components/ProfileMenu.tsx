import { useState, useEffect } from 'react';
import { User, Settings, Clock, LogOut, ChevronDown, Check, Edit2, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface ProfileMenuProps {
  user: SupabaseUser;
  onLogout: () => void;
  onViewHistory: () => void;
  projectCount: number;
}

export function ProfileMenu({ user, onLogout, onViewHistory, projectCount }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user.user_metadata?.full_name || user.email?.split('@')[0] || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: newName }
      });
      if (error) throw error;
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 border border-white/10 hover:border-accent/40 bg-white/5 transition-all group lg:min-w-[160px]"
      >
        <div className="w-6 h-6 bg-accent/20 flex items-center justify-center border border-accent/20">
          <User size={14} className="text-accent" />
        </div>
        <div className="flex flex-col items-start lg:flex-1 text-left">
          <span className="font-mono text-[8px] text-gray-500 uppercase tracking-widest leading-tight">Architect</span>
          <span className="font-mono text-[10px] text-white truncate max-w-[100px]">
            {user.user_metadata?.full_name || user.email?.split('@')[0]}
          </span>
        </div>
        <ChevronDown size={12} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-[#0d0d0f] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[9999] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-mono text-[9px] text-gray-500 uppercase tracking-[0.2em]">Profile_System</span>
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className="text-gray-500 hover:text-accent transition-colors"
                title="Edit Identity"
              >
                {isEditing ? <X size={12} /> : <Settings size={12} />}
              </button>
            </div>
            
            {isEditing ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-black border border-white/10 px-2 py-1.5 font-mono text-[10px] text-white focus:outline-none focus:border-[#00ff88]/50"
                    placeholder="New identity..."
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="w-full py-2 bg-[#00ff88] text-black font-mono text-[9px] font-black uppercase tracking-widest hover:bg-white transition-all disabled:opacity-50"
                >
                  {loading ? 'Executing...' : '[save_changes]'}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/10 border border-accent/20 flex items-center justify-center">
                  <User size={24} className="text-accent" />
                </div>
                <div className="space-y-1 overflow-hidden">
                  <h4 className="text-white font-syne font-bold uppercase truncate">
                    {user.user_metadata?.full_name || 'Anonymous Architect'}
                  </h4>
                  <p className="text-[10px] font-mono text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            )}
          </div>

          <div className="p-2 space-y-1">
            <button
              onClick={() => {
                onViewHistory();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white hover:bg-white/5 transition-all group"
            >
              <Clock size={14} className="group-hover:text-accent transition-colors" />
              <span className="font-mono text-[11px] uppercase tracking-wider flex-1 text-left">Project History</span>
              <span className="text-[9px] bg-white/5 px-1.5 py-0.5 border border-white/5">{String(projectCount).padStart(2, '0')}</span>
            </button>
            <button
               onClick={() => {
                 onLogout();
                 setIsOpen(false);
               }}
               className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-rose-500 hover:bg-rose-500/5 transition-all group"
            >
              <LogOut size={14} className="group-hover:rotate-12 transition-transform" />
              <span className="font-mono text-[11px] uppercase tracking-wider text-left">Terminate Session</span>
            </button>
          </div>
          
          <div className="p-3 bg-black/50 border-t border-white/5 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="font-mono text-[8px] text-accent/60 uppercase tracking-widest">
              Security: RSA_ENCRYPTED_AUTH: OK
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
