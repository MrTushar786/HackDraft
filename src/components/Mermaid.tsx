import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Loader2 } from 'lucide-react';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: "'Space Mono', monospace",
  themeVariables: {
    primaryColor: '#111111',
    primaryTextColor: '#d4d4d4',
    primaryBorderColor: '#00ff88',
    lineColor: '#00ff88',
    secondaryColor: '#0a0a0a',
    tertiaryColor: '#151515',
  }
});

export const Mermaid = ({ chart }: { chart: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const renderChart = async () => {
      if (!chart || !containerRef.current) return;
      
      try {
        setLoading(true);
        setError(null);
        // Clean graph content
        let cleanChart = chart.replace(/```mermaid/g, '').replace(/```/g, '').trim();
        // Unescape escaped newlines if present
        cleanChart = cleanChart.replace(/\\n/g, '\n');
        
        // Handle erDiagram syntax issues (sometimes LLM output is a single line, erDiagram requires strict newlines)
        if (cleanChart.startsWith('erDiagram') && !cleanChart.includes('\n')) {
             cleanChart = cleanChart.replace('erDiagram', 'erDiagram\n');
        }

        if (!cleanChart.startsWith('graph') && !cleanChart.startsWith('flowchart') && !cleanChart.startsWith('erDiagram')) {
            cleanChart = 'graph TD\n' + cleanChart;
        }

        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        console.log("Rendering Mermaid:", cleanChart);
        const { svg } = await mermaid.render(id, cleanChart);
        
        if (mounted && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Mermaid error:", err);
        if (mounted) {
          setError(err?.message || "Failed to render diagram");
          setLoading(false);
          if (containerRef.current) containerRef.current.innerHTML = '';
        }
      }
    };

    renderChart();

    return () => {
      mounted = false;
    };
  }, [chart]);

  return (
    <div className="relative w-full overflow-hidden bg-[#0d0d0f] border border-white/5 p-8 flex justify-center items-center min-h-[300px]">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0d0d0f]/80 z-10">
          <Loader2 className="animate-spin text-[#00ff88]" size={24} />
        </div>
      )}
      {error && (
        <div className="text-rose-500 font-mono text-xs max-w-lg mb-8 bg-rose-500/10 p-4 border border-rose-500/20">
          ⚠️ Diagram render failed: {error}
        </div>
      )}
      <div 
        ref={containerRef} 
        className="w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto"
      />
    </div>
  );
};
