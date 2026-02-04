
import React, { useState, useRef } from 'react';
import { Layout } from './components/Layout';
import { MediaPreview } from './components/MediaPreview';
import { AssistantSidebar } from './components/AssistantSidebar';
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

  const audioContextRef = useRef<AudioContext | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImage = file.type.startsWith('image/');
      const isAudio = file.type.startsWith('audio/');
      
      if (!isImage && !isAudio) {
        setError("Only image and audio files are supported for multimodal localization.");
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
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const runLocalization = async () => {
    if (!text && !media) {
      setError("Please provide some text or media to localize.");
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);
    setLoadingMessage('Gemini 3: Analyzing multimodal context...');

    try {
      const service = new GeminiService();
      
      const localization = await service.localizeContent(text, language, media);
      
      setLoadingMessage('Gemini 3: Adapting visual identity...');
      let localizedImage = '';
      try {
        localizedImage = await service.generateLocalizedImage(
          localization.suggestedVisualChanges, 
          media?.type === 'image' ? media.content : undefined
        );
      } catch (e) { console.error("Image gen failed", e); }

      setLoadingMessage('Gemini 3: Synthesizing natural voiceover...');
      
      try {
        // We ensure context is created if it doesn't exist for subsequent calls
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        await service.generateAndPlayTTS(localization.translatedText, language, audioContextRef.current);
      } catch (e) { 
        console.error("TTS generation or playback failed", e); 
      }

      setResult({
        ...localization,
        localizedImageUrl: localizedImage || undefined,
        localizedAudioUrl: 'READY'
      });

    } catch (err: any) {
      setError(err.message || "Something went wrong during localization.");
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const playAudioManual = async () => {
    if (result && result.translatedText) {
      const service = new GeminiService();
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      await service.generateAndPlayTTS(result.translatedText, language, audioContextRef.current);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-160px)]">
        
        {/* Main Workspace */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Input Side */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Project Assets
              </h2>
              <div className="space-y-4">
                <textarea 
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste your original ad copy or campaign text here..."
                  className="w-full h-24 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition"
                />
                
                <div className="flex gap-4">
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as TargetLanguage)}
                    className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                  >
                    {Object.entries(TargetLanguage).map(([key, val]) => (
                      <option key={key} value={val}>{val}</option>
                    ))}
                  </select>
                </div>

                <div className="relative border-2 border-dashed border-gray-200 rounded-xl overflow-hidden min-h-[140px] flex items-center justify-center hover:bg-gray-50 transition cursor-pointer">
                  {!media ? (
                    <>
                      <input type="file" accept="image/*,audio/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                      <div className="text-center p-4">
                        <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        <p className="text-xs text-gray-500 font-medium">Upload Image or Audio Reference</p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">Gemini 3 Multimodal Input</p>
                      </div>
                    </>
                  ) : (
                    <MediaPreview media={media} onRemove={() => setMedia(undefined)} />
                  )}
                </div>

                <button 
                  onClick={runLocalization}
                  disabled={loading}
                  className={`w-full py-3.5 rounded-xl font-bold text-white transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
                    loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100'
                  }`}
                >
                  {loading ? 'Processing Multimodal Pipeline...' : 'Transform Campaign'}
                </button>
              </div>
            </div>

            {/* Results Header/Summary */}
            <div className="space-y-6">
              {result ? (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 animate-in fade-in duration-500">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900">Localization Strategy</h3>
                    <div className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">
                      Score: {Math.round(result.qualityScore * 100)}%
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="text-sm p-3 bg-gray-50 rounded-lg italic text-gray-600 border-l-4 border-indigo-400">
                      {result.brandVoiceCheck}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {result.culturalNotes.slice(0, 3).map((n, i) => (
                        <span key={i} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md font-medium">{n}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-100/50 border-2 border-dashed border-gray-200 rounded-2xl h-48 flex items-center justify-center text-gray-400 text-sm italic">
                  Results will appear after processing...
                </div>
              )}

              {/* Cultural Scanner Flags */}
              {result && result.culturalFlags.length > 0 && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-50">
                  <h3 className="text-sm font-bold text-red-600 mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    Cultural Appropriateness Flags
                  </h3>
                  <div className="space-y-3">
                    {result.culturalFlags.map((flag, i) => (
                      <div key={i} className="p-3 bg-red-50 rounded-xl border border-red-100">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-red-700">{flag.issue}</span>
                          <span className={`text-[10px] uppercase font-bold px-1.5 rounded ${
                            flag.severity === 'high' ? 'bg-red-200 text-red-800' : 'bg-orange-200 text-orange-800'
                          }`}>{flag.severity}</span>
                        </div>
                        <p className="text-[11px] text-red-600 italic">" {flag.suggestion} "</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Multimodal Output Grid */}
          {result && (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-8 duration-700">
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Visual Output */}
                <div className="p-8 bg-slate-900 text-white flex flex-col">
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">Adapted Visual Asset</h3>
                  <div className="flex-1 aspect-video bg-slate-800 rounded-2xl overflow-hidden relative group">
                    {result.localizedImageUrl ? (
                      <img src={result.localizedImageUrl} className="w-full h-full object-cover transition duration-500 group-hover:scale-105" alt="Localized" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-500 animate-pulse italic">Rendering...</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-4">
                      <p className="text-xs text-indigo-200">AI-suggested: {result.suggestedVisualChanges}</p>
                    </div>
                  </div>
                </div>
                
                {/* Text/Audio Output */}
                <div className="p-8 space-y-8">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Localized Slogan & Copy</h3>
                    <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 relative">
                      <p className="text-3xl font-black text-indigo-900 leading-tight">
                        {result.translatedText}
                      </p>
                      <div className="absolute -top-3 -left-3 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-indigo-200">
                        {language[0]}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Multimodal Audio Bridge</h3>
                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
                      <div 
                        onClick={playAudioManual}
                        className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer hover:bg-indigo-700 transition active:scale-90"
                      >
                        <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs font-bold text-gray-700 uppercase">Localized Voiceover</span>
                          <span className="text-[10px] text-indigo-500 font-bold">24kHz PCM</span>
                        </div>
                        <div className="h-1.5 w-full bg-indigo-100 rounded-full overflow-hidden">
                          <div className="h-full w-2/3 bg-indigo-500 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Gemini Assistant Sidebar */}
        <div className="w-full lg:w-80 h-full">
           <AssistantSidebar context={result} />
        </div>

      </div>
    </Layout>
  );
};

export default App;
