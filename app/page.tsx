"use client";

import { useState } from "react";
import { generateTranslation } from "./actions";
import { Languages, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function PolyglotPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTranslate = async () => {
    if (!input.trim()) return toast.error("Please enter some text!");

    setIsLoading(true);
    // Specific instruction for the AI
    const prompt = `Translate the following text into professional Spanish, French, and German. Format it clearly:\n\n${input}`;
    
    const result = await generateTranslation(prompt);

    if (result.success) {
      setOutput(result.data as string);
      toast.success("Translation complete!");
    } else {
      toast.error("Something went wrong.");
    }
    setIsLoading(false);
  };

  return (
    <main className="max-w-4xl mx-auto p-8 space-y-6">
      <div className="flex items-center gap-2 mb-8">
        <Languages className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold">Polyglot Studio</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea
          className="w-full h-64 p-4 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Enter text to translate..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <div className="w-full h-64 p-4 border rounded-xl bg-white overflow-auto whitespace-pre-wrap">
          {output || <span className="text-slate-400">Translations will appear here...</span>}
        </div>
      </div>

      <button
        onClick={handleTranslate}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
      >
        {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
        {isLoading ? "Processing..." : "Translate Everything"}
      </button>
    </main>
  );
}
