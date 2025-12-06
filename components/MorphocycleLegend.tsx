
import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const MorphocycleLegend: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    const legendItems = [
        { code: "MD", title: "Match Day", desc: "Der Wettkampf. Maximale Belastung." },
        { code: "MD+1/+2", title: "Recovery (Rec)", desc: "Regeneration. Taktisch: Leichte Technik, Mobilität. Keine hohe Belastung." },
        { code: "MD-4", title: "Strength (Str)", desc: "Kraft & Spannung. Große Räume, viel Zeit pro Aktion, lange Pausen. Fokus: Aufbau." },
        { code: "MD-3", title: "Endurance (End)", desc: "Ausdauer. Mittlere Räume, viele Wiederholungen, kaum Pausen. Fokus: Gegenpressing." },
        { code: "MD-2", title: "Speed (Spd)", desc: "Schnelligkeit. Kleine Räume, maximale Explosivität, kurze Dauer. Fokus: Torabschluss." },
        { code: "MD-1", title: "Activation (Act)", desc: "Aktivierung. Kurz, spritzig, Standards. Vorbereitung auf Spieltag." },
        { code: "Sim", title: "Game Simulation", desc: "Spielersatztraining (in spielfreien Wochen). Hohe Intensität, oft 11vs11." },
    ];

    return (
        <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden mb-6">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 text-sm font-medium text-slate-300 hover:bg-slate-750 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-emerald-500" />
                    <span>Legende: Taktische Periodisierung Codes</span>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {isOpen && (
                <div className="p-4 bg-slate-900/50 border-t border-slate-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {legendItems.map((item) => (
                        <div key={item.code} className="bg-slate-800 p-2 rounded border border-slate-700/50">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-slate-700 text-slate-200 text-xs font-bold px-1.5 py-0.5 rounded font-mono">
                                    {item.code}
                                </span>
                                <span className="text-emerald-400 text-xs font-bold uppercase">{item.title}</span>
                            </div>
                            <p className="text-xs text-slate-400 leading-snug">{item.desc}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
