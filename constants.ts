

import { WeeklyPlan, TeamPreset } from './types';

export const TEAM_PRESETS: TeamPreset[] = [
  { 
    id: 'u15_aka', 
    name: 'AKA U15', 
    shortName: 'U15', 
    defaultPlayerCount: 18,
    defaultFieldPlayers: 16,
    defaultGoalkeepers: 2,
    defaultPhilosophy: "Individuelle Entwicklung, Technik unter Druck, Spielintelligenz" 
  },
  { 
    id: 'u16_aka', 
    name: 'AKA U16', 
    shortName: 'U16', 
    defaultPlayerCount: 20,
    defaultFieldPlayers: 18,
    defaultGoalkeepers: 2,
    defaultPhilosophy: "Positionsspezifische Technik, Gruppen-Taktik, Umschalten" 
  },
  { 
    id: 'u18_aka', 
    name: 'AKA U18', 
    shortName: 'U18', 
    defaultPlayerCount: 22,
    defaultFieldPlayers: 20,
    defaultGoalkeepers: 2,
    defaultPhilosophy: "Gegenpressing, Umschalten, Vertikal, Taktische Flexibilität" 
  },
  { 
    id: 'u21', 
    name: 'U21', 
    shortName: 'U21', 
    defaultPlayerCount: 20, 
    defaultFieldPlayers: 18,
    defaultGoalkeepers: 2,
    defaultPhilosophy: "Ballbesitz, Dominanz, Physische Härte, Match-Winning-Mentality" 
  },
  { 
    id: 'amateur', 
    name: 'Amateure', 
    shortName: 'AMA', 
    defaultPlayerCount: 16, 
    defaultFieldPlayers: 15,
    defaultGoalkeepers: 1,
    defaultPhilosophy: "Kompaktheit, Disziplin, Einfache Abläufe, Spaß am Spiel" 
  },
  { 
    id: 'semipro', 
    name: 'Halbprofis', 
    shortName: 'SEMI', 
    defaultPlayerCount: 22, 
    defaultFieldPlayers: 20,
    defaultGoalkeepers: 2,
    defaultPhilosophy: "Struktur, Hohe Intensität, Detailarbeit, Gegneranalyse" 
  },
  { 
    id: 'pro', 
    name: 'Profis', 
    shortName: 'PRO', 
    defaultPlayerCount: 24, 
    defaultFieldPlayers: 21,
    defaultGoalkeepers: 3,
    defaultPhilosophy: "Resultadorientiert, Maximale Effizienz, System-Variabilität" 
  }
];

export const DEFAULT_PLAN: WeeklyPlan = {
  status: 'draft',
  teamName: TEAM_PRESETS[2].name, // Default to AKA U18
  formation: "4-3-3",
  playerCount: TEAM_PRESETS[2].defaultPlayerCount,
  fieldPlayerCount: TEAM_PRESETS[2].defaultFieldPlayers,
  goalkeeperCount: TEAM_PRESETS[2].defaultGoalkeepers,
  philosophy: TEAM_PRESETS[2].defaultPhilosophy,
  weekRationale: "Initialer Entwurf.",
  cycleWeek: 1,
  totalCycleWeeks: 4,
  hasMatch: true,
  days: [
    {
      dayName: "Montag",
      morphocycleCode: "MD+2",
      theme: "Regeneration & Technik",
      schedule: { hasAM: true, hasPM: true, isMatchDay: false },
      dailyLoad: 3,
      rationale: "Aktive Erholung, Lösen von Verspannungen, kognitive Entlastung.",
      amSession: {
        type: "AM",
        focus: "Mobilität & Pflege",
        duration: "60 min",
        intensity: 2,
        drills: []
      },
      pmSession: {
        type: "PM",
        focus: "Technische Leichtigkeit",
        duration: "90 min",
        intensity: 3,
        drills: []
      }
    },
    {
      dayName: "Dienstag",
      morphocycleCode: "MD-4",
      theme: "Struktur & Große Räume",
      schedule: { hasAM: false, hasPM: true, isMatchDay: false },
      dailyLoad: 7,
      rationale: "Fokus auf Spielaufbau unter Druck und Organisation in großen Räumen.",
      pmSession: {
        type: "PM",
        focus: "Taktik: Spielaufbau",
        duration: "90 min",
        intensity: 7,
        drills: []
      }
    },
    {
      dayName: "Mittwoch",
      morphocycleCode: "MD-3",
      theme: "Umschalten & Ausdauer",
      schedule: { hasAM: true, hasPM: false, isMatchDay: false },
      dailyLoad: 9,
      rationale: "Maximale Belastung durch intensive Umschaltmomente in mittleren Räumen.",
      amSession: {
        type: "AM",
        focus: "Gegenpressing intensiv",
        duration: "60 min",
        intensity: 9,
        drills: []
      }
    },
    {
      dayName: "Donnerstag",
      morphocycleCode: "MD-2",
      theme: "Schnelligkeit & Kleine Räume",
      schedule: { hasAM: true, hasPM: true, isMatchDay: false },
      dailyLoad: 6,
      rationale: "Spritzigkeit, Reaktionsschnelligkeit und Torabschluss unter Zeitdruck.",
      amSession: {
        type: "AM",
        focus: "Explosivität & Koordination",
        duration: "60 min",
        intensity: 6,
        drills: []
      },
      pmSession: {
        type: "PM",
        focus: "Taktik: Pressing im Detail",
        duration: "90 min",
        intensity: 6,
        drills: []
      }
    },
    {
      dayName: "Freitag",
      morphocycleCode: "MD-1",
      theme: "Aktivierung & Standards",
      schedule: { hasAM: false, hasPM: true, isMatchDay: false },
      dailyLoad: 4,
      rationale: "Feinschliff, Standardsituationen und emotionale Einstimmung auf das Spiel.",
      pmSession: {
        type: "PM",
        focus: "Match Plan",
        duration: "90 min",
        intensity: 4,
        drills: []
      }
    },
    {
      dayName: "Samstag",
      morphocycleCode: "MD",
      theme: "Spieltag",
      schedule: { hasAM: false, hasPM: false, isMatchDay: true },
      dailyLoad: 10,
      rationale: "Maximale Leistung.",
      pmSession: {
        type: "SINGLE",
        focus: "Wettkampf",
        duration: "90+ min",
        intensity: 10,
        drills: []
      }
    },
    {
      dayName: "Sonntag",
      morphocycleCode: "MD+1",
      theme: "Frei / Passive Erholung",
      schedule: { hasAM: false, hasPM: false, isMatchDay: false },
      dailyLoad: 1,
      rationale: "Komplette Ruhe.",
    }
  ]
};