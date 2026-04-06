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
  Maximize2, Minimize2, Plus, Trash2, X, Key,
  Link2, RefreshCcw, ChevronRight, Database, Edit3,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface DBField {
  name: string;
  type: string;
  pk: boolean;
  fk: boolean;
  nullable: boolean;
}

interface TableData {
  title: string;
  fields: DBField[];
  onSelect: (id: string) => void;
  selectedId: string | null;
}

const SQL_TYPES = ['int', 'bigint', 'string', 'varchar', 'text', 'boolean', 'float', 'date', 'datetime', 'uuid', 'json', 'enum'];

// ─── Table Node ───────────────────────────────────────────────────────────────
const TableNode = ({ id, data }: any) => {
  const { title, fields, onSelect, selectedId } = data as TableData;
  const isSelected = selectedId === id;

  return (
    <div
      className={`w-56 font-mono rounded-xl overflow-hidden shadow-2xl cursor-pointer transition-all duration-200 
        ${isSelected
          ? 'ring-2 ring-blue-400 border border-blue-400/60 bg-[#0d1829]'
          : 'border border-white/10 bg-[#0c0c0f] hover:border-blue-500/30'
        }`}
      onClick={() => (onSelect as any)(id)}
    >
      <Handle type="target" position={Position.Left} style={{ background: '#3b82f6', width: 8, height: 8, border: 'none', left: -4 }} />
      <Handle type="source" position={Position.Right} style={{ background: '#3b82f6', width: 8, height: 8, border: 'none', right: -4 }} />

      {/* Header */}
      <div className={`px-3 py-2.5 flex items-center gap-2 ${isSelected ? 'bg-blue-500/20' : 'bg-white/[0.03]'} border-b border-white/[0.07]`}>
        <Database size={12} className={isSelected ? 'text-blue-400' : 'text-gray-500'} />
        <span className={`font-bold text-[11px] uppercase tracking-wider truncate ${isSelected ? 'text-blue-300' : 'text-gray-200'}`}>{title}</span>
        <ChevronRight size={10} className={`ml-auto shrink-0 ${isSelected ? 'text-blue-400' : 'text-gray-700'}`} />
      </div>

      {/* Fields */}
      <div className="divide-y divide-white/[0.04]">
        {(fields as DBField[]).slice(0, 8).map((field, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/[0.03]">
            {field.pk && <Key size={9} className="text-amber-400 shrink-0" />}
            {field.fk && !field.pk && <Link2 size={9} className="text-purple-400 shrink-0" />}
            {!field.pk && !field.fk && <span className="w-[9px]" />}
            <span className="text-[10px] text-gray-300 flex-1 truncate">{field.name}</span>
            <span className="text-[8px] text-blue-500/50 uppercase font-bold tracking-wider">{field.type}</span>
          </div>
        ))}
        {(fields as DBField[]).length > 8 && (
          <div className="px-3 py-1 text-[9px] text-gray-600 italic">+{(fields as DBField[]).length - 8} more...</div>
        )}
      </div>
    </div>
  );
};

// ─── Field Editor Row ─────────────────────────────────────────────────────────
const FieldRow = ({
  field, idx, onUpdate, onDelete
}: { field: DBField; idx: number; onUpdate: (i: number, f: DBField) => void; onDelete: (i: number) => void }) => {
  const [localName, setLocalName] = useState(field.name);

  useEffect(() => { setLocalName(field.name); }, [field.name]);

  const commitName = () => { if (localName !== field.name) onUpdate(idx, { ...field, name: localName }); };

  return (
    <div className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-2 px-3 py-2 border-b border-white/[0.05] hover:bg-white/[0.02] group">
      {/* PK / FK toggles */}
      <div className="flex gap-1">
        <button
          title="Primary Key"
          onClick={() => onUpdate(idx, { ...field, pk: !field.pk, fk: !field.pk ? false : field.fk })}
          className={`w-5 h-5 rounded flex items-center justify-center text-[8px] font-bold border transition-all ${field.pk ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'border-white/10 text-gray-700 hover:text-amber-400'}`}
        >
          PK
        </button>
        <button
          title="Foreign Key"
          onClick={() => onUpdate(idx, { ...field, fk: !field.fk, pk: !field.fk ? false : field.pk })}
          className={`w-5 h-5 rounded flex items-center justify-center text-[8px] font-bold border transition-all ${field.fk ? 'bg-purple-500/20 border-purple-500/40 text-purple-400' : 'border-white/10 text-gray-700 hover:text-purple-400'}`}
        >
          FK
        </button>
      </div>

      {/* Field name */}
      <input
        className="bg-transparent border border-transparent focus:border-blue-500/40 focus:bg-blue-500/5 rounded px-2 py-0.5 text-[11px] text-gray-200 outline-none w-full transition-all"
        value={localName}
        onChange={e => setLocalName(e.target.value)}
        onBlur={commitName}
        onKeyDown={e => e.key === 'Enter' && commitName()}
      />

      {/* Type selector */}
      <select
        value={field.type}
        onChange={e => onUpdate(idx, { ...field, type: e.target.value })}
        className="bg-[#111] border border-white/10 text-blue-400/70 text-[9px] uppercase font-bold rounded px-1 py-0.5 outline-none focus:border-blue-500/40 cursor-pointer"
      >
        {SQL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
      </select>

      {/* Nullable toggle */}
      <button
        title="Nullable"
        onClick={() => onUpdate(idx, { ...field, nullable: !field.nullable })}
        className={`text-[8px] font-bold w-5 h-5 rounded border flex items-center justify-center transition-all ${field.nullable ? 'border-white/10 text-gray-600' : 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10'}`}
      >
        N
      </button>

      {/* Delete */}
      <button
        onClick={() => onDelete(idx)}
        className="opacity-0 group-hover:opacity-100 text-rose-500/40 hover:text-rose-500 transition-all"
      >
        <X size={12} />
      </button>
    </div>
  );
};

// ─── Side Panel ───────────────────────────────────────────────────────────────
const SidePanel = ({
  table, onUpdate, onClose, onDelete
}: {
  table: { id: string; data: { title: string; fields: DBField[] } } | null;
  onUpdate: (id: string, title: string, fields: DBField[]) => void;
  onClose: () => void;
  onDelete: (id: string) => void;
}) => {
  const [localTitle, setLocalTitle] = useState('');
  const [fields, setFields] = useState<DBField[]>([]);

  useEffect(() => {
    if (table) {
      setLocalTitle(table.data.title);
      setFields(table.data.fields);
    }
  }, [table?.id]);

  const commit = (newTitle = localTitle, newFields = fields) => {
    if (table) onUpdate(table.id, newTitle, newFields);
  };

  const updateField = (i: number, f: DBField) => {
    const next = fields.map((x, idx) => idx === i ? f : x);
    setFields(next);
    commit(localTitle, next);
  };

  const deleteField = (i: number) => {
    const next = fields.filter((_, idx) => idx !== i);
    setFields(next);
    commit(localTitle, next);
  };

  const addField = () => {
    const next = [...fields, { name: `field_${fields.length + 1}`, type: 'string', pk: false, fk: false, nullable: true }];
    setFields(next);
    commit(localTitle, next);
  };

  if (!table) return null;

  return (
    <div className="absolute right-0 top-0 h-full w-72 bg-[#0a0a0c] border-l border-white/[0.07] flex flex-col z-10 shadow-2xl">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07] bg-blue-500/5">
        <div className="flex items-center gap-2">
          <Edit3 size={13} className="text-blue-400" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">Edit Table</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => { onDelete(table.id); onClose(); }} className="p-1.5 text-rose-500/50 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all" title="Delete Table"><Trash2 size={13} /></button>
          <button onClick={onClose} className="p-1.5 text-gray-600 hover:text-gray-300 hover:bg-white/5 rounded transition-all"><X size={13} /></button>
        </div>
      </div>

      {/* Table Name */}
      <div className="px-4 py-3 border-b border-white/[0.05] bg-white/[0.01]">
        <label className="text-[9px] uppercase tracking-widest text-gray-600 font-bold block mb-1.5">Table Name</label>
        <input
          className="w-full bg-[#111] border border-white/10 focus:border-blue-500/50 text-white text-[13px] font-bold px-3 py-2 rounded outline-none uppercase tracking-wide transition-all"
          value={localTitle}
          onChange={e => setLocalTitle(e.target.value)}
          onBlur={() => commit()}
          onKeyDown={e => e.key === 'Enter' && commit()}
        />
      </div>

      {/* Column Legend */}
      <div className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-2 px-3 py-1.5 bg-white/[0.02] border-b border-white/[0.05]">
        <span className="text-[8px] text-gray-700 uppercase tracking-widest w-[42px]">Key</span>
        <span className="text-[8px] text-gray-700 uppercase tracking-widest">Column</span>
        <span className="text-[8px] text-gray-700 uppercase tracking-widest">Type</span>
        <span className="text-[8px] text-gray-700 uppercase tracking-widest">NN</span>
        <span />
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {fields.map((f, i) => (
          <FieldRow key={i} field={f} idx={i} onUpdate={updateField} onDelete={deleteField} />
        ))}
      </div>

      {/* Add Column */}
      <button
        onClick={addField}
        className="flex items-center gap-2 m-3 px-4 py-2.5 border border-dashed border-blue-500/30 text-blue-500/60 text-[10px] font-bold uppercase tracking-widest hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all rounded-lg"
      >
        <Plus size={12} /> Add Column
      </button>
    </div>
  );
};

// ─── Main Canvas ───────────────────────────────────────────────────────────────
interface DBSchemaCanvasProps {
  schemaText: string;
  onChange?: (newSchema: string) => void;
}

export const DBSchemaCanvas: React.FC<DBSchemaCanvasProps> = ({ schemaText, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ─── Parser ──────────────────────────────────────────────────────
  const parseMermaid = useCallback((text: string): { nodes: Node[]; edges: Edge[] } => {
    if (!text?.trim()) return { nodes: [], edges: [] };

    const clean = text
      .replace(/```mermaid/gi, '').replace(/```/g, '')
      .replace(/erDiagram/gi, '').trim();

    const tables = new Map<string, DBField[]>();
    const edges: Edge[] = [];

    // Parse table blocks: TABLE_NAME { ... }
    const blockRegex = /(\w[\w-]*)\s*\{([^}]*)\}/g;
    let m: RegExpExecArray | null;
    while ((m = blockRegex.exec(clean)) !== null) {
      const name = m[1].trim();
      const body = m[2];
      const fields: DBField[] = [];

      const lineRegex = /(\w+)\s+([\w-]+)(?:\s+(PK|FK|PK,FK|FK,PK|"[^"]*"))?/g;
      let lm: RegExpExecArray | null;
      while ((lm = lineRegex.exec(body)) !== null) {
        const rawType = lm[1].toLowerCase();
        const rawName = lm[2];
        const rawConstraint = (lm[3] || '').toUpperCase();
        fields.push({
          type: SQL_TYPES.includes(rawType) ? rawType : 'string',
          name: rawName,
          pk: rawConstraint.includes('PK'),
          fk: rawConstraint.includes('FK'),
          nullable: !rawConstraint.includes('PK'),
        });
      }

      if (fields.length === 0) {
        // Fallback: treat anything after table name opening as identifiers
        body.trim().split('\n').forEach(line => {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 2) {
            fields.push({ type: parts[0].toLowerCase(), name: parts[1], pk: false, fk: false, nullable: true });
          }
        });
      }

      tables.set(name, fields);
    }

    // Parse relationships: TABLE1 ||--o{ TABLE2 : "label"
    const relRegex = /(\w[\w-]*)\s*([|ou}{<>-]{2,}[|ou}{<>-]*)\s*(\w[\w-]*)\s*(?::\s*["']?([^"'\n]*)["']?)?/g;
    const knownTables = new Set(tables.keys());
    while ((m = relRegex.exec(clean)) !== null) {
      const src = m[1].trim();
      const tgt = m[3].trim();
      const label = m[4] ? m[4].trim() : '';

      // Auto-create table stubs from relationships if not already found
      if (!knownTables.has(src)) { tables.set(src, [{ name: 'id', type: 'int', pk: true, fk: false, nullable: false }]); knownTables.add(src); }
      if (!knownTables.has(tgt)) { tables.set(tgt, [{ name: 'id', type: 'int', pk: true, fk: false, nullable: false }]); knownTables.add(tgt); }

      edges.push({
        id: `e-${src}-${tgt}-${Math.random().toString(36).slice(2)}`,
        source: src,
        target: tgt,
        label,
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 1.5, opacity: 0.5 },
        labelStyle: { fill: '#6b7280', fontSize: 9, fontFamily: 'monospace' },
        labelBgStyle: { fill: 'transparent' },
      });
    }

    // Build nodes in grid layout
    const nodes: Node[] = [];
    let i = 0;
    for (const [name, fields] of tables.entries()) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      nodes.push({
        id: name,
        type: 'tableNode',
        position: { x: col * 320, y: row * 360 },
        data: { title: name, fields },
      });
      i++;
    }

    return { nodes, edges };
  }, []);

  // ─── Serializer ───────────────────────────────────────────────────
  const serialize = useCallback((ns: Node[], es: Edge[]): string => {
    let out = 'erDiagram\n';
    ns.forEach(n => {
      const f = n.data.fields as DBField[];
      out += `    ${n.id} {\n`;
      f.forEach(col => {
        const constraint = col.pk ? ' PK' : col.fk ? ' FK' : '';
        out += `        ${col.type} ${col.name}${constraint}\n`;
      });
      out += '    }\n';
    });
    es.forEach(e => out += `    ${e.source} ||--o{ ${e.target} : "${e.label || ''}"\n`);
    return out;
  }, []);

  // ─── State ────────────────────────────────────────────────────────
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const lastText = useRef('');

  // Initial load + prop-driven updates
  useEffect(() => {
    if (schemaText && schemaText !== lastText.current) {
      const { nodes: n, edges: e } = parseMermaid(schemaText);
      setNodes(n);
      setEdges(e);
      lastText.current = schemaText;
    }
  }, [schemaText, parseMermaid, setNodes, setEdges]);

  // Sync outward (debounced via useEffect)
  useEffect(() => {
    if (nodes.length === 0) return;
    const out = serialize(nodes, edges);
    if (out !== lastText.current) {
      lastText.current = out;
      onChange?.(out);
    }
  }, [nodes, edges, serialize, onChange]);

  // ─── Update handlers ──────────────────────────────────────────────
  const handleTableUpdate = useCallback((id: string, title: string, fields: DBField[]) => {
    setNodes(nds => nds.map(n => n.id === id ? { ...n, id: title, data: { title, fields } } : n));
    setEdges(eds => eds.map(e => ({
      ...e,
      source: e.source === id ? title : e.source,
      target: e.target === id ? title : e.target,
    })));
    if (id !== title) setSelectedId(title);
  }, [setNodes, setEdges]);

  const handleDelete = useCallback((id: string) => {
    setNodes(nds => nds.filter(n => n.id !== id));
    setEdges(eds => eds.filter(e => e.source !== id && e.target !== id));
  }, [setNodes, setEdges]);

  const onConnect = useCallback((params: Connection) => {
    setEdges(eds => addEdge({ ...params, animated: true, style: { stroke: '#3b82f6', strokeWidth: 1.5 } }, eds));
  }, [setEdges]);

  const addTable = () => {
    const id = `NewTable${nodes.length + 1}`;
    setNodes(prev => [...prev, {
      id,
      type: 'tableNode',
      position: { x: 80 + Math.random() * 200, y: 80 + Math.random() * 200 },
      data: { title: id, fields: [{ name: 'id', type: 'int', pk: true, fk: false, nullable: false }] },
    }]);
    setSelectedId(id);
  };

  // Inject callbacks into node data
  const displayNodes = useMemo(() => nodes.map(n => ({
    ...n,
    data: { ...n.data, onSelect: setSelectedId, selectedId },
  })), [nodes, selectedId]);

  const nodeTypes = useMemo(() => ({ tableNode: TableNode }), []);

  // Selected table for side panel
  const selectedNode = useMemo(() => {
    if (!selectedId) return null;
    const n = nodes.find(x => x.id === selectedId);
    if (!n) return null;
    return { id: n.id, data: n.data as { title: string; fields: DBField[] } };
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

  // Reparse from source
  const reparse = () => {
    const { nodes: n, edges: e } = parseMermaid(schemaText);
    setNodes(n); setEdges(e); setSelectedId(null);
    lastText.current = schemaText;
  };

  return (
    <div
      ref={containerRef}
      className={`w-full bg-[#050507] border border-white/5 relative overflow-hidden
        ${isFullscreen ? 'h-screen' : 'h-[580px] rounded-2xl'}`}
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
        fitViewOptions={{ padding: 0.3 }}
        proOptions={{ hideAttribution: true }}
        deleteKeyCode="Delete"
        style={{ paddingRight: selectedId ? 288 : 0, transition: 'padding 0.2s' }}
      >
        <Background variant={BackgroundVariant.Lines} gap={40} size={0.5} color="#ffffff04" />
        <Controls className="!bg-[#111] !border-white/10 !fill-gray-400" />

        <Panel position="top-left" className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#0a0a0c] border border-white/[0.06] px-3 py-1.5 rounded-full">
            <Database size={10} className="text-blue-500" />
            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">ER Diagram</span>
            <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[9px] font-mono text-gray-600">{nodes.length} tables</span>
          </div>
        </Panel>

        <Panel position="top-right" className="flex gap-2">
          <button onClick={reparse} title="Reload AI schema" className="p-2 bg-[#0a0a0c] border border-white/[0.07] text-gray-600 hover:text-gray-300 hover:border-white/20 rounded-lg transition-all"><RefreshCcw size={13} /></button>
          <button onClick={addTable} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[10px] font-bold uppercase tracking-wider hover:bg-blue-500/25 rounded-lg transition-all"><Plus size={11} /> Add Table</button>
          <button onClick={toggleFullscreen} className="p-2 bg-[#0a0a0c] border border-white/[0.07] text-gray-600 hover:text-gray-300 rounded-lg transition-all">{isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}</button>
        </Panel>

        {nodes.length === 0 && (
          <Panel position="top-left">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 pointer-events-none">
              <div className="text-center space-y-3 pointer-events-auto">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto">
                  <Database size={28} className="text-blue-500/40" />
                </div>
                <p className="text-[11px] text-gray-600 font-mono max-w-[200px] leading-relaxed">No schema parsed. Try reparsing or create tables manually.</p>
                <div className="flex gap-2 justify-center">
                  <button onClick={reparse} className="px-4 py-1.5 border border-white/10 text-gray-400 text-[10px] rounded-lg hover:bg-white/5 transition-all">Reparse AI</button>
                  <button onClick={addTable} className="px-4 py-1.5 bg-blue-500 text-white text-[10px] font-bold rounded-lg hover:bg-blue-400 transition-all">+ New Table</button>
                </div>
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>

      {/* Side Panel */}
      <SidePanel
        table={selectedNode}
        onUpdate={handleTableUpdate}
        onClose={() => setSelectedId(null)}
        onDelete={handleDelete}
      />

      {/* Hint */}
      {!selectedId && nodes.length > 0 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm border border-white/5 px-3 py-1.5 rounded-full flex items-center gap-2 pointer-events-none">
          <span className="text-[9px] text-gray-600 font-mono">Click a table to edit · Drag to reposition · Connect handles to add relationships</span>
        </div>
      )}
    </div>
  );
};
