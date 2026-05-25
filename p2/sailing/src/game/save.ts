import { createInitialWorld } from "./init";
import { WorldState } from "./types";

const KEY = "sailing_save_v1";
const MAX_SLOTS = 3;

export interface SaveMeta {
  slots: { id: number; day: number; time: number; hasSave: boolean }[];
}

export function listSaves(): SaveMeta {
  const slots: SaveMeta["slots"] = [];
  for (let i = 0; i < MAX_SLOTS; i++) {
    try {
      const raw = localStorage.getItem(`${KEY}_${i}`);
      if (raw) {
        const data = JSON.parse(raw) as WorldState;
        slots.push({ id: i, day: data.day, time: data.time, hasSave: true });
      } else {
        slots.push({ id: i, day: 0, time: 0, hasSave: false });
      }
    } catch {
      slots.push({ id: i, day: 0, time: 0, hasSave: false });
    }
  }
  return { slots };
}

export function saveGame(w: WorldState, slot: number) {
  try {
    localStorage.setItem(`${KEY}_${slot}`, JSON.stringify(w));
    return true;
  } catch {
    return false;
  }
}

export function loadGame(slot: number): WorldState | null {
  try {
    const raw = localStorage.getItem(`${KEY}_${slot}`);
    if (!raw) return null;
    return JSON.parse(raw) as WorldState;
  } catch {
    return null;
  }
}

export function newGame(seed?: number): WorldState {
  return createInitialWorld(seed);
}

export function deleteSave(slot: number) {
  localStorage.removeItem(`${KEY}_${slot}`);
}
