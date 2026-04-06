import { useState, useEffect } from 'react';
import { Terminal, Activity } from 'lucide-react';

const LOG_MESSAGES = [
  "HYDRATING AGENT CONTEXT...",
  "THINKING LIKE A SENIOR ARCHITECT...",
  "ANALYZING WINNING HACKATHON PATTERNS...",
  "CRAFTING INNOVATIVE BLUEPRINTS...",
  "OPTIMIZING TECH STACKS FOR SHIP-SPEED...",
  "POLISHING WOW-FACTOR ELEMENTS...",
  "GENERATING BOILERPLATE SNIPPETS...",
  "FINALIZING TIMELINE BREAKDOWN..."
];

export const LoadingTerminal = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [visibleIdx, setVisibleIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleIdx(prev => (prev + 1) % LOG_MESSAGES.length);
      setLogs(prev => {
        const newLogs = [...prev, LOG_MESSAGES[visibleIdx]];
        return newLogs.slice(-6); // Keep last 6 logs
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [visibleIdx]);

  return (
    <div className="max-w-2xl mx-auto py-24 px-8 text-center space-y-12">
      <div className="relative inline-block">
        <div className="absolute -inset-4 bg-accent/20 blur-2xl rounded-full animate-pulse opacity-50" />
        <div className="relative bg-[#151515] border border-accent/40 w-24 h-24 flex items-center justify-center animate-bounce">
          <Activity className="text-accent" size={32} />
        </div>
      </div>

      <div className="space-y-6 text-left font-mono max-w-sm mx-auto">
        <div className="flex items-center gap-3 text-accent/80 text-sm">
          <Terminal size={16} />
          <span className="font-bold tracking-widest uppercase">System Initialization</span>
        </div>
        
        <div className="space-y-2 border-l border-white/5 pl-4 min-h-32">
          {logs.map((log, i) => (
            <p key={i} className="text-xs text-gray-500 flex items-center gap-2 animate-in fade-in slide-in-from-left duration-500">
              <span className="text-accent/30 tracking-tighter">[{new Date().toLocaleTimeString()}]</span>
              {log}
            </p>
          ))}
          <p className="text-accent text-xs flex items-center gap-1">
            &gt; SYNCING_REALTIME_DATA<span className="terminal-cursor" />
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-mono text-gray-400 animate-pulse">BUILDING YOUR WINNING STRATEGY...</p>
        <div className="w-full h-1 bg-white/5 overflow-hidden max-w-xs mx-auto">
          <div className="h-full bg-accent animate-[loading_4s_ease-in-out_infinite]" />
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};
