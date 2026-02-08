"use client";

import { useState } from "react";
import { Languages, Loader2, Sparkles, Copy, Check, Globe } from "lucide-react";
import { toast } from "sonner";

const SUPPORTED_LANGUAGES = [
  { label: "Spanish", value: "Spanish" },
  { label: "French", value: "French" },
  { label: "German", value: "German" },
  { label: "Japanese", value: "Japanese" },
  { label: "Chinese", value: "Chinese" },
  { label: "Arabic", value: "Arabic" },
];

export default function PolyglotPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedLangs, setSelectedLangs] = useState<string[]>(["Spanish"]);

  const toggleLanguage = (lang: string) => {
    setSelectedLangs(prev => 
      prev.includes(lang) ? prev.filter(l => l !== lang) : [...prev, lang]
    );
  };

  const handleTranslate = async () => {
    if (!input.trim()) return toast.error("Please enter text!");
    if (selectedLangs.length === 0) return toast.error("Select at least one language!");

    setIsLoading(true);
    setOutput("");
    
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        body: JSON.stringify({ 
          prompt: `Translate the following text into these languages: ${selectedLangs.join(", ")}. 
          Use clear markdown headers (e.g., ## Spanish) for each section.
          Text: ${input}` 
        }),
      });

      if (!response.ok) throw new Error("Stream failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setOutput((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (error) {
      toast.error("Error streaming content.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="max-w-5xl mx-auto p-6 md:p-12 space-y-8">
      <header className="flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg"><Languages className="w-6 h-6 text-white" /></div>
        <h1 className="text-3xl font-extrabold text-slate-900">Polyglot Studio</h1>
      </header>

      {/* Language Selector */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-slate-500">
          <Globe size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">Target Languages</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              onClick={() => toggleLanguage(lang.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                selectedLangs.includes(lang.value)
                  ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
                  : "bg-white border-slate-200 text-slate-600 hover:border-blue-300"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <textarea
          className="w-full h-80 p-5 border-2 border-slate-100 rounded-2xl bg-slate-50 focus:bg-white focus:border-blue-500 outline-none transition-all resize-none text-slate-700"
          placeholder="Enter text..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <div className="flex flex-col gap-2">
          <div className="flex justify-end">
            {output && (
              <button onClick={copyToClipboard} className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-blue-600 p-1">
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                {copied ? "Copied!" : "Copy Results"}
              </button>
            )}
          </div>
          <div className={`w-full h-80 p-5 border-2 rounded-2xl bg-white overflow-auto whitespace-pre-wrap text-slate-800 ${isLoading ? 'border-blue-200 ring-4 ring-blue-50' : 'border-slate-100'}`}>
            {output || <span className="text-slate-300 italic">Select languages and click translate...</span>}
          </div>
        </div>
      </div>

      <button
        onClick={handleTranslate}
        disabled={isLoading || selectedLangs.length === 0}
        className="w-full py-5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 transition-all font-bold text-lg flex justify-center items-center gap-2 shadow-xl shadow-blue-100"
      >
        {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
        {isLoading ? "Generating..." : `Translate to ${selectedLangs.length} Language${selectedLangs.length === 1 ? '' : 's'}`}
      </button>
    </main>
  );
}
