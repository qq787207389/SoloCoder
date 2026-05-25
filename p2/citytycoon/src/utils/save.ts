import { GameState } from '../types';

const SAVE_KEY = 'city-tycoon-save';

export function saveGame(state: GameState): void {
  try {
    const serializableState = {
      ...state,
      buildings: Array.from(state.buildings.entries())
    };
    
    const saveData = JSON.stringify(serializableState);
    localStorage.setItem(SAVE_KEY, saveData);
    console.log('游戏已保存');
  } catch (error) {
    console.error('保存游戏失败:', error);
  }
}

export function loadGame(): GameState | null {
  try {
    const saveData = localStorage.getItem(SAVE_KEY);
    if (!saveData) return null;

    const parsedState = JSON.parse(saveData);
    const restoredState: GameState = {
      ...parsedState,
      buildings: new Map(parsedState.buildings)
    };

    console.log('游戏已加载');
    return restoredState;
  } catch (error) {
    console.error('加载游戏失败:', error);
    return null;
  }
}

export function hasSaveData(): boolean {
  return localStorage.getItem(SAVE_KEY) !== null;
}

export function clearSaveData(): void {
  localStorage.removeItem(SAVE_KEY);
  console.log('存档已清除');
}

export function autoSave(state: GameState, interval: number = 60000): () => void {
  const timer = setInterval(() => {
    saveGame(state);
  }, interval);

  return () => clearInterval(timer);
}
