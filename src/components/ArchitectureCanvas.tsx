import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  Panel,
  type Connection,
  type Edge,
  type Node,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Maximize2, Minimize2, Plus, Trash2, X,
  RefreshCcw, Server, Globe, Cpu, ShieldAlert, Cloud,
  Database, Zap, Box, Edit2, Check,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface ArchNode {
  id: string;
  label: string;
  description: string;
  category: 'frontend' | 'api' | 'auth' | 'db' | 'cloud' | 'service' | 'ml' | 'default';
}

interface ArchitectureCanvasProps {
  /** Array of strings: "Client: React frontend" OR mermaid text: "graph TD\n  A --> B" */
  steps: string[];
  mermaidDiagram?: string;
  onChange?: (newSteps: string[]) => void;
}

// ─── Category Config ─────────────────────────────────────────────────────────
const CATEGORIES: Record<string, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  frontend: { icon: Globe,       color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/30' },
  api:      { icon: Cpu,         color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  auth:     { icon: ShieldAlert, color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30' },
  db:       { icon: Database,    color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/30' },
  cloud:    { icon: Cloud,       color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/30' },
  ml:       { icon: Zap,         color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/30' },
  service:  { icon: Box,         color: 'text-indigo-400',  bg: 'bg-indigo-500/10',  border: 'border-indigo-500/30' },
  default:  { icon: Server,      color: 'text-gray-400',    bg: 'bg-white/5',        border: 'border-white/10' },
};

function guessCategory(text: string): ArchNode['category'] {
  const t = text.toLowerCase();
  if (t.includes('client') || t.includes('frontend') || t.includes('react') || t.includes('next') || t.includes('web') || t.includes('browser')) return 'frontend';
  if (t.includes('auth') || t.includes('jwt') || t.includes('oauth') || t.includes('security') || t.includes('clerk')) return 'auth';
  if (t.includes('database') || t.includes('db') || t.includes('postgres') || t.includes('mongo') || t.includes('redis') || t.includes('sql')) return 'db';
  if (t.includes('cloud') || t.includes('deploy') || t.includes('vercel') || t.includes('aws') || t.includes('docker')) return 'cloud';
  if (t.includes('ml') || t.includes('ai') || t.includes('model') || t.includes('llm') || t.includes('learning')) return 'ml';
  if (t.includes('gateway') || t.includes('api') || t.includes('rest') || t.includes('graphql') || t.includes('grpc')) return 'api';
  if (t.includes('queue') || t.includes('kafka') || t.includes('service') || t.includes('worker') || t.includes('cache')) return 'service';
  return 'default';
}

// ─── Arch Node Component ──────────────────────────────────────────────────────
const ArchNodeComp = ({ id, data }: any) => {
  const { label, description, category, onSelect, selectedId } = data as any;
  const cfg = CATEGORIES[category] || CATEGORIES.default;
  const Icon = cfg.icon;
  const isSelected = selectedId === id;

  return (
    <div
      onClick={() => onSelect(id)}
      className={`w-52 rounded-xl overflow-hidden shadow-2xl cursor-pointer transition-all duration-200 ring-1
        ${isSelected
          ? `${cfg.border} ring-2 ring-offset-0`
          : 'border border-white/[0.08] ring-transparent hover:ring-white/10'
        } bg-[#0d0d10]`}
      style={{ boxShadow: isSelected ? `0 0 30px -10px ${cfg.color.replace('text-', '').replace('-400', '')}` : undefined }}
    >
      <Handle type="target" position={Position.Top}    style={{ background: '#ffffff20', width: 8, height: 8, border: '1px solid rgba(255,255,255,0.15)', top: -4 }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#ffffff20', width: 8, height: 8, border: '1px solid rgba(255,255,255,0.15)', bottom: -4 }} />
      <Handle type="target" position={Position.Left}   style={{ background: '#ffffff20', width: 8, height: 8, border: '1px solid rgba(255,255,255,0.15)', left: -4 }} />
      <Handle type="source" position={Position.Right}  style={{ background: '#ffffff20', width: 8, height: 8, border: '1px solid rgba(255,255,255,0.15)', right: -4 }} />

      <div className={`px-4 py-3 flex items-center gap-2.5 ${cfg.bg} border-b border-white/[0.06]`}>
        <div className={`shrink-0 ${cfg.color}`}><Icon size={14} /></div>
        <span className={`font-syne font-bold text-[11px] uppercase tracking-wider truncate ${cfg.color}`}>{label}</span>
      </div>

      {description && (
        <div className="px-4 py-2.5">
          <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-3">{description}</p>
        </div>
      )}
    </div>
  );
};

// ─── Side Panel ───────────────────────────────────────────────────────────────
interface SidePanelProps {
  node: { id: string; label: string; description: string; category: ArchNode['category'] } | null;
  onUpdate: (id: string, label: string, description: string, category: ArchNode['category']) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const SidePanel: React.FC<SidePanelProps> = ({ node, onUpdate, onDelete, onClose }) => {
  const [label, setLabel] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState<ArchNode['category']>('default');

  useEffect(() => {
    if (node) { setLabel(node.label); setDesc(node.description); setCategory(node.category); }
  }, [node?.id]);

  const commit = (l = label, d = desc, c = category) => { if (node) onUpdate(node.id, l, d, c); };

  if (!node) return null;

  const cfg = CATEGORIES[category] || CATEGORIES.default;

  return (
    <div className="absolute right-0 top-0 h-full w-72 bg-[#08080b] border-l border-white/[0.06] flex flex-col z-10 shadow-2xl">
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b border-white/[0.06] ${cfg.bg}`}>
        <div className="flex items-center gap-2">
          <Edit2 size={12} className={cfg.color} />
          <span className={`text-[10px] font-bold uppercase tracking-widest ${cfg.color}`}>Edit Node</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => { onDelete(node.id); onClose(); }} className="p-1.5 text-rose-500/50 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all"><Trash2 size={12} /></button>
          <button onClick={onClose} className="p-1.5 text-gray-700 hover:text-gray-300 hover:bg-white/5 rounded transition-all"><X size={12} /></button>
        </div>
      </div>

      {/* Category Picker */}
      <div className="px-4 py-3 border-b border-white/[0.05]">
        <label className="text-[9px] uppercase tracking-widest text-gray-600 font-bold block mb-2">Category</label>
        <div className="grid grid-cols-4 gap-1.5">
          {Object.entries(CATEGORIES).map(([key, val]) => {
            const CatIcon = val.icon;
            return (
              <button
                key={key}
                onClick={() => { setCategory(key as ArchNode['category']); commit(label, desc, key as ArchNode['category']); }}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-[8px] transition-all ${category === key ? `${val.bg} ${val.border} ${val.color}` : 'border-white/5 text-gray-700 hover:border-white/10 hover:text-gray-500'}`}
                title={key}
              >
                <CatIcon size={12} />
                <span className="capitalize truncate w-full text-center">{key}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Label */}
      <div className="px-4 py-3 border-b border-white/[0.05]">
        <label className="text-[9px] uppercase tracking-widest text-gray-600 font-bold block mb-1.5">Layer Name</label>
        <input
          className="w-full bg-[#111] border border-white/10 focus:border-emerald-500/40 text-white text-[12px] font-bold px-3 py-2 rounded outline-none transition-all"
          value={label}
          onChange={e => setLabel(e.target.value)}
          onBlur={() => commit()}
          onKeyDown={e => e.key === 'Enter' && commit()}
        />
      </div>

      {/* Description */}
      <div className="px-4 py-3 flex-1">
        <label className="text-[9px] uppercase tracking-widest text-gray-600 font-bold block mb-1.5">Description</label>
        <textarea
          className="w-full h-36 bg-[#111] border border-white/10 focus:border-emerald-500/40 text-gray-300 text-[11px] px-3 py-2 rounded outline-none resize-none leading-relaxed transition-all font-mono"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          onBlur={() => commit()}
          placeholder="Describe what this layer does..."
        />
      </div>

      {/* Save button */}
      <button
        onClick={() => commit()}
        className="flex items-center justify-center gap-2 m-4 py-2.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500/25 rounded-lg transition-all"
      >
        <Check size={12} /> Apply Changes
      </button>
    </div>
  );
};

// ─── Main Canvas ──────────────────────────────────────────────────────────────
export const ArchitectureCanvas: React.FC<ArchitectureCanvasProps> = ({ steps, mermaidDiagram, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ─── Utility: Parse steps array → ArchNodes ──────────────────────
  const parseStepsToArchNodes = useCallback((src: string[]): ArchNode[] => {
    return src.map((step, i) => {
      const clean = step.replace(/^\d+\.\s*/, '').trim();
      const colonIdx = clean.indexOf(':');
      const label = colonIdx > -1 ? clean.slice(0, colonIdx).trim() : clean;
      const description = colonIdx > -1 ? clean.slice(colonIdx + 1).trim() : '';
      return {
        id: `node-${i}`,
        label: label || `Layer ${i + 1}`,
        description,
        category: guessCategory(label + ' ' + description),
      };
    });
  }, []);

  // ─── Utility: Parse mermaid graph TD → ArchNodes ─────────────────
  const parseMermaidToArchNodes = useCallback((text: string): ArchNode[] => {
    if (!text?.trim()) return [];
    const clean = text
      .replace(/```mermaid/gi, '').replace(/```/g, '')
      .replace(/graph\s+(TD|LR|TB|RL)/gi, '').trim();

    const nodeMap = new Map<string, { label: string }>();
    // Match: A[Label] or A(Label) or A[(Label)] or A{Label}
    const nodeDef = /(\w+)\s*[\[({\|]+(([^\])\|}]+))[\])\|}]+/g;
    let m: RegExpExecArray | null;
    while ((m = nodeDef.exec(clean)) !== null) {
      if (!nodeMap.has(m[1])) nodeMap.set(m[1], { label: m[2].trim() });
    }
    // Also capture bare identifiers from arrows
    const arrowRe = /(\w+)\s*--?>?\s*\w+/g;
    while ((m = arrowRe.exec(clean)) !== null) {
      if (!nodeMap.has(m[1])) nodeMap.set(m[1], { label: m[1] });
    }
    const arrowRe2 = /\w+\s*--?>?\s*(\w+)/g;
    while ((m = arrowRe2.exec(clean)) !== null) {
      if (!nodeMap.has(m[1])) nodeMap.set(m[1], { label: m[1] });
    }

    return Array.from(nodeMap.entries()).map(([id, val], i) => ({
      id: `node-${i}`,
      label: val.label,
      description: '',
      category: guessCategory(val.label),
    }));
  }, []);

  // ─── Build RF nodes from ArchNodes ────────────────────────────────
  const archNodesToRF = useCallback((archs: ArchNode[]): { nodes: Node[]; edges: Edge[] } => {
    const COLS = 3;
    const X_GAP = 320, Y_GAP = 200;
    const nodes: Node[] = archs.map((a, i) => ({
      id: a.id,
      type: 'archNode',
      position: { x: (i % COLS) * X_GAP, y: Math.floor(i / COLS) * Y_GAP },
      data: { ...a },
    }));
    const edges: Edge[] = archs.slice(1).map((_, i) => ({
      id: `e-${i}`,
      source: archs[i].id,
      target: archs[i + 1].id,
      animated: true,
      style: { stroke: '#ffffff15', strokeWidth: 2 },
      type: 'smoothstep',
    }));
    return { nodes, edges };
  }, []);

  // ─── Serialize back to steps format ──────────────────────────────
  const serialize = useCallback((rfNodes: Node[]): string[] => {
    return rfNodes.map(n => {
      const d = n.data as any;
      return d.description ? `${d.label}: ${d.description}` : d.label;
    });
  }, []);

  // ─── State ────────────────────────────────────────────────────────
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    let archNodes: ArchNode[] = [];

    if (steps && steps.length > 0) {
      archNodes = parseStepsToArchNodes(steps);
    } else if (mermaidDiagram) {
      archNodes = parseMermaidToArchNodes(mermaidDiagram);
    }

    if (archNodes.length > 0) {
      const { nodes: n, edges: e } = archNodesToRF(archNodes);
      setNodes(n);
      setEdges(e);
      initialized.current = true;
    }
  }, [steps, mermaidDiagram, parseStepsToArchNodes, parseMermaidToArchNodes, archNodesToRF, setNodes, setEdges]);

  // Persist changes up
  useEffect(() => {
    if (nodes.length > 0) {
      onChange?.(serialize(nodes));
    }
  }, [nodes, serialize, onChange]);

  // ─── Handlers ─────────────────────────────────────────────────────
  const handleUpdate = useCallback((id: string, label: string, description: string, category: ArchNode['category']) => {
    setNodes(nds => nds.map(n => n.id === id ? { ...n, data: { ...n.data, label, description, category } } : n));
  }, [setNodes]);

  const handleDelete = useCallback((id: string) => {
    setNodes(nds => nds.filter(n => n.id !== id));
    setEdges(eds => eds.filter(e => e.source !== id && e.target !== id));
  }, [setNodes, setEdges]);

  const onConnect = useCallback((params: Connection) => {
    setEdges(eds => addEdge({
      ...params,
      animated: true,
      style: { stroke: '#ffffff20', strokeWidth: 2 },
      type: 'smoothstep',
    }, eds));
  }, [setEdges]);

  const addNode = () => {
    const id = `node-${Date.now()}`;
    const n: Node = {
      id,
      type: 'archNode',
      position: { x: 100 + Math.random() * 300, y: 100 + Math.random() * 200 },
      data: { id, label: 'New Layer', description: '', category: 'default' },
    };
    setNodes(prev => [...prev, n]);
    setSelectedId(id);
  };

  const reparse = () => {
    initialized.current = false;
    let archNodes: ArchNode[] = [];
    if (steps && steps.length > 0) archNodes = parseStepsToArchNodes(steps);
    else if (mermaidDiagram) archNodes = parseMermaidToArchNodes(mermaidDiagram);
    if (archNodes.length > 0) {
      const { nodes: n, edges: e } = archNodesToRF(archNodes);
      setNodes(n); setEdges(e);
      initialized.current = true;
    }
    setSelectedId(null);
  };

  // Inject callbacks + selectedId
  const displayNodes = useMemo(() => nodes.map(n => ({
    ...n,
    data: { ...n.data, onSelect: setSelectedId, selectedId },
  })), [nodes, selectedId]);

  const nodeTypes = useMemo(() => ({ archNode: ArchNodeComp }), []);

  const selectedNodeData = useMemo(() => {
    if (!selectedId) return null;
    const n = nodes.find(x => x.id === selectedId);
    if (!n) return null;
    const d = n.data as any;
    return { id: n.id, label: d.label, description: d.description, category: d.category };
  }, [nodes, selectedId]);

  // Fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen) containerRef.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
  };
  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full bg-[#050507] border border-white/5 relative overflow-hidden
        ${isFullscreen ? 'h-screen' : 'h-[560px] rounded-2xl'}`}
    >
      <ReactFlow
        nodes={displayNodes}
        edges={edges}
        nodeTypes={nodeTypes as any}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={() => setSelectedId(null)}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        proOptions={{ hideAttribution: true }}
        deleteKeyCode="Delete"
        style={{ paddingRight: selectedId ? 288 : 0, transition: 'padding 0.2s' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={28} size={0.8} color="#ffffff06" />
        <Controls className="!bg-[#111] !border-white/10 !fill-gray-500" />

        {/* Status bar */}
        <Panel position="top-left">
          <div className="flex items-center gap-2 bg-[#0a0a0d] border border-white/[0.06] px-3 py-1.5 rounded-full">
            <Server size={9} className="text-emerald-500" />
            <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">Infrastructure Map</span>
            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-mono text-gray-700">{nodes.length} layers</span>
          </div>
        </Panel>

        {/* Toolbar */}
        <Panel position="top-right" className="flex gap-2">
          <button onClick={reparse} title="Reload from AI" className="p-2 bg-[#0a0a0d] border border-white/[0.07] text-gray-600 hover:text-gray-300 hover:border-white/20 rounded-lg transition-all"><RefreshCcw size={13} /></button>
          <button onClick={addNode} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-500/25 rounded-lg transition-all"><Plus size={11} /> Add Layer</button>
          <button onClick={toggleFullscreen} className="p-2 bg-[#0a0a0d] border border-white/[0.07] text-gray-600 hover:text-gray-300 rounded-lg transition-all">{isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}</button>
        </Panel>

        {/* Empty state */}
        {nodes.length === 0 && (
          <Panel position="top-left">
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                  <Server size={28} className="text-emerald-500/40" />
                </div>
                <p className="text-[11px] text-gray-600 font-mono max-w-[200px] leading-relaxed">No architecture detected. Reparse or add layers manually.</p>
                <div className="flex gap-2 justify-center">
                  <button onClick={reparse} className="px-4 py-1.5 border border-white/10 text-gray-400 text-[10px] rounded-lg hover:bg-white/5">Reparse AI</button>
                  <button onClick={addNode} className="px-4 py-1.5 bg-emerald-500 text-black text-[10px] font-bold rounded-lg hover:bg-emerald-400">+ Add Layer</button>
                </div>
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>

      {/* Side Panel */}
      <SidePanel
        node={selectedNodeData}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onClose={() => setSelectedId(null)}
      />

      {/* Hint bar */}
      {!selectedId && nodes.length > 0 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm border border-white/[0.05] px-3 py-1.5 rounded-full pointer-events-none">
          <span className="text-[9px] text-gray-700 font-mono">Click node to edit · Drag to reposition · Connect handles to link layers</span>
        </div>
      )}
    </div>
  );
};
