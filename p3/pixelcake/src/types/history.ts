export interface Command {
  id: string;
  name: string;
  timestamp: number;
  execute: () => void;
  undo: () => void;
}

export interface HistoryState {
  past: Command[];
  future: Command[];
  currentIndex: number;
  maxHistory: number;
}

export interface HistoryEntry {
  id: string;
  name: string;
  timestamp: number;
}

export type HistoryAction = 
  | { type: 'EXECUTE'; command: Command }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'JUMP'; index: number }
  | { type: 'CLEAR' };
