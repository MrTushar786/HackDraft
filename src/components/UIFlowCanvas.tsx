import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Plus, Trash2, Maximize2, Minimize2, Settings2 } from 'lucide-react';

interface UIFlowCanvasProps {
  flowSteps: string[];
  onChange?: (newSteps: string[]) => void;
}

export const UIFlowCanvas: React.FC<UIFlowCanvasProps> = ({ flowSteps, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Parse strings to nodes
  const initialNodes: Node[] = useMemo(() => {
    return flowSteps.map((step, index) => {
      const match = step.match(/^(?:\\d+\\.\\s*)?([^:]+):\\s*(.*)$/);
      let title = match ? match[1].trim() : `Screen ${index + 1}`;
      let description = match ? match[2].trim() : step;

      return {
        id: `node-${index}`,
        position: { x: index * 300, y: 100 },
        data: {
          label: (
            <div className="relative group/node flex flex-col gap-2 p-3 w-52 text-left bg-[#111] border border-[#00ff88]/20 rounded-lg shadow-xl hover:border-[#00ff88]/50 transition-all">
              <div className="flex justify-between items-start gap-2">
                <input 
                  className="nodrag bg-transparent border-none outline-none font-syne font-bold text-[13px] text-[#00ff88] truncate w-full p-0 h-auto selection:bg-[#00ff88]/20"
                  defaultValue={title}
                  onBlur={(e) => handleNodeUpdate(index, e.target.value, description)}
                />
                <span className="text-[10px] font-mono text-gray-500 shrink-0">#{index + 1}</span>
              </div>
              <textarea 
                className="nodrag bg-transparent border-none outline-none font-mono text-[11px] text-gray-400 leading-relaxed resize-none h-16 w-full custom-scrollbar selection:bg-[#00ff88]/20"
                defaultValue={description}
                onBlur={(e) => handleNodeUpdate(index, title, e.target.value)}
              />
              <div className="absolute -top-2 -right-2 opacity-0 group-hover/node:opacity-100 transition-opacity flex gap-1">
                 <button 
                    onClick={(e) => { e.stopPropagation(); deleteNode(index); }}
                    className="p-1 border border-rose-500/30 text-rose-500 rounded bg-black hover:bg-rose-500/10"
                 >
                   <Trash2 size={10} />
                 </button>
              </div>
            </div>
          )
        }
      };
    });
  }, [flowSteps]);

  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = [];
    for (let i = 0; i < flowSteps.length - 1; i++) {
      edges.push({
        id: `edge-${i}-${i + 1}`,
        source: `node-${i}`,
        target: `node-${i + 1}`,
        animated: true,
        style: { stroke: '#00ff88', strokeWidth: 2, opacity: 0.4 }
      });
    }
    return edges;
  }, [flowSteps]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    if (nodes.length !== flowSteps.length) {
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [initialNodes, initialEdges, flowSteps.length, nodes.length, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#00ff88', strokeWidth: 2, opacity: 0.4 } }, eds)),
    [setEdges],
  );

  const handleNodeUpdate = (index: number, title: string, newDesc: string) => {
    const newSteps = [...flowSteps];
    newSteps[index] = `${title}: ${newDesc}`;
    onChange?.(newSteps);
  };

  const addNode = () => {
    const newSteps = [...flowSteps, "New Screen: Description goes here"];
    onChange?.(newSteps);
  };

  const deleteNode = (index: number) => {
    const newSteps = flowSteps.filter((_, i) => i !== index);
    onChange?.(newSteps);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div 
        ref={containerRef}
        className={`w-full border border-white/5 bg-[#0a0a0a] relative overflow-hidden group/canvas ${isFullscreen ? 'h-screen' : 'h-[500px] rounded-lg'}`}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Controls className="!bg-[#111] !border-white/10 !fill-white" />
        <MiniMap 
            nodeColor="#00ff88" 
            maskColor="rgba(0, 0, 0, 0.8)" 
            className="!bg-[#111] !border-white/10"
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#ffffff10" />
        
        <Panel position="top-right" className="flex gap-2">
           <button 
             onClick={addNode}
             className="flex items-center gap-2 px-3 py-1.5 bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88] font-mono text-[10px] uppercase tracking-widest hover:bg-[#00ff88]/20 transition-all rounded backdrop-blur-md"
           >
             <Plus size={12} />
             Add Stage
           </button>
           <button 
             onClick={toggleFullscreen}
             className="flex items-center gap-2 px-3 py-1.5 bg-black/40 border border-white/10 text-gray-400 font-mono text-[10px] uppercase tracking-widest hover:text-white transition-all rounded backdrop-blur-md"
           >
             {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
             {isFullscreen ? 'Exit Full' : 'Zen View'}
           </button>
        </Panel>

        <Panel position="bottom-left">
           <div className="flex items-center gap-2 bg-[#111] border border-[#00ff88]/10 px-3 py-1.5 rounded-full shadow-lg">
              <Settings2 size={12} className="text-[#00ff88]" />
              <span className="text-[#00ff88] text-[9px] font-mono tracking-tight uppercase">Interactive_Flow_Engine</span>
           </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};
