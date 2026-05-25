
import { GameStats } from '../types';

const STORAGE_KEY = 'vampire_survivor_save';

export interface SaveData {
  highScore: number;
  totalKills: number;
  gamesPlayed: number;
}

export function loadSaveData(): SaveData {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load save data:', e);
  }
  return {
    highScore: 0,
    totalKills: 0,
    gamesPlayed: 0
  };
}

export function saveSaveData(data: SaveData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

export function updateHighScore(score: number): SaveData {
  const data = loadSaveData();
  if (score &gt; data.highScore) {
    data.highScore = score;
  }
  saveSaveData(data);
  return data;
}
