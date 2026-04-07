import { useState } from 'react';
import type { HackathonInput } from '../types';
import { Cpu, Terminal, Users, Clock, Plus, X } from 'lucide-react';

const DURATIONS = ['24h', '48h', '72h'];
const TEAM_SIZES = ['Solo', '2-3 people', '4-5 people'];
const DEFAULT_SKILLS = [
  'React', 'Next.js', 'Vite', 'TypeScript', 'Python', 'Go', 'Rust',
  'ML', 'NLP', 'Computer Vision', 'LLMs', 'Agentic AI', 'Vector DBs',
  'Web3', 'Solidity', 'Blockchain', 'Ethereum',
  'PostgreSQL', 'Prisma', 'MongoDB', 'Firebase', 'Supabase',
  'Tailwind', 'Framer Motion', 'Three.js', 'WebSockets', 'Shadcn UI'
];

export const InputForm = ({ onSubmit, loading }: { onSubmit: (data: HackathonInput) => void; loading: boolean }) => {
  const [formData, setFormData] = useState<HackathonInput>({
    theme: '',
    duration: '24h',
    teamSize: 'Solo',
    skills: [],
  });
  const [customSkill, setCustomSkill] = useState('');
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [showCustomDuration, setShowCustomDuration] = useState(false);
  const [showCustomTeamSize, setShowCustomTeamSize] = useState(false);
  const [formError, setFormError] = useState('');

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleAddCustomSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customSkill.trim()) {
      e.preventDefault();
      if (!formData.skills.includes(customSkill.trim())) {
        toggleSkill(customSkill.trim());
      }
      setCustomSkill('');
      setShowSkillInput(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.theme.trim().length < 30) {
      setFormError('⚠ ERROR: Please provide more details (min. 30 characters) about your idea to proceed.');
      return;
    }
    if (formData.skills.length === 0) {
      setFormError('⚠ ERROR: At least select one Tech Skill / Technology to proceed.');
      return;
    }
    setFormError('');
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto space-y-6 py-6 px-6 relative z-10 overflow-hidden"
      style={{
        background: 'rgba(8, 8, 8, 0.6)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '16px',
        boxShadow: '0 0 80px -20px rgba(0,0,0,0.8), inset 0 0 40px -20px rgba(0,255,136,0.03)',
      }}
    >
      {/* Background Glow */}
      <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-accent/5 blur-[120px] pointer-events-none" />

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-accent uppercase font-mono tracking-tighter text-xs font-bold">
          <Terminal size={12} /> Project Theme / Problem
        </label>
        <textarea
          placeholder="e.g. AI for sustainable urban logistics..."
          className="input-field min-h-[80px] resize-none leading-relaxed text-sm bg-black/40 border-white/10 p-4"
          value={formData.theme}
          onChange={e => {
            setFormData({ ...formData, theme: e.target.value });
            if (formError && e.target.value.trim().length >= 30) setFormError('');
          }}
          required
        />
        {formData.theme.length > 0 && formData.theme.length < 30 && (
          <div className="text-[#ffaa00] font-mono text-[9px] uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
            <span className="font-bold">⚠ ALERT:</span> Please explain your theme in more detail (min. 30 chars) for an ultra-accurate AI blueprint.
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-accent uppercase font-mono tracking-tighter text-[10px] font-bold">
            <Clock size={12} /> Duration
          </label>
          <div className="flex flex-wrap gap-1">
            {DURATIONS.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setFormData({ ...formData, duration: d as any });
                  setShowCustomDuration(false);
                }}
                className={`flex-1 py-1.5 px-2 border font-mono text-[10px] transition-all rounded-sm font-bold whitespace-nowrap min-w-[40px] text-center ${formData.duration === d ? 'bg-accent text-background border-accent shadow-[0_0_15px_rgba(0,255,136,0.3)]' : 'border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/5'
                  }`}
              >
                {d}
              </button>
            ))}

            {!showCustomDuration && (!formData.duration || DURATIONS.includes(formData.duration)) ? (
              <button
                type="button"
                onClick={() => setShowCustomDuration(true)}
                className="flex-1 py-1.5 px-2 border border-dashed border-white/20 text-gray-500 font-mono text-[10px] hover:border-accent hover:text-accent transition-all rounded-sm whitespace-nowrap min-w-[50px] text-center"
              >
                + Custom
              </button>
            ) : (
              <input
                autoFocus
                className="flex-1 min-w-[70px] bg-black/40 border border-accent px-2 py-1.5 font-mono text-[10px] text-white outline-none rounded-sm placeholder:text-gray-600"
                placeholder="e.g. 1 Week"
                value={!DURATIONS.includes(formData.duration) ? formData.duration : ''}
                onChange={e => setFormData({ ...formData, duration: e.target.value as any })}
                onBlur={() => {
                  if (!formData.duration || DURATIONS.includes(formData.duration)) setShowCustomDuration(false);
                }}
              />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-accent uppercase font-mono tracking-tighter text-[10px] font-bold">
            <Users size={12} /> Squad Size
          </label>
          <div className="flex flex-wrap gap-1">
            {TEAM_SIZES.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setFormData({ ...formData, teamSize: t as any });
                  setShowCustomTeamSize(false);
                }}
                className={`flex-1 py-1.5 px-2 border font-mono text-[9px] transition-all rounded-sm font-bold whitespace-nowrap min-w-[50px] text-center ${formData.teamSize === t ? 'bg-accent text-background border-accent shadow-[0_0_15px_rgba(0,255,136,0.3)]' : 'border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/5'
                  }`}
              >
                {t}
              </button>
            ))}

            {!showCustomTeamSize && (!formData.teamSize || TEAM_SIZES.includes(formData.teamSize)) ? (
              <button
                type="button"
                onClick={() => setShowCustomTeamSize(true)}
                className="flex-1 py-1.5 px-2 border border-dashed border-white/20 text-gray-500 font-mono text-[9px] hover:border-accent hover:text-accent transition-all rounded-sm whitespace-nowrap min-w-[50px] text-center"
              >
                + Custom
              </button>
            ) : (
              <input
                autoFocus
                className="flex-1 min-w-[70px] bg-black/40 border border-accent px-2 py-1.5 font-mono text-[9px] text-white outline-none rounded-sm placeholder:text-gray-600"
                placeholder="e.g. 10 Devs"
                value={!TEAM_SIZES.includes(formData.teamSize) ? formData.teamSize : ''}
                onChange={e => setFormData({ ...formData, teamSize: e.target.value as any })}
                onBlur={() => {
                  if (!formData.teamSize || TEAM_SIZES.includes(formData.teamSize)) setShowCustomTeamSize(false);
                }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-accent uppercase font-mono tracking-tighter text-[10px] font-bold">
          <Cpu size={12} /> Tech Arsenal / Skill Proficiency
        </label>
        <div className="flex flex-wrap gap-1">
          {DEFAULT_SKILLS.map(skill => (
            <button
              key={skill}
              type="button"
              onClick={() => toggleSkill(skill)}
              className={`px-3 py-1 border font-mono text-[9px] transition-all flex items-center gap-1.5 rounded-sm font-bold ${formData.skills.includes(skill) ? 'bg-accent/10 border-accent/40 text-accent' : 'border-white/5 text-gray-500 hover:border-white/20 hover:text-white hover:bg-white/5'
                }`}
            >
              {skill}
            </button>
          ))}
          {/* User Added Skills */}
          {formData.skills.filter(s => !DEFAULT_SKILLS.includes(s)).map(skill => (
            <button
              key={skill}
              type="button"
              onClick={() => toggleSkill(skill)}
              className="px-3 py-1 border border-accent/40 bg-accent/20 text-accent font-mono text-[9px] transition-all rounded-sm font-bold flex items-center gap-1.5"
            >
              <X size={10} /> {skill}
            </button>
          ))}

          {!showSkillInput ? (
            <button
              type="button"
              onClick={() => setShowSkillInput(true)}
              className="px-3 py-1 border border-dashed border-white/20 text-gray-500 font-mono text-[9px] hover:border-accent hover:text-accent transition-all rounded-sm"
            >
              + ADD CUSTOM TECH
            </button>
          ) : (
            <input
              autoFocus
              className="bg-black/40 border border-accent px-3 py-1 font-mono text-[9px] text-white outline-none rounded-sm w-32 placeholder:text-gray-600"
              placeholder="e.g. AWS, Redis..."
              value={customSkill}
              onChange={e => setCustomSkill(e.target.value)}
              onKeyDown={handleAddCustomSkill}
              onBlur={() => !customSkill && setShowSkillInput(false)}
            />
          )}
        </div>
      </div>

      {formError && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-500 p-3 rounded text-xs font-mono font-bold animate-pulse">
          {formError}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-3.5 text-sm font-syne font-black tracking-widest mt-2"
      >
        {loading ? 'MODULATING ARCHITECTS...' : 'SCRUCTURE BLUEPRINTS'}
      </button>
    </form>
  );
};
