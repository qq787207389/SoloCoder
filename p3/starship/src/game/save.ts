import type { GameState } from '../types';
const SAVE_KEY = 'star_trader_save';
export function saveGame(gameState: GameState): boolean {
 try {
 const saveData = JSON.stringify({
 version: 1,
 savedAt: Date.now(),
 state: gameState
 });
 localStorage.setItem(SAVE_KEY, saveData);
 return true;
 }
 catch (e) {
 console.error('Failed to save game:', e);
 return false;
 }
}
export function loadGame(): GameState | null {
 try {
 const saveData = localStorage.getItem(SAVE_KEY);
 if (!saveData)
 return null;
 const parsed = JSON.parse(saveData);
 if (parsed.version !== 1) {
 console.warn('Unknown save version');
 return null;
 }
 return parsed.state;
 }
 catch (e) {
 console.error('Failed to load game:', e);
 return null;
 }
}
export function hasSaveGame(): boolean {
 return localStorage.getItem(SAVE_KEY) !== null;
}
export function deleteSaveGame(): void {
 localStorage.removeItem(SAVE_KEY);
}
export function getSaveInfo(): {
 savedAt: number;
 day: number;
 credits: number;
} | null {
 try {
 const saveData = localStorage.getItem(SAVE_KEY);
 if (!saveData)
 return null;
 const parsed = JSON.parse(saveData);
 return {
 savedAt: parsed.savedAt,
 day: parsed.state.day,
 credits: parsed.state.fleet.credits
 };
 }
 catch {
 return null;
 }
}

