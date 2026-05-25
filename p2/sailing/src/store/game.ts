import { create } from "zustand";
import { loadGame, newGame, saveGame, deleteSave } from "@/game/save";
import { WorldState } from "@/game/types";

export interface GameStore {
  world: WorldState | null;
  currentSlot: number;
  started: boolean;
  lastSaveAt: number;
  setWorld: (w: WorldState) => void;
  patch: (fn: (w: WorldState) => void) => void;
  startNew: (seed?: number) => void;
  loadSlot: (slot: number) => boolean;
  saveSlot: (slot: number) => void;
  deleteSlot: (slot: number) => void;
  finishGame: () => void;
}

export const useGame = create<GameStore>((set, get) => ({
  world: null,
  currentSlot: -1,
  started: false,
  lastSaveAt: 0,
  setWorld: (world) => set({ world }),
  patch: (fn) => {
    const w = get().world;
    if (!w) return;
    fn(w);
    set({ world: { ...w } });
  },
  startNew: (seed) => {
    const w = newGame(seed);
    set({ world: w, started: true });
  },
  loadSlot: (slot) => {
    const w = loadGame(slot);
    if (!w) return false;
    set({ world: w, started: true, currentSlot: slot });
    return true;
  },
  saveSlot: (slot) => {
    const w = get().world;
    if (!w) return;
    if (saveGame(w, slot)) {
      set({ currentSlot: slot, lastSaveAt: Date.now() });
    }
  },
  deleteSlot: (slot) => {
    deleteSave(slot);
  },
  finishGame: () => set({ started: false, world: null, currentSlot: -1 }),
}));
