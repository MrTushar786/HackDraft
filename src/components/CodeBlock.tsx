import { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import type { CodeSnippet } from '../types';

// A hand-tuned theme built on top of the VS Code dark+ palette
const hackDraftTheme: Record<string, React.CSSProperties> = {
  'code[class*="language-"]': {
    color: '#d4d4d4',
    background: 'transparent',
    fontFamily: "'Space Mono', 'Menlo', 'Consolas', monospace",
    fontSize: '13px',
    lineHeight: '1.75',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    tabSize: 2,
  },
  'pre[class*="language-"]': {
    color: '#d4d4d4',
    background: 'transparent',
    margin: 0,
    padding: 0,
    overflow: 'auto',
  },
  comment: { color: '#6a9955', fontStyle: 'italic' },
  prolog:  { color: '#6a9955' },
  doctype: { color: '#6a9955' },
  cdata:   { color: '#6a9955' },

  punctuation: { color: '#808080' },

  'attr-name':  { color: '#9cdcfe' },
  'attr-value': { color: '#ce9178' },

  keyword:   { color: '#c586c0' },
  builtin:   { color: '#4ec9b0' },
  'class-name': { color: '#4ec9b0' },
  function:  { color: '#dcdcaa' },
  boolean:   { color: '#569cd6' },
  number:    { color: '#b5cea8' },
  string:    { color: '#ce9178' },
  'template-string': { color: '#ce9178' },
  char:      { color: '#ce9178' },
  symbol:    { color: '#569cd6' },
  regex:     { color: '#d16969' },
  url:       { color: '#ce9178' },

  operator:  { color: '#d4d4d4' },
  variable:  { color: '#9cdcfe' },
  constant:  { color: '#4fc1ff' },
  property:  { color: '#9cdcfe' },
  'template-literal': { color: '#ce9178' },

  selector:    { color: '#d7ba7d' },
  tag:         { color: '#569cd6' },
  'attr-equals': { color: '#d4d4d4' },

  important: { color: '#569cd6', fontWeight: 'bold' },
  bold:      { fontWeight: 'bold' },
  italic:    { fontStyle: 'italic' },

  'inserted-sign':{ color: '#73c991' },
  inserted:       { color: '#73c991', background: 'rgba(115,201,145,0.1)' },
  'deleted-sign': { color: '#f14c4c' },
  deleted:        { color: '#f14c4c', background: 'rgba(241,76,76,0.1)' },
  changed:        { color: '#e2c08d' },
};

// Map short lang codes to Prism language identifiers
const LANG_MAP: Record<string, string> = {
  ts: 'typescript', js: 'javascript', py: 'python',
  tsx: 'tsx', jsx: 'jsx', sh: 'bash', bash: 'bash',
  sql: 'sql', go: 'go', rs: 'rust', yml: 'yaml', yaml: 'yaml',
  json: 'json', css: 'css', html: 'markup',
};

const LANG_COLORS: Record<string, { fg: string; bg: string }> = {
  typescript:  { fg: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  javascript:  { fg: '#eab308', bg: 'rgba(234,179,8,0.12)'  },
  python:      { fg: '#22c55e', bg: 'rgba(34,197,94,0.12)'  },
  go:          { fg: '#06b6d4', bg: 'rgba(6,182,212,0.12)'  },
  rust:        { fg: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  sql:         { fg: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
  bash:        { fg: '#00ff88', bg: 'rgba(0,255,136,0.08)'  },
  json:        { fg: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
};

export const CodeBlock = ({ snippet }: { snippet: CodeSnippet }) => {
  const [copied, setCopied] = useState(false);

  const rawLang = snippet.language?.toLowerCase() ?? 'typescript';
  const prismLang = LANG_MAP[rawLang] ?? rawLang;
  const colors = LANG_COLORS[prismLang] ?? { fg: '#00ff88', bg: 'rgba(0,255,136,0.08)' };

  // Unescape \\n back to real newlines for display + copy
  const displayCode = snippet.code
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"');

  const lineCount = displayCode.split('\n').length;

  const handleCopy = () => {
    navigator.clipboard.writeText(displayCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative border border-white/[0.06] bg-[#0d0d0f] overflow-hidden transition-all duration-300 hover:border-white/[0.12]"
         style={{ boxShadow: '0 0 0 0 transparent', transition: 'box-shadow 0.3s' }}
         onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 0 40px -10px ${colors.fg}22`)}
         onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
    >
      {/* ── Title Bar ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#161618] border-b border-white/[0.05]">
        {/* Left: traffic lights + file name */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 items-center">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-110 cursor-default transition-all" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e] hover:brightness-110 cursor-default transition-all" />
            <div className="w-3 h-3 rounded-full bg-[#28c840] hover:brightness-110 cursor-default transition-all" />
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <Terminal size={13} style={{ color: colors.fg }} />
            <span className="text-[12px] font-mono text-gray-300 tracking-wide">
              {snippet.filename}
            </span>
          </div>
        </div>

        {/* Right: language badge + copy */}
        <div className="flex items-center gap-3">
          <span
            className="text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 border"
            style={{ color: colors.fg, background: colors.bg, borderColor: colors.fg + '40' }}
          >
            {snippet.language}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 border border-white/10 text-gray-500 hover:text-white hover:border-white/30 transition-all"
          >
            {copied
              ? <><Check size={11} className="text-[#00ff88]" /><span className="text-[#00ff88]">Copied</span></>
              : <><Copy size={11} /><span>Copy</span></>
            }
          </button>
        </div>
      </div>

      {/* ── Explanation Banner ─────────────────────────────────────── */}
      <div className="flex items-start gap-3 px-5 py-3 border-b border-white/[0.04]"
           style={{ background: colors.bg }}>
        <span className="font-mono text-[11px] mt-px" style={{ color: colors.fg + 'aa' }}>//</span>
        <p className="text-[12px] font-mono leading-relaxed text-gray-400">
          {snippet.explanation}
        </p>
      </div>

      {/* ── Code Area ─────────────────────────────────────────────── */}
      <div className="overflow-x-auto custom-scrollbar">
        <div className="flex">
          {/* Line numbers gutter */}
          <div className="select-none shrink-0 px-4 py-5 text-right border-r border-white/[0.04] bg-[#0a0a0c]"
               style={{ minWidth: '3.5rem' }}>
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i} className="text-[12px] font-mono text-gray-700 leading-[1.75]">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Highlighted code */}
          <div className="flex-1 px-5 py-5 overflow-x-auto">
            <SyntaxHighlighter
              language={prismLang}
              style={hackDraftTheme}
              customStyle={{
                background: 'transparent',
                margin: 0,
                padding: 0,
                fontSize: '13px',
                lineHeight: '1.75',
              }}
              wrapLines={false}
              useInlineStyles={true}
              PreTag="div"
              CodeTag="code"
            >
              {displayCode}
            </SyntaxHighlighter>
          </div>
        </div>
      </div>

      {/* ── Status Bar ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-2 bg-[#0f0f11] border-t border-white/[0.04]">
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-mono text-gray-700 uppercase tracking-widest">
            {lineCount} lines
          </span>
          <span className="text-[9px] font-mono text-gray-700 uppercase tracking-widest">
            UTF-8
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: colors.fg }} />
          <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: colors.fg + '99' }}>
            {prismLang}
          </span>
        </div>
      </div>
    </div>
  );
};
