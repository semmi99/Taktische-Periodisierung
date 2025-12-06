

import React from 'react';
import { WeeklyPlan } from '../types';
import { X, Save } from 'lucide-react';

interface TeamSettingsProps {
  plan: WeeklyPlan;
  onSave: (formation: string, fieldPlayerCount: number, goalkeeperCount: number, philosophy: string, cycleWeek: number, totalCycleWeeks: number) => void;
  onClose: () => void;
}

export const TeamSettings: React.FC<TeamSettingsProps> = ({ plan, onSave, onClose }) => {
  const [formation, setFormation] = React.useState(plan.formation);
  const [fieldPlayerCount, setFieldPlayerCount] = React.useState(plan.fieldPlayerCount || 18);
  const [goalkeeperCount, setGoalkeeperCount] = React.useState(plan.goalkeeperCount || 2);
  const [philosophy, setPhilosophy] = React.useState(plan.philosophy);
  const [cycleWeek, setCycleWeek] = React.useState(plan.cycleWeek || 1);
  const [totalCycleWeeks, setTotalCycleWeeks] = React.useState(plan.totalCycleWeeks || 4);

  const durationOptions = [1, 2, 3, 4, 8, 12, 16, 20];

  const handleTotalWeeksChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newTotal = parseInt(e.target.value);
      setTotalCycleWeeks(newTotal);
      // Reset current week if it exceeds new total
      if (cycleWeek > newTotal) {
          setCycleWeek(1);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formation, fieldPlayerCount, goalkeeperCount, philosophy, cycleWeek, totalCycleWeeks);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg">
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Team Einstellungen</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Dauer des Zyklus
                </label>
                <select
                  value={totalCycleWeeks}
                  onChange={handleTotalWeeksChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {durationOptions.map(weeks => (
                      <option key={weeks} value={weeks}>{weeks} Wochen</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Aktuelle Woche
                </label>
                <select
                  value={cycleWeek}
                  onChange={(e) => setCycleWeek(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {Array.from({ length: totalCycleWeeks }, (_, i) => i + 1).map(week => (
                      <option key={week} value={week}>Woche {week}</option>
                  ))}
                </select>
              </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Formation / System
            </label>
            <select
              value={formation}
              onChange={(e) => setFormation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="4-3-3">4-3-3</option>
              <option value="4-2-3-1">4-2-3-1</option>
              <option value="4-4-2">4-4-2</option>
              <option value="3-5-2">3-5-2</option>
              <option value="3-4-3">3-4-3</option>
              <option value="4-4-2 Raute">4-4-2 (Raute)</option>
              <option value="5-3-2">5-3-2</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                Feldspieler
                </label>
                <input
                type="number"
                min="0"
                max="40"
                value={fieldPlayerCount}
                onChange={(e) => setFieldPlayerCount(parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                Torhüter
                </label>
                <input
                type="number"
                min="0"
                max="6"
                value={goalkeeperCount}
                onChange={(e) => setGoalkeeperCount(parseInt(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Spielidee & Philosophie
            </label>
            <textarea
              rows={3}
              value={philosophy}
              onChange={(e) => setPhilosophy(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              placeholder="z.B. Gegenpressing, Ballbesitz..."
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
             <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors shadow-lg shadow-emerald-900/20"
            >
              <Save className="w-4 h-4" />
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};