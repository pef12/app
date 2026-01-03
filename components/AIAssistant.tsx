
import React, { useState, useRef, useEffect } from 'react';
import { getGeminiResponse } from '../services/geminiService';
import { ChatMessage, ProjectInfo } from '../types';

interface AIAssistantProps {
  projectInfo: ProjectInfo;
}

type AssistantTab = 'chat' | 'blueprint' | 'logic';

const AIAssistant: React.FC<AIAssistantProps> = ({ projectInfo }) => {
  const [activeTab, setActiveTab] = useState<AssistantTab>('chat');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: `[CONVERSA]\nOlá! Sou seu arquiteto de sistemas UE5. 
      
Como posso ajudar no seu projeto hoje? Vou organizar os **Nodes** e fornecer os equivalentes em **C++** para você!`,
      timestamp: new Date()
    }
  ]);
  
  const [parsedContent, setParsedContent] = useState({
    chat: '',
    blueprint: '',
    logic: ''
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  const parseAIResponse = (text: string) => {
    const sections = {
      chat: text.split('[BLUEPRINT]')[0].replace('[CONVERSA]', '').trim(),
      blueprint: text.includes('[BLUEPRINT]') ? text.split('[BLUEPRINT]')[1].split('[LOGICA]')[0].trim() : '',
      logic: text.includes('[LOGICA]') ? text.split('[LOGICA]')[1].trim() : ''
    };
    setParsedContent(sections);
    return sections;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: textToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const context = `Projeto: ${projectInfo.name}, Gênero: ${projectInfo.genre}`;
    const response = await getGeminiResponse(textToSend, context);
    
    const aiMsg: ChatMessage = { role: 'model', content: response || '', timestamp: new Date() };
    setMessages(prev => [...prev, aiMsg]);
    parseAIResponse(response || '');
    setIsLoading(false);
    
    if (response?.includes('[BLUEPRINT]')) {
      setActiveTab('blueprint');
    }
  };

  const renderBlueprintContent = (content: string) => {
    const lines = content.split('\n').filter(l => l.includes('|') && !l.includes('---'));
    
    if (lines.length <= 1) {
      return (
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 font-mono text-xs text-blue-300 whitespace-pre-wrap">
          {content}
        </div>
      );
    }

    const dataLines = lines.slice(1);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        {dataLines.map((line, idx) => {
          const parts = line.split('|').filter(p => p.trim() !== '').map(p => p.trim());
          if (parts.length < 2) return null;
          
          const nodeName = parts[0].replace(/\*\*/g, '');
          const nodeDesc = parts[1];
          const nodePerf = parts[2] || 'N/A';
          const cppCode = parts[3] || null;
          const cardId = `node-${idx}`;

          const isGoodPerf = nodePerf.toLowerCase().includes('excelente') || 
                            nodePerf.toLowerCase().includes('rápida') || 
                            nodePerf.toLowerCase().includes('baixa') ||
                            nodePerf.toLowerCase().includes('event-driven');

          return (
            <div key={idx} className="bg-[#1b2230] border border-slate-700/40 rounded-xl overflow-hidden shadow-2xl hover:border-blue-500/50 transition-all group flex flex-col relative">
              {/* Pins Esquerda (Entrada) */}
              <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
                <div className="w-3 h-3 rounded-full bg-white border-2 border-slate-900 shadow-sm" title="Exec In"></div>
                <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-slate-900 shadow-sm" title="Object In"></div>
              </div>
              
              {/* Pins Direita (Saída) */}
              <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
                <div className="w-3 h-3 rounded-full bg-white border-2 border-slate-900 shadow-sm" title="Exec Out"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-sm" title="Success Out"></div>
              </div>

              <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-4 py-3 border-b border-white/5 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-code-commit text-[10px] text-white/70"></i>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{nodeName}</span>
                </div>
                {cppCode && (
                  <button 
                    onClick={() => copyToClipboard(cppCode, cardId)}
                    className={`flex items-center gap-2 px-2 py-1 rounded-md text-[9px] font-bold uppercase transition-all shadow-lg ${
                      copiedId === cardId ? 'bg-emerald-500 text-white' : 'bg-black/30 text-white/70 hover:bg-white hover:text-blue-900'
                    }`}
                  >
                    <i className={`fa-solid ${copiedId === cardId ? 'fa-check' : 'fa-copy'}`}></i>
                  </button>
                )}
              </div>
              
              <div className="p-5 flex-1 bg-slate-900/40">
                <p className="text-slate-300 text-[11px] leading-relaxed mb-4 italic">
                  "{nodeDesc}"
                </p>
                
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isGoodPerf ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`}></div>
                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Perf: {nodePerf}</span>
                  </div>
                </div>
              </div>

              {cppCode && (
                 <div className="bg-black/40 px-4 py-2 border-t border-slate-800/30">
                    <code className="text-[9px] text-blue-400/80 font-mono truncate block">
                      {cppCode}
                    </code>
                 </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const quickPrompts = [
    { label: 'IA de Perseguição', prompt: 'Gere os nodes e a lógica para uma IA de perseguição usando AI Perception. Inclua snippets C++ na tabela.' },
    { label: 'Dash System', prompt: 'Como criar um sistema de Dash (esquiva) otimizado com Launch Character? Liste nodes e C++.' },
    { label: 'Inventário Data Asset', prompt: 'Nodes necessários para carregar itens a partir de um Primary Data Asset.' },
    { label: 'Multiplayer Health', prompt: 'Como replicar vida no servidor? Liste os nodes e a lógica de OnRep.' }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] glass-card rounded-3xl overflow-hidden border-slate-800 shadow-2xl animate-in fade-in duration-500">
      {/* Tab Switcher */}
      <div className="flex bg-[#0f172a] border-b border-slate-800 p-1.5 gap-1">
        {(['chat', 'blueprint', 'logic'] as AssistantTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 ${
              activeTab === tab 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20 scale-[1.01]' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            <i className={`fa-solid ${
              tab === 'chat' ? 'fa-comments' : 
              tab === 'blueprint' ? 'fa-diagram-project' : 'fa-code-branch'
            }`}></i>
            {tab === 'chat' ? 'Conversa' : tab === 'blueprint' ? 'Blueprint' : 'Lógica'}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative bg-[#0b0e14]">
        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div ref={scrollRef} className="h-full overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-4 shadow-md ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-[#1e293b] text-slate-200 rounded-tl-none border border-slate-700/50'
                }`}>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <p className="whitespace-pre-wrap leading-relaxed text-sm">
                      {msg.content.includes('[CONVERSA]') ? msg.content.split('[CONVERSA]')[1].split('[')[0].trim() : msg.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 animate-pulse text-blue-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  Consultando Oráculo Unreal...
                </div>
              </div>
            )}
          </div>
        )}

        {/* Blueprint Tab */}
        {activeTab === 'blueprint' && (
          <div className="h-full overflow-y-auto p-8 relative custom-scrollbar bg-[#0b0e14]">
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-blue-400 font-black text-sm uppercase tracking-[0.2em] flex items-center gap-2">
                    <i className="fa-solid fa-microchip"></i> Node Inspector
                  </h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-tight">Tradução Visual de Blueprints</p>
                </div>
                <div className="h-px flex-1 mx-8 bg-slate-800/50"></div>
              </div>
              
              {parsedContent.blueprint ? (
                renderBlueprintContent(parsedContent.blueprint)
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-700 text-center">
                  <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center mb-4 border border-slate-800 shadow-inner">
                    <i className="fa-solid fa-diagram-cells text-3xl opacity-20"></i>
                  </div>
                  <p className="text-sm font-medium">Nenhum node detectado.</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">Use o chat para solicitar uma implementação lógica.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Logic Tab */}
        {activeTab === 'logic' && (
          <div className="h-full overflow-y-auto p-8 bg-[#0f172a] custom-scrollbar">
            <div className="flex items-center gap-3 mb-8 border-l-4 border-emerald-500 pl-4">
              <div>
                <h3 className="text-emerald-400 font-black text-sm uppercase tracking-[0.2em]">Guia de Fluxo</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Regras e Conexões Lógicas</p>
              </div>
            </div>
            {parsedContent.logic ? (
              <div className="prose prose-invert max-w-none">
                <div className="bg-[#162033] border border-slate-800 p-8 rounded-3xl text-slate-300 leading-relaxed shadow-xl">
                  <div className="whitespace-pre-wrap font-sans text-sm md:text-base">
                    {parsedContent.logic}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-700">
                <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center mb-4 border border-slate-800">
                  <i className="fa-solid fa-brain text-3xl opacity-20"></i>
                </div>
                <p className="text-sm font-medium">Lógica não gerada.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Prompts & Input */}
      <div className="bg-[#0b0e14] border-t border-slate-800 p-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
          {quickPrompts.map((qp, i) => (
            <button 
              key={i}
              onClick={() => handleSend(qp.prompt)}
              className="whitespace-nowrap bg-slate-900 hover:bg-blue-600/10 text-slate-400 hover:text-blue-400 text-[9px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl border border-slate-800 hover:border-blue-500/30 transition-all"
            >
              <i className="fa-solid fa-bolt-lightning mr-2 text-[8px]"></i>
              {qp.label}
            </button>
          ))}
        </div>
        
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Como implementar [sua idéia]?"
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 pl-6 pr-16 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all shadow-inner"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 w-12 h-12 rounded-xl unreal-gradient text-white shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-all flex items-center justify-center group"
          >
            <i className="fa-solid fa-paper-plane group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
