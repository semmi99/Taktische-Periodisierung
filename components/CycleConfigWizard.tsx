
import React, { useState } from 'react';
import { X, Calendar, Trophy, Play, AlertTriangle } from 'lucide-react';
import { WeeklyPlan } from '../types';

interface CycleConfigWizardProps {
  currentPlans: WeeklyPlan[];
  onConfirm: (configs: { weekIndex: number; hasMatch: boolean; matchDayIndices: number[] }[]) => void;
  onClose: () => void;
}

export const CycleConfigWizard: React.FC<CycleConfigWizardProps> = ({ currentPlans, onConfirm, onClose }) => {
  const daysOfWeek = [
    { name: "Montag", short: "MO" },
    { name: "Dienstag", short: "DI" },
    { name: "Mittwoch", short: "MI" },
    { name: "Donnerstag", short: "DO" },
    { name: "Freitag", short: "FR" },
    { name: "Samstag", short: "SA" },
    { name: "Sonntag", short: "SO" }
  ];

  // Fix: Ensure we use the configured total weeks, not just the current array length
  // Fallback to 4 if somehow data is missing, but prioritize the property on the first plan
  const totalWeeksToConfigure = currentPlans.length > 0 ? (currentPlans[0].totalCycleWeeks || 4) : 4;

  // Initialize state based on TOTAL desired weeks, creating defaults for future weeks
  const [configs, setConfigs] = useState(() => {
    return Array.from({ length: totalWeeksToConfigure }, (_, idx) => {
      // Try to get existing data if available for this index
      const existingPlan = currentPlans[idx];
      
      if (existingPlan) {
          const existingMatchIndices = existingPlan.days
            .map((d, i) => d.schedule.isMatchDay ? i : -1)
            .filter(i => i !== -1);
          
          // If hasMatch is true but no indices found (legacy data), default to Saturday (5)
          const defaultIndices = existingMatchIndices.length > 0 ? existingMatchIndices : [5]; 

          return {
            weekIndex: idx,
            hasMatch: existingPlan.hasMatch,
            matchDayIndices: existingPlan.hasMatch ? defaultIndices : []
          };
      } else {
          // Default for new future weeks that don't exist in the plans array yet
          return {
              weekIndex: idx,
              hasMatch: true, // Default to having a match
              matchDayIndices: [5] // Default Saturday
          };
      }
    });
  });

  const handleToggleMatchWeek = (index: number, hasMatch: boolean) => {
    const newConfigs = [...configs];
    newConfigs[index].hasMatch = hasMatch;
    // If turning on, set default to Saturday if empty
    if (hasMatch && newConfigs[index].matchDayIndices.length === 0) {
        newConfigs[index].matchDayIndices = [5];
    }
    // If turning off, clear days
    if (!hasMatch) {
        newConfigs[index].matchDayIndices = [];
    }
    setConfigs(newConfigs);
  };

  const handleToggleDay = (configIndex: number, dayIndex: number) => {
      const newConfigs = [...configs];
      const currentIndices = newConfigs[configIndex].matchDayIndices;
      
      if (currentIndices.includes(dayIndex)) {
          // Remove
          newConfigs[configIndex].matchDayIndices = currentIndices.filter(i => i !== dayIndex);
          // If no days left, turn off hasMatch
          if (newConfigs[configIndex].matchDayIndices.length === 0) {
              newConfigs[configIndex].hasMatch = false;
          }
      } else {
          // Add
          newConfigs[configIndex].matchDayIndices = [...currentIndices, dayIndex].sort();
          newConfigs[configIndex].hasMatch = true;
      }
      setConfigs(newConfigs);
  };

  const handleStart = () => {
    onConfirm(configs);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        <div className="bg-slate-800 p-6 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Calendar className="w-6 h-6 text-emerald-500" />
              Saisonplanung konfigurieren
            </h2>
            <p className="text-slate-400 mt-1">
                Lege fest, wann deine Spiele stattfinden. 
                <span className="text-emerald-400 ml-1 font-bold">Planung für {totalWeeksToConfigure} Wochen.</span>
            </p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
            <div className="space-y-4">
                {configs.map((config, idx) => (
                    <div key={idx} className={`p-4 rounded-lg border flex flex-col gap-4 transition-colors ${config.hasMatch ? 'bg-slate-800 border-slate-600' : 'bg-slate-800/50 border-slate-800'}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col items-center justify-center w-12 h-12 bg-slate-700 rounded-lg border border-slate-600">
                                    <span className="text-xs text-slate-400 uppercase">KW</span>
                                    <span className="text-lg font-bold text-white">{idx + 1}</span>
                                </div>
                                
                                <div>
                                    <h3 className="font-bold text-white">Woche {idx + 1}</h3>
                                    <p className="text-sm text-slate-400">
                                        {config.matchDayIndices.length > 1 
                                            ? 'Englische Woche / Mehrfachbelastung' 
                                            : (config.hasMatch ? 'Reguläre Wettkampfwoche' : 'Trainingswoche (Spielfrei)')}
                                    </p>
                                </div>
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer bg-slate-900/50 p-2 rounded border border-slate-700 hover:border-slate-500 transition-colors">
                                <input 
                                    type="checkbox" 
                                    checked={config.hasMatch}
                                    onChange={(e) => handleToggleMatchWeek(idx, e.target.checked)}
                                    className="w-5 h-5 rounded border-slate-600 text-emerald-600 focus:ring-emerald-500 bg-slate-800"
                                />
                                <span className="text-sm font-medium text-slate-200">Spiel(e) geplant</span>
                            </label>
                        </div>

                        {/* Day Selector */}
                        <div className={`transition-all duration-300 ${config.hasMatch ? 'opacity-100 max-h-24' : 'opacity-30 max-h-24 grayscale pointer-events-none'}`}>
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Spieltage auswählen:</span>
                                <div className="flex gap-2 flex-wrap">
                                    {daysOfWeek.map((day, dIdx) => {
                                        const isSelected = config.matchDayIndices.includes(dIdx);
                                        return (
                                            <button
                                                key={dIdx}
                                                onClick={() => handleToggleDay(idx, dIdx)}
                                                className={`
                                                    relative px-3 py-2 rounded text-xs font-bold uppercase tracking-wider border transition-all
                                                    ${isSelected 
                                                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/20' 
                                                        : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
                                                    }
                                                `}
                                            >
                                                {day.short}
                                                {isSelected && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full"></div>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="p-6 bg-slate-800 border-t border-slate-700 flex justify-between gap-3 items-center">
             <div className="flex items-center gap-2 text-amber-500 text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Struktur wird beim Starten neu erstellt.</span>
             </div>
             <div className="flex gap-3">
                <button
                onClick={onClose}
                className="px-6 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                >
                Abbrechen
                </button>
                <button
                onClick={handleStart}
                className="flex items-center gap-2 px-8 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-lg shadow-emerald-900/20 hover:scale-105"
                >
                <Play className="w-5 h-5 fill-current" />
                Planung starten
                </button>
             </div>
        </div>
      </div>
    </div>
  );
};
