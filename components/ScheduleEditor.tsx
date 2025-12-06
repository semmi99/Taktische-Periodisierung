
import React from 'react';
import { DayPlan } from '../types';
import { X, Check, Trophy, CalendarOff } from 'lucide-react';

interface ScheduleEditorProps {
  days: DayPlan[];
  hasMatch: boolean;
  onUpdateDay: (index: number, field: 'hasAM' | 'hasPM' | 'isMatchDay', value: boolean) => void;
  onToggleWeekMatch: (hasMatch: boolean) => void;
  onClose: () => void;
}

export const ScheduleEditor: React.FC<ScheduleEditorProps> = ({ days, hasMatch, onUpdateDay, onToggleWeekMatch, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Wochenplan konfigurieren</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[70vh]">
            <div className="flex items-center justify-between bg-slate-800 p-4 rounded-lg mb-6 border border-slate-700">
                <div className="flex items-center gap-3">
                    {hasMatch ? <Trophy className="w-6 h-6 text-emerald-500" /> : <CalendarOff className="w-6 h-6 text-slate-500" />}
                    <div>
                        <p className="text-white font-medium">Spiele in dieser Woche?</p>
                        <p className="text-xs text-slate-400">
                            {hasMatch ? "Woche beinhaltet Wettkämpfe." : "Entwicklungswoche ohne Spiel."}
                        </p>
                    </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={hasMatch}
                        onChange={(e) => onToggleWeekMatch(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
            </div>

            <p className="text-slate-400 text-sm mb-4">
                Wähle aus, wann trainiert wird. {hasMatch && "Du kannst nun auch mehrere Spieltage pro Woche markieren."}
            </p>

            <div className="grid grid-cols-5 gap-4 mb-2 text-xs font-bold uppercase text-slate-500 tracking-wider text-center">
                <div className="text-left pl-2">Tag</div>
                <div>Code</div>
                <div>Früh</div>
                <div>Nachmittag</div>
                <div>{hasMatch ? "Spieltag" : "-"}</div>
            </div>

            <div className="space-y-2">
                {days.map((day, index) => (
                    <div key={index} className={`grid grid-cols-5 gap-4 items-center p-3 rounded-lg border ${day.schedule.isMatchDay ? 'bg-emerald-900/20 border-emerald-500/50' : 'bg-slate-800/50 border-slate-700'}`}>
                        <div className="font-medium text-slate-200 pl-2">{day.dayName}</div>
                        
                        <div className={`text-center text-xs font-mono px-2 py-1 rounded ${day.schedule.isMatchDay ? 'bg-emerald-500 text-slate-900 font-bold' : 'bg-slate-700 text-slate-400'}`}>
                            {day.morphocycleCode}
                        </div>

                        <div className="flex justify-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={day.schedule.hasAM}
                                    disabled={day.schedule.isMatchDay}
                                    onChange={(e) => onUpdateDay(index, 'hasAM', e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex justify-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={day.schedule.hasPM}
                                    disabled={day.schedule.isMatchDay}
                                    onChange={(e) => onUpdateDay(index, 'hasPM', e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex justify-center">
                             <button
                                onClick={() => hasMatch && onUpdateDay(index, 'isMatchDay', !day.schedule.isMatchDay)}
                                disabled={!hasMatch}
                                className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${day.schedule.isMatchDay ? 'bg-emerald-500 border-emerald-500 text-slate-900' : (!hasMatch ? 'opacity-20 border-slate-700 cursor-not-allowed' : 'border-slate-600 hover:border-emerald-500')}`}
                             >
                                {day.schedule.isMatchDay && <Check className="w-3.5 h-3.5 stroke-[4]" />}
                             </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="p-4 bg-slate-800 border-t border-slate-700 flex justify-end">
            <button 
                onClick={onClose}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
                Fertig
            </button>
        </div>
      </div>
    </div>
  );
};
