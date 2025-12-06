

export interface Drill {
  name: string;
  duration: string;
  space: string;
  players: string;
  description: string;
  coachingPoints: string[];
  linkToPhilosophy: string;
  visualDescription?: string; // For image generation prompt
  imageUrl?: string;
}

export interface Session {
  type: 'AM' | 'PM' | 'SINGLE';
  focus: string; // e.g., "Kraft/Raum", "Speed"
  duration: string;
  intensity: number; // 1-10
  playerCount?: number; // Total override
  fieldPlayerCount?: number; // Specific override
  goalkeeperCount?: number; // Specific override
  drills: Drill[];
}

export interface ScheduleConfig {
  hasAM: boolean;
  hasPM: boolean;
  isMatchDay: boolean;
}

export interface DayPlan {
  dayName: string; // Montag, Dienstag...
  morphocycleCode: string; // MD+2, MD-4...
  theme: string; // e.g., "Active Recovery"
  schedule: ScheduleConfig;
  amSession?: Session;
  pmSession?: Session;
  dailyLoad: number; // For the chart
  rationale: string;
}

export interface WeeklyPlan {
  id?: string;
  status?: 'draft' | 'generated'; // Track if this week has been AI generated
  teamName: string;
  formation: string;
  playerCount: number; // Total
  fieldPlayerCount: number; // Feldspieler
  goalkeeperCount: number; // Torhüter
  philosophy: string;
  weekRationale: string;
  cycleWeek: number; // Current week number
  totalCycleWeeks: number; // Total duration (1, 4, 8, 12 etc)
  hasMatch: boolean;
  days: DayPlan[];
}

export interface TeamPreset {
  id: string;
  name: string;
  shortName: string;
  defaultPlayerCount: number; // Total
  defaultFieldPlayers: number;
  defaultGoalkeepers: number;
  defaultPhilosophy: string;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';