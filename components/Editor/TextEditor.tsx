
import React from 'react';
import { Send, Globe, Image as ImageIcon, Sparkles } from 'lucide-react';
import { TargetLanguage } from '../../types';

interface TextEditorProps {
  text: string;
  setText: (text: string) => void;
  targetLang: TargetLanguage;
  setTargetLang: (lang: TargetLanguage) => void;
  isTranslating: boolean;
  onTranslate: () => void;
  onAddMedia: () => void;
  translationPreview?: string;
  hasMedia: boolean;
}

export default function TextEditor({
  text,
  setText,
  targetLang,
  setTargetLang,
  isTranslating,
  onTranslate,
  onAddMedia,
  translationPreview,
  hasMedia
}: TextEditorProps) {
  return (
    <div className="w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className="bg-slate-50 border-b border-gray-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Sparkles size={18} />
          </div>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Multimodal Editor</h2>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value as TargetLanguage)}
            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
          >
            {Object.entries(TargetLanguage).map(([key, val]) => (
              <option key={key} value={val}>{val}</option>
            ))}
          </select>
          
          <button 
            onClick={onAddMedia}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              hasMedia 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-white text-indigo-600 border border-gray-200 hover:border-indigo-300'
            }`}
          >
            {hasMedia ? <ImageIcon size={14} /> : <Globe size={14} />}
            <span>{hasMedia ? 'Asset Linked' : 'Add Context'}</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Source Editor */}
        <div className="p-6 border-b lg:border-b-0 lg:border-r border-gray-100">
          <label className="block mb-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Source Campaign Text</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-64 bg-transparent resize-none text-slate-800 text-sm font-medium leading-relaxed outline-none placeholder:text-gray-300"
            placeholder="Type or paste your original campaign copy, slogan, or descriptive content here..."
          />
        </div>
        
        {/* Translation Preview */}
        <div className="p-6 bg-slate-50/50">
          <label className="block mb-3 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Real-time Strategy Preview</label>
          <div className="w-full h-64 flex flex-col justify-center">
            {isTranslating ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-indigo-400">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest">Engine Localizing...</p>
              </div>
            ) : translationPreview ? (
              <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                <p className="text-2xl font-black text-indigo-950 leading-tight">
                  {translationPreview}
                </p>
                <div className="mt-4 flex gap-2">
                  <span className="text-[9px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded font-bold uppercase tracking-tighter">AI Optimized</span>
                  <span className="text-[9px] bg-white text-slate-400 px-2 py-0.5 rounded border border-gray-100 font-bold uppercase tracking-tighter">Gemini 3 Pro</span>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xs text-gray-400 font-medium italic">Translation and cultural nuances will appear here once processed.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="px-6 py-6 bg-white border-t border-gray-50 flex justify-end">
        <button
          onClick={onTranslate}
          disabled={!text || isTranslating}
          className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-black text-sm hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xl shadow-indigo-100 active:scale-95"
        >
          <Send size={18} />
          <span>{isTranslating ? 'LOCALIZING...' : 'TRANSLATE & ADAPT'}</span>
        </button>
      </div>
    </div>
  );
}
