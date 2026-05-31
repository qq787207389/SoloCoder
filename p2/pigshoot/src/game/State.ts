import { GameState, GameStateType } from '../utils/constants';

export class GameStateManager {
  private currentState: GameStateType = GameState.MENU;
  private score: number = 0;
  private lives: number = 3;
  private highScore: number = 0;
  private currentLevel: number = 1;
  private currentCycle: number = 1;
  private wolvesReachedTop: number = 0;
  private meatAvailable: boolean = false;
  private fireRateBoost: boolean = false;
  private snakeMeat: boolean = false;
  private meatNoCooldown: boolean = false;
  private levelStartTime: number = 0;

  constructor() {
    this.loadHighScore();
  }

  private loadHighScore(): void {
    try {
      const saved = localStorage.getItem('pigshoot_highscore');
      if (saved) {
        this.highScore = parseInt(saved, 10);
      }
    } catch (e) {
      console.warn('Could not load high score');
    }
  }

  private saveHighScore(): void {
    try {
      localStorage.setItem('pigshoot_highscore', this.highScore.toString());
    } catch (e) {
      console.warn('Could not save high score');
    }
  }

  public getState(): GameStateType {
    return this.currentState;
  }

  public setState(state: GameStateType): void {
    this.currentState = state;
  }

  public getScore(): number {
    return this.score;
  }

  public addScore(points: number): void {
    this.score += points;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
    }
  }

  public getLives(): number {
    return this.lives;
  }

  public setLives(lives: number): void {
    this.lives = lives;
  }

  public loseLife(): void {
    this.lives = Math.max(0, this.lives - 1);
  }

  public addLife(): void {
    this.lives++;
  }

  public getHighScore(): number {
    return this.highScore;
  }

  public getCurrentLevel(): number {
    return this.currentLevel;
  }

  public setCurrentLevel(level: number): void {
    this.currentLevel = level;
  }

  public getCurrentCycle(): number {
    return this.currentCycle;
  }

  public setCurrentCycle(cycle: number): void {
    this.currentCycle = cycle;
  }

  public nextLevel(): void {
    this.currentLevel++;
    if (this.currentLevel > 3) {
      this.currentLevel = 1;
      this.currentCycle++;
    }
  }

  public getWolvesReachedTop(): number {
    return this.wolvesReachedTop;
  }

  public setWolvesReachedTop(count: number): void {
    this.wolvesReachedTop = count;
  }

  public incrementWolvesReachedTop(): void {
    this.wolvesReachedTop++;
  }

  public hasMeatAvailable(): boolean {
    return this.meatAvailable;
  }

  public setMeatAvailable(available: boolean): void {
    this.meatAvailable = available;
  }

  public hasFireRateBoost(): boolean {
    return this.fireRateBoost;
  }

  public setFireRateBoost(boost: boolean): void {
    this.fireRateBoost = boost;
  }

  public hasSnakeMeat(): boolean {
    return this.snakeMeat;
  }

  public setSnakeMeat(snake: boolean): void {
    this.snakeMeat = snake;
  }

  public hasMeatNoCooldown(): boolean {
    return this.meatNoCooldown;
  }

  public setMeatNoCooldown(noCooldown: boolean): void {
    this.meatNoCooldown = noCooldown;
  }

  public getLevelStartTime(): number {
    return this.levelStartTime;
  }

  public setLevelStartTime(time: number): void {
    this.levelStartTime = time;
  }

  public reset(): void {
    this.score = 0;
    this.lives = 3;
    this.currentLevel = 1;
    this.currentCycle = 1;
    this.wolvesReachedTop = 0;
    this.meatAvailable = false;
    this.fireRateBoost = false;
    this.snakeMeat = false;
    this.meatNoCooldown = false;
  }
}
