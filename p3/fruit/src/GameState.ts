import { GAME_CONFIG } from './config';
import { WinResult, FruitType } from './types';

export class GameState {
  private credits: number;
  private currentBet: number;
  private lastWin: number;
  private lastWinResults: WinResult[];
  private isSpinning: boolean;
  private isAutoSpin: boolean;
  private isStopping: boolean[];

  constructor() {
    this.credits = GAME_CONFIG.initialCredits;
    this.currentBet = GAME_CONFIG.minBet;
    this.lastWin = 0;
    this.lastWinResults = [];
    this.isSpinning = false;
    this.isAutoSpin = false;
    this.isStopping = [false, false, false];
  }

  getCredits(): number {
    return this.credits;
  }

  addCredits(amount: number): void {
    this.credits += amount;
  }

  deductCredits(amount: number): void {
    this.credits -= amount;
  }

  getCurrentBet(): number {
    return this.currentBet;
  }

  setCurrentBet(amount: number): void {
    if (amount >= GAME_CONFIG.minBet && amount <= GAME_CONFIG.maxBet) {
      this.currentBet = amount;
    }
  }

  incrementBet(): void {
    if (this.currentBet < GAME_CONFIG.maxBet) {
      this.currentBet++;
    }
  }

  decrementBet(): void {
    if (this.currentBet > GAME_CONFIG.minBet) {
      this.currentBet--;
    }
  }

  getLastWin(): number {
    return this.lastWin;
  }

  setLastWin(amount: number): void {
    this.lastWin = amount;
  }

  getLastWinResults(): WinResult[] {
    return this.lastWinResults;
  }

  setLastWinResults(results: WinResult[]): void {
    this.lastWinResults = results;
  }

  isSpinningState(): boolean {
    return this.isSpinning;
  }

  setSpinning(spinning: boolean): void {
    this.isSpinning = spinning;
  }

  isAutoSpinState(): boolean {
    return this.isAutoSpin;
  }

  toggleAutoSpin(): boolean {
    this.isAutoSpin = !this.isAutoSpin;
    return this.isAutoSpin;
  }

  setAutoSpin(enabled: boolean): void {
    this.isAutoSpin = enabled;
  }

  getStoppingState(): boolean[] {
    return this.isStopping;
  }

  setReelStopping(reelIndex: number, stopping: boolean): void {
    this.isStopping[reelIndex] = stopping;
  }

  resetStoppingState(): void {
    this.isStopping = [false, false, false];
  }

  canSpin(): boolean {
    return !this.isSpinning && this.credits >= this.currentBet;
  }

  reset(): void {
    this.credits = GAME_CONFIG.initialCredits;
    this.currentBet = GAME_CONFIG.minBet;
    this.lastWin = 0;
    this.lastWinResults = [];
    this.isSpinning = false;
    this.isAutoSpin = false;
    this.isStopping = [false, false, false];
  }
}