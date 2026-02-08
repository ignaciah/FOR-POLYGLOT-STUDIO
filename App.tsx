
import React, { useState, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import { Sparkles } from 'lucide-react';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import { MediaPreview } from './components/MediaPreview';
import { AssistantSidebar } from './components/AssistantSidebar';
import TextEditor from './components/Editor/TextEditor';
import ImageProcessor from './components/Editor/ImageProcessor';
import { TargetLanguage, ProjectMedia, LocalizationResult } from './types';
import { GeminiService } from './services/geminiService';

const App: React.FC = () => {
  const [text, setText] = useState('');
  const [language, setLanguage] = useState<TargetLanguage>(TargetLanguage.JAPANESE);
  const [media, setMedia] = useState<ProjectMedia | undefined>();
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [result, setResult] = useState<LocalizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImage = file.type.startsWith('image/');
      const isAudio = file.type.startsWith('audio/');
      
      if (!isImage && !isAudio) {
        toast.error("Unsupported file format. Please upload an image or audio file.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setMedia({
          id: Math.random().toString(36).substr(2, 9),
          type: isImage ? 'image' : 'audio',
          content,
          mimeType: file.type,
          fileName: file.name
        });
        toast.success(`${isImage ? 'Visual' : 'Audio'} context added!`);
      };
      reader.readAsDataURL(file);
    }
  };

  const runLocalization = async () => {
    if (!text) {
      toast.error("Please enter some campaign text to localize.");
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);
    setLoadingMessage('Gemini 3 Pro: Analyzing Context...');

    try {
      const service = new GeminiService();
      const localization = await service.localizeContent(text, language, media);
      
      setLoadingMessage('Gemini 2.5: Adapting Visuals...');
      let localizedImage = '';
      try {
        localizedImage = await service.generateLocalizedImage(
          localization.suggestedVisualChanges || "Adapted version of current visual", 
          media?.type === 'image' ? media.content : undefined
        );
      } catch (e) { console.error("Visual adaptation failed:", e); }

      setLoadingMessage('Gemini 2.5 TTS: Synthesizing Audio...');
      try {
        if (localization.translatedText) {
          if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          }
          await service.generateAndPlayTTS(localization.translatedText, language, audioContextRef.current);
        }
      } catch (e) { console.error("Audio synthesis failed:", e); }

      setResult({
        ...localization,
        localizedImageUrl: localizedImage || undefined,
        localizedAudioUrl: 'READY'
      });
      
      toast.success("Localization completed successfully!");

    } catch (err: any) {
      setError(err.message || "Failed to process localization.");
      toast.error("Localization failed. Check cultural safety flags.");
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const playLocalizedAudio = async () => {
    if (result?.translatedText) {
      const service = new GeminiService();
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      await service.generateAndPlayTTS(result.translatedText, language, audioContextRef.current);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto scrollbar-hide">
          <Toaster position="top-right" richColors />
          
          {/* Main Content Area */}
          <div className="max-w-6xl mx-auto">
            <div className="mb-10">
              <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
                PolyGlot Studio
              </h1>
              <p className="text-gray-600 font-medium">
                Transform your content across languages and cultures with AI-powered multimodal precision.
              </p>
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*,audio/*" 
            />
            
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 pb-20">
              {/* Multimodal Editor Stage */}
              <div className="xl:col-span-8 space-y-8">
                <TextEditor 
                  text={text}
                  setText={setText}
                  targetLang={language}
                  setTargetLang={setLanguage}
                  isTranslating={loading}
                  onTranslate={runLocalization}
                  onAddMedia={triggerFileUpload}
                  translationPreview={result?.translatedText}
                  hasMedia={!!media}
                />
                
                {/* Visual Analysis Engine */}
                <ImageProcessor />
                
                {/* Active Media Context Preview */}
                {media && (
                  <div className="animate-in slide-in-from-top-4 duration-500">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Active Context</h3>
                    <div className="max-w-md">
                      <MediaPreview media={media} onRemove={() => setMedia(undefined)} />
                    </div>
                  </div>
                )}

                {/* Localized Output Stage */}
                {result && (
                  <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-12 duration-1000 mt-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 min-h-[450px]">
                      {/* Visual Section */}
                      <div className="p-10 bg-slate-900 text-white flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                          <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">Visual Synthesis</h3>
                        </div>
                        <div className="flex-1 rounded-[2rem] overflow-hidden relative group bg-slate-800 shadow-2xl">
                          {result.localizedImageUrl ? (
                            <img src={result.localizedImageUrl} className="w-full h-full object-cover transition duration-[2.5s] group-hover:scale-105" alt="Localized" />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-600">
                              <div className="w-10 h-10 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
                              <p className="text-[9px] font-black uppercase tracking-widest italic">Mutation in Progress...</p>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex flex-col justify-end p-10">
                            <h4 className="text-[10px] text-indigo-400 font-black uppercase mb-3 tracking-widest">Visual Rationale</h4>
                            <p className="text-xs text-white/90 font-medium leading-relaxed">{result.suggestedVisualChanges}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Sonic Branding Section */}
                      <div className="p-10 space-y-12 bg-white flex flex-col justify-center border-l border-gray-100">
                        <div>
                          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8">Sonic Brand Bridge</h3>
                          <div 
                            onClick={playLocalizedAudio}
                            className="p-8 bg-slate-50 hover:bg-slate-100 rounded-[2.5rem] border border-slate-200 flex items-center gap-8 cursor-pointer transition-all active:scale-95 group shadow-sm"
                          >
                            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-indigo-100 group-hover:scale-105 transition-transform">
                              <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Native Synthesis</span>
                                <span className="text-[9px] bg-white px-2 py-0.5 rounded-full text-indigo-600 font-bold border border-indigo-100 shadow-sm uppercase tracking-tighter">Gemini 2.5</span>
                              </div>
                              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full w-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse origin-left transition-all"></div>
                              </div>
                              <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-tighter">Click for Playback</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Cultural Intelligence Sidebar */}
              <div className="xl:col-span-4 space-y-8">
                {result ? (
                  <>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 animate-in fade-in slide-in-from-right-4 duration-500">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-black text-[11px] text-slate-800 flex items-center gap-2 uppercase tracking-widest">
                          <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                          Cultural Intelligence
                        </h3>
                        <div className="text-[9px] font-black bg-indigo-600 text-white px-2 py-1 rounded shadow-md">ADAPTATION: {Math.round(result.qualityScore * 100)}%</div>
                      </div>
                      <div className="space-y-4">
                        {result.brandVoiceCheck && (
                          <div className="p-4 bg-indigo-50/30 rounded-2xl border-l-4 border-indigo-600 text-xs italic text-slate-700 leading-relaxed">
                            <span className="font-black text-indigo-700 block mb-1 uppercase text-[9px] tracking-widest">Brand Voice Verdict</span>
                            "{result.brandVoiceCheck}"
                          </div>
                        )}
                        <div className="space-y-3">
                          {result.culturalNotes?.map((note, i) => (
                            <div key={i} className="flex gap-3 text-[11px] text-slate-600 leading-normal font-medium">
                              <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1 shrink-0"></div>
                              {note}
                            </div>
                          )) || <p className="text-xs text-slate-400 italic">No cultural notes available.</p>}
                        </div>
                      </div>
                    </div>

                    {(result.culturalFlags?.length ?? 0) > 0 && (
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-50">
                        <h3 className="text-[10px] font-black text-red-600 mb-5 uppercase tracking-[0.3em] flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                          Safety Warnings
                        </h3>
                        <div className="space-y-4">
                          {result.culturalFlags?.map((flag, i) => (
                            <div key={i} className={`p-4 rounded-2xl border-l-4 transition-all hover:translate-x-1 ${flag.severity === 'high' ? 'bg-red-50 border-red-500' : 'bg-orange-50 border-orange-400'}`}>
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">{flag.issue}</span>
                                <span className={`text-[7px] font-black px-1.5 py-0.5 rounded shadow-sm ${flag.severity === 'high' ? 'bg-red-200 text-red-800' : 'bg-orange-200 text-orange-800'}`}>
                                  {flag.severity.toUpperCase()}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-600 font-semibold leading-relaxed">Fix: {flag.suggestion}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-white/50 border-2 border-dashed border-gray-200 rounded-3xl h-64 flex flex-col items-center justify-center p-8 text-center">
                     <div className="w-16 h-16 bg-white rounded-full shadow-inner flex items-center justify-center mb-4 text-slate-300">
                       <Sparkles size={24} />
                     </div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ready for Analysis</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        
        {/* Assistant / Chat Sidebar */}
        <div className="w-[350px] shrink-0 hidden xl:block">
           <AssistantSidebar context={result} />
        </div>
      </div>
    </div>
  );
};

export default App;
