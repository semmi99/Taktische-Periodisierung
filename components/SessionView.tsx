
import React from 'react';
import { Session } from '../types';
import { DrillCard } from './DrillCard';
import { Activity, Clock, Edit3, Users } from 'lucide-react';

interface SessionViewProps {
  session: Session;
  title: string;
  onGenerateDrillImage: (drillIndex: number) => Promise<void>;
  onEdit: () => void;
}

export const SessionView: React.FC<SessionViewProps> = ({ session, title, onGenerateDrillImage, onEdit }) => {
  const displayPlayerCount = () => {
      if (session.fieldPlayerCount !== undefined && session.goalkeeperCount !== undefined) {
          return `${session.fieldPlayerCount} + ${session.goalkeeperCount} TW`;
      }
      if (session.playerCount) {
          return `${session.playerCount} Spieler`;
      }
      return "";
  }

  return (
    <div className="mb-8 last:mb-0 break-inside-avoid">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-700/50 p-4 rounded-t-lg border-b border-slate-600 group">
        <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 text-xs font-bold rounded ${session.type === 'AM' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {session.type}
            </span>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {title} 
                <span className="text-slate-400 font-normal">- {session.focus}</span>
            </h3>
        </div>
        <div className="flex flex-wrap gap-4 mt-2 md:mt-0 text-sm items-center">
            {displayPlayerCount() && (
                <div className="flex items-center gap-1.5 text-emerald-300 bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-500/30">
                    <Users className="w-3.5 h-3.5" />
                    {displayPlayerCount()}
                </div>
            )}
            <div className="flex items-center gap-1.5 text-slate-300">
                <Clock className="w-4 h-4 text-emerald-400" />
                {session.duration}
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
                <Activity className="w-4 h-4 text-rose-400" />
                Intensität: {session.intensity}/10
            </div>
            <button 
                onClick={onEdit}
                className="p-1.5 rounded-md hover:bg-slate-600 text-slate-400 hover:text-white transition-colors ml-2"
                title="Einheit bearbeiten / Neu generieren"
            >
                <Edit3 className="w-4 h-4" />
            </button>
        </div>
      </div>
      
      <div className="bg-slate-900/30 p-4 rounded-b-lg border border-slate-700/50 border-t-0">
          {(!session.drills || session.drills.length === 0) ? (
              <div className="text-slate-500 text-center py-8 flex flex-col items-center gap-2">
                  <span className="italic">Keine Übungen für diese Einheit geladen.</span>
                  <button onClick={onEdit} className="text-emerald-400 hover:underline text-sm">Jetzt generieren</button>
              </div>
          ) : (
              session.drills.map((drill, idx) => (
                  <DrillCard 
                    key={idx} 
                    drill={drill} 
                    index={idx} 
                    onGenerateImage={() => onGenerateDrillImage(idx)}
                  />
              ))
          )}
      </div>
    </div>
  );
};
