import { IEntity, checkAABB } from '../utils/collision';
import { GAME_WIDTH, GAME_HEIGHT } from '../utils/constants';
import { SpriteRenderer } from '../rendering/Sprite';

export class Rock implements IEntity {
  public x: number;
  public y: number;
  public width: number = 24;
  public height: number = 24;
  public active: boolean = true;

  private velocityX: number;
  private velocityY: number;
  private gravity: number = 400;
  private reboundCount: number = 0;
  private size: number = 24;

  constructor(x: number, y: number, velocityX: number, velocityY: number, isBig: boolean = false) {
    this.x = x;
    this.y = y;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    
    if (isBig) {
      this.size = 40;
      this.width = 40;
      this.height = 40;
    }
  }

  public update(deltaTime: number): void {
    if (!this.active) return;

    const dt = deltaTime / 1000;
    
    this.velocityY += this.gravity * dt;
    this.x += this.velocityX * dt;
    this.y += this.velocityY * dt;

    if (this.x < 0 || this.x > GAME_WIDTH || this.y > GAME_HEIGHT) {
      this.active = false;
    }
  }

  public render(sprite: SpriteRenderer): void {
    if (!this.active) return;
    sprite.drawRock(this.x, this.y, this.size);
  }

  public checkCollision(target: IEntity): boolean {
    if (!this.active || !target.active) return false;
    return checkAABB(this, target);
  }

  public rebound(): void {
    this.velocityX *= -1.2;
    this.velocityY *= -0.8;
    this.reboundCount++;
  }

  public isFromTop(): boolean {
    return this.velocityY > 200;
  }

  public getReboundCount(): number {
    return this.reboundCount;
  }

  public isBigRock(): boolean {
    return this.size === 40;
  }
}
