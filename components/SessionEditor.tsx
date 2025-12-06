

import React, { useState } from 'react';
import { Session } from '../types';
import { X, RefreshCw, Save } from 'lucide-react';

interface SessionEditorProps {
  session: Session;
  dayName: string;
  morphocycle: string;
  defaultFieldPlayerCount: number;
  defaultGoalkeeperCount: number;
  onSave: (updatedSession: Session) => void;
  onRegenerate: (fieldPlayerCount: number, goalkeeperCount: number, focus: string, duration: string, intensity: number) => Promise<Session>;
  onClose: () => void;
}

export const SessionEditor: React.FC<SessionEditorProps> = ({ 
    session, 
    dayName, 
    morphocycle, 
    defaultFieldPlayerCount,
    defaultGoalkeeperCount,
    onSave, 
    onRegenerate, 
    onClose 
}) => {
  const [focus, setFocus] = useState(session.focus);
  const [duration, setDuration] = useState(session.duration);
  const [intensity, setIntensity] = useState(session.intensity);
  const [fieldPlayerCount, setFieldPlayerCount] = useState(session.fieldPlayerCount !== undefined ? session.fieldPlayerCount : defaultFieldPlayerCount);
  const [goalkeeperCount, setGoalkeeperCount] = useState(session.goalkeeperCount !== undefined ? session.goalkeeperCount : defaultGoalkeeperCount);
  
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = async () => {
      setIsRegenerating(true);
      try {
          const newSession = await onRegenerate(fieldPlayerCount, goalkeeperCount, focus, duration, intensity);
          // Auto-save the regenerated session
          onSave(newSession);
          onClose();
      } catch (e) {
          console.error(e);
          alert("Fehler beim Generieren der Einheit.");
      } finally {
          setIsRegenerating(false);
      }
  };

  const handleSaveOnly = () => {
      // Updates metadata without regenerating drills
      onSave({
          ...session,
          focus,
          duration,
          intensity,
          fieldPlayerCount,
          goalkeeperCount,
          playerCount: fieldPlayerCount + goalkeeperCount
      });
      onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg">
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Einheit bearbeiten</h2>
            <p className="text-xs text-slate-400">{dayName} | {morphocycle} | {session.type}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-5">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Trainingsschwerpunkt (Fokus)</label>
                <input 
                    type="text" 
                    value={focus}
                    onChange={(e) => setFocus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Dauer</label>
                    <input 
                        type="text" 
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                    />
                </div>
                <div>
                    {/* Spacer or Intensity can go here if we want to change layout */}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Feldspieler</label>
                    <input 
                        type="number" 
                        value={fieldPlayerCount}
                        onChange={(e) => setFieldPlayerCount(parseInt(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Torhüter</label>
                    <input 
                        type="number" 
                        value={goalkeeperCount}
                        onChange={(e) => setGoalkeeperCount(parseInt(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1 flex justify-between">
                    <span>Intensität (RPE)</span>
                    <span className="text-emerald-400 font-bold">{intensity}/10</span>
                </label>
                <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    value={intensity} 
                    onChange={(e) => setIntensity(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>Regeneration</span>
                    <span>Maximal</span>
                </div>
            </div>

            <div className="bg-amber-900/20 border border-amber-900/50 p-3 rounded-lg">
                <p className="text-xs text-amber-200">
                    <strong>Hinweis:</strong> Wenn du die Spieleranzahl änderst, solltest du auf "Übungen neu generieren" klicken, damit die Organisationsformen (z.B. Feldgrößen, Teams) angepasst werden.
                </p>
            </div>
        </div>

        <div className="p-4 bg-slate-800 border-t border-slate-700 flex justify-between gap-3">
             <button 
                onClick={handleSaveOnly}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-2"
            >
                <Save className="w-4 h-4" />
                Nur Daten speichern
            </button>

            <button 
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
            >
                {isRegenerating ? (
                    <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Generiere...
                    </>
                ) : (
                    <>
                        <RefreshCw className="w-4 h-4" />
                        Übungen neu generieren
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
};