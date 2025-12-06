
import React from 'react';
import { Activity, Settings, CalendarDays, SlidersHorizontal, ChevronDown, CheckCircle, Trash2, Download } from 'lucide-react';
import { TeamPreset, WeeklyPlan } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  teamName: string;
  availableTeams: TeamPreset[];
  onTeamChange: (teamName: string) => void;
  onGenerate: () => void;
  onEditSchedule: () => void;
  onEditSettings: () => void;
  onExportPDF: () => void;
  isGenerating: boolean;
  generationProgress?: string;
  currentWeekIndex: number;
  totalWeeks: number;
  onWeekSelect: (index: number) => void;
  weeks: WeeklyPlan[];
  onClearData?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  teamName, 
  availableTeams,
  onTeamChange,
  onGenerate, 
  onEditSchedule, 
  onEditSettings, 
  onExportPDF,
  isGenerating,
  generationProgress,
  currentWeekIndex,
  totalWeeks,
  onWeekSelect,
  weeks,
  onClearData
}) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 p-2 rounded-lg">
                <Activity className="h-6 w-6 text-slate-900" />
              </div>
              <div className="flex flex-col">
                <div className="relative group">
                    <select
                        value={teamName}
                        onChange={(e) => onTeamChange(e.target.value)}
                        className="appearance-none bg-transparent text-xl font-bold tracking-tight text-white border-none focus:ring-0 cursor-pointer pr-6 py-0 pl-0 hover:text-emerald-400 transition-colors"
                        disabled={isGenerating}
                    >
                        {availableTeams.map(team => (
                            <option key={team.id} value={team.name} className="bg-slate-800 text-slate-100">
                                {team.name}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-emerald-500 absolute right-0 top-1.5 pointer-events-none group-hover:translate-y-0.5 transition-transform" />
                </div>
                <p className="text-xs text-emerald-400 font-medium tracking-wider">TACTICAL PERIODIZATION</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
                <button
                    onClick={onExportPDF}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                    title="Als PDF speichern"
                >
                    <Download className="w-4 h-4" />
                    <span className="hidden lg:inline">PDF Export</span>
                </button>

                <button
                    onClick={onEditSettings}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                    title="Team Einstellungen"
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="hidden lg:inline">Einstellungen</span>
                </button>

                <button
                    onClick={onEditSchedule}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                >
                    <CalendarDays className="w-4 h-4" />
                    <span className="hidden lg:inline">Zeitplan</span>
                </button>

                <button
                onClick={onGenerate}
                disabled={isGenerating}
                className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
                    ${isGenerating 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'
                    }
                `}
                >
                {isGenerating ? (
                    <>
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-slate-500 border-t-transparent"></span>
                    Generiere...
                    </>
                ) : (
                    <>
                    <Settings className="w-4 h-4" />
                    Generieren
                    </>
                )}
                </button>
            </div>
          </div>
          
          {/* Week Navigation Tabs */}
          <div className="flex overflow-x-auto gap-1 pb-2 no-scrollbar border-t border-slate-800/50 mt-1 scroll-smooth">
             {weeks.map((week, idx) => (
                 <button
                    key={idx}
                    onClick={() => onWeekSelect(idx)}
                    className={`
                        relative flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex-shrink-0 min-w-[5rem]
                        ${currentWeekIndex === idx 
                            ? 'border-emerald-500 text-white bg-slate-800/50' 
                            : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                        }
                    `}
                 >
                    <span>Woche {idx + 1}</span>
                    {week.status === 'generated' && (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                 </button>
             ))}
          </div>
          
          {/* Progress Bar overlay */}
          {isGenerating && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-900/30">
                  <div 
                    className="h-full bg-emerald-500 animate-pulse transition-all duration-300" 
                    style={{ width: '100%' }} // Simple indeterminate animation for now
                  ></div>
                  {generationProgress && (
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900 px-3 py-1 rounded-full text-xs text-emerald-400 border border-emerald-900/50 shadow-xl z-50 whitespace-nowrap">
                          {generationProgress}
                      </div>
                  )}
              </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main id="week-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12 py-8 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm gap-4">
          <p>&copy; {new Date().getFullYear()} {teamName} Planner. Bereitgestellt durch Gemini AI.</p>
          
          {onClearData && (
              <button 
                onClick={onClearData}
                className="flex items-center gap-2 text-rose-500/70 hover:text-rose-400 transition-colors text-xs uppercase font-bold tracking-wider"
              >
                  <Trash2 className="w-3 h-3" />
                  Alle Daten löschen
              </button>
          )}
        </div>
      </footer>
    </div>
  );
};
