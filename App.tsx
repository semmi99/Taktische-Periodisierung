
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { WeekChart } from './components/WeekChart';
import { SessionView } from './components/SessionView';
import { ScheduleEditor } from './components/ScheduleEditor';
import { TeamSettings } from './components/TeamSettings';
import { SessionEditor } from './components/SessionEditor';
import { MorphocycleLegend } from './components/MorphocycleLegend';
import { CycleConfigWizard } from './components/CycleConfigWizard';
import { WeeklyPlan, DayPlan, Session } from './types';
import { DEFAULT_PLAN, TEAM_PRESETS } from './constants';
import { generateTrainingPlan, generateDrillImage, generateSession } from './geminiService';
import { savePlansToStorage, loadPlansFromStorage, saveLastTeam, loadLastTeam, clearStorage } from './storage';
import { ChevronRight, Calendar, Info, Users, Shield, Layers, CalendarOff, CheckCircle2, Save, X, Loader2 } from 'lucide-react';

// Helper to determine morphocycle code handling MULTIPLE matches
const calculateMorphocycleCode = (dayIndex: number, matchDayIndices: number[]): string => {
    // 1. No Match at all in week
    if (matchDayIndices.length === 0) {
        if (dayIndex === 0) return "Rec"; 
        if (dayIndex === 1) return "Str"; 
        if (dayIndex === 2) return "End"; 
        if (dayIndex === 3) return "Spd"; 
        if (dayIndex === 4) return "Sim"; 
        if (dayIndex === 5) return "Sim"; 
        if (dayIndex === 6) return "Off"; 
        return "Dev";
    }

    // 2. Is today a match?
    if (matchDayIndices.includes(dayIndex)) {
        return "MD";
    }

    // 3. Complex Logic for Multiple Matches
    // Find distance to nearest match (past or future)
    
    // Find closest previous match
    const prevMatches = matchDayIndices.filter(m => m < dayIndex);
    const lastMatchIndex = prevMatches.length > 0 ? Math.max(...prevMatches) : -99; // -99 implies match was last week
    const distFromLast = dayIndex - lastMatchIndex;

    // Find closest next match
    const nextMatches = matchDayIndices.filter(m => m > dayIndex);
    const nextMatchIndex = nextMatches.length > 0 ? Math.min(...nextMatches) : 99; // 99 implies match is next week
    const distToNext = nextMatchIndex - dayIndex;

    // Priorities: 
    // A. Recovery from yesterday always takes precedence? 
    // B. Activation for tomorrow takes precedence over Recovery from 3 days ago.

    // Immediate Recovery (Day after match)
    if (distFromLast === 1) return "MD+1";
    
    // Immediate Prep (Day before match)
    if (distToNext === 1) return "MD-1";

    // Second Day Recovery
    if (distFromLast === 2) return "MD+2";

    // Two Days before match (Speed/Activation)
    if (distToNext === 2) return "MD-2";
    
    // Three Days before match (Endurance/Strength)
    if (distToNext === 3) return "MD-3";
    
    // Four Days before match (Strength)
    if (distToNext === 4) return "MD-4";

    return "Dev"; // Fallback
};

// --- PRINT COMPONENTS ---

const PrintSessionView = ({ session, title }: { session: Session, title: string }) => (
    <div className="pl-4 border-l-4 border-black mb-6 break-inside-avoid">
        <div className="flex justify-between items-baseline mb-2">
            <h4 className="font-bold text-lg uppercase">{title} <span className="text-gray-600 normal-case font-normal">- {session.focus}</span></h4>
            <div className="text-sm font-mono whitespace-nowrap">
                {session.duration} | Intensität: {session.intensity}/10 | {session.fieldPlayerCount}+{session.goalkeeperCount}
            </div>
        </div>
        
        <div className="space-y-4 mt-3">
            {(!session.drills || session.drills.length === 0) ? (
                <div className="text-xs text-gray-400 italic">Keine Übungen geplant.</div>
            ) : (
                session.drills.map((drill, i) => (
                    <div key={i} className="bg-gray-50 p-3 rounded border border-gray-200 break-inside-avoid shadow-sm">
                        <div className="flex justify-between font-bold text-sm mb-1 border-b border-gray-200 pb-1">
                            <span>{i+1}. {drill.name}</span>
                            <span>{drill.duration}</span>
                        </div>
                        <div className="flex gap-4 text-xs text-gray-500 mb-2">
                            <span className="bg-gray-200 px-1 rounded">{drill.space}</span>
                            <span className="bg-gray-200 px-1 rounded">{drill.players}</span>
                        </div>
                        <p className="text-sm mb-2 leading-relaxed text-gray-800">{drill.description}</p>
                        {drill.coachingPoints.length > 0 && (
                            <div className="mt-2">
                                <span className="text-[10px] font-bold uppercase text-gray-400">Coaching-Punkte:</span>
                                <ul className="list-disc list-inside text-xs text-gray-700 mt-1">
                                    {drill.coachingPoints.map((cp, k) => <li key={k}>{cp}</li>)}
                                </ul>
                            </div>
                        )}
                         {/* Render Image for Print if exists */}
                         {drill.imageUrl && (
                            <div className="mt-3 w-48 h-36 border border-gray-300 bg-gray-100 mx-auto">
                                <img src={drill.imageUrl} alt="Drill Diagram" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    </div>
);

const PrintView: React.FC<{ plan: WeeklyPlan; onCancel: () => void }> = ({ plan, onCancel }) => {
  if (!plan) return null;
  return (
    <>
        {/* Control Overlay - Ignored by HTML2PDF via data-html2canvas-ignore */}
        <div data-html2canvas-ignore="true" className="fixed top-6 right-6 z-[10000] flex items-center gap-4 bg-white/90 backdrop-blur border border-gray-200 p-2 rounded-lg shadow-xl print:hidden">
            <div className="flex items-center gap-2 text-sm text-gray-600 px-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>PDF wird vorbereitet...</span>
            </div>
            <button 
                onClick={onCancel}
                className="bg-rose-100 hover:bg-rose-200 text-rose-700 px-4 py-2 rounded font-medium text-sm transition-colors flex items-center gap-2"
            >
                <X className="w-4 h-4" />
                Abbrechen
            </button>
        </div>

        {/* Printable Content */}
        <div id="printable-area" className="bg-white text-black p-8 font-sans w-[794px] box-border mx-auto shadow-2xl my-8 print:shadow-none print:w-full print:my-0">
            {/* Header Block */}
            <div className="text-center border-b-4 border-black pb-6 mb-8">
                <h1 className="text-4xl font-extrabold uppercase tracking-widest mb-2">{plan.teamName}</h1>
                <div className="flex justify-center gap-8 text-sm font-bold uppercase text-gray-600 border-t border-gray-300 pt-2">
                    <span>Woche {plan.cycleWeek} / {plan.totalCycleWeeks}</span>
                    <span>System: {plan.formation}</span>
                    <span>Kader: {plan.fieldPlayerCount} Feld + {plan.goalkeeperCount} TW</span>
                </div>
                <div className="mt-4 bg-gray-100 p-3 rounded border-l-4 border-emerald-600 text-left">
                    <span className="block text-xs font-bold uppercase text-gray-500 mb-1">Wochenziel / Philosophie:</span>
                    <p className="italic text-lg leading-snug">"{plan.philosophy}"</p>
                    <p className="mt-2 text-sm text-gray-600 not-italic">{plan.weekRationale}</p>
                </div>
            </div>

            {/* Days Loop */}
            <div className="space-y-8">
                {plan.days.map((day, idx) => (
                    <div key={idx} className="break-inside-avoid border-b-2 border-gray-200 pb-6 mb-6 last:border-0">
                        {/* Day Header */}
                        <div className="flex justify-between items-center mb-4 bg-gray-100 p-2 rounded border border-gray-200">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-bold">{day.dayName}</span>
                                <span className="text-sm px-2 py-1 bg-black text-white rounded font-mono font-bold tracking-wider">{day.morphocycleCode}</span>
                            </div>
                            <span className="font-bold text-gray-700 uppercase text-sm tracking-wide">{day.theme}</span>
                        </div>
                        
                        <p className="text-sm italic text-gray-600 mb-6 px-2 border-l-2 border-gray-300 ml-1">Planungshintergrund: {day.rationale}</p>

                        {/* Sessions Container */}
                        <div className="space-y-6">
                            {day.schedule.hasAM && day.amSession && (
                                <PrintSessionView session={day.amSession} title="Vormittag (AM)" />
                            )}
                            {day.schedule.hasPM && day.pmSession && (
                                <PrintSessionView session={day.pmSession} title="Nachmittag (PM)" />
                            )}
                            {day.schedule.isMatchDay && day.pmSession && (
                                <PrintSessionView session={day.pmSession} title="Wettkampf" />
                            )}
                            {!day.schedule.hasAM && !day.schedule.hasPM && !day.schedule.isMatchDay && (
                                <div className="flex flex-col items-center justify-center py-6 text-gray-300 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                                    <span className="font-bold uppercase tracking-widest text-xl">Regeneration / Frei</span>
                                    <span className="text-xs">Keine Trainingseinheiten geplant.</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className="text-center text-[10px] text-gray-400 mt-8 border-t border-gray-200 pt-2">
                Erstellt mit NWZ Tactical Planner • {new Date().toLocaleDateString()}
            </div>
        </div>
    </>
  );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [teamName, setTeamName] = useState<string>(TEAM_PRESETS[2].name);
  const [plans, setPlans] = useState<WeeklyPlan[]>([DEFAULT_PLAN]);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<string>("");
  
  const [isScheduleEditorOpen, setIsScheduleEditorOpen] = useState(false);
  const [isTeamSettingsOpen, setIsTeamSettingsOpen] = useState(false);
  const [isSessionEditorOpen, setIsSessionEditorOpen] = useState(false);
  const [isCycleWizardOpen, setIsCycleWizardOpen] = useState(false);

  // Editor State
  const [editingSessionDayIndex, setEditingSessionDayIndex] = useState<number | null>(null);
  const [editingSessionType, setEditingSessionType] = useState<'AM' | 'PM' | 'SINGLE' | null>(null);

  // Initialization
  useEffect(() => {
    // Load last used team
    const savedTeam = loadLastTeam();
    if (savedTeam) {
        setTeamName(savedTeam);
    }
    
    // Load plans
    const savedPlans = loadPlansFromStorage();
    if (savedPlans && savedPlans.length > 0) {
        setPlans(savedPlans);
    } else {
        setIsCycleWizardOpen(true);
    }
  }, []);

  // Auto-save
  useEffect(() => {
    savePlansToStorage(plans);
  }, [plans]);

  const handleTeamChange = (newTeamName: string) => {
    setTeamName(newTeamName);
    saveLastTeam(newTeamName);
    
    const preset = TEAM_PRESETS.find(t => t.name === newTeamName);
    if (preset) {
        if (confirm(`Möchtest du einen neuen Plan für ${newTeamName} starten? Alle nicht gespeicherten Daten gehen verloren.`)) {
            const newPlan = {
                ...DEFAULT_PLAN,
                teamName: preset.name,
                playerCount: preset.defaultPlayerCount,
                fieldPlayerCount: preset.defaultFieldPlayers,
                goalkeeperCount: preset.defaultGoalkeepers,
                philosophy: preset.defaultPhilosophy,
                id: Date.now().toString(),
                status: 'draft' as const
            };
            setPlans([newPlan]);
            setCurrentWeekIndex(0);
            setIsCycleWizardOpen(true);
        }
    }
  };

  const handleClearData = () => {
      if (confirm("Wirklich ALLES löschen? Dies kann nicht rückgängig gemacht werden.")) {
          clearStorage();
          window.location.reload();
      }
  }

  const handleTeamSettingsSave = (
      formation: string, 
      fieldPlayers: number, 
      goalkeepers: number, 
      philosophy: string,
      cycleWeek: number, 
      totalCycleWeeks: number
    ) => {
    setPlans(prevPlans => {
        const updatedPlans = [...prevPlans];
        
        // Update current plan details
        updatedPlans[currentWeekIndex] = {
            ...updatedPlans[currentWeekIndex],
            formation,
            fieldPlayerCount: fieldPlayers,
            goalkeeperCount: goalkeepers,
            playerCount: fieldPlayers + goalkeepers,
            philosophy,
            cycleWeek, // Only visual if we have multiple
            totalCycleWeeks
        };

        // Expand Array if Total Weeks increased
        if (totalCycleWeeks > updatedPlans.length) {
            const basePlan = updatedPlans[0];
            for (let i = updatedPlans.length; i < totalCycleWeeks; i++) {
                updatedPlans.push({
                    ...basePlan, // Clone base settings
                    id: `week-${i+1}-${Date.now()}`,
                    status: 'draft',
                    cycleWeek: i + 1,
                    totalCycleWeeks: totalCycleWeeks,
                    weekRationale: "Neu erstellt (Wartet auf Planung)",
                    days: basePlan.days.map((day, dIdx) => ({
                         ...day,
                         amSession: undefined,
                         pmSession: undefined,
                         rationale: ""
                    }))
                });
            }
        }
        
        // Sync total weeks across all plans to ensure consistency
        updatedPlans.forEach(p => p.totalCycleWeeks = totalCycleWeeks);
        
        // Important: If we reduced the number of weeks, we should probably slice the array
        // to avoid ghost tabs.
        if (totalCycleWeeks < updatedPlans.length) {
            return updatedPlans.slice(0, totalCycleWeeks);
        }

        return updatedPlans;
    });
  };

  const handleCycleConfigConfirm = (configs: { weekIndex: number; hasMatch: boolean; matchDayIndices: number[] }[]) => {
    setPlans(prevPlans => {
      // Create a new array based on the configuration length
      // This ensures we always have the correct number of weeks
      const newPlans: WeeklyPlan[] = [];
      const basePlan = prevPlans[0] || DEFAULT_PLAN;

      configs.forEach((cfg, idx) => {
          if (idx < prevPlans.length) {
              // Update existing plan
              newPlans.push({
                  ...prevPlans[idx],
                  totalCycleWeeks: configs.length,
                  hasMatch: cfg.hasMatch,
                  days: prevPlans[idx].days.map((day: DayPlan, dIdx: number) => ({
                      ...day,
                      schedule: {
                          ...day.schedule,
                          isMatchDay: cfg.matchDayIndices.includes(dIdx)
                      },
                      morphocycleCode: calculateMorphocycleCode(dIdx, cfg.matchDayIndices)
                  }))
              });
          } else {
              // Create new empty plan for added weeks
              newPlans.push({
                  ...basePlan,
                  id: `week-${idx + 1}-${Date.now()}`,
                  status: 'draft',
                  cycleWeek: idx + 1,
                  totalCycleWeeks: configs.length, 
                  hasMatch: cfg.hasMatch,
                  weekRationale: "Wartet auf Generierung...",
                  days: basePlan.days.map((day: DayPlan, dIdx: number) => ({
                      ...day,
                      schedule: {
                           hasAM: !cfg.matchDayIndices.includes(dIdx) && dIdx !== 6,
                           hasPM: !cfg.matchDayIndices.includes(dIdx) && dIdx !== 6,
                           isMatchDay: cfg.matchDayIndices.includes(dIdx)
                      },
                      morphocycleCode: calculateMorphocycleCode(dIdx, cfg.matchDayIndices),
                      amSession: undefined,
                      pmSession: undefined,
                      rationale: "Wartet auf Planung..."
                  }))
              });
          }
      });
      return newPlans;
    });
    setIsCycleWizardOpen(false);
  };

  const updateDaySchedule = (dayIndex: number, field: 'hasAM' | 'hasPM' | 'isMatchDay', value: boolean) => {
    setPlans(prev => {
        const newPlans = [...prev];
        const currentPlan = newPlans[currentWeekIndex];
        const newDays = [...currentPlan.days];
        
        newDays[dayIndex] = {
            ...newDays[dayIndex],
            schedule: {
                ...newDays[dayIndex].schedule,
                [field]: value
            }
        };

        if (field === 'isMatchDay') {
            const matchIndices = newDays
                .map((d, i) => d.schedule.isMatchDay ? i : -1)
                .filter(i => i !== -1);
            
            newDays.forEach((day, idx) => {
                day.morphocycleCode = calculateMorphocycleCode(idx, matchIndices);
            });
        }

        newPlans[currentWeekIndex] = { ...currentPlan, days: newDays };
        return newPlans;
    });
  };

  const handleToggleWeekMatch = (hasMatch: boolean) => {
      setPlans(prev => {
          const newPlans = [...prev];
          newPlans[currentWeekIndex] = { ...newPlans[currentWeekIndex], hasMatch };
          return newPlans;
      });
  };

  const handleGenerateFullPlan = async () => {
    if (!process.env.API_KEY) {
        alert("API Key fehlt.");
        return;
    }
    
    setIsGenerating(true);
    setGenerationProgress("Starte Planung...");

    try {
        const updatedPlans = [...plans];

        for (let i = 0; i < updatedPlans.length; i++) {
            if (updatedPlans[i].status === 'generated') {
                setGenerationProgress(`Woche ${i + 1} bereits fertig. Überspringe...`);
                await new Promise(resolve => setTimeout(resolve, 300)); 
                continue;
            }

            setGenerationProgress(`Generiere Woche ${i + 1} von ${updatedPlans.length}...`);
            
            const generatedWeek = await generateTrainingPlan(process.env.API_KEY, updatedPlans[i]);
            
            updatedPlans[i] = {
                ...generatedWeek,
                id: updatedPlans[i].id || Date.now().toString(),
                status: 'generated',
                fieldPlayerCount: updatedPlans[i].fieldPlayerCount,
                goalkeeperCount: updatedPlans[i].goalkeeperCount
            };

            setPlans([...updatedPlans]);
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        setGenerationProgress("Fertig!");
    } catch (error) {
        console.error(error);
        alert("Fehler bei der Generierung.");
    } finally {
        setIsGenerating(false);
        setGenerationProgress("");
    }
  };

  const handleGenerateDrillImage = async (sessionType: 'AM' | 'PM', dayIndex: number, drillIndex: number) => {
      if (!process.env.API_KEY) return;
      
      const currentPlan = plans[currentWeekIndex];
      const day = currentPlan.days[dayIndex];
      const session = sessionType === 'AM' ? day.amSession : day.pmSession;
      
      if (!session || !session.drills[drillIndex]) return;

      try {
          const drill = session.drills[drillIndex];
          const imageUrl = await generateDrillImage(process.env.API_KEY, drill);
          
          setPlans(prev => {
              const newPlans = [...prev];
              const week = newPlans[currentWeekIndex];
              const d = week.days[dayIndex];
              const s = sessionType === 'AM' ? d.amSession! : d.pmSession!;
              s.drills[drillIndex].imageUrl = imageUrl;
              return newPlans;
          });
      } catch (e) {
          console.error(e);
          alert("Bild konnte nicht generiert werden.");
      }
  };

  const handleSessionEdit = (dayIndex: number, type: 'AM' | 'PM' | 'SINGLE') => {
      setEditingSessionDayIndex(dayIndex);
      setEditingSessionType(type);
      setIsSessionEditorOpen(true);
  };

  const handleSessionUpdate = (updatedSession: Session) => {
      if (editingSessionDayIndex === null || !editingSessionType) return;

      setPlans(prev => {
          const newPlans = [...prev];
          const week = newPlans[currentWeekIndex];
          const day = week.days[editingSessionDayIndex];
          
          if (editingSessionType === 'AM') day.amSession = updatedSession;
          else if (editingSessionType === 'PM' || editingSessionType === 'SINGLE') day.pmSession = updatedSession;
          
          return newPlans;
      });
  };

  const handleSessionRegenerate = async (
      fieldPlayers: number, 
      goalkeepers: number, 
      focus: string, 
      duration: string, 
      intensity: number
    ) => {
      if (!process.env.API_KEY || editingSessionDayIndex === null || !editingSessionType) {
          throw new Error("Missing info");
      }

      const week = plans[currentWeekIndex];
      const day = week.days[editingSessionDayIndex];

      return await generateSession(
          process.env.API_KEY, 
          week, 
          day, 
          editingSessionType, 
          fieldPlayers, 
          goalkeepers, 
          focus, 
          duration, 
          intensity
      );
  };

  const handlePrintCancel = () => {
      setIsPrinting(false);
      document.body.classList.remove('printing-mode');
  };

  const handleExportPDF = async () => {
    setIsPrinting(true);
    document.body.classList.add('printing-mode');
    
    // Smooth scroll disable and jump to top to prevent clipping
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    
    // Check if html2pdf is loaded, if not, try to load it or fallback
    if (typeof (window as any).html2pdf === 'undefined') {
        try {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        } catch (e) {
            console.error("PDF Library load failed", e);
            // Fallback directly to print
            window.print();
            handlePrintCancel();
            return;
        }
    }

    setTimeout(async () => {
        const element = document.getElementById('printable-area');
        if (!element) {
            alert("Druckbereich nicht gefunden. Fallback auf Standard-Druck.");
            window.print();
            handlePrintCancel();
            return;
        }

        // Wait for images to load
        const images = Array.from(element.getElementsByTagName('img'));
        await Promise.all(images.map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve; 
            });
        }));

        const plan = plans[currentWeekIndex];
        const safeTeamName = (plan.teamName || 'Team').replace(/[^a-z0-9]/gi, '_');
        const filename = `Plan_${safeTeamName}_W${plan.cycleWeek}.pdf`;

        const opt = {
            margin: [10, 10, 10, 10], // mm
            filename: filename,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 1.5, // 1.5 is good balance between quality and memory
                useCORS: true,
                logging: false,
                letterRendering: true,
                scrollY: 0,
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        try {
            // @ts-ignore
            await window.html2pdf().from(element).set(opt).save();
        } catch (err) {
            console.error("HTML2PDF failed:", err);
            // Fallback to browser print if JS generation fails
            if (confirm("Automatischer Download fehlgeschlagen. Browser-Druckdialog öffnen?")) {
                 window.print();
            }
        } finally {
            handlePrintCancel();
        }
    }, 1500); 
  };

  const currentPlan = plans[currentWeekIndex] || DEFAULT_PLAN;

  return (
    <>
    {/* APP VIEW - HIDDEN WHEN PRINTING */}
    <div className={isPrinting ? 'hidden' : 'block'}>
        <Layout
        teamName={teamName}
        availableTeams={TEAM_PRESETS}
        onTeamChange={handleTeamChange}
        onGenerate={handleGenerateFullPlan}
        onEditSchedule={() => setIsScheduleEditorOpen(true)}
        onEditSettings={() => setIsTeamSettingsOpen(true)}
        onExportPDF={handleExportPDF}
        isGenerating={isGenerating}
        generationProgress={generationProgress}
        currentWeekIndex={currentWeekIndex}
        totalWeeks={plans.length}
        onWeekSelect={setCurrentWeekIndex}
        weeks={plans}
        onClearData={handleClearData}
        >
            {/* Dashboard Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 break-inside-avoid">
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="w-16 h-16 text-emerald-500" />
                    </div>
                    <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Kader</h3>
                    <p className="text-3xl font-bold text-white">{currentPlan.fieldPlayerCount} <span className="text-lg text-slate-500 font-normal">+ {currentPlan.goalkeeperCount} TW</span></p>
                    <p className="text-xs text-slate-500 mt-2">{currentPlan.formation}</p>
                </div>
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Layers className="w-16 h-16 text-blue-500" />
                    </div>
                    <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Philosophie</h3>
                    <p className="text-lg font-bold text-white line-clamp-2 leading-tight">{currentPlan.philosophy}</p>
                </div>
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Calendar className="w-16 h-16 text-amber-500" />
                    </div>
                    <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Zyklus Woche</h3>
                    <p className="text-3xl font-bold text-white">{currentPlan.cycleWeek} <span className="text-lg text-slate-500 font-normal">/ {currentPlan.totalCycleWeeks}</span></p>
                    <p className="text-xs text-slate-500 mt-2">{currentPlan.hasMatch ? "Wettkampfwoche" : "Entwicklungswoche"}</p>
                </div>
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Shield className="w-16 h-16 text-rose-500" />
                    </div>
                    <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Wochenziel</h3>
                    <p className="text-sm font-medium text-slate-300 line-clamp-3 leading-relaxed">{currentPlan.weekRationale}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Schedule Column */}
                <div className="lg:col-span-2 space-y-8">
                    {currentPlan.days.map((day, idx) => (
                        <div key={idx} id={`day-${idx}`} className="bg-slate-800/50 rounded-xl border border-slate-700 p-1">
                            {/* Day Header */}
                            <div className="bg-slate-800 p-4 rounded-t-lg flex justify-between items-center border-b border-slate-700">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center font-bold text-lg leading-none ${day.schedule.isMatchDay ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-slate-700 text-slate-300'}`}>
                                        <span className="text-[10px] uppercase font-normal opacity-70">{day.dayName.substring(0,2)}</span>
                                        {idx + 1}.
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                            {day.dayName}
                                            <span className="text-xs font-mono font-normal px-2 py-0.5 bg-slate-900 rounded text-emerald-400 border border-emerald-900/50">{day.morphocycleCode}</span>
                                        </h2>
                                        <p className="text-slate-400 text-sm">{day.theme}</p>
                                    </div>
                                </div>
                                {day.schedule.isMatchDay && <TrophyIcon />}
                            </div>
                            
                            {/* Rationale */}
                            <div className="px-6 py-3 bg-slate-800/30 border-b border-slate-700/50">
                                <p className="text-xs text-slate-400 italic flex items-start gap-2">
                                    <Info className="w-3 h-3 mt-0.5 text-slate-500 shrink-0" />
                                    {day.rationale}
                                </p>
                            </div>

                            {/* Sessions Container */}
                            <div className="p-4 space-y-4">
                                {!day.schedule.hasAM && !day.schedule.hasPM && !day.schedule.isMatchDay ? (
                                    <div className="py-8 text-center border-2 border-dashed border-slate-700 rounded-lg text-slate-500">
                                        <CalendarOff className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                        <p>Regeneration / Frei</p>
                                    </div>
                                ) : (
                                    <>
                                        {day.schedule.hasAM && day.amSession && (
                                            <SessionView 
                                                session={day.amSession} 
                                                title="Vormittag" 
                                                onGenerateDrillImage={(drillIdx) => handleGenerateDrillImage('AM', idx, drillIdx)}
                                                onEdit={() => handleSessionEdit(idx, 'AM')}
                                            />
                                        )}
                                        {day.schedule.hasPM && day.pmSession && (
                                            <SessionView 
                                                session={day.pmSession} 
                                                title="Nachmittag"
                                                onGenerateDrillImage={(drillIdx) => handleGenerateDrillImage('PM', idx, drillIdx)}
                                                onEdit={() => handleSessionEdit(idx, 'PM')}
                                            />
                                        )}
                                        {day.schedule.isMatchDay && day.pmSession && (
                                            <SessionView 
                                                session={day.pmSession} 
                                                title="Wettkampf"
                                                onGenerateDrillImage={(drillIdx) => handleGenerateDrillImage('PM', idx, drillIdx)}
                                                onEdit={() => handleSessionEdit(idx, 'SINGLE')}
                                            />
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-1 space-y-6">
                    <WeekChart days={currentPlan.days} />
                    <MorphocycleLegend />
                </div>
            </div>

            {/* Modals */}
            {isScheduleEditorOpen && (
                <ScheduleEditor 
                    days={currentPlan.days} 
                    hasMatch={currentPlan.hasMatch}
                    onUpdateDay={updateDaySchedule}
                    onToggleWeekMatch={handleToggleWeekMatch}
                    onClose={() => setIsScheduleEditorOpen(false)} 
                />
            )}

            {isTeamSettingsOpen && (
                <TeamSettings 
                    plan={currentPlan}
                    onSave={handleTeamSettingsSave}
                    onClose={() => setIsTeamSettingsOpen(false)}
                />
            )}

            {isSessionEditorOpen && editingSessionDayIndex !== null && editingSessionType && (
                <SessionEditor
                    session={editingSessionType === 'AM' 
                        ? currentPlan.days[editingSessionDayIndex].amSession! 
                        : currentPlan.days[editingSessionDayIndex].pmSession!
                    }
                    dayName={currentPlan.days[editingSessionDayIndex].dayName}
                    morphocycle={currentPlan.days[editingSessionDayIndex].morphocycleCode}
                    defaultFieldPlayerCount={currentPlan.fieldPlayerCount}
                    defaultGoalkeeperCount={currentPlan.goalkeeperCount}
                    onSave={handleSessionUpdate}
                    onRegenerate={handleSessionRegenerate}
                    onClose={() => {
                        setIsSessionEditorOpen(false);
                        setEditingSessionDayIndex(null);
                        setEditingSessionType(null);
                    }}
                />
            )}

            {isCycleWizardOpen && (
                <CycleConfigWizard
                    currentPlans={plans}
                    onConfirm={handleCycleConfigConfirm}
                    onClose={() => {
                        setIsCycleWizardOpen(false);
                    }}
                />
            )}
        </Layout>
    </div>

    {/* EXCLUSIVE PRINT VIEW - VISIBLE ONLY WHEN PRINTING */}
    {isPrinting && (
        <div className="absolute top-0 left-0 w-full min-h-screen z-[9999] bg-white flex justify-center items-start pt-0">
            <PrintView plan={currentPlan} onCancel={handlePrintCancel} />
        </div>
    )}
    </>
  );
}

const TrophyIcon = () => (
    <div className="bg-emerald-500/10 p-2 rounded-full border border-emerald-500/30">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
    </div>
);
