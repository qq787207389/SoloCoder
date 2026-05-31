import { BaseLevel } from './Level';
import { Wolf } from '../entities/Wolf';
import { SpriteRenderer } from '../rendering/Sprite';
import { GAME_WIDTH, GAME_HEIGHT, WolfState, COLORS } from '../utils/constants';

export class Level3 extends BaseLevel {
  public name: string = '彩虹奖励关';
  public number: number = 3;
  private time: number = 0;

  constructor() {
    super();
    this.targetWolves = 12;
    this.spawnRate = 1500;
    this.levelTime = 45000;
  }

  public init(): void {
    this.time = 0;
  }

  public update(deltaTime: number): void {
    this.time += deltaTime;
  }

  public renderBackground(sprite: SpriteRenderer): void {
    const ctx = (sprite as any).ctx;
    
    const rainbowColors = COLORS.RAINBOW;
    const stripeHeight = GAME_HEIGHT / rainbowColors.length;
    
    rainbowColors.forEach((color, i) => {
      const offset = (this.time / 50 + i * stripeHeight) % GAME_HEIGHT;
      ctx.fillStyle = color + '40';
      ctx.fillRect(0, offset - stripeHeight, GAME_WIDTH, stripeHeight);
      if (offset > 0) {
        ctx.fillRect(0, offset - stripeHeight - GAME_HEIGHT, GAME_WIDTH, stripeHeight);
      }
    });

    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, '#FFB6C1');
    gradient.addColorStop(1, '#DDA0DD');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.drawClouds(sprite, this.time);

    for (let i = 0; i < 10; i++) {
      const starX = (i * 80 + this.time / 20) % GAME_WIDTH;
      const starY = 50 + (i * 47) % 200;
      const size = 3 + Math.sin(this.time / 300 + i) * 2;
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(starX, starY, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  public renderForeground(_sprite: SpriteRenderer): void {
  }

  public spawnWolf(difficultyMultiplier: number): Wolf {
    const x = 200 + Math.random() * (GAME_WIDTH - 350);
    const y = -60;
    const speed = this.wolfSpeed * difficultyMultiplier * 0.6;
    
    const wolf = new Wolf(x, y, WolfState.BALLOONING, speed, true);
    return wolf;
  }

  public checkWinCondition(time: number, _wolvesDefeated: number): boolean {
    return time >= this.levelTime;
  }

  public checkLoseCondition(_wolvesReachedTop: number, _lives: number): boolean {
    return false;
  }
}
