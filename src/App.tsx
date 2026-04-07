import { useState, useEffect } from 'react';
import { useAgent } from './hooks/useAgent';
import { InputForm } from './components/InputForm';
import { IdeaCard } from './components/IdeaCard';
import { DetailView } from './components/DetailView';
import { LoadingTerminal } from './components/LoadingTerminal';
import { ChatBot } from './components/ChatBot';
import type { ProjectIdea } from './types';
import { Brain, Terminal, User as UserIcon, Settings, ChevronDown, Check, Edit2 } from 'lucide-react';
import { supabase } from './lib/supabase';
import { AuthModal } from './components/AuthModal';
import { ProfileMenu } from './components/ProfileMenu';
import { HistoryModal } from './components/HistoryModal';
import { MovingLights } from './components/MovingLights';
import type { User } from '@supabase/supabase-js';
import { LogOut } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

function App() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spotlightRange = 600;

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const spotlightMask = useTransform(
    [mouseX, mouseY],
    (values: number[]) => {
      const [x, y] = values;
      return `radial-gradient(${spotlightRange}px circle at ${x}px ${y}px, rgba(0, 255, 136, 0.06), transparent 80%)`;
    }
  );

  const { loading, ideas, error, generateIdeas, refineIdea, clearIdeas, updateIdea, fetchHistoryFromDB } = useAgent();
  const [selectedIdea, setSelectedIdea] = useState<ProjectIdea | null>(() => {
    const saved = localStorage.getItem('hackdraft_selected');
    return saved ? JSON.parse(saved) : null;
  });
  const [hasStarted, setHasStarted] = useState(() => {
    const saved = localStorage.getItem('hackdraft_started');
    return saved === 'true';
  });
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showSignupFirst, setShowSignupFirst] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState<ProjectIdea[]>(() => {
    const saved = localStorage.getItem('hackdraft_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('hackdraft_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Fetch from DB when user logs in
        fetchHistoryFromDB().then(setHistory);
      } else {
        setHistory([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const openAuth = (mode: 'login' | 'signup') => {
    setShowSignupFirst(mode === 'signup');
    setAuthMessage(null);
    setIsAuthModalOpen(true);
  };

  useEffect(() => {
    localStorage.setItem('hackdraft_selected', JSON.stringify(selectedIdea));
  }, [selectedIdea]);

  useEffect(() => {
    localStorage.setItem('hackdraft_started', hasStarted.toString());

    if (ideas.length > 0 && hasStarted && !loading) {
      setHistory(prev => {
        const newHistory = [...prev];
        ideas.forEach(idea => {
          if (!newHistory.find(h => h.id === idea.id)) {
            newHistory.unshift(idea);
          }
        });
        return newHistory.slice(0, 50); // Keep last 50
      });
    }
  }, [hasStarted, ideas, loading]);

  const handleFormSubmit = (data: any) => {
    if (!user) {
      setAuthMessage('AUTHENTICATION REQUIRED: PLEASE LOGIN TO GENERATE BLUEPRINTS');
      setIsAuthModalOpen(true);
      return;
    }

    setHasStarted(true);
    generateIdeas(data);
  };

  const handleUpdateIdea = (updatedIdea: ProjectIdea) => {
    setSelectedIdea(updatedIdea);
    updateIdea(updatedIdea);
  };

  const handleRefine = (refinement: string) => {
    if (selectedIdea) {
      refineIdea(selectedIdea, refinement);
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#050505] text-foreground custom-scrollbar overflow-x-hidden selection:bg-[#00ff88] selection:text-black"
    >
      {/* ── Background Layer ────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>

        {/* 1 · Roaming multi-colour lights (below grid) */}
        <MovingLights />

        {/* 2 · Primary grid — large cells, subtle lines */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.035) 1px, transparent 1px), ' +
              'linear-gradient(to bottom, rgba(255,255,255,0.035) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse 75% 75% at 50% 45%, white 20%, rgba(255,255,255,0.3) 60%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 75% 75% at 50% 45%, white 20%, rgba(255,255,255,0.3) 60%, transparent 100%)',
          }}
        />

        {/* 3 · Fine sub-grid — 12px cells, very faint */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.012) 1px, transparent 1px), ' +
              'linear-gradient(to bottom, rgba(255,255,255,0.012) 1px, transparent 1px)',
            backgroundSize: '12px 12px',
            maskImage: 'radial-gradient(ellipse 70% 70% at 50% 45%, white 10%, rgba(255,255,255,0.15) 55%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 45%, white 10%, rgba(255,255,255,0.15) 55%, transparent 100%)',
          }}
        />

        {/* 4 · Mouse spotlight on top of the grid */}
        <motion.div
          style={{ background: spotlightMask }}
          className="absolute inset-0"
        />

        {/* 5 · Corner glow anchors */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-[20%] -left-[10%] w-[55%] h-[55%] rounded-full"
          style={{ background: 'radial-gradient(circle, #00ff8815 0%, transparent 70%)', filter: 'blur(120px)' }}
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.1, 0.18, 0.1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute bottom-[-10%] right-[-5%] w-[45%] h-[45%] rounded-full"
          style={{ background: 'radial-gradient(circle, #8b5cf615 0%, transparent 70%)', filter: 'blur(100px)' }}
        />

        {/* 6 · Noise grain texture on top */}
        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
          style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
        />
      </div>

      {/* ── Floating Tech Entities ────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * 100 + "%",
              y: Math.random() * 100 + "%",
              opacity: 0
            }}
            animate={{
              y: ["0%", "-20%", "0%"],
              opacity: [0, 0.2, 0]
            }}
            transition={{
              duration: 5 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            className="absolute w-px h-12 bg-gradient-to-b from-[#00ff88]/20 to-transparent"
          />
        ))}
      </div>

      {/* Navbar Minimalist */}
      <nav className="fixed top-0 w-full px-8 py-6 z-[9999] pointer-events-none">
        <div className="flex justify-between items-center max-w-[1400px] mx-auto pointer-events-auto">
          <div
            className="flex items-center gap-3 font-syne font-black text-2xl tracking-tighter cursor-pointer mix-blend-difference"
            onClick={() => {
              setHasStarted(false);
              setSelectedIdea(null);
              clearIdeas();
              localStorage.removeItem('hackdraft_started');
              localStorage.removeItem('hackdraft_selected');
            }}
          >
            <Brain className="text-accent" />
            HACKDRAFT<span className="text-accent">_</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-10 font-mono text-[10px] uppercase tracking-widest text-gray-400/60 mix-blend-difference">
              <span className="flex items-center gap-2 group transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span>
                [agent_status: {loading ? 'processing' : 'idle'}]
              </span>
              <span>[v1.0.4]</span>
            </div>

            <div className="flex items-center gap-4 ml-4">
              {user ? (
                <ProfileMenu
                  user={user}
                  onLogout={handleLogout}
                  onViewHistory={() => setIsHistoryOpen(true)}
                  projectCount={history.length}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openAuth('login')}
                    className="font-mono text-[10px] uppercase tracking-widest text-gray-400 hover:text-white transition-colors border border-white/5 px-4 py-2 hover:border-white/20"
                  >
                    [login]
                  </button>
                  <button
                    onClick={() => openAuth('signup')}
                    className="font-mono text-[10px] uppercase tracking-widest bg-white/5 text-white hover:bg-white/10 transition-all border border-white/10 px-4 py-2 hover:border-white/40"
                  >
                    [signup]
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 relative overflow-hidden" style={{ zIndex: 10 }}>
        <AnimatePresence mode="wait">
          {!hasStarted && !selectedIdea && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="max-w-[1100px] mx-auto px-8 relative flex flex-col justify-center min-h-[calc(100vh-160px)]"
            >
              <div className="text-center space-y-4 mb-4">
                <motion.h1
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-[9vw] sm:text-5xl md:text-6xl lg:text-7xl font-syne font-black leading-none uppercase tracking-tight whitespace-nowrap flex justify-center w-full"
                >
                  BUILD. SHIP. <span className="text-[#00ff88] underline decoration-[#00ff88]/20 ml-3">WIN.</span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.4 }}
                  className="max-w-2xl mx-auto text-base text-gray-500 font-mono leading-relaxed mt-4"
                >
                  Stop overthinking the problem statement. Hand your constraints to our architectural agents and start shipping your winning prototype in seconds.
                </motion.p>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <InputForm onSubmit={handleFormSubmit} loading={loading} />
              </motion.div>
            </motion.div>
          )}

          {hasStarted && loading && !selectedIdea && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LoadingTerminal />
            </motion.div>
          )}

          {hasStarted && !loading && ideas.length > 0 && !selectedIdea && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-[1200px] mx-auto px-8 animate-in fade-in slide-in-from-bottom duration-1000"
            >
              <div className="flex justify-between items-end mb-16">
                <div className="space-y-2">
                  <h2 className="text-5xl font-syne font-black uppercase tracking-tighter">Architectural Blueprints</h2>
                  <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">{ideas.length} Strategic Directions Generated for your theme.</p>
                </div>
                <button
                  onClick={() => { setHasStarted(false); }}
                  className="text-[#00ff88] font-mono text-[10px] uppercase border border-[#00ff88]/20 px-4 py-2 hover:bg-[#00ff88] hover:text-black transition-all"
                >
                  [redefine_problem]
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8 pb-20">
                {ideas.map((idea, index) => (
                  <IdeaCard key={idea.id} idea={idea} onSelect={setSelectedIdea} />
                ))}
              </div>
            </motion.div>
          )}

          {selectedIdea && (
            <motion.div
              key="detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="animate-in fade-in duration-500"
            >
              <DetailView
                idea={selectedIdea}
                onBack={() => setSelectedIdea(null)}
                onRefine={handleRefine}
                onUpdate={handleUpdateIdea}
              />
              <ChatBot idea={selectedIdea} />
              {loading && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                  <LoadingTerminal />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="max-w-xl mx-auto p-10 border-2 border-rose-500 bg-rose-500/10 text-center space-y-4">
            <h3 className="text-2xl font-syne font-bold uppercase text-rose-500">System Error</h3>
            <p className="font-mono text-sm text-rose-400">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-primary bg-rose-500 hover:bg-rose-400">REBOOT SYSTEM</button>
          </div>
        )}
      </main>

      {/* Footer Minimalist */}
      <footer className="fixed bottom-0 w-full px-8 py-4 z-40 bg-background/50 backdrop-blur-sm border-t border-white/5 pointer-events-none">
        <div className="flex justify-between items-center max-w-[1400px] mx-auto pointer-events-auto">
          <div className="flex items-center gap-4 text-gray-600 font-mono text-[10px]">
            <span className="flex items-center gap-1"><Terminal size={10} /> ENGINE: MISTRAL-7B_V0.3</span>
            <span>|</span>
            <span>LATENCY: 1.2S</span>
          </div>
          <div className="text-gray-600 font-mono text-[10px] tracking-tighter uppercase">
            Designed for Ksolves Hackathon 2024
          </div>
        </div>
      </footer>
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={showSignupFirst ? 'signup' : 'login'}
        externalMessage={authMessage}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {isHistoryOpen && (
        <HistoryModal
          history={history}
          onSelect={(idea) => {
            setSelectedIdea(idea);
            setHasStarted(true);
            setIsHistoryOpen(false);
          }}
          onClose={() => setIsHistoryOpen(false)}
          onClear={() => {
            setHistory([]);
            localStorage.removeItem('hackdraft_history');
          }}
        />
      )}
    </div>
  );
}

export default App;
