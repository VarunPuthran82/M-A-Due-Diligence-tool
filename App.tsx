
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GeminiService } from './services/geminiService';
import { UploadedFile, ChatMessage } from './types';
import { MarkdownRenderer } from './components/MarkdownRenderer';

const FileIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const SendIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
  </svg>
);

const StopIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="6" y="6" width="12" height="12" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const RiskIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const App: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const geminiRef = useRef<GeminiService | null>(null);

  useEffect(() => {
    geminiRef.current = new GeminiService();
  }, []);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentResponse, scrollToBottom]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      if (file.type !== 'application/pdf' && file.type !== 'text/html' && file.type !== 'text/plain') {
        alert(`${file.name} is not supported. Only PDFs, HTML, and TXT files are allowed.`);
        continue;
      }

      const reader = new FileReader();
      const promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
      });
      reader.readAsDataURL(file);
      const base64 = await promise;

      newFiles.push({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        base64: base64,
        status: 'ready'
      });
    }

    setFiles(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const executeAnalysis = async (promptText: string) => {
    if (isAnalyzing || files.length === 0) return;

    const controller = new AbortController();
    setAbortController(controller);

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: promptText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsAnalyzing(true);
    setCurrentResponse('');

    let accumulatedResponse = '';

    try {
      const result = await geminiRef.current?.analyzeDocuments(
        files,
        promptText,
        (chunk) => {
          accumulatedResponse += chunk;
          setCurrentResponse(prev => prev + chunk)
        },
        controller.signal
      );

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: result || '',
        timestamp: new Date()
      }]);
      setCurrentResponse('');
    } catch (error: any) {
      if (error.name === 'AbortError' || error.message === 'AbortError') {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: accumulatedResponse + "\n\n*(Analysis stopped by user)*",
          timestamp: new Date()
        }]);
        setCurrentResponse('');
      } else {
        console.error(error);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: "Error: Analysis failed. Verify your API key and file integrity.",
          timestamp: new Date()
        }]);
      }
    } finally {
      setIsAnalyzing(false);
      setAbortController(null);
    }
  };

  const handleStop = () => {
    abortController?.abort();
  };

  const handleSend = () => {
    if (!input.trim()) return;
    executeAnalysis(input);
    setInput('');
  };

  const insightsGallery = [
    {
      title: "Item 1A Risk Audit",
      description: "Extract and compare 'Risk Factors'. Identify thematic clusters, severity shifts, and unique liabilities.",
      prompt: "Extract and compare the 'Risk Factors' sections (typically Item 1A) from all provided reports. Identify: 1) Common thematic risks. 2) Unique risks. 3) Significant differences in disclosure language or perceived severity. Present in a comparative table with page citations.",
      icon: <RiskIcon />
    },
    {
      title: "ESG Strategic Analysis",
      description: "Environmental targets, social initiatives, and board governance practices compared across entities.",
      prompt: "Generate a comprehensive comparative analysis of ESG disclosures. Focus on: 1) Environmental targets. 2) Social impact. 3) Governance board independence. Present in a table with citations.",
      icon: <ShieldIcon />
    },
    {
      title: "Capital Structure Snapshot",
      description: "Benchmarking total debt, cash positions, and liquidity ratios across all targets.",
      prompt: "Synthesize the capital structure for each company. Extract total debt, cash equivalents, and shareholder equity. Provide a comparative table of liquidity ratios and cite source pages.",
      icon: <SparklesIcon />
    }
  ];

  const presets = [
    {
      label: "Board Diversity Audit",
      prompt: "Compare board diversity metrics (gender, ethnicity, tenure, independence). Create a table comparing exact figures and cite page numbers.",
      icon: <UsersIcon />
    },
    {
      label: "Exec Comp Benchmarking",
      prompt: "Extract and compare executive compensation details for the last 3 fiscal years. Present in a table with page citations.",
      icon: <UsersIcon />
    },
    {
      label: "R&D Spend Trends",
      prompt: "Compare R&D spending trends for the last 3 fiscal years from MD&A. Cite page numbers.",
      icon: <SparklesIcon />
    },
    {
      label: "Discrepancy Auditor",
      prompt: "Audit reports for significant discrepancies or logical contradictions regarding financial performance or legal disclosures. Cite page numbers.",
      icon: <ShieldIcon />
    }
  ];

  return (
    <div className="flex h-screen bg-[#0a0a0c] text-zinc-100 overflow-hidden font-sans selection:bg-indigo-500/30">
      <aside className="w-80 border-r border-zinc-800 bg-[#0c0c0e] flex flex-col hidden lg:flex shadow-2xl z-30">
        <div className="p-6 border-b border-zinc-800 bg-[#0e0e11]">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">D</div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white leading-none">DueDiligence<span className="text-indigo-500">.ai</span></h1>
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1">Audit & Analysis Engine</p>
            </div>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-800 hover:bg-zinc-700 transition-all rounded-xl text-sm font-medium border border-zinc-700 hover:border-zinc-500 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Import Data Room
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple accept=".pdf,.html,.htm,.txt" className="hidden" />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide">
          <section>
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2 mb-3">Loaded Documents ({files.length})</h2>
            <div className="space-y-2">
              {files.length === 0 ? (
                <div className="px-2 py-8 text-center border-2 border-dashed border-zinc-800 rounded-2xl">
                  <p className="text-zinc-600 text-[11px] italic">No filings loaded.</p>
                </div>
              ) : (
                files.map(file => (
                  <div key={file.id} className="group flex items-center gap-3 bg-zinc-900/40 border border-zinc-800/50 p-2.5 rounded-xl transition-all hover:bg-zinc-800/80 hover:border-zinc-700">
                    <div className="text-indigo-500/80 p-1.5 bg-indigo-500/5 rounded-lg"><FileIcon /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-zinc-300 truncate">{file.name}</p>
                      <p className="text-[10px] text-zinc-600">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                    <button onClick={() => removeFile(file.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-600 hover:text-red-400 transition-all hover:bg-red-500/10 rounded-md">
                      <TrashIcon />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          <section>
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2 mb-3">Analysis Templates</h2>
            <div className="space-y-1">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => executeAnalysis(preset.prompt)}
                  disabled={files.length === 0 || isAnalyzing}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed group text-left"
                >
                  <span className="text-indigo-500 group-hover:scale-110 transition-transform">{preset.icon}</span>
                  {preset.label}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="p-4 border-t border-zinc-800 bg-zinc-900/20">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] text-zinc-500 flex items-center gap-1.5 uppercase tracking-wider font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              Gemini 3 Pro Active
            </span>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative min-w-0 bg-[#0a0a0c]">
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-[#0a0a0c]/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <h2 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">Long-Context Analysis Terminal</h2>
            {isAnalyzing && (
              <div className="flex items-center gap-3 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Parsing Corpus...</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Capacity:</span>
              <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">1,000,000 Tokens</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar">
          {files.length > 0 && messages.length === 0 && (
            <div className="p-8 pb-0 animate-in fade-in slide-in-from-top-4 duration-700">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 ml-2">Executive Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {insightsGallery.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => executeAnalysis(item.prompt)}
                    className="flex flex-col text-left p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 hover:bg-zinc-800/60 hover:border-indigo-500/40 transition-all group relative overflow-hidden shadow-lg"
                  >
                    <div className="mb-4 p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 w-fit group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <h4 className="text-sm font-bold text-white mb-2">{item.title}</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">{item.description}</p>
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="text-indigo-400"><SendIcon /></div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="max-w-5xl mx-auto p-8 space-y-12">
            {messages.length === 0 ? (
              <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-[2.5rem] flex items-center justify-center border border-indigo-400/30 mb-10 shadow-2xl shadow-indigo-500/20 rotate-12 hover:rotate-0 hover:scale-110 transition-all duration-500">
                  <ShieldIcon />
                </div>
                <h2 className="text-4xl font-extrabold text-white mb-6 tracking-tight leading-none">
                  M&A <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400 text-shadow-glow">Intelligence</span> Audit
                </h2>
                <p className="text-zinc-400 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
                  Execute complex, cross-document reasoning across entire 10-Ks. Our engine provides citation-backed analytical precision without slicing text into RAG fragments.
                </p>

                {files.length === 0 && (
                  <div className="p-8 bg-[#111116] border border-zinc-800 rounded-3xl max-w-md shadow-2xl">
                    <p className="text-zinc-400 text-sm mb-6 font-medium">Load target filings to initiate workspace</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-bold transition-all shadow-xl shadow-indigo-600/20 active:scale-[0.98]"
                    >
                      Upload Multi-Document Data Room
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-10">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                    <div className={`max-w-[95%] rounded-3xl p-8 ${msg.role === 'user'
                      ? 'bg-zinc-800/40 border border-zinc-700/50 text-white relative group'
                      : 'bg-[#0e0e11] border border-zinc-800 shadow-2xl'
                      }`}>
                      <div className="flex items-center gap-3 mb-6">
                        <div className={`w-1.5 h-6 rounded-full ${msg.role === 'user' ? 'bg-indigo-500' : 'bg-zinc-700'}`}></div>
                        <div className="text-[10px] uppercase tracking-[0.4em] font-black text-zinc-500">
                          {msg.role === 'user' ? 'Direct Query' : 'Consolidated Intelligence Output'}
                        </div>
                        {msg.role === 'user' && !isAnalyzing && (
                          <div className="ml-auto flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setInput(msg.content); document.querySelector('textarea')?.focus(); }} className="p-2 text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors bg-zinc-800/80" title="Edit query">
                              <EditIcon />
                            </button>
                            <button onClick={() => executeAnalysis(msg.content)} className="p-2 text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors bg-zinc-800/80" title="Retry query">
                              <RefreshIcon />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="text-zinc-200">
                        {msg.role === 'user' ? (
                          <p className="text-xl font-medium leading-relaxed tracking-tight text-zinc-100">{msg.content}</p>
                        ) : (
                          <MarkdownRenderer content={msg.content} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isAnalyzing && currentResponse && (
                  <div className="flex justify-start">
                    <div className="max-w-[95%] rounded-3xl p-8 bg-[#0e0e11] border border-zinc-800 shadow-xl border-l-indigo-500">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1.5 h-6 rounded-full bg-indigo-500 animate-pulse"></div>
                        <div className="text-[10px] uppercase tracking-[0.4em] font-black text-indigo-400 animate-pulse">
                          Synthesizing Analysis...
                        </div>
                      </div>
                      <div className="text-zinc-200">
                        <MarkdownRenderer content={currentResponse} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={chatEndRef} className="h-24" />
          </div>
        </div>

        <div className="p-8 pt-4 border-t border-zinc-800/50 bg-[#0a0a0c]/90 backdrop-blur-3xl sticky bottom-0 z-40">
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-violet-500/20 rounded-[2rem] blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={files.length > 0 ? "Identify risk discrepancies or strategic conflicts..." : "Load documents to enable audit features..."}
                disabled={files.length === 0 || isAnalyzing}
                className="w-full bg-[#111116] border border-zinc-800 focus:border-indigo-500/50 focus:ring-0 rounded-[2rem] py-6 pl-8 pr-24 text-zinc-100 placeholder-zinc-600 resize-none h-32 transition-all disabled:opacity-40 shadow-2xl leading-relaxed text-base"
              />
              <div className="absolute right-5 bottom-5">
                {isAnalyzing ? (
                  <button
                    onClick={handleStop}
                    className="p-5 bg-red-500/80 hover:bg-red-500 text-white rounded-2xl transition-all shadow-xl hover:scale-105 active:scale-95 animate-pulse"
                    title="Stop Generating"
                  >
                    <StopIcon />
                  </button>
                ) : (
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || files.length === 0}
                    className="p-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-2xl transition-all shadow-xl hover:scale-105 active:scale-95 disabled:scale-100 text-white"
                  >
                    <SendIcon />
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-6 mt-6">
            <p className="text-[10px] text-zinc-600 uppercase tracking-[0.3em] font-bold">
              Secure Data Room Isolation • Native 1M+ Context Reasoning
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
