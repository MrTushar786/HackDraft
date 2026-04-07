import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { X, Mail, Lock, User, Terminal, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  externalMessage?: string | null;
}

export function AuthModal({ isOpen, onClose, initialMode = 'login', externalMessage = null }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLogin(initialMode === 'login');
      if (externalMessage) {
        setMessage({ type: 'error', text: externalMessage });
      } else {
        setMessage(null);
      }
    }
  }, [isOpen, initialMode, externalMessage]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onClose();
      } else {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        });
        if (error) throw error;
        
        if (data.user) {
          setMessage({ type: 'success', text: 'First signup! Please check your email for confirmation.' });
        }
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#111111] border border-white/10 p-8 shadow-2xl relative animate-in fade-in zoom-in duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-8 text-left">
          <div className="flex items-center gap-2 mb-2">
            <Terminal size={14} className="text-[#00ff88]" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#00ff88]">Authentication Protocol</span>
          </div>
          <h2 className="text-3xl font-syne font-black uppercase italic tracking-tighter leading-none mb-1">
            {isLogin ? 'SYSTEM LOGIN' : 'CREATE ACCOUNT'}
          </h2>
          <div className="h-0.5 w-12 bg-[#00ff88] mt-2"></div>
        </div>

        {message && (
          <div className={`mb-6 p-4 font-mono text-xs border ${
            message.type === 'success' ? 'border-[#00ff88]/40 bg-[#00ff88]/10 text-[#00ff88]' : 'border-rose-500/40 bg-rose-500/10 text-rose-500'
          }`}>
            <span className="uppercase font-bold">[{message.type}]:</span> {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <label className="block font-mono text-[10px] uppercase text-gray-500 ml-1">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                <input 
                  type="text"
                  required
                  placeholder="ARCHITECT_NAME"
                  className="bg-transparent border-b-2 border-white/10 px-4 py-3 pl-12 outline-none focus:border-[#00ff88] transition-colors w-full text-base placeholder:text-gray-700 font-mono uppercase"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block font-mono text-[10px] uppercase text-gray-500 ml-1">Identity Vector (Email)</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input 
                type="email"
                required
                placeholder="USER@HACKDRAFT.AI"
                className="bg-transparent border-b-2 border-white/10 px-4 py-3 pl-12 outline-none focus:border-[#00ff88] transition-colors w-full text-base placeholder:text-gray-700 font-mono italic"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-mono text-[10px] uppercase text-gray-500 ml-1">Access Cipher (Password)</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <input 
                type="password"
                required
                placeholder="••••••••"
                className="bg-transparent border-b-2 border-white/10 px-4 py-3 pl-12 outline-none focus:border-[#00ff88] transition-colors w-full text-base placeholder:text-gray-700 font-mono"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="bg-[#00ff88] text-black w-full py-4 px-6 font-syne font-black uppercase italic tracking-tighter text-lg hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                {isLogin ? 'INITIALIZE SESSION' : 'REGISTER ARCHITECT'}
                <Terminal size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-white/5">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setMessage(null);
            }}
            className="font-mono text-[10px] uppercase text-gray-500 hover:text-[#00ff88] tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            {isLogin ? "[ protocol: register_new_account ]" : "[ protocol: bypass_to_login ]"}
          </button>
        </div>
      </div>
    </div>
  );
}
