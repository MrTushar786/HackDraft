import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Plus, Maximize2, Minimize2 } from 'lucide-react';
import type { ProjectIdea } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatBotProps {
  idea: ProjectIdea | null;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatBot: React.FC<ChatBotProps> = ({ idea }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 450, height: 600 });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Welcome message
  const initChat = useCallback(() => {
    if (idea) {
      setMessages([
        {
          role: 'assistant',
          content: `Hey! I'm your HackDraft Buddy for **${idea.name}**. I know everything about this blueprint. \n\nNeed help setting it up, writing code, or preparing your pitch? Ask away!`
        }
      ]);
    }
  }, [idea]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initChat();
    }
  }, [isOpen, messages.length, initChat]);

  // Resizing logic
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = dimensions.width;
    const startHeight = dimensions.height;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(320, Math.min(window.innerWidth - 100, startWidth + (startX - moveEvent.clientX)));
      const newHeight = Math.max(400, Math.min(window.innerHeight - 100, startHeight + (startY - moveEvent.clientY)));
      setDimensions({ width: newWidth, height: newHeight });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [dimensions]);

  if (!idea) return null;

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, messages: newMessages }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send message');

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "SYSTEM ERROR: Could not connect to neural link. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm("Start a new conversation with your buddy?")) {
      setMessages([]);
    }
  };

  const chatContainerStyles = isMaximized 
    ? { width: 'calc(100vw - 48px)', height: 'calc(100vh - 48px)', bottom: '24px', right: '24px' }
    : { width: `${dimensions.width}px`, height: `${dimensions.height}px` };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen ? (
        <div 
          className="bg-[#0a0a0a] border border-[#00ff88]/30 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 transition-[width,height] relative"
          style={chatContainerStyles}
        >
          {/* Resize Handle (Top Left) */}
          {!isMaximized && (
            <div 
              onMouseDown={startResizing}
              className="absolute top-0 left-0 w-6 h-6 cursor-nwse-resize z-50 hover:bg-[#00ff88]/10 flex items-start justify-start p-0.5"
            >
              <div className="w-1.5 h-1.5 bg-[#00ff88]/30 rounded-full" />
            </div>
          )}

          {/* Header */}
          <div className="bg-[#00ff88]/10 border-b border-[#00ff88]/20 px-4 py-3 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-[#00ff88]" />
              <div className="flex flex-col">
                <span className="font-mono text-[10px] font-bold text-[#00ff88] tracking-widest uppercase leading-none mb-1">HackDraft Buddy</span>
                <span className="text-[9px] text-gray-500 font-mono uppercase tracking-tighter truncate max-w-[150px]">{idea.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={clearChat} title="New Chat" className="text-gray-500 hover:text-[#00ff88] transition p-1">
                <Plus size={16} />
              </button>
              <button onClick={() => setIsMaximized(!isMaximized)} title={isMaximized ? "Restore" : "Maximize"} className="text-gray-500 hover:text-white transition p-1">
                {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button onClick={() => setIsOpen(false)} title="Close" className="text-gray-400 hover:text-rose-500 transition p-1 ml-1">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/20">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-[#00ff88]/20 text-[#00ff88]' : 'bg-gray-800 text-gray-300'}`}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`p-4 rounded-xl text-sm font-mono leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-[#00ff88]/10 border border-[#00ff88]/20 text-white rounded-tr-none ml-12' : 'bg-white/5 border border-white/10 text-gray-300 rounded-tl-none mr-12'}`}>
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-3 space-y-1" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-3 space-y-1" {...props} />,
                      code: ({node, ...props}) => (
                        <code className="bg-[#00ff88]/10 px-1.5 py-0.5 rounded text-[#00ff88] text-xs font-bold" {...props} />
                      ),
                      pre: ({node, ...props}) => (
                        <pre className="bg-black/80 p-3 rounded-lg border border-white/5 overflow-x-auto my-4 text-xs" {...props} />
                      ),
                      strong: ({node, ...props}) => <strong className="text-[#00ff88] font-bold" {...props} />,
                      a: ({node, ...props}) => <a className="text-[#00ff88] underline hover:text-[#00ff88]/80" target="_blank" rel="noopener noreferrer" {...props} />,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-800 text-gray-400 flex items-center justify-center border border-[#00ff88]/20 animate-pulse">
                  <Bot size={14} className="text-[#00ff88]" />
                </div>
                <div className="bg-white/5 p-4 rounded-xl text-xs font-mono text-gray-500 animate-pulse border border-white/5">
                  Analyzing architecture...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-4 border-t border-white/10 bg-black/40 shrink-0">
            <div className="relative flex items-center gap-3">
              <input
                type="text"
                placeholder="Ask about architecture, setup, or code..."
                className="flex-1 bg-white/5 border border-white/10 text-white rounded-lg pl-4 pr-10 py-3.5 text-sm focus:outline-none focus:border-[#00ff88]/50 font-mono transition-all placeholder:text-gray-600"
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="absolute right-2 p-2 text-[#00ff88] hover:bg-[#00ff88]/20 rounded-md transition-all disabled:opacity-30"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center w-14 h-14 bg-[#00ff88] hover:bg-[#00331a] hover:text-[#00ff88] text-black rounded-full shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:shadow-[0_0_40px_rgba(0,255,136,0.5)] transition-all duration-300"
        >
          <MessageSquare size={24} className="group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff88] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-white border-2 border-[#00ff88]"></span>
          </span>
        </button>
      )}
    </div>
  );
};
