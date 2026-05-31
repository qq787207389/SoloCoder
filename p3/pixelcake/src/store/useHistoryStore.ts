import { create } from 'zustand';
import { Command, HistoryEntry } from '@/types/history';

interface HistoryState {
  past: Command[];
  future: Command[];
  maxHistory: number;
  
  execute: (command: Command) => void;
  undo: () => void;
  redo: () => void;
  jumpTo: (index: number) => void;
  clear: () => void;
  
  canUndo: () => boolean;
  canRedo: () => boolean;
  getHistory: () => HistoryEntry[];
  getCurrentIndex: () => number;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],
  maxHistory: 50,

  execute: (command) => {
    set((state) => {
      const newPast = [...state.past, command].slice(-state.maxHistory);
      command.execute();
      
      return {
        past: newPast,
        future: [],
      };
    });
  },

  undo: () => {
    set((state) => {
      if (state.past.length === 0) return state;
      
      const newPast = [...state.past];
      const command = newPast.pop()!;
      command.undo();
      
      return {
        past: newPast,
        future: [command, ...state.future],
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.future.length === 0) return state;
      
      const newFuture = [...state.future];
      const command = newFuture.shift()!;
      command.execute();
      
      return {
        past: [...state.past, command],
        future: newFuture,
      };
    });
  },

  jumpTo: (index) => {
    set((state) => {
      const total = state.past.length;
      
      if (index < 0 || index > total) return state;
      
      while (state.past.length > index) {
        const cmd = state.past[state.past.length - 1];
        cmd.undo();
        state.future.unshift(cmd);
        state.past.pop();
      }
      
      while (state.past.length < index && state.future.length > 0) {
        const cmd = state.future.shift()!;
        cmd.execute();
        state.past.push(cmd);
      }
      
      return {
        past: [...state.past],
        future: [...state.future],
      };
    });
  },

  clear: () => set({ past: [], future: [] }),

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  getHistory: () => {
    const { past } = get();
    return past.map((cmd) => ({
      id: cmd.id,
      name: cmd.name,
      timestamp: cmd.timestamp,
    }));
  },

  getCurrentIndex: () => get().past.length,
}));
