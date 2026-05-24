import { HistoryAction } from './types';

export class HistoryManager {
  private undoStack: HistoryAction[] = [];
  private redoStack: HistoryAction[] = [];
  private maxStackSize: number = 50;

  pushAction(action: HistoryAction): void {
    this.undoStack.push(action);
    if (this.undoStack.length > this.maxStackSize) {
      this.undoStack.shift();
    }
    this.redoStack = [];
  }

  undo(): HistoryAction | null {
    if (this.undoStack.length === 0) return null;
    const action = this.undoStack.pop()!;
    this.redoStack.push(action);
    return action;
  }

  redo(): HistoryAction | null {
    if (this.redoStack.length === 0) return null;
    const action = this.redoStack.pop()!;
    this.undoStack.push(action);
    return action;
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}
