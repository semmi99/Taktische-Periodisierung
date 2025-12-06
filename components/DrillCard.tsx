
import React, { useState } from 'react';
import { Drill } from '../types';
import { Users, Move, Clock, Lightbulb, Target, Image as ImageIcon, Loader2 } from 'lucide-react';

interface DrillCardProps {
  drill: Drill;
  index: number;
  onGenerateImage: () => Promise<void>;
}

export const DrillCard: React.FC<DrillCardProps> = ({ drill, index, onGenerateImage }) => {
  const [isImageLoading, setIsImageLoading] = useState(false);

  const handleImageClick = async () => {
    if (drill.imageUrl) return;
    setIsImageLoading(true);
    try {
        await onGenerateImage();
    } finally {
        setIsImageLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 border-l-4 border-emerald-500 rounded-r-lg p-5 shadow-lg mb-4 hover:bg-slate-750 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded">
            {index + 1}
          </span>
          {drill.name}
        </h4>
        <div className="flex items-center gap-1 text-slate-400 text-sm">
           <Clock className="w-4 h-4" />
           {drill.duration}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4 text-sm text-slate-300">
        <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded">
          <Move className="w-4 h-4 text-emerald-400" />
          <span>{drill.space}</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1.5 rounded">
          <Users className="w-4 h-4 text-emerald-400" />
          <span>{drill.players}</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
            <p className="text-slate-300 mb-4 text-sm leading-relaxed border-b border-slate-700 pb-4">
                {drill.description}
            </p>

            <div className="grid grid-cols-1 gap-4">
                <div>
                <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-3 h-3" /> Coaching-Punkte
                </h5>
                <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                    {drill.coachingPoints.map((point, idx) => (
                    <li key={idx} className="marker:text-emerald-500">{point}</li>
                    ))}
                </ul>
                </div>
                <div>
                <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                    <Target className="w-3 h-3" /> Spielprinzip / Bezug
                </h5>
                <p className="text-sm text-slate-400 italic bg-slate-900/30 p-2 rounded border border-slate-700/50">
                    "{drill.linkToPhilosophy}"
                </p>
                </div>
            </div>
        </div>
        
        {/* Image Section */}
        <div className="md:w-1/3 flex flex-col items-center">
            {drill.imageUrl ? (
                <div className="w-full aspect-[4/3] rounded-lg overflow-hidden border border-slate-600 bg-slate-900">
                    <img src={drill.imageUrl} alt={drill.name} className="w-full h-full object-cover" />
                </div>
            ) : (
                <button 
                    onClick={handleImageClick}
                    disabled={isImageLoading}
                    className="w-full aspect-[4/3] rounded-lg border-2 border-dashed border-slate-600 bg-slate-900/50 flex flex-col items-center justify-center text-slate-500 hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-slate-900 transition-all group"
                >
                    {isImageLoading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                            <span className="text-xs font-medium text-emerald-500">Generiere Taktik-Board...</span>
                        </div>
                    ) : (
                        <>
                            <ImageIcon className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium">Taktik-Bild generieren</span>
                        </>
                    )}
                </button>
            )}
        </div>
      </div>
    </div>
  );
};
