import type { ProjectIdea } from '../types';
import { ArrowUpRight, Zap, ChevronRight } from 'lucide-react';

const difficultyConfig: Record<string, { border: string; text: string; glow: string; dot: string }> = {
  Beginner: { border: 'border-emerald-500/40', text: 'text-emerald-400', glow: 'hover:shadow-emerald-500/10', dot: 'bg-emerald-400' },
  Intermediate: { border: 'border-amber-500/40', text: 'text-amber-400', glow: 'hover:shadow-amber-500/10', dot: 'bg-amber-400' },
  Advanced: { border: 'border-rose-500/40', text: 'text-rose-400', glow: 'hover:shadow-rose-500/10', dot: 'bg-rose-400' },
};

export const IdeaCard = ({ idea, onSelect }: { idea: ProjectIdea; onSelect: (idea: ProjectIdea) => void }) => {
  const config = difficultyConfig[idea.difficulty] ?? difficultyConfig.Advanced;

  return (
    <div
      className={`flex flex-col group h-full cursor-pointer border transition-all duration-500 overflow-hidden hover:-translate-y-2 hover:shadow-2xl ${config.glow}`}
      style={{
        background: 'rgba(12, 12, 12, 0.55)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(0, 255, 136, 0.35)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 0 40px -10px rgba(0,255,136,0.15), inset 0 0 60px -20px rgba(0,255,136,0.04)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255, 255, 255, 0.08)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
      onClick={() => onSelect(idea)}
    >
      {/* Top accent line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#00ff88]/20 to-transparent group-hover:via-[#00ff88]/60 transition-all duration-500" />

      <div className="p-7 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
            <span className={`text-[10px] font-mono font-bold uppercase tracking-widest border px-2.5 py-1 ${config.border} ${config.text} bg-current/5`}>
              {idea.difficulty}
            </span>
          </div>
          <ArrowUpRight
            className="text-[#00ff88] opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            size={18}
          />
        </div>

        {/* Name & tagline */}
        <div className="mb-5">
          <h3 className="text-2xl font-syne font-black uppercase mb-2.5 leading-tight group-hover:text-[#00ff88] transition-colors duration-300">
            {idea.name}
          </h3>
          <p className="text-gray-500 font-mono text-[13px] leading-relaxed italic line-clamp-2">
            {idea.tagline}
          </p>
        </div>

        {/* Problem teaser */}
        <p className="text-[13px] text-gray-400 leading-relaxed line-clamp-3 mb-5 flex-1">
          {idea.problem}
        </p>

        {/* Tech tags */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {idea.techStack.slice(0, 5).map((tech) => (
            <span
              key={tech.name}
              className="px-2 py-0.5 border border-white/10 text-[10px] font-mono text-gray-500 group-hover:border-white/20 transition-colors"
            >
              {tech.name}
            </span>
          ))}
          {idea.techStack.length > 5 && (
            <span className="px-2 py-0.5 border border-white/5 text-[10px] font-mono text-gray-600">
              +{idea.techStack.length - 5}
            </span>
          )}
        </div>

        {/* Wow factor */}
        <div className="flex items-start gap-3 p-4 bg-[#00ff88]/5 border border-[#00ff88]/10 group-hover:border-[#00ff88]/25 transition-colors mb-5">
          <Zap size={14} className="text-[#00ff88] shrink-0 mt-0.5" />
          <div>
            <span className="block text-[9px] uppercase font-mono text-[#00ff88]/50 font-bold tracking-widest mb-1">Wow Factor</span>
            <p className="text-[12px] text-gray-400 leading-snug group-hover:text-gray-300 transition-colors line-clamp-2">
              {idea.wowFactor}
            </p>
          </div>
        </div>

        {/* CTA */}
        <button className="w-full flex items-center justify-center gap-2 py-3.5 border border-white/10 group-hover:border-[#00ff88]/60 group-hover:bg-[#00ff88] group-hover:text-black font-mono text-xs uppercase tracking-widest text-[#00ff88] transition-all duration-300">
          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          Explore Blueprint
        </button>
      </div>
    </div>
  );
};
