import { BaseLevel } from './Level';
import { Wolf } from '../entities/Wolf';
import { SpriteRenderer } from '../rendering/Sprite';
import { GAME_WIDTH, GAME_HEIGHT, WolfState } from '../utils/constants';

export class Level1 extends BaseLevel {
  public name: string = '绿叶崖壁';
  public number: number = 1;
  private time: number = 0;

  constructor() {
    super();
    this.targetWolves = 15;
  }

  public init(): void {
    this.time = 0;
  }

  public update(deltaTime: number): void {
    this.time += deltaTime;
  }

  public renderBackground(sprite: SpriteRenderer): void {
    this.drawSky(sprite);
    this.drawClouds(sprite, this.time);

    sprite.drawCliffSide(0, 0, 100, GAME_HEIGHT, true);

    sprite.drawCliffSide(GAME_WIDTH - 80, 0, 80, GAME_HEIGHT, true);
  }

  public renderForeground(sprite: SpriteRenderer): void {
    sprite.drawLadder(60, 80, 40, GAME_HEIGHT - 120);
  }

  public spawnWolf(difficultyMultiplier: number): Wolf {
    const x = 200 + Math.random() * (GAME_WIDTH - 350);
    const y = -60;
    const speed = this.wolfSpeed * difficultyMultiplier;
    
    const wolf = new Wolf(x, y, WolfState.BALLOONING, speed, false);
    
    if (x < 250) {
      wolf.isLeftmost = true;
    }
    
    return wolf;
  }
}
