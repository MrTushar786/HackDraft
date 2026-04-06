import React from 'react';
import type { ProjectIdea } from '../types';

interface BlueprintPDFProps {
  idea: ProjectIdea;
}

export const BlueprintPDF: React.FC<BlueprintPDFProps> = ({ idea }) => {
  return (
    <div 
      id="hackdraft-blueprint-pdf-v2"
      className="bg-[#0a0a0a] text-white p-12 w-[1200px]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="border-[12px] border-[#00ff88]/20 p-16 relative">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-20">
          <div>
            <div className="text-[#00ff88] font-mono text-xs uppercase tracking-[0.5em] mb-4 font-bold">HackDraft AI / Official Output</div>
            <h1 className="text-8xl font-black uppercase tracking-tighter leading-none mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>
              {idea.name}
            </h1>
            <p className="text-3xl text-gray-500 italic max-w-4xl leading-relaxed">
              "{idea.tagline}"
            </p>
          </div>
          <div className="text-right flex flex-col gap-2">
            <div className="text-xs font-mono text-gray-600 bg-white/5 px-4 py-2 rounded-full border border-white/10 uppercase tracking-widest">{idea.difficulty} Difficulty</div>
            <div className="text-[10px] font-mono text-gray-800 uppercase tracking-widest">ID: HM-{Math.random().toString(36).substring(7).toUpperCase()}</div>
            <div className="text-[10px] font-mono text-gray-800 uppercase tracking-widest">Date: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="grid grid-cols-2 gap-12 mb-20 bg-white/[0.02] border border-white/5 p-12">
          <div>
            <h3 className="text-[#00ff88] font-mono text-xs uppercase tracking-[0.3em] font-bold mb-6">The Friction Point</h3>
            <p className="text-xl text-gray-400 leading-relaxed italic border-l-2 border-rose-500/30 pl-6">"{idea.problem}"</p>
          </div>
          <div>
            <h3 className="text-[#00ff88] font-mono text-xs uppercase tracking-[0.3em] font-bold mb-6">The Tactical Response</h3>
            <p className="text-xl text-[#00ff88]/80 leading-relaxed font-medium">{idea.solution}</p>
          </div>
        </div>

        {/* Wow Factor */}
        <div className="mb-20 bg-[#00ff88]/10 border border-[#00ff88]/20 p-10">
          <h3 className="text-[#00ff88] font-mono text-xs uppercase tracking-[0.3em] font-bold mb-4">Wow Factor ⚡</h3>
          <p className="text-2xl font-bold italic text-white leading-relaxed">{idea.wowFactor}</p>
        </div>

        {/* Technical Architecture */}
        <div className="mb-20">
          <h3 className="text-[#00ff88] font-mono text-xs uppercase tracking-[0.3em] font-bold mb-8 border-b border-white/10 pb-4">System Architecture</h3>
          <div className="bg-black/40 p-10 border border-white/5 rounded-xl">
             <p className="text-lg text-gray-300 leading-relaxed mb-6 font-mono opacity-80">{idea.architecture}</p>
             {idea.mermaidDiagram && (
               <div className="mt-6 p-6 bg-white/[0.01] border border-white/10 font-mono text-sm text-emerald-500/50 italic opacity-50">
                 [Architectural Logic Parser Active: {idea.mermaidDiagram.substring(0, 100)}...]
               </div>
             )}
          </div>
        </div>

        {/* Features & Roadmap */}
        <div className="grid grid-cols-2 gap-12 mb-20">
          <div>
            <h3 className="text-[#00ff88] font-mono text-xs uppercase tracking-[0.3em] font-bold mb-8 border-b border-white/10 pb-4">Core Feature Set</h3>
            <div className="space-y-4">
              {idea.features?.map((f, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <span className="text-[#00ff88] font-mono font-bold text-lg opacity-40">0{i+1}</span>
                  <p className="text-lg text-gray-300 font-medium">{f}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-[#00ff88] font-mono text-xs uppercase tracking-[0.3em] font-bold mb-8 border-b border-white/10 pb-4">Development Horizon</h3>
            <div className="space-y-6">
              {idea.timeline?.map((t, i) => (
                <div key={i} className="border-l border-white/10 pl-6 relative">
                  <div className="absolute top-0 left-0 w-2 h-2 rounded-full bg-[#00ff88] -translate-x-[4.5px]" />
                  <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">{t.phase}</span>
                  <p className="text-base text-white font-bold mt-1">{t.tasks[0]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tech Stack Fidelity */}
        <div className="mb-20">
          <h3 className="text-[#00ff88] font-mono text-xs uppercase tracking-[0.3em] font-bold mb-8 border-b border-white/10 pb-4">Tech Specs</h3>
          <div className="grid grid-cols-3 gap-6">
            {idea.techStack?.map((t, i) => (
              <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-lg">
                 <h4 className="text-white font-bold text-lg mb-2">{t.name}</h4>
                 <p className="text-sm text-gray-500 font-mono italic leading-relaxed">{t.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* API Design */}
        {idea.apiEndpoints && idea.apiEndpoints.length > 0 && (
          <div className="mb-20">
            <h3 className="text-[#00ff88] font-mono text-xs uppercase tracking-[0.3em] font-bold mb-8 border-b border-white/10 pb-4">Restful API Blueprint</h3>
            <div className="bg-black/20 border border-white/5 divide-y divide-white/[0.05]">
               {idea.apiEndpoints.map((endpoint, i) => (
                 <div key={i} className="p-6 flex items-center justify-between">
                   <div className="flex items-center gap-6">
                     <span className="bg-emerald-500/20 text-[#00ff88] px-3 py-1 text-[11px] font-mono font-bold border border-emerald-500/20 rounded">{endpoint.method}</span>
                     <code className="text-white font-mono text-base">{endpoint.path}</code>
                   </div>
                   <p className="text-sm text-gray-500 italic max-w-sm text-right font-mono">{endpoint.description}</p>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* Database Architecture */}
        <div className="mb-20">
          <h3 className="text-[#00ff88] font-mono text-xs uppercase tracking-[0.3em] font-bold mb-8 border-b border-white/10 pb-4">Schema Map</h3>
          <div className="bg-black/40 p-8 border border-white/5 font-mono text-[14px]">
             <pre className="text-emerald-500/80 whitespace-pre-wrap leading-relaxed opacity-90">{idea.dbSchemaDiagram}</pre>
          </div>
        </div>

        {/* Setup & Deployment */}
        {(idea.setupCommands || idea.setupCommand) && (
          <div className="mb-20">
            <h3 className="text-[#00ff88] font-mono text-xs uppercase tracking-[0.3em] font-bold mb-8 border-b border-white/10 pb-4">Rapid Deployment Sequence</h3>
            <div className="bg-[#111] border border-white/5 p-8 rounded-lg font-mono text-sm space-y-4">
              {(idea.setupCommands || [idea.setupCommand || ""]).map((cmd, i) => (
                <div key={i} className="flex gap-4 text-emerald-500/70">
                  <span className="opacity-30">$</span>
                  <span className="text-gray-300">{cmd}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Winning Pitch Section */}
        <div className="mb-20">
           <div className="bg-emerald-500/10 border-2 border-emerald-500/50 p-12">
              <h3 className="text-emerald-500 font-mono text-xs uppercase tracking-[0.5em] font-bold mb-10 text-center">3-Minute High-Compression Pitch</h3>
              <div className="space-y-10 max-w-4xl mx-auto">
                 {idea.pitchScript?.map((s, i) => (
                   <div key={i}>
                      <span className="text-[10px] font-mono text-emerald-500/60 uppercase tracking-widest block mb-3">{s.section} [{s.duration}]</span>
                      <p className="text-xl text-gray-200 leading-[1.8] font-serif font-medium">"{s.script}"</p>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Business Logic Extras */}
        <div className="grid grid-cols-2 gap-12 mb-20">
           <div className="bg-emerald-500/5 border border-emerald-500/10 p-10">
              <h3 className="text-emerald-500 font-mono text-xs uppercase tracking-[0.3em] font-bold mb-4">Market Potential</h3>
              <p className="text-lg text-gray-400 italic">Target: {idea.monetization || "Global Market Expansion"}</p>
           </div>
           {idea.roadblocks && idea.roadblocks.length > 0 && (
             <div className="bg-rose-500/5 border border-rose-500/10 p-10 font-mono">
                <h3 className="text-rose-500 text-xs uppercase tracking-[0.3em] font-bold mb-4">Critical Roadblocks</h3>
                <ul className="space-y-2 text-sm text-gray-500">
                   {idea.roadblocks.map((rb, i) => <li key={i}>× {rb}</li>)}
                </ul>
             </div>
           )}
        </div>

        {/* Footer */}
        <div className="mt-32 pt-10 border-t border-white/10 flex items-center justify-between opacity-30">
          <div className="text-[10px] font-mono tracking-widest grayscale font-bold">BY HACKDRAFT AI ENGINE V2.1</div>
          <div className="text-[10px] font-mono tracking-widest grayscale">© {new Date().getFullYear()} ALL PLATFORMS PROTECTED</div>
          <div className="w-12 h-1 bg-[#00ff88]" />
        </div>
      </div>
    </div>
  );
};
