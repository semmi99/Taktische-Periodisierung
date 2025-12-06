
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { DayPlan } from '../types';

interface WeekChartProps {
  days: DayPlan[];
}

export const WeekChart: React.FC<WeekChartProps> = ({ days }) => {
  const data = days.map(day => ({
    name: day.morphocycleCode,
    load: day.dailyLoad,
    fullName: day.dayName
  }));

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
      <h3 className="text-slate-100 font-bold mb-6 text-lg">Belastungsprofil (Intensität)</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
                dataKey="name" 
                stroke="#94a3b8" 
                tick={{fill: '#94a3b8', fontSize: 12}} 
                tickLine={false}
                axisLine={false}
            />
            <YAxis 
                stroke="#94a3b8" 
                domain={[0, 10]} 
                tick={{fill: '#94a3b8', fontSize: 12}} 
                tickLine={false}
                axisLine={false}
            />
            <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }}
                itemStyle={{ color: '#34d399' }}
            />
            <ReferenceLine y={5} stroke="#475569" strokeDasharray="3 3" />
            <Line 
                type="monotone" 
                dataKey="load" 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#ecfdf5' }} 
                activeDot={{ r: 8 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between mt-4 text-xs text-slate-500 px-2">
          <span>Regeneration</span>
          <span>Akquisition (Load)</span>
          <span>Tapering</span>
          <span>Match</span>
      </div>
    </div>
  );
};
