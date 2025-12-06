
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { WeeklyPlan, Drill, Session, DayPlan } from "./types";

const drillSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING },
    duration: { type: Type.STRING },
    space: { type: Type.STRING },
    players: { type: Type.STRING },
    description: { type: Type.STRING },
    coachingPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
    linkToPhilosophy: { type: Type.STRING },
    visualDescription: { type: Type.STRING, description: "Short visual setup." },
  },
  required: ["name", "duration", "space", "players", "description", "coachingPoints", "linkToPhilosophy", "visualDescription"]
};

const sessionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    type: { type: Type.STRING, enum: ["AM", "PM", "SINGLE"] },
    focus: { type: Type.STRING },
    duration: { type: Type.STRING },
    intensity: { type: Type.NUMBER },
    playerCount: { type: Type.NUMBER },
    fieldPlayerCount: { type: Type.NUMBER },
    goalkeeperCount: { type: Type.NUMBER },
    drills: { type: Type.ARRAY, items: drillSchema },
  },
  required: ["type", "focus", "duration", "intensity", "drills"]
};

export const generateTrainingPlan = async (
  apiKey: string,
  currentPlanContext: WeeklyPlan
): Promise<WeeklyPlan> => {
  const ai = new GoogleGenAI({ apiKey });

  const scheduleSchema: Schema = {
      type: Type.OBJECT,
      properties: {
          hasAM: { type: Type.BOOLEAN },
          hasPM: { type: Type.BOOLEAN },
          isMatchDay: { type: Type.BOOLEAN },
      }
  };

  const dayPlanSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      dayName: { type: Type.STRING },
      morphocycleCode: { type: Type.STRING },
      theme: { type: Type.STRING },
      schedule: scheduleSchema,
      rationale: { type: Type.STRING },
      dailyLoad: { type: Type.NUMBER },
      amSession: sessionSchema,
      pmSession: sessionSchema,
    },
    required: ["dayName", "morphocycleCode", "theme", "rationale", "dailyLoad"]
  };

  const weeklyPlanSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      teamName: { type: Type.STRING },
      formation: { type: Type.STRING },
      playerCount: { type: Type.NUMBER },
      fieldPlayerCount: { type: Type.NUMBER },
      goalkeeperCount: { type: Type.NUMBER },
      philosophy: { type: Type.STRING },
      weekRationale: { type: Type.STRING },
      cycleWeek: { type: Type.NUMBER },
      totalCycleWeeks: { type: Type.NUMBER },
      hasMatch: { type: Type.BOOLEAN },
      days: { type: Type.ARRAY, items: dayPlanSchema },
    },
    required: ["teamName", "formation", "philosophy", "weekRationale", "days", "playerCount", "cycleWeek", "hasMatch"]
  };

  const scheduleDescription = currentPlanContext.days.map(day => {
    let desc = `${day.dayName} (${day.morphocycleCode}): `;
    if (day.schedule.isMatchDay) {
        desc += "MATCH.";
    } else {
        const parts = [];
        if (day.schedule.hasAM) parts.push("AM");
        if (day.schedule.hasPM) parts.push("PM");
        if (parts.length === 0) parts.push("Frei");
        desc += parts.join("+");
    }
    return desc;
  }).join(' | ');

  const prompt = `
    Erstelle Taktische Periodisierung für: ${currentPlanContext.teamName}.
    Stats: ${currentPlanContext.fieldPlayerCount} Feld + ${currentPlanContext.goalkeeperCount} TW.
    Woche ${currentPlanContext.cycleWeek}/${currentPlanContext.totalCycleWeeks}.
    Struktur: ${scheduleDescription}
    
    Regeln:
    - Exakt für angegebene Spielerzahl.
    - MD-4 = Große Räume. MD-2 = Kleine Räume/Speed.
    - AM = 60 min. PM = 90 min.
    - SEHR KNAPP. Stichpunkte. KEIN Markdown. Nur JSON.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: weeklyPlanSchema,
      temperature: 0.7,
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  return JSON.parse(text) as WeeklyPlan;
};

export const generateDrillImage = async (apiKey: string, drill: Drill): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `Tactical soccer board diagram. Top down. ${drill.name}. ${drill.visualDescription}. Green pitch, white lines. Red vs Blue dots.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', 
        contents: { parts: [{ text: prompt }] },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    throw new Error("No image generated");
};

export const generateSession = async (
    apiKey: string, 
    weeklyContext: WeeklyPlan,
    dayContext: DayPlan,
    type: 'AM' | 'PM' | 'SINGLE',
    fieldPlayers: number,
    goalkeepers: number,
    focus: string,
    duration: string,
    intensity: number
): Promise<Session> => {
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Trainingseinheit.
      ${weeklyContext.teamName}. ${dayContext.dayName} (${dayContext.morphocycleCode}).
      ${type}. Fokus: ${focus}.
      ${fieldPlayers} Feld + ${goalkeepers} TW.
      
      Regeln:
      - Passend zum Morphocycle.
      - 3-4 Übungen.
      - KURZ & KNAPP. JSON.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: sessionSchema,
            temperature: 0.7
        }
    });

    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text) as Session;
}
