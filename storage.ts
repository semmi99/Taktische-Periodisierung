
import { WeeklyPlan } from './types';

const STORAGE_KEY = 'tactical_planner_plans_v1';
const TEAM_KEY = 'tactical_planner_last_team';

export const savePlansToStorage = (plans: WeeklyPlan[]) => {
  try {
    const serialized = JSON.stringify(plans);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (e) {
    console.error("Failed to save plans to local storage", e);
  }
};

export const loadPlansFromStorage = (): WeeklyPlan[] | null => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;
    return JSON.parse(serialized) as WeeklyPlan[];
  } catch (e) {
    console.error("Failed to load plans from local storage", e);
    return null;
  }
};

export const saveLastTeam = (teamName: string) => {
    localStorage.setItem(TEAM_KEY, teamName);
}

export const loadLastTeam = (): string | null => {
    return localStorage.getItem(TEAM_KEY);
}

export const clearStorage = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TEAM_KEY);
};
