import { useState, useEffect } from 'react';
import { useAgent } from './hooks/useAgent';
import { InputForm } from './components/InputForm';
import { IdeaCard } from './components/IdeaCard';
import { DetailView } from './components/DetailView';
import { LoadingTerminal } from './components/LoadingTerminal';
import { ChatBot } from './components/ChatBot';
import type { ProjectIdea } from './types';
import { Brain, Terminal } from 'lucide-react';

function App() {
  const { loading, ideas, error, generateIdeas, refineIdea, clearIdeas, updateIdea } = useAgent();
  const [selectedIdea, setSelectedIdea] = useState<ProjectIdea | null>(() => {
    const saved = localStorage.getItem('hackdraft_selected');
    return saved ? JSON.parse(saved) : null;
  });
  const [hasStarted, setHasStarted] = useState(() => {
    const saved = localStorage.getItem('hackdraft_started');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('hackdraft_selected', JSON.stringify(selectedIdea));
  }, [selectedIdea]);

  useEffect(() => {
    localStorage.setItem('hackdraft_started', hasStarted.toString());
  }, [hasStarted]);

  const handleFormSubmit = (data: any) => {
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
    <div className="min-h-screen bg-background text-foreground custom-scrollbar overflow-x-hidden selection:bg-accent selection:text-black">
      {/* Navbar Minimalist */}
      <nav className="fixed top-0 w-full px-8 py-6 z-50 mix-blend-difference pointer-events-none">
        <div className="flex justify-between items-center max-w-[1400px] mx-auto pointer-events-auto">
          <div 
            className="flex items-center gap-3 font-syne font-black text-2xl tracking-tighter cursor-pointer" 
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
          <div className="hidden md:flex gap-10 font-mono text-[10px] uppercase tracking-widest text-gray-500">
            <span>[agent_status: idle]</span>
            <span>[v1.0.4]</span>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12">
        {!hasStarted && !selectedIdea && (
          <div className="max-w-[1100px] mx-auto px-8">
             <div className="text-center space-y-4 mb-4">
                <h1 className="text-[9vw] sm:text-5xl md:text-6xl lg:text-7xl font-syne font-black leading-none uppercase tracking-tight whitespace-nowrap flex justify-center w-full">
                  BUILD. SHIP. <span className="text-accent underline decoration-accent/20 ml-3">WIN.</span>
                </h1>
                <p className="max-w-2xl mx-auto text-base text-gray-500 font-mono leading-relaxed mt-4">
                  Stop overthinking the problem statement. Hand your constraints to our senior architect agents and start shipping your winning prototype in seconds.
                </p>
             </div>
             <InputForm onSubmit={handleFormSubmit} loading={loading} />
          </div>
        )}

        {hasStarted && loading && !ideas.length && <LoadingTerminal />}

        {hasStarted && !loading && ideas.length > 0 && !selectedIdea && (
          <div className="max-w-[1200px] mx-auto px-8 animate-in fade-in slide-in-from-bottom duration-1000">
            <div className="flex justify-between items-end mb-16">
               <div className="space-y-2">
                 <h2 className="text-5xl font-syne font-black uppercase">Architectural Blueprints</h2>
                 <p className="font-mono text-xs text-gray-500 uppercase tracking-widest">{ideas.length} Strategic Directions Generated for your theme.</p>
               </div>
               <button 
                 onClick={() => { setHasStarted(false); }} 
                 className="text-accent font-mono text-[10px] uppercase border border-accent/20 px-4 py-2 hover:bg-accent hover:text-black transition-all"
               >
                 [redefine_problem]
               </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {ideas.map((idea, index) => (
                <IdeaCard key={idea.id === "uuid-string-here" ? `idea-${index}` : idea.id} idea={idea} onSelect={setSelectedIdea} />
              ))}
            </div>
          </div>
        )}

        {selectedIdea && (
          <div className="animate-in fade-in duration-500">
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
          </div>
        )}

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
    </div>
  );
}

export default App;
