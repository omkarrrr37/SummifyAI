"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCompletion } from "@ai-sdk/react";
import { 
  Sparkles, 
  Trash2, 
  Copy, 
  Check, 
  History, 
  Maximize2, 
  Minimize2, 
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  Zap,
  BookOpen,
  HelpCircle,
  TrendingUp,
  FileText,
  Brain,
  Upload,
  AlertCircle
} from "lucide-react";

interface HistoryItem {
  id: string;
  prompt: string;
  response: string;
  created_at: string;
}

// Beautiful ultra-light Markdown parser to render clean structures (headers, bold, bullet lists)
function MarkdownRenderer({ text }: { text: string }) {
  if (!text) return null;

  const lines = text.split("\n");
  const renderedElements: React.ReactNode[] = [];
  
  let currentList: React.ReactNode[] = [];

  const parseInlineMarkdown = (lineText: string): React.ReactNode[] => {
    // Robust bold (**text**) parsing
    const parts = lineText.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index} className="font-bold text-indigo-400">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const flushList = (key: number) => {
    if (currentList.length > 0) {
      renderedElements.push(
        <ul key={`list-${key}`} className="list-disc pl-5 my-3.5 space-y-2 text-slate-300">
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Header level 3
    if (trimmed.startsWith("### ")) {
      flushList(index);
      renderedElements.push(
        <h4 key={index} className="text-base font-bold text-white mt-5 mb-2.5 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
          {parseInlineMarkdown(trimmed.slice(4))}
        </h4>
      );
    }
    // Header level 2
    else if (trimmed.startsWith("## ")) {
      flushList(index);
      renderedElements.push(
        <h3 key={index} className="text-lg font-extrabold text-white mt-6 mb-3 border-b border-slate-800/60 pb-1 flex items-center gap-2">
          {parseInlineMarkdown(trimmed.slice(3))}
        </h3>
      );
    }
    // Header level 1
    else if (trimmed.startsWith("# ")) {
      flushList(index);
      renderedElements.push(
        <h2 key={index} className="text-xl font-black text-white mt-7 mb-4 tracking-tight flex items-center gap-2">
          {parseInlineMarkdown(trimmed.slice(2))}
        </h2>
      );
    }
    // Bullet lists (supporting '*', '-', or nested tabs)
    else if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      const listContent = trimmed.slice(2);
      currentList.push(
        <li key={`li-${index}`} className="leading-relaxed pl-1 text-slate-300">
          {parseInlineMarkdown(listContent)}
        </li>
      );
    }
    // Empty spacing line
    else if (trimmed === "") {
      flushList(index);
    }
    // Plain text paragraphs
    else {
      flushList(index);
      renderedElements.push(
        <p key={index} className="mb-4 text-slate-300 leading-relaxed font-normal text-sm">
          {parseInlineMarkdown(line)}
        </p>
      );
    }
  });

  // Clean remaining lists
  flushList(lines.length);

  return <div className="space-y-1">{renderedElements}</div>;
}

export default function Dashboard() {
  const [option, setOption] = useState<string>("summary");
  const [length, setLength] = useState<string>("medium");
  const [inputText, setInputText] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedHistoryId, setCopiedHistoryId] = useState<string | null>(null);
  
  // History states
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(true);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false); // Mobile sidebar drawer
  
  // Premium rate limit modal state
  const [showPremiumModal, setShowPremiumModal] = useState<boolean>(false);
  
  const [isParsingPdf, setIsParsingPdf] = useState<boolean>(false);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      try {
        setIsParsingPdf(true);
        setInputText("Extracting text from PDF, please wait...");
        
        const formData = new FormData();
        formData.append("file", file);
        
        const res = await fetch("/api/parse-pdf", {
          method: "POST",
          body: formData,
        });
        
        if (res.ok) {
          const data = await res.json();
          setInputText(data.text.slice(0, 50000));
        } else {
          setInputText("Failed to parse PDF. Please copy-paste the text manually.");
        }
      } catch (err) {
        console.error("PDF upload error:", err);
        setInputText("Failed to upload PDF. Please copy-paste the text manually.");
      } finally {
        setIsParsingPdf(false);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setInputText(text.slice(0, 50000));
      };
      reader.readAsText(file);
    }
  };
  
  // Completion SDK hook
  const { completion, complete, isLoading, error, setCompletion } = useCompletion({
    api: "/api/generate",
    // Must match server's toTextStreamResponse() — data protocol would show blank
    streamProtocol: "text",
    onError: (err) => {
      console.error("Completion error:", err);
      // Only show premium modal for actual rate-limit (429) responses
      if (
        err.message?.includes("429") ||
        err.message?.toLowerCase().includes("rate limit")
      ) {
        setShowPremiumModal(true);
      }
      // Other errors are logged but don't block the UI
    },
    onFinish: (promptText, completionText) => {
      // 1. Trigger Supabase DB refresh
      fetchHistory();

      // 2. Dual-persistence Local fallback
      try {
        const cached = localStorage.getItem("summify_history_cache");
        const list = cached ? JSON.parse(cached) : [];
        
        // Use promptText or fallback to inputText
        const activePrompt = promptText || inputText;
        const displayPrompt = activePrompt.length > 80 ? activePrompt.substring(0, 80) + "..." : activePrompt;

        const newItem: HistoryItem = {
          id: `local_${Date.now()}`,
          prompt: displayPrompt,
          response: completionText,
          created_at: new Date().toISOString()
        };

        const updatedList = [newItem, ...list].filter(
          (item, index, self) => self.findIndex(t => t.response === item.response) === index
        ).slice(0, 50); // Keep last 50 entries

        localStorage.setItem("summify_history_cache", JSON.stringify(updatedList));
        setHistory(updatedList);
      } catch (err) {
        console.error("Local history cache sync error:", err);
      }
    }
  });

  // Fetch history list from API with LocalStorage cache fallback
  const fetchHistory = async () => {
    try {
      setIsHistoryLoading(true);
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        // If Supabase returns history, prioritize and cache it
        if (data && Array.isArray(data) && data.length > 0) {
          setHistory(data);
          localStorage.setItem("summify_history_cache", JSON.stringify(data));
          return;
        }
      }
      
      // Fallback: If DB is empty/failing, load from localStorage
      const cached = localStorage.getItem("summify_history_cache");
      if (cached) {
        setHistory(JSON.parse(cached));
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
      const cached = localStorage.getItem("summify_history_cache");
      if (cached) {
        setHistory(JSON.parse(cached));
      }
    } finally {
      setIsHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Reset previous selection
    setSelectedHistoryItem(null);
    setCompletion("");

    try {
      await complete(inputText, {
        body: {
          option,
          length
        }
      });
    } catch (err) {
      console.error("Error starting stream:", err);
    }
  };

  const handleDeleteHistory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Stop row click selection
    try {
      // Optimistic state update
      setHistory(prev => prev.filter(item => item.id !== id));
      if (selectedHistoryItem?.id === id) {
        setSelectedHistoryItem(null);
      }

      // Sync local cache
      try {
        const cached = localStorage.getItem("summify_history_cache");
        if (cached) {
          const list = JSON.parse(cached);
          const updatedList = list.filter((item: any) => item.id !== id);
          localStorage.setItem("summify_history_cache", JSON.stringify(updatedList));
        }
      } catch (err) {
        console.error("Local delete sync error:", err);
      }

      const res = await fetch(`/api/history?id=${id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        // Re-fetch on failure to restore state
        fetchHistory();
      }
    } catch (err) {
      console.error("Error deleting item:", err);
      fetchHistory();
    }
  };

  const handleCopyToClipboard = (text: string, isHistory: boolean = false, histId: string | null = null) => {
    navigator.clipboard.writeText(text);
    if (isHistory && histId) {
      setCopiedHistoryId(histId);
      setTimeout(() => setCopiedHistoryId(null), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Determine current result text displayed
  const currentResultText = selectedHistoryItem ? selectedHistoryItem.response : completion;

  return (
    <div className="relative">
      {/* Rate Limit Premium Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-indigo-500 bg-slate-900 p-6 shadow-2xl shadow-indigo-950/40">
            {/* Design accents */}
            <div className="absolute top-0 right-0 bg-indigo-500 text-slate-950 text-[10px] font-bold px-3 py-1 uppercase tracking-widest rounded-bl-lg">
              PRO ACCESS
            </div>

            <div className="text-center mt-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mb-4 animate-bounce">
                <Zap className="h-7 w-7" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">Upgrade to Premium</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                You've hit your free limit of <strong>5 generations per day</strong>. Upgrade now to unlock unlimited summaries, deep dives, and faster generation.
              </p>

              <div className="space-y-3 text-left bg-slate-950/40 p-4 rounded-xl border border-slate-800 mb-6 text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Unlimited daily generations</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Priority access to Gemini 1.5 Pro</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Detailed structural explainers</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowPremiumModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-800 hover:bg-slate-800 font-semibold text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <a
                  href="#upgrade"
                  onClick={() => alert("Premium subscription mockup! Checkout logic goes here.")}
                  className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white shadow-lg shadow-indigo-600/30 transition-colors text-center"
                >
                  Get Pro for $9/mo
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main layout: Grid of workspace and history */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 cols: Workspace (Input + Output) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header block with statistics / action */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <Brain className="h-6 w-6 text-indigo-400" />
                Text Summarizer & Explainer
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Pasted text is processed using real-time Gemini AI generation.
              </p>
            </div>
            
            {/* Mobile History trigger */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-sm font-semibold hover:bg-slate-800 text-slate-300"
            >
              <History className="h-4 w-4 text-indigo-400" />
              <span>History ({history.length})</span>
            </button>
          </div>

          {/* Form workspace card */}
          <form onSubmit={handleGenerate} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-xl space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="prompt" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Source Document / Text
                </label>
                <label className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-[11px] font-semibold text-slate-300 cursor-pointer border border-slate-750 transition-colors ${
                  isParsingPdf ? "opacity-55 cursor-not-allowed" : ""
                }`}>
                  {isParsingPdf ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border border-indigo-400 border-t-transparent"></div>
                  ) : (
                    <Upload className="h-3.5 w-3.5 text-indigo-400" />
                  )}
                  <span>{isParsingPdf ? "Parsing..." : "Upload (.txt, .md, .pdf)"}</span>
                  <input 
                    type="file" 
                    accept=".txt,.md,.pdf" 
                    onChange={handleFileUpload} 
                    disabled={isParsingPdf}
                    className="hidden" 
                  />
                </label>
              </div>
              <textarea
                id="prompt"
                rows={7}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste text, or upload a .txt / .md / .pdf file above..."
                className="w-full rounded-xl bg-slate-950/80 border border-slate-800 p-4 text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all resize-y text-sm leading-relaxed"
              />
              <div className="flex justify-between items-center text-xs text-slate-500 mt-2">
                <span>{inputText.length.toLocaleString()} characters {inputText.length > 40000 && <span className="text-amber-400 ml-1">(large document)</span>}</span>
                <span>{inputText.trim() ? inputText.trim().split(/\s+/).length.toLocaleString() : 0} words</span>
              </div>
            </div>

            {/* Custom generation settings selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Explain Mode
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setOption("summary")}
                    className={`py-2.5 px-3 rounded-lg border text-left transition-all ${
                      option === "summary"
                        ? "bg-indigo-600/10 border-indigo-500 text-indigo-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      Summary
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setOption("bullet")}
                    className={`py-2.5 px-3 rounded-lg border text-left transition-all ${
                      option === "bullet"
                        ? "bg-indigo-600/10 border-indigo-500 text-indigo-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5" />
                      Key Points
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOption("explain_like_5")}
                    className={`py-2.5 px-3 rounded-lg border text-left transition-all ${
                      option === "explain_like_5"
                        ? "bg-indigo-600/10 border-indigo-500 text-indigo-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <HelpCircle className="h-3.5 w-3.5" />
                      ELI5 Simple
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOption("deep_dive")}
                    className={`py-2.5 px-3 rounded-lg border text-left transition-all ${
                      option === "deep_dive"
                        ? "bg-indigo-600/10 border-indigo-500 text-indigo-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5" />
                      Deep Dive
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Output Length
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs font-medium">
                  {["short", "medium", "long"].map((len) => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => setLength(len)}
                      className={`py-2.5 px-2 rounded-lg border capitalize text-center transition-all ${
                        length === len
                          ? "bg-indigo-600/10 border-indigo-500 text-indigo-300"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      {len}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-3.5 leading-snug">
                  Note: Custom Explainer mode structures the prompts to Gemini accordingly.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Streaming Analysis...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate AI summary</span>
                </>
              )}
            </button>
          </form>

          {/* Error banner – shown whenever useCompletion reports an error */}
          {error && !isLoading && (
            <div className="rounded-xl border border-red-500/40 bg-red-950/20 px-5 py-4 flex items-start gap-3 animate-fade-in">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-400">Generation failed</p>
                <p className="text-xs text-red-300/70 mt-1 leading-relaxed break-words">
                  {error.message || 'An unknown error occurred. Check the browser console and server terminal for details.'}
                </p>
              </div>
              <button
                onClick={() => setCompletion('')}
                className="ml-2 text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
                title="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Streaming Output workspace panel */}
          {(currentResultText || isLoading) && (
            <div className="rounded-2xl border border-slate-850 bg-slate-900/20 backdrop-blur-xl overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/40">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></div>
                  {selectedHistoryItem ? (
                    <span className="text-slate-400">Viewing from history</span>
                  ) : (
                    <span>AI Generated Output</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyToClipboard(currentResultText)}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="p-6 prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed font-sans">
                {currentResultText ? (
                  <MarkdownRenderer text={currentResultText} />
                ) : (
                  <span className="text-slate-500 italic">Initializing stream from Gemini models...</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 col: Desktop History sidebar panel */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-xl space-y-4 sticky top-24 max-h-[calc(100vh-8rem)] flex flex-col">
            <h2 className="text-base font-bold text-white flex items-center gap-2 pb-3 border-b border-slate-800">
              <History className="h-5 w-5 text-indigo-400" />
              <span>Generation History</span>
              <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full ml-auto font-normal">
                {history.length}
              </span>
            </h2>

            {isHistoryLoading ? (
              <div className="space-y-4 py-8 text-center text-slate-500 text-sm">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mx-auto"></div>
                <p>Loading your logs...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                <p className="italic">No history records yet.</p>
                <p className="text-xs text-slate-600 mt-2">Summarized requests appear here.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-1 custom-scrollbar">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedHistoryItem(item);
                      // Fill in standard inputs to match selection
                      setInputText(item.prompt.replace(/\.\.\.$/, ""));
                    }}
                    className={`group p-3 rounded-xl border text-left cursor-pointer transition-all hover:bg-slate-800/40 ${
                      selectedHistoryItem?.id === item.id
                        ? "bg-slate-800 border-indigo-500 text-white"
                        : "bg-slate-950 border-slate-850 text-slate-400"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-xs font-semibold text-slate-200 line-clamp-2 leading-relaxed">
                        {item.prompt}
                      </p>
                      
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyToClipboard(item.response, true, item.id);
                          }}
                          className="p-1 rounded bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white"
                          title="Copy response"
                        >
                          {copiedHistoryId === item.id ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                        <button
                          onClick={(e) => handleDeleteHistory(item.id, e)}
                          className="p-1 rounded bg-slate-900 border border-slate-850 hover:bg-red-950 text-slate-400 hover:text-red-400"
                          title="Delete summary log"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2 block">
                      {new Date(item.created_at).toLocaleDateString()} at{" "}
                      {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Slide-out mobile drawer overlay for history list */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsHistoryOpen(false)}></div>
          <div className="relative w-full max-w-sm bg-slate-900 border-l border-slate-800 h-full p-6 flex flex-col justify-between shadow-2xl animate-slide-in">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <History className="h-5 w-5 text-indigo-400" />
                  <span>Generation History</span>
                </h3>
                <button 
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-850 text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {isHistoryLoading ? (
                <div className="py-8 text-center text-slate-500 text-sm">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent mx-auto mb-2"></div>
                  <p>Loading history...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm">
                  <p className="italic">No history records yet.</p>
                </div>
              ) : (
                <div className="space-y-2.5 overflow-y-auto max-h-[calc(100vh-8rem)] pr-1">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedHistoryItem(item);
                        setInputText(item.prompt.replace(/\.\.\.$/, ""));
                        setIsHistoryOpen(false); // Close sidebar drawer
                      }}
                      className={`group p-3 rounded-xl border text-left cursor-pointer transition-all hover:bg-slate-850 ${
                        selectedHistoryItem?.id === item.id
                          ? "bg-slate-800 border-indigo-500 text-white"
                          : "bg-slate-950 border-slate-850 text-slate-400"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <p className="text-xs font-semibold text-slate-200 line-clamp-2 leading-relaxed">
                          {item.prompt}
                        </p>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyToClipboard(item.response, true, item.id);
                            }}
                            className="p-1 rounded bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white"
                          >
                            {copiedHistoryId === item.id ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                          <button
                            onClick={(e) => handleDeleteHistory(item.id, e)}
                            className="p-1 rounded bg-slate-900 border border-slate-850 hover:bg-red-950 text-slate-400 hover:text-red-400"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-2 block">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
