import { useState } from 'react';
import type { ProjectIdea } from '../types';
import { CodeBlock } from './CodeBlock';
import {
  ArrowLeft, Copy, RotateCcw,
  Layers, Package, ListTodo,
  Clock3, Sparkles, AlertCircle,
  Database, ShieldCheck, Zap,
  CheckCircle2, ChevronRight, Brain, Download, Terminal, MessageSquareQuote,
  DollarSign, Route, FlagTriangleRight, Unplug, Presentation, MousePointerClick, TableProperties, Mic,
  Swords, Scale, Gift, Target, Printer, FileDown, Check,
  type LucideIcon
} from 'lucide-react';
import { Mermaid } from './Mermaid';
import { UIFlowCanvas } from './UIFlowCanvas';
import { DBSchemaCanvas } from './DBSchemaCanvas';
import { ArchitectureCanvas } from './ArchitectureCanvas';
import { BlueprintPDF } from './BlueprintPDF';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
const difficultyStyles: Record<string, { badge: string; glow: string; bg: string }> = {
  Beginner:     { badge: 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10', glow: 'shadow-emerald-500/20', bg: 'from-emerald-500/5' },
  Intermediate: { badge: 'text-amber-400 border-amber-500/50 bg-amber-500/10',       glow: 'shadow-amber-500/20',   bg: 'from-amber-500/5'   },
  Advanced:     { badge: 'text-rose-400 border-rose-500/50 bg-rose-500/10',           glow: 'shadow-rose-500/20',    bg: 'from-rose-500/5'    },
};

const SectionHeader = ({ title, icon: Icon, subtitle }: { title: string; icon: LucideIcon; subtitle?: string }) => (
  <div className="flex items-start gap-4 mb-8">
    <div className="p-3 bg-[#00ff88]/10 border border-[#00ff88]/20 shrink-0">
      <Icon size={20} className="text-[#00ff88]" />
    </div>
    <div>
      <h2 className="text-2xl font-syne font-extrabold uppercase tracking-tight">{title}</h2>
      {subtitle && <p className="text-xs font-mono text-gray-500 mt-1 uppercase tracking-widest">{subtitle}</p>}
    </div>
  </div>
);

const Divider = () => (
  <div className="flex items-center gap-4 my-2">
    <div className="flex-1 h-px bg-white/5" />
    <div className="w-1 h-1 bg-[#00ff88]/30 rotate-45" />
    <div className="flex-1 h-px bg-white/5" />
  </div>
);

export const DetailView = ({
  idea,
  onBack,
  onRefine,
  onUpdate,
}: {
  idea: ProjectIdea;
  onBack: () => void;
  onRefine: (refinement: string) => void;
  onUpdate?: (updatedIdea: ProjectIdea) => void;
}) => {
  const [refineText, setRefineText] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedCmdIndex, setCopiedCmdIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const diff = difficultyStyles[idea.difficulty] ?? difficultyStyles.Advanced;

  const downloadReadme = () => {
    const md = `
# ${idea.name}
> ${idea.tagline}

## ⚡ The Problem
${idea.problem}

## 💡 The Solution
${idea.solution}

## 🏗️ Architecture
${idea.architecture}

${idea.setupCommand ? `## 🚀 Setup\n\`\`\`bash\n${idea.setupCommand}\n\`\`\`\n` : ''}
## ✨ Features
${idea.features?.map((f, i) => `${i + 1}. ${f}`)?.join('\n') ?? ''}

## 🛠️ Tech Stack
${idea.techStack?.map(t => `- **${t.name}**: ${t.reason}`)?.join('\n') ?? ''}
    `.trim();
    
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `README-${idea.name.replace(/\\s+/g,'-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyDetail = () => {
    const text = `
Project: ${idea.name}
Tagline: ${idea.tagline}
Difficulty: ${idea.difficulty}

PROBLEM:
${idea.problem}

SOLUTION:
${idea.solution}

ARCHITECTURE:
${idea.architecture}

WOW FACTOR:
${idea.wowFactor}

FEATURES:
${idea.features?.map((f, i) => `${i + 1}. ${f}`)?.join('\n') ?? ''}

TECH STACK:
${idea.techStack?.map(t => `• ${t.name}: ${t.reason}`)?.join('\n') ?? ''}

TIMELINE:
${idea.timeline?.map(p => `[${p.phase} — ${p.duration}]\n${p.tasks?.map(t => `  - ${t}`)?.join('\n') ?? ''}`)?.join('\n\n') ?? ''}
    `.trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadWorkspace = async () => {
    const zip = new JSZip();
    
    // Core Documentation
    zip.file("README.md", `# ${idea.name}\n\n> ${idea.tagline}\n\n## Overview\n${idea.solution}\n\n## Setup\n\`\`\`bash\n${idea.setupCommand}\n\`\`\`\n\n## Architecture\n${idea.architecture}\n`);
    
    // Core Dependencies & Scripts
    zip.file("package.json", JSON.stringify({
      name: idea.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      version: "0.1.0",
      description: idea.tagline,
      private: true,
      scripts: {
        dev: "echo 'Run the setup command from the README first!'",
        build: "echo 'Run the setup command from the README first!'"
      }
    }, null, 2));

    // Boilerplate files based on AI structure
    const srcFolder = zip.folder("src");
    if (idea.codeSnippets) {
       idea.codeSnippets.forEach((snippet) => {
          srcFolder?.file(snippet.filename, snippet.code);
       });
    }

    // Default Configs
    zip.file(".env.example", "# Generated by HackDraft AI\nDATABASE_URL=\nAPI_KEY=\nNEXT_PUBLIC_API_URL=\n");
    zip.file(".gitignore", "node_modules\n.env\ndist\nbuild\n.DS_Store\n.next\n");
    zip.file("docker-compose.yml", `version: '3.8'\nservices:\n  app:\n    build: .\n    ports:\n      - "3000:3000"\n    volumes:\n      - .:/app\n      - /app/node_modules`);

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${idea.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-workspace.zip`);
  };

  const downloadManualPDF = () => {
    // Initialize jsPDF (A4 Portrait, mm units)
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let curY = 25;

    // Helper: Add newline with page check
    const addText = (text: string, size = 12, color = '#333333', style = 'normal', spacing = 7) => {
      doc.setFontSize(size);
      doc.setTextColor(color);
      doc.setFont('helvetica', style);
      
      const lines = doc.splitTextToSize(text, contentWidth);
      const textHeight = (lines.length * (size / 3)) + 2;

      if (curY + textHeight > pageHeight - margin) {
        doc.addPage();
        curY = 25;
      }
      
      doc.text(lines, margin, curY);
      curY += textHeight + spacing;
    };

    // Helper: Section Headings
    const addSection = (title: string, accent = '#00ff88') => {
      if (curY + 25 > pageHeight - margin) {
        doc.addPage();
        curY = 25;
      }
      
      curY += 5;
      // Section Box
      doc.setFillColor(245, 255, 250);
      doc.rect(margin - 2, curY - 6, contentWidth + 4, 8, 'F');
      
      // Left border accent
      doc.setFillColor(accent);
      doc.rect(margin - 2, curY - 6, 2, 8, 'F');
      
      doc.setFontSize(10);
      doc.setTextColor(accent);
      doc.setFont('helvetica', 'bold');
      doc.text(title.toUpperCase(), margin + 2, curY);
      curY += 12;
    };

    // ── Header Background ─────────────────────────────────────────
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, pageWidth, 55, 'F');
    
    // Logo / Branding
    doc.setFontSize(8);
    doc.setTextColor(0, 255, 136);
    doc.setFont('helvetica', 'bold');
    doc.text('HACKDRAFT AI ENGINE V2.0', margin, 15);
    
    doc.setFontSize(32);
    doc.setTextColor(255, 255, 255);
    doc.text(idea.name.toUpperCase(), margin, 32);
    
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'italic');
    doc.text(idea.tagline, margin, 42);

    // Difficulty Badge in Header
    doc.setDrawColor(255, 255, 255, 0.2);
    doc.rect(pageWidth - margin - 35, 25, 35, 10);
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(idea.difficulty.toUpperCase() + ' TIER', pageWidth - margin - 32, 32);

    curY = 70;

    // ── Executive Summary ─────────────────────────────────────────
    addSection('I. Concept & Vision', '#00ff88');
    addText(idea.solution, 11, '#1a1a1a', 'normal', 6);
    
    addText('The Challenge:', 9, '#ff3b3b', 'bold', 2);
    addText(idea.problem, 10, '#666666', 'italic', 8);

    addText('The Wow Factor:', 9, '#00ff88', 'bold', 2);
    addText(idea.wowFactor || "Unique technical advantage in execution.", 10, '#000000', 'bold', 10);

    // ── Core Features ─────────────────────────────────────────────
    addSection('II. Core Capabilities', '#00ff88');
    idea.features?.forEach((f, i) => {
       addText(`[0${i + 1}] ${f}`, 10, '#333333', 'normal', 3);
    });
    curY += 5;

    // ── Technical Architecture ────────────────────────────────────
    addSection('III. System Architecture', '#00ff88');
    addText(idea.architecture?.replace(/[*#`_]/g, ''), 10, '#444444', 'normal', 8);
    
    if (idea.architectureFlow?.length) {
      addText('System Flow Sequence:', 9, '#000', 'bold', 3);
      idea.architectureFlow.forEach((flow) => {
         addText(`  • ${flow.replace(/[*#`_]/g, '')}`, 9, '#555', 'normal', 2);
      });
      curY += 5;
    }

    // ── Development Roadmap ───────────────────────────────────────
    if (idea.timeline?.length) {
      addSection('IV. Development Horizon', '#00ff88');
      idea.timeline.forEach((phase) => {
         addText(`Phase: ${phase.phase} (${phase.duration})`, 10, '#000', 'bold', 3);
         phase.tasks.forEach(task => {
            addText(`  • ${task.replace(/[*#`_]/g, '')}`, 9, '#666', 'normal', 1);
         });
         curY += 4;
      });
    }

    // ── Technology Stack ──────────────────────────────────────────
    addSection('V. Tech Fidelity Stack', '#00ff88');
    idea.techStack?.forEach((t) => {
       addText(`» ${t.name}`, 10, '#000000', 'bold', 1);
       addText(`  Choice Logic: ${t.reason.replace(/[*#`_]/g, '')}`, 9, '#666666', 'italic', 5);
    });

    // ── Rapid Setup Scripts ───────────────────────────────────────
    if (idea.setupCommands?.length || idea.setupCommand) {
      addSection('VI. Rapid Deployment Protocol', '#00ff88');
      doc.setFillColor(248, 249, 250);
      const cmds = idea.setupCommands || [idea.setupCommand || ""];
      const blockHeight = (cmds.length * 6) + 12;
      
      if (curY + blockHeight > pageHeight - margin) {
        doc.addPage();
        curY = 25;
      }
      
      doc.rect(margin, curY, contentWidth, blockHeight, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.rect(margin, curY, contentWidth, blockHeight, 'S');
      
      let cmdY = curY + 8;
      doc.setFontSize(8);
      doc.setFont('courier', 'normal');
      doc.setTextColor(30, 30, 30);
      cmds.forEach(cmd => {
         doc.text(`$ ${cmd}`, margin + 6, cmdY);
         cmdY += 6;
      });
      curY += blockHeight + 15;
    }

    // ── API & Data Infrastructure ─────────────────────────────────
    if (idea.apiEndpoints?.length) {
      addSection('VII. API & Connectivity Blueprint', '#00ff88');
      idea.apiEndpoints.forEach(ep => {
         addText(`${ep.method} ${ep.path}`, 10, '#000', 'bold', 1);
         addText(`Description: ${ep.description.replace(/[*#`_]/g, '')}`, 9, '#555', 'normal', 2);
         if (ep.requestBody && ep.requestBody !== 'none') {
           addText(`Request: ${ep.requestBody}`, 8, '#777', 'italic', 1);
         }
         addText(`Response example: ${ep.response || "200 OK"}`, 8, '#777', 'italic', 4);
      });
    }

    if (idea.dbSchemaDiagram) {
      addSection('VIII. Database Schema Definition', '#00ff88');
      
      // Clean markdown tags
      let cleanSchema = idea.dbSchemaDiagram.replace(/```[a-zA-Z]*\n?/g, '').replace(/```/g, '').trim();

      // Smart Prisma / SQL Schema Parser
      const models: {name: string, fields: {name: string, type: string, details: string}[]}[] = [];
      const modelRegex = /(?:model|CREATE TABLE)\s+([a-zA-Z0-9_"]+)[^{(]*[{(]([^})]*)[})]/gi;
      let match;
      while ((match = modelRegex.exec(cleanSchema)) !== null) {
        const modelName = match[1].replace(/"/g, '');
        const fieldsStr = match[2];
        const fields = fieldsStr
          .split('\n')
          .map(line => line.trim().replace(/,/g, ''))
          .filter(line => line && !line.startsWith('//') && !line.startsWith('--') && !line.startsWith('@@'));
        
        const parsedFields = fields.map(f => {
           const parts = f.split(/\s+/);
           return { name: parts[0], type: parts[1] || '', details: parts.slice(2).join(' ') };
        });
        
        models.push({ name: modelName, fields: parsedFields });
      }

      if (models.length > 0) {
        models.forEach(model => {
          // Table Title
          if (curY + 20 > pageHeight - margin) { doc.addPage(); curY = 25; }
          doc.setFillColor(240, 240, 240);
          doc.rect(margin, curY, contentWidth, 8, 'F');
          doc.setFontSize(9);
          doc.setTextColor(30, 30, 30);
          doc.setFont('helvetica', 'bold');
          doc.text(`Table: ${model.name}`, margin + 3, curY + 5);
          curY += 8;

          // Table Rows
          doc.setFontSize(8);
          doc.setFont('courier', 'normal');
          model.fields.forEach((field, idx) => {
            if (curY + 6 > pageHeight - margin) { doc.addPage(); curY = 25; }
            if (idx % 2 === 0) {
               doc.setFillColor(252, 252, 252);
               doc.rect(margin, curY, contentWidth, 6, 'F');
            }
            doc.setTextColor(0, 0, 0);
            doc.text(field.name.substring(0, 25), margin + 3, curY + 4);
            doc.setTextColor(0, 100, 200);
            doc.text(field.type.substring(0, 20), margin + 50, curY + 4);
            doc.setTextColor(100, 100, 100);
            const detailText = doc.splitTextToSize(field.details, contentWidth - 100);
            doc.text(detailText, margin + 90, curY + 4);
            curY += 6 + ((detailText.length - 1) * 3);
          });
          curY += 6;
        });
      } else {
        // Safe fallback if parsing fails completely
        addText("Structured DB Tables:", 9, "#000", "bold");
        addText(cleanSchema.substring(0, 800) + (cleanSchema.length > 800 ? "..." : ""), 8, '#555555', 'normal', 3);
      }
    }

    // ── Business & Growth ─────────────────────────────────────────
    addSection('IX. Market & Execution Strategy', '#00ff88');
    addText('Monetization Logic:', 9, '#000', 'bold', 1);
    
    // Clean markdown from monetization strategy
    const cleanMonetization = (idea.monetization || "Open Source / Community Growth Model").replace(/[*#`_]/g, '');
    addText(cleanMonetization, 10, '#444', 'normal', 6);
    
    if (idea.roadblocks?.length) {
      addText('Critical Roadblocks:', 9, '#ff3b3b', 'bold', 1);
      idea.roadblocks.forEach(rb => {
         addText(`  ⚠ ${rb.replace(/[*#`_]/g, '')}`, 9, '#666', 'italic', 2);
      });
      curY += 5;
    }

    // ── Competitive & Sponsorships ────────────────────────────────
    if (idea.competitorAnalysis?.length) {
      addSection('X. Competitive Intelligence', '#00ff88');
      idea.competitorAnalysis.forEach(comp => {
         addText(`vs. ${comp.name}`, 10, '#000', 'bold', 1);
         addText(`Weakness to Exploit: ${comp.weakness}`, 9, '#666', 'italic', 3);
      });
    }

    if (idea.targetSponsorships?.length) {
      addSection('XI. Target Sponsorships & APIs', '#00ff88');
      idea.targetSponsorships.forEach(sponsor => {
         addText(`${sponsor.company} (${sponsor.api})`, 10, '#000', 'bold', 1);
         addText(`Integration Play: ${sponsor.integrationIdea}`, 9, '#666', 'normal', 3);
      });
    }

    if (idea.techTradeoffs?.length) {
      addSection('XII. Engineering Trade-offs', '#00ff88');
      idea.techTradeoffs.forEach(trade => {
         addText(`Chosen: ${trade.choice} (Rejected: ${trade.alternative})`, 9, '#000', 'bold', 1);
         addText(`Reason: ${trade.reasonNotUsed}`, 9, '#666', 'italic', 3);
      });
    }

    // ── Final Pitch ───────────────────────────────────────────────
    addSection('XIII. Winning Pitch Script', '#00ff88');
    idea.pitchScript?.forEach(p => {
       addText(`[${p.section}] (${p.duration})`, 9, '#00ff88', 'bold', 1);
       addText(p.script, 10, '#111', 'italic', 6);
    });

    // ── Page Numbers & Legal Footer ───────────────────────────────
    const finalPageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= finalPageCount; i++) {
       doc.setPage(i);
       doc.setFontSize(7);
       doc.setTextColor(180, 180, 180);
       doc.text(`Doc Ref: HM-BLUEPRINT-${Math.random().toString(36).substring(7).toUpperCase()}`, margin, pageHeight - 12);
       doc.text(`Page ${i} of ${finalPageCount}`, pageWidth - margin - 15, pageHeight - 12);
       doc.rect(margin, pageHeight - 15, contentWidth, 0.1, 'F');
       doc.text('HACKDRAFT AI BLUEPRINT ENGINE • CONFIDENTIAL STRATEGY DOCUMENT', margin, pageHeight - 8);
    }

    // Final Download
    doc.save(`HackDraft-COMPLETE-Blueprint-${idea.name.replace(/\s+/g, '-')}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] detail-view">
      {/* ── Sticky Top Bar ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/10 no-print">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-500 hover:text-[#00ff88] font-mono text-xs uppercase tracking-widest transition-all group relative z-50 p-4 -ml-4 cursor-pointer select-none"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Blueprints
          </button>
          <div className="flex flex-wrap items-center gap-2 no-print">
            <button
               onClick={downloadManualPDF}
               className="flex items-center gap-2 bg-[#00ff88] text-black px-6 py-2.5 font-mono text-[11px] font-black uppercase tracking-[0.1em] hover:bg-white transition-all shadow-[0_0_40px_-10px_rgba(0,255,136,0.5)] border-2 border-[#00ff88]"
            >
              <Printer size={13} fill="currentColor" />
              Download Pro Blueprint PDF
            </button>
            <button
              onClick={downloadWorkspace}
              className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 font-mono text-[10px] uppercase tracking-widest hover:border-blue-500/40 hover:text-blue-500 transition-all"
            >
              <Package size={12} />
              Export ZIP
            </button>
            <button
              onClick={downloadReadme}
              className="flex items-center gap-2 border border-white/10 px-4 py-2 font-mono text-[10px] uppercase tracking-widest hover:border-yellow-500/40 hover:text-yellow-500 transition-all"
            >
              <Download size={12} />
              Export README
            </button>
            <button
              onClick={copyDetail}
              className="flex items-center gap-2 border border-white/10 px-4 py-2 font-mono text-[10px] uppercase tracking-widest hover:border-[#00ff88]/40 hover:text-[#00ff88] transition-all"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        {/* ── Hero Header ─────────────────────────────────────────────*/}
        <header className={`relative p-10 border border-white/5 bg-gradient-to-br ${diff.bg} to-transparent overflow-hidden`}>
          {/* Background glyph */}
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <Brain size={220} />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 text-[10px] font-mono font-bold uppercase border ${diff.badge}`}>
                {idea.difficulty} Difficulty
              </span>
              <span className="px-3 py-1 text-[10px] font-mono font-bold uppercase border border-[#00ff88]/20 text-[#00ff88]/60">
                HackDraft Blueprint
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-syne font-black uppercase leading-none tracking-tighter text-white">
              {idea.name}
            </h1>

            <p className="text-xl md:text-2xl font-mono text-gray-400 italic max-w-3xl leading-relaxed">
              "{idea.tagline}"
            </p>

            {/* Wow Factor Call-out */}
            <div className="inline-flex items-start gap-3 bg-[#00ff88]/5 border border-[#00ff88]/20 px-5 py-4 max-w-2xl">
              <Zap size={20} className="text-[#00ff88] shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] font-mono uppercase tracking-[0.3em] text-[#00ff88]/60 mb-1">Wow Factor</span>
                <p className="text-base text-white leading-relaxed font-medium">{idea.wowFactor}</p>
              </div>
            </div>
          </div>
        </header>

        {/* ── Problem & Solution ──────────────────────────────────────*/}
        <section>
          <SectionHeader title="Problem × Solution" icon={ShieldCheck} subtitle="The core challenge and our technical answer" />
          <div className="grid md:grid-cols-2 gap-6">
            {/* Problem */}
            <div className="p-8 bg-rose-500/5 border border-rose-500/15 space-y-4 relative overflow-hidden group hover:border-rose-500/30 transition-colors">
              <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <AlertCircle size={80} />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-rose-500 rotate-45" />
                <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-rose-400 font-bold">The Friction Point</h3>
              </div>
              <p className="text-gray-300 leading-[1.8] text-[15px]">{idea.problem}</p>
            </div>

            {/* Solution */}
            <div className="p-8 bg-[#00ff88]/5 border border-[#00ff88]/15 space-y-4 relative overflow-hidden group hover:border-[#00ff88]/30 transition-colors">
              <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles size={80} />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#00ff88] rotate-45" />
                <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-[#00ff88] font-bold">Our Technical Answer</h3>
              </div>
              <p className="text-white leading-[1.8] text-[15px]">{idea.solution}</p>
            </div>
          </div>
        </section>

        <Divider />

        {/* ── Architecture ────────────────────────────────────────────*/}
        <section>
          <SectionHeader title="System Architecture" icon={Layers} subtitle="End-to-end technical flow and data pipeline" />
          <div className="mt-8">
            <ArchitectureCanvas 
               steps={idea.architectureFlow || []} 
               mermaidDiagram={idea.mermaidDiagram}
               onChange={(newSteps) => onUpdate?.({ ...idea, architectureFlow: newSteps })}
            />
          </div>
        </section>


        <Divider />

        {/* ── Magic Setup ─────────────────────────────────────────────*/}
        {(idea.setupCommands || idea.setupCommand) && (
          <>
            <section>
              <SectionHeader title="Magic Setup Script" icon={Terminal} subtitle="The sequential commands to scaffold and launch your entire repo" />
              <div className="bg-[#0d0d0f] border border-white/10 overflow-hidden relative group hover:border-[#00ff88]/40 transition-colors shadow-2xl shadow-black rounded-lg">
                 <div className="flex bg-[#111] overflow-x-auto custom-scrollbar border-b border-white/5">
                    {/* Multi-Command Terminal Style */}
                    <div className="bg-[#151515] p-4 flex flex-col items-center border-r border-white/5 font-mono text-[#00ff88] text-[12px] opacity-30 select-none">
                       {(idea.setupCommands || [idea.setupCommand]).map((_, i) => (
                         <div key={i} className="mb-4 last:mb-0">$</div>
                       ))}
                    </div>
                    <div className="flex-1 p-4 font-mono text-[13px] text-gray-300">
                       {(idea.setupCommands || [idea.setupCommand || ""]).map((cmd, i) => (
                         <div key={i} className="mb-4 last:mb-0 flex items-center justify-between group/cmd">
                           <span className="break-all">{cmd}</span>
                           <button 
                             onClick={() => {
                               navigator.clipboard.writeText(cmd);
                               setCopiedCmdIndex(i);
                               setTimeout(() => setCopiedCmdIndex(null), 2000);
                             }}
                             className={`ml-4 px-2 py-0.5 border rounded text-[9px] uppercase transition-all ${
                               copiedCmdIndex === i 
                                 ? 'bg-[#00ff88] text-black border-[#00ff88]' 
                                 : 'opacity-0 group-hover/cmd:opacity-100 bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/20 hover:bg-[#00ff88] hover:text-black'
                             }`}
                           >
                             {copiedCmdIndex === i ? 'Copied' : 'Copy'}
                           </button>
                         </div>
                       ))}
                    </div>
                 </div>
                 <button 
                   onClick={() => {
                     const allCmds = (idea.setupCommands || [idea.setupCommand || ""]).join(' && ');
                     navigator.clipboard.writeText(allCmds);
                     setCopiedAll(true);
                     setTimeout(() => setCopiedAll(false), 2000);
                   }}
                   className={`w-full py-2 font-bold font-mono text-[10px] uppercase transition-colors flex items-center justify-center gap-2 ${
                     copiedAll 
                       ? 'bg-[#00ff88] text-black' 
                       : 'bg-white/[0.03] text-gray-500 hover:bg-[#00ff88]/10 hover:text-[#00ff88]'
                   }`}
                 >
                   {copiedAll ? <><Check size={10} /> Copied to Clipboard</> : 'Copy All as One-Liner'}
                 </button>
              </div>
            </section>
            <Divider />
          </>
        )}

        {/* ── Features ────────────────────────────────────────────────*/}
        <section>
          <SectionHeader title="Core Features" icon={ListTodo} subtitle="Six key capabilities that define the product" />
          <div className="grid md:grid-cols-2 gap-4">
            {idea.features?.map((feature, i) => (
              <div
                key={i}
                className="flex gap-4 p-6 bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-[#00ff88]/20 transition-all group"
              >
                <div className="shrink-0 mt-0.5">
                  <CheckCircle2 size={18} className="text-[#00ff88] opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <span className="block text-[9px] font-mono text-gray-600 mb-1.5 uppercase tracking-widest">
                    Feature {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-gray-300 text-[14px] leading-[1.7] group-hover:text-white transition-colors">
                    {feature}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* ── Tech Stack ──────────────────────────────────────────────*/}
        <section>
          <SectionHeader title="Tech Arsenal" icon={Package} subtitle="The technologies powering this project and why" />
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {idea.techStack?.map((tech, i) => (
              <div
                key={tech.name}
                className="p-6 border border-white/5 bg-[#111] hover:bg-white/[0.04] hover:border-[#00ff88]/25 transition-all group relative overflow-hidden"
              >
                <span className="absolute top-3 right-3 font-mono text-[9px] text-gray-700">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex items-center gap-2 mb-3">
                  <ChevronRight size={14} className="text-[#00ff88] opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  <span className="font-syne font-bold text-lg text-white group-hover:text-[#00ff88] transition-colors">
                    {tech.name}
                  </span>
                </div>
                <p className="text-[13px] text-gray-500 leading-[1.7] group-hover:text-gray-400 transition-colors font-mono">
                  {tech.reason}
                </p>
              </div>
            ))}
          </div>
        </section>

        <Divider />

        {/* ── Code Snippets ───────────────────────────────────────────*/}
        <section>
          <SectionHeader
            title="Code Catalyst"
            icon={Database}
            subtitle={`${idea.codeSnippets.length} production-ready starter file${idea.codeSnippets.length !== 1 ? 's' : ''} to hit the ground running`}
          />

          {/* File tab strip */}
          <div className="flex items-center gap-1 mb-4 border-b border-white/[0.06] pb-0 overflow-x-auto custom-scrollbar">
            {idea.codeSnippets?.map((snippet, i) => {
              const langColors: Record<string, string> = {
                typescript: '#3b82f6', javascript: '#eab308', python: '#22c55e',
                go: '#06b6d4', rust: '#f97316', sql: '#a855f7', ts: '#3b82f6',
                js: '#eab308', py: '#22c55e', bash: '#00ff88', sh: '#00ff88',
              };
              const color = langColors[snippet.language?.toLowerCase() ?? ''] ?? '#00ff88';
              return (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2.5 border-t border-x border-white/[0.06] bg-[#0d0d0f] text-[11px] font-mono text-gray-400 whitespace-nowrap"
                  style={{ borderTopColor: color }}
                >
                  <span style={{ color }} className="text-[8px]">●</span>
                  {snippet.filename}
                </div>
              );
            })}
            <div className="flex-1 border-b border-white/[0.06]" />
          </div>

          <div className="space-y-6">
            {idea.codeSnippets?.map((snippet) => (
              <CodeBlock key={snippet.filename} snippet={snippet} />
            ))}
          </div>
        </section>

        <Divider />

        {/* ── Timeline ────────────────────────────────────────────────*/}
        <section>
          <SectionHeader title="Mission Timeline" icon={Clock3} subtitle="Hour-by-hour execution plan to ship on time" />
          <div className="grid md:grid-cols-2 gap-6">
            {idea.timeline?.map((phase, i) => (
              <div key={i} className="relative p-7 border border-white/5 bg-[#111] hover:border-[#00ff88]/20 transition-colors group overflow-hidden">
                {/* Phase number */}
                <span className="absolute top-4 right-4 font-syne font-black text-5xl text-white/[0.04] group-hover:text-white/[0.07] transition-colors">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="block text-[9px] font-mono text-gray-600 uppercase tracking-[0.4em] mb-1">Phase {i + 1}</span>
                    <h3 className="text-lg font-syne font-bold uppercase text-[#00ff88] tracking-tight">{phase.phase}</h3>
                  </div>
                  <span className="font-mono text-xs bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88] px-3 py-1">
                    {phase.duration}
                  </span>
                </div>
                <ul className="space-y-2.5 relative z-10">
                  {phase.tasks?.map((task, j) => (
                    <li key={j} className="flex gap-2.5">
                      <span className="text-[#00ff88]/40 font-mono text-xs mt-0.5 shrink-0">▸</span>
                      <span className="text-[13px] text-gray-400 leading-[1.6] font-mono group-hover:text-gray-300 transition-colors">
                        {task}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
             ))}
          </div>
        </section>

        {/* ── High-Value Hackathon Artifacts ──────────────────────────────*/}
        {((idea.dbSchemaDiagram) || (idea.uiMockupFlow && idea.uiMockupFlow.length > 0) || (idea.pitchScript && idea.pitchScript.length > 0)) && (
          <>
            <Divider />
            <section className="space-y-12">
              <SectionHeader title="High-Value Artifacts" icon={Presentation} subtitle="DB Schemas, UI Flows, and Final Pitch Scripts" />
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* DB Schema */}
                {idea.dbSchemaDiagram && (
                  <div className="bg-[#111] border border-blue-500/10 hover:border-blue-500/30 transition-colors flex flex-col min-h-[500px]">
                    <div className="px-6 py-4 flex items-center gap-3 bg-blue-500/[0.02]">
                      <div className="p-2 bg-blue-500/10 rounded-full text-blue-500">
                        <TableProperties size={16} />
                      </div>
                      <h3 className="text-sm font-syne font-bold uppercase tracking-widest text-blue-500">Interactive DB ER Diagram</h3>
                    </div>
                    <div className="flex-1 border-t border-white/5">
                       <DBSchemaCanvas 
                         schemaText={idea.dbSchemaDiagram} 
                         onChange={(newSchema) => onUpdate?.({ ...idea, dbSchemaDiagram: newSchema })}
                       />
                    </div>
                  </div>
                )}
                
                {/* UI Mockup Flow */}
                {idea.uiMockupFlow && idea.uiMockupFlow.length > 0 && (
                  <div className="bg-[#111] border border-fuchsia-500/10 hover:border-fuchsia-500/30 transition-colors flex flex-col">
                    <div className="px-6 py-4 flex items-center gap-3 bg-fuchsia-500/[0.02]">
                      <div className="p-2 bg-fuchsia-500/10 rounded-full text-fuchsia-500">
                        <MousePointerClick size={16} />
                      </div>
                      <h3 className="text-sm font-syne font-bold uppercase text-fuchsia-500">Interactive UI Flow</h3>
                    </div>
                    <div className="flex-1 border-t border-white/5">
                      <UIFlowCanvas 
                        flowSteps={idea.uiMockupFlow} 
                        onChange={(newSteps) => onUpdate?.({ ...idea, uiMockupFlow: newSteps })}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Final Pitch Script */}
              {idea.pitchScript && idea.pitchScript.length > 0 && (
                <div className="bg-[#111] border border-emerald-500/10 overflow-hidden rounded-xl shadow-2xl">
                  <div className="px-8 py-5 border-b border-emerald-500/10 flex items-center gap-4 bg-emerald-500/[0.03]">
                    <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500 shadow-inner">
                       <Mic size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-syne font-bold uppercase tracking-widest text-emerald-500">3-Minute Winning Pitch Script</h3>
                      <p className="text-[10px] font-mono text-emerald-500/40 uppercase tracking-widest mt-0.5">Optimized for conversion and clarity</p>
                    </div>
                  </div>
                  <div className="divide-y divide-white/[0.04]">
                    {idea.pitchScript.map((script, i) => (
                      <div key={i} className="p-8 md:p-12 hover:bg-white/[0.01] transition-all relative group">
                        <div className="absolute top-10 right-10 text-[11px] font-mono text-emerald-500/60 bg-emerald-500/5 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                           ⏱ {script.duration}
                        </div>
                        <span className="block text-[10px] font-mono text-gray-600 mb-2 uppercase tracking-[0.2em]">{script.section}</span>
                        <h4 className="text-2xl font-syne font-bold text-white mb-6 group-hover:text-emerald-400/90 transition-colors">{script.section}</h4>
                        <div className="relative">
                          <span className="absolute -top-4 -left-4 text-emerald-500/10 text-6xl font-serif">"</span>
                          <p className="text-[15px] font-mono text-gray-300 leading-[1.9] pr-12 relative z-10 whitespace-pre-wrap">
                            {script.script}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        {/* ── Advanced Utilities ────────────────────────────────────────*/}
        {((idea.monetization) || (idea.roadblocks && idea.roadblocks.length > 0) || (idea.apiEndpoints && idea.apiEndpoints.length > 0)) && (
          <>
            <Divider />
            <section className="space-y-12">
              <SectionHeader title="Advanced Utilities" icon={Unplug} subtitle="Monetization, Roadblocks, and API Design" />
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Monetization */}
                {idea.monetization && (
                  <div className="bg-[#111] p-6 border border-amber-500/10 hover:border-amber-500/30 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-amber-500/10 rounded-full text-amber-500">
                        <DollarSign size={16} />
                      </div>
                      <h3 className="text-sm font-syne font-bold uppercase text-amber-500">Monetization Strategy</h3>
                    </div>
                    <p className="text-[13px] font-mono text-gray-400 leading-relaxed">
                      {idea.monetization}
                    </p>
                  </div>
                )}
                
                {/* Roadblocks */}
                {idea.roadblocks && idea.roadblocks.length > 0 && (
                  <div className="bg-[#111] p-6 border border-rose-500/10 hover:border-rose-500/30 transition-colors">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-rose-500/10 rounded-full text-rose-500">
                        <FlagTriangleRight size={16} />
                      </div>
                      <h3 className="text-sm font-syne font-bold uppercase text-rose-500">Expected Roadblocks</h3>
                    </div>
                    <ul className="space-y-3">
                      {idea.roadblocks.map((block, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-rose-500/50 mt-1">▸</span>
                          <span className="text-[13px] font-mono text-gray-400 leading-relaxed">{block}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* API Endpoints */}
              {idea.apiEndpoints && idea.apiEndpoints.length > 0 && (
                <div className="bg-[#111] border border-white/5 overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
                    <Route size={16} className="text-[#00ff88]" />
                    <h3 className="text-sm font-syne font-bold uppercase tracking-widest text-[#00ff88]">Core API Endpoints</h3>
                  </div>
                  <div className="divide-y divide-white/[0.02] bg-[#0c0c0e]">
                    {idea.apiEndpoints.map((endpoint, i) => (
                      <div key={i} className="p-8 hover:bg-white/[0.01] transition-all">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-6 mb-6">
                          <div className="flex items-center gap-4 min-w-[200px]">
                            <span className={`px-4 py-1.5 text-[11px] font-mono font-bold rounded-lg border shadow-sm ${
                              endpoint.method === 'GET' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                              endpoint.method === 'POST' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              endpoint.method === 'PUT' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                              endpoint.method === 'DELETE' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                              'bg-white/5 text-gray-400 border-white/10'
                            }`}>
                              {endpoint.method}
                            </span>
                            <code className="text-[14px] font-mono text-white tracking-tight">
                              {endpoint.path}
                            </code>
                          </div>
                          <p className="text-[13px] font-mono text-gray-400 flex-1 lg:border-l lg:border-white/5 lg:pl-6">
                            {endpoint.description}
                          </p>
                        </div>
                        
                        {(endpoint.requestBody || endpoint.response) && (
                          <div className="grid md:grid-cols-2 gap-4 mt-6">
                            {endpoint.requestBody && endpoint.requestBody !== 'none' && (
                              <div className="space-y-2">
                                <span className="text-[9px] uppercase tracking-widest text-gray-600 font-bold">Request Body</span>
                                <pre className="p-4 bg-black/40 rounded-xl border border-white/5 text-[11px] font-mono text-gray-500 overflow-x-auto custom-scrollbar">
                                  {endpoint.requestBody}
                                </pre>
                              </div>
                            )}
                            {endpoint.response && (
                              <div className="space-y-2">
                                <span className="text-[9px] uppercase tracking-widest text-[#00ff88]/40 font-bold">Example Response</span>
                                <pre className="p-4 bg-[#00ff88]/[0.02] rounded-xl border border-[#00ff88]/10 text-[11px] font-mono text-[#00ff88]/50 overflow-x-auto custom-scrollbar">
                                  {endpoint.response}
                                </pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        {/* ── Strategy & Edge ───────────────────────────────────────────*/}
        {((idea.competitorAnalysis && idea.competitorAnalysis.length > 0) || (idea.techTradeoffs && idea.techTradeoffs.length > 0) || (idea.targetSponsorships && idea.targetSponsorships.length > 0)) && (
          <>
            <Divider />
            <section className="space-y-12">
              <SectionHeader title="Strategy & Edge" icon={Target} subtitle="Market gaps, architecture defense, and winning APIs" />

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Competitor Analysis */}
                {idea.competitorAnalysis && idea.competitorAnalysis.length > 0 && (
                  <div className="bg-[#111] p-6 border border-purple-500/10 hover:border-purple-500/30 transition-colors">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-purple-500/10 rounded-full text-purple-500">
                        <Swords size={16} />
                      </div>
                      <h3 className="text-sm font-syne font-bold uppercase text-purple-500">Competitor Weaknesses</h3>
                    </div>
                    <ul className="space-y-4">
                      {idea.competitorAnalysis.map((comp, i) => (
                        <li key={i} className="flex flex-col gap-1 p-4 bg-black/40 border border-white/5 rounded">
                          <span className="text-white font-syne font-bold text-sm">{comp.name}</span>
                          <span className="text-[13px] font-mono text-purple-400/80 leading-relaxed">Weakness: {comp.weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Target Sponsorships */}
                {idea.targetSponsorships && idea.targetSponsorships.length > 0 && (
                  <div className="bg-[#111] p-6 border border-yellow-500/10 hover:border-yellow-500/30 transition-colors">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-yellow-500/10 rounded-full text-yellow-500">
                        <Gift size={16} />
                      </div>
                      <h3 className="text-sm font-syne font-bold uppercase text-yellow-500">Bounty / Sponsor Targets</h3>
                    </div>
                    <ul className="space-y-4">
                      {idea.targetSponsorships.map((sponsor, i) => (
                        <li key={i} className="flex flex-col gap-1 p-4 bg-black/40 border border-white/5 rounded">
                          <span className="text-white font-syne font-bold text-sm">{sponsor.company} - {sponsor.api}</span>
                          <span className="text-[13px] font-mono text-yellow-500/80 leading-relaxed">{sponsor.integrationIdea}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Tech Tradeoffs */}
              {idea.techTradeoffs && idea.techTradeoffs.length > 0 && (
                <div className="bg-[#111] border border-orange-500/10 overflow-hidden">
                  <div className="px-6 py-4 border-b border-orange-500/10 flex items-center gap-3 bg-orange-500/[0.02]">
                    <div className="p-2 bg-orange-500/10 rounded-full text-orange-500">
                       <Scale size={16} />
                    </div>
                    <h3 className="text-sm font-syne font-bold uppercase tracking-widest text-orange-500">Architecture Trade-offs (Why we didn't use XYZ)</h3>
                  </div>
                  <div className="divide-y divide-white/[0.02]">
                    {idea.techTradeoffs.map((tradeoff, i) => (
                      <div key={i} className="p-6 md:p-8 hover:bg-white/[0.01] transition-colors flex flex-col md:flex-row gap-6">
                        <div className="min-w-[150px] shrink-0">
                          <span className="text-orange-500/60 font-mono text-[10px] uppercase tracking-widest block mb-1">Chose</span>
                          <span className="text-white font-syne font-bold text-lg">{tradeoff.choice}</span>
                        </div>
                        <div className="min-w-[150px] shrink-0">
                          <span className="text-gray-500 font-mono text-[10px] uppercase tracking-widest block mb-1">Instead Of</span>
                          <span className="text-gray-400 font-syne font-bold text-lg line-through">{tradeoff.alternative}</span>
                        </div>
                        <div className="flex-1 border-l border-white/10 pl-6">
                           <span className="text-gray-500 font-mono text-[10px] uppercase tracking-widest block mb-1">Defense</span>
                           <p className="text-[13px] font-mono text-orange-400/80 leading-relaxed">"{tradeoff.reasonNotUsed}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        {/* ── Defend Your Hack (Q&A) ──────────────────────────────────*/}
        {idea.pitchQnA && idea.pitchQnA.length > 0 && (
          <>
             <Divider />
             <section>
               <SectionHeader title="Defend Your Hack" icon={MessageSquareQuote} subtitle="Anticipated judge Q&A and the perfect technical counters" />
               <div className="space-y-4">
                 {idea.pitchQnA?.map((qna, i) => (
                   <div key={i} className="p-8 bg-[#111] border border-white/5 hover:border-[#00ff88]/30 transition-colors group">
                     {/* Question */}
                     <div className="flex gap-4">
                       <div className="shrink-0 text-amber-500 font-syne font-bold text-2xl mt-0.5 w-6">Q.</div>
                       <p className="text-gray-200 text-lg leading-relaxed font-semibold">{qna.question}</p>
                     </div>
                     {/* Answer */}
                     <div className="flex gap-4 mt-6 pt-6 border-t border-white/[0.04]">
                       <div className="shrink-0 text-[#00ff88] font-syne font-bold text-2xl mt-0.5 w-6">A.</div>
                       <p className="text-[#00ff88]/80 font-mono text-[14px] leading-[1.8] italic">{qna.answer}</p>
                     </div>
                   </div>
                 ))}
               </div>
             </section>
          </>
        )}

        {/* ── Refine Panel ────────────────────────────────────────────*/}
        <footer className="pt-8">
          <div className="p-10 border border-[#00ff88]/15 bg-[#00ff88]/[0.02] space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#00ff88]/10 border border-[#00ff88]/20">
                <RotateCcw size={18} className="text-[#00ff88]" />
              </div>
              <div>
                <h3 className="text-2xl font-syne font-black uppercase">Refine This Blueprint</h3>
                <p className="text-sm font-mono text-gray-500 mt-1">
                  Tell the AI architect what to change — it will regenerate with your feedback applied.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 max-w-3xl">
              <input
                type="text"
                placeholder="e.g. 'Use WebSockets for real-time', 'Make the auth flow simpler', 'Add offline support'..."
                className="flex-1 bg-transparent border-b-2 border-white/15 px-4 py-3 outline-none focus:border-[#00ff88] transition-colors text-base font-mono placeholder:text-gray-600"
                value={refineText}
                onChange={(e) => setRefineText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && refineText.trim()) {
                    onRefine(refineText);
                    setRefineText('');
                  }
                }}
              />
              <button
                onClick={() => {
                  if (refineText.trim()) {
                    onRefine(refineText);
                    setRefineText('');
                  }
                }}
                disabled={!refineText.trim()}
                className="btn-primary whitespace-nowrap h-14 px-10 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <RotateCcw size={14} className="inline mr-2" />
                REGENERATE
              </button>
            </div>
          </div>
        </footer>
      </div>

      <div className="hidden no-print">
         <BlueprintPDF idea={idea} />
      </div>
    </div>
  );
};
