import { Wolf } from '../entities/Wolf';
import { SpriteRenderer } from '../rendering/Sprite';
import { COLORS, GAME_HEIGHT, GAME_WIDTH, DIFFICULTY } from '../utils/constants';

export interface ILevel {
  name: string;
  number: number;
  spawnRate: number;
  wolfSpeed: number;
  maxWolves: number;
  
  init(): void;
  update(deltaTime: number): void;
  renderBackground(sprite: SpriteRenderer): void;
  renderForeground(sprite: SpriteRenderer): void;
  spawnWolf(difficultyMultiplier: number): Wolf;
  checkWinCondition(time: number, wolvesDefeated: number): boolean;
  checkLoseCondition(wolvesReachedTop: number, lives: number): boolean;
  getLevelTime(): number;
  getTargetWolves(): number;
}

export abstract class BaseLevel implements ILevel {
  public abstract name: string;
  public abstract number: number;
  public spawnRate: number;
  public wolfSpeed: number;
  public maxWolves: number;
  protected levelTime: number = 60000;
  protected targetWolves: number = 15;

  constructor() {
    this.spawnRate = DIFFICULTY.SPAWN_RATE_BASE;
    this.wolfSpeed = DIFFICULTY.WOLF_SPEED_BASE;
    this.maxWolves = DIFFICULTY.MAX_WOLVES_BASE;
  }

  public init(): void {}
  public abstract update(deltaTime: number): void;
  public abstract renderBackground(sprite: SpriteRenderer): void;
  public abstract renderForeground(sprite: SpriteRenderer): void;
  public abstract spawnWolf(difficultyMultiplier: number): Wolf;

  public checkWinCondition(time: number, wolvesDefeated: number): boolean {
    return wolvesDefeated >= this.targetWolves || time >= this.levelTime;
  }

  public checkLoseCondition(wolvesReachedTop: number, lives: number): boolean {
    return lives <= 0 || wolvesReachedTop >= 7;
  }

  public getLevelTime(): number {
    return this.levelTime;
  }

  public getTargetWolves(): number {
    return this.targetWolves;
  }

  protected drawSky(sprite: SpriteRenderer): void {
    const ctx = (sprite as any).ctx;
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, COLORS.SKY_BLUE);
    gradient.addColorStop(1, COLORS.SKY_LIGHT);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }

  protected drawClouds(sprite: SpriteRenderer, time: number): void {
    const cloudPositions = [
      { x: 100 + (time / 50) % 200, y: 60, scale: 0.8 },
      { x: 400 + (time / 70) % 300, y: 100, scale: 1 },
      { x: 650 + (time / 40) % 250, y: 50, scale: 0.6 },
    ];
    cloudPositions.forEach(cloud => {
      sprite.drawCloud(cloud.x, cloud.y, cloud.scale);
    });
  }
}
