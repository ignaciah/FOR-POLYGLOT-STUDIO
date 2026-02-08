
import React, { useState, useCallback } from 'react';
import { Upload, Eye, X, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { GeminiService } from '../../services/geminiService';

interface AnalysisResult {
  mainThemes?: string[];
  culturalReferences?: Array<{ reference: string; detectionReason: string }>;
  toneAnalysis?: string;
  suggestedAdaptations?: Array<{ culture: string; advice: string }>;
  error?: string;
}

export default function ImageProcessor() {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type. Please upload an image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image is too large. Max size is 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      setAnalysis(null); // Clear previous analysis when new image is uploaded
    };
    reader.readAsDataURL(file);
  }, []);

  const analyzeImage = async () => {
    if (!image) return;

    setIsAnalyzing(true);
    try {
      const service = new GeminiService();
      const result = await service.analyzeMultimodal([{ type: 'image', content: image }]);
      
      if (result.error) {
        toast.error(result.error);
        setAnalysis(null);
      } else {
        setAnalysis(result);
        toast.success('Visual intelligence processing complete!');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to analyze image context.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-indigo-50 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-100/50">
      <div className="bg-slate-50/80 backdrop-blur-sm border-b border-gray-100 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Eye size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Visual Context Engine</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Gemini 3 Multimodal Analysis</p>
          </div>
        </div>
        
        <button
          onClick={analyzeImage}
          disabled={!image || isAnalyzing}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-700 transition-all active:scale-95 shadow-md shadow-indigo-100"
        >
          {isAnalyzing ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <Sparkles size={14} />
          )}
          <span>{isAnalyzing ? 'Decoding...' : 'Analyze Scene'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Upload Area */}
        <div className="p-8 border-b lg:border-b-0 lg:border-r border-gray-100">
          <label className="block mb-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Source Visual Asset</label>
          <div 
            className={`relative border-2 border-dashed rounded-3xl p-4 transition-all duration-300 min-h-[320px] flex items-center justify-center ${
              image ? 'border-indigo-200 bg-slate-50/30' : 'border-gray-200 hover:border-indigo-300 bg-gray-50/50'
            }`}
          >
            {image ? (
              <div className="relative w-full h-full group">
                <img 
                  src={image} 
                  alt="Asset Preview" 
                  className="w-full h-64 object-contain rounded-2xl transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <button
                  onClick={() => setImage(null)}
                  className="absolute -top-2 -right-2 bg-white text-slate-400 hover:text-red-500 p-2 rounded-full shadow-xl border border-gray-100 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-inner flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <Upload size={28} />
                </div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Drop campaign visual here</p>
                <p className="text-xs text-slate-400 mb-6 font-medium">PNG, JPG or WEBP up to 5MB</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-processor-upload"
                />
                <label
                  htmlFor="image-processor-upload"
                  className="inline-block bg-white border border-gray-200 text-indigo-600 px-6 py-3 rounded-2xl cursor-pointer text-xs font-black uppercase tracking-widest hover:border-indigo-200 hover:shadow-lg transition-all active:scale-95 shadow-sm"
                >
                  Browse Files
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Analysis Results */}
        <div className="p-8 bg-slate-50/30">
          <label className="block mb-4 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Scene Intelligence</label>
          <div className="rounded-3xl h-[320px] overflow-auto scrollbar-hide pr-2">
            {analysis ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700">
                {/* Themes */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-slate-800 uppercase flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-green-500" />
                    Core Themes
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.mainThemes?.map((theme, i) => (
                      <span key={i} className="text-[9px] bg-white border border-indigo-100 text-indigo-600 px-3 py-1 rounded-lg font-bold shadow-sm">
                        {theme}
                      </span>
                    )) || <span className="text-[10px] text-slate-400 italic">No themes identified</span>}
                  </div>
                </div>

                {/* Cultural refs */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-800 uppercase flex items-center gap-2">
                    <AlertCircle size={12} className="text-amber-500" />
                    Cultural Markers
                  </h4>
                  <div className="space-y-2">
                    {analysis.culturalReferences?.map((ref, i) => (
                      <div key={i} className="p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                        <p className="text-[11px] font-black text-slate-800 mb-1 uppercase tracking-tight">{ref.reference}</p>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{ref.detectionReason}</p>
                      </div>
                    )) || <p className="text-[10px] text-slate-400 italic">No specific cultural markers detected</p>}
                  </div>
                </div>

                {/* Tone */}
                {analysis.toneAnalysis && (
                  <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                    <h4 className="text-[9px] font-black text-indigo-200 uppercase mb-2 tracking-widest">Visual Tone Analysis</h4>
                    <p className="text-xs leading-relaxed font-medium italic opacity-90">"{analysis.toneAnalysis}"</p>
                  </div>
                )}

                {/* Adaptations */}
                <div className="space-y-3 pb-4">
                   <h4 className="text-[10px] font-black text-slate-800 uppercase">Localization Guidance</h4>
                   {analysis.suggestedAdaptations?.map((item, i) => (
                     <div key={i} className="flex gap-4 items-start p-3 bg-white rounded-xl border-l-4 border-indigo-500 shadow-sm transition-transform hover:translate-x-1">
                        <div className="text-[9px] font-black text-indigo-600 uppercase w-16 shrink-0 pt-1 tracking-tighter">{item.culture}</div>
                        <p className="text-[10px] text-slate-600 font-medium leading-relaxed">{item.advice}</p>
                     </div>
                   )) || <p className="text-[10px] text-slate-400 italic">No adaptation advice available</p>}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                {isAnalyzing ? (
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600/50" size={16} />
                    </div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">Running Multimodal OCR & Analysis...</p>
                  </div>
                ) : (
                  <div className="text-center space-y-2 opacity-30">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Eye size={24} className="text-gray-400" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awaiting Visual Input</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
