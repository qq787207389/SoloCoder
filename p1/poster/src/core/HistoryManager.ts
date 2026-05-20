import type { HistoryState, HistoryCommand } from '@/types';

export class HistoryManager {
  private historyStack: HistoryCommand[] = [];
  private currentIndex: number = -1;
  private maxHistory: number = 100;
  private listeners: Set<() => void> = new Set();

  constructor(maxHistory: number = 100) {
    this.maxHistory = maxHistory;
  }

  private notify(): void {
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.historyStack.length - 1;
  }

  push(command: Omit<HistoryCommand, 'id' | 'timestamp'>): void {
    if (this.currentIndex < this.historyStack.length - 1) {
      this.historyStack = this.historyStack.slice(0, this.currentIndex + 1);
    }

    const newCommand: HistoryCommand = {
      ...command,
      id: this.generateId(),
      timestamp: Date.now(),
    };

    this.historyStack.push(newCommand);

    if (this.historyStack.length > this.maxHistory) {
      this.historyStack.shift();
    } else {
      this.currentIndex++;
    }

    this.notify();
  }

  undo(): HistoryState | null {
    if (!this.canUndo()) return null;

    const command = this.historyStack[this.currentIndex];
    this.currentIndex--;
    this.notify();
    return command.beforeState;
  }

  redo(): HistoryState | null {
    if (!this.canRedo()) return null;

    this.currentIndex++;
    const command = this.historyStack[this.currentIndex];
    this.notify();
    return command.afterState;
  }

  goTo(index: number): HistoryState | null {
    if (index < 0 || index >= this.historyStack.length) return null;

    this.currentIndex = index;
    const command = this.historyStack[this.currentIndex];
    this.notify();
    return command.afterState;
  }

  getHistory(): HistoryCommand[] {
    return [...this.historyStack];
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  clear(): void {
    this.historyStack = [];
    this.currentIndex = -1;
    this.notify();
  }

  private generateId(): string {
    return `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
