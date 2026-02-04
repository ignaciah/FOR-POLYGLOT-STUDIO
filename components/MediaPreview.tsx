
import React from 'react';
import { ProjectMedia } from '../types';

interface Props {
  media?: ProjectMedia;
  onRemove: () => void;
}

export const MediaPreview: React.FC<Props> = ({ media, onRemove }) => {
  if (!media) return null;

  return (
    <div className="relative group bg-gray-100 rounded-xl overflow-hidden aspect-video flex items-center justify-center border-2 border-dashed border-gray-200 w-full h-full">
      {media.type === 'image' && (
        <img src={media.content} alt="Preview" className="w-full h-full object-contain" />
      )}
      
      {media.type === 'audio' && (
        <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-slate-800 to-indigo-900 p-6 text-white">
          {/* Simulated Waveform Visualization */}
          <div className="flex items-end justify-center gap-1 h-12 mb-4">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className="w-1.5 bg-indigo-400 rounded-full animate-pulse"
                style={{ 
                  height: `${Math.random() * 100 + 20}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '0.8s'
                }}
              ></div>
            ))}
          </div>
          
          <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg">
              <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 20 20">
                <path d="M6 4l10 6-10 6V4z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold truncate max-w-[120px]">
                {media.fileName || 'Audio Campaign Jingle'}
              </span>
              <span className="text-[10px] text-indigo-300 font-medium uppercase tracking-wider">
                {media.mimeType?.split('/')[1] || 'AUDIO'}
              </span>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-xl z-10 scale-90 group-hover:scale-100"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};
