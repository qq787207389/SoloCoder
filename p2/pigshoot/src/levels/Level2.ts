import { BaseLevel } from './Level';
import { Wolf } from '../entities/Wolf';
import { SpriteRenderer } from '../rendering/Sprite';
import { GAME_WIDTH, GAME_HEIGHT, WolfState } from '../utils/constants';

export class Level2 extends BaseLevel {
  public name: string = '黄土崖壁';
  public number: number = 2;
  private time: number = 0;

  constructor() {
    super();
    this.targetWolves = 18;
    this.wolfSpeed *= 0.8;
  }

  public init(): void {
    this.time = 0;
  }

  public update(deltaTime: number): void {
    this.time += deltaTime;
  }

  public renderBackground(sprite: SpriteRenderer): void {
    const ctx = (sprite as any).ctx;
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, '#DEB887');
    gradient.addColorStop(1, '#F4A460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.drawClouds(sprite, this.time);

    sprite.drawCliffSide(0, 0, 80, GAME_HEIGHT, false);

    sprite.drawCliffSide(GAME_WIDTH - 100, 0, 100, GAME_HEIGHT, false);
  }

  public renderForeground(_sprite: SpriteRenderer): void {
  }

  public spawnWolf(difficultyMultiplier: number): Wolf {
    const x = 200 + Math.random() * (GAME_WIDTH - 350);
    const y = GAME_HEIGHT + 60;
    const speed = this.wolfSpeed * difficultyMultiplier;
    
    const wolf = new Wolf(x, y, WolfState.ASCENDING, speed, false);
    
    if (x < 250) {
      wolf.isLeftmost = true;
    }
    
    return wolf;
  }

  public checkLoseCondition(wolvesReachedTop: number, lives: number): boolean {
    return lives <= 0 || wolvesReachedTop >= 7;
  }
}
