import { IEntity, checkAABB } from '../utils/collision';
import { MEAT, GAME_HEIGHT, GAME_WIDTH } from '../utils/constants';
import { SpriteRenderer } from '../rendering/Sprite';

export class Meat implements IEntity {
  public x: number;
  public y: number;
  public width: number = MEAT.WIDTH;
  public height: number = MEAT.HEIGHT;
  public active: boolean = true;

  private velocityX: number;
  private velocityY: number;
  private gravity: number = MEAT.GRAVITY;
  private isSnake: boolean = false;
  private snakeTime: number = 0;
  private baseX: number;

  constructor(x: number, y: number, velocityX: number = 50, velocityY: number = -150, isSnake: boolean = false) {
    this.x = x;
    this.y = y;
    this.baseX = x;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.isSnake = isSnake;
  }

  public update(deltaTime: number): void {
    if (!this.active) return;

    const dt = deltaTime / 1000;
    
    this.velocityY += this.gravity * dt;
    this.baseX += this.velocityX * dt;
    this.y += this.velocityY * dt;

    if (this.isSnake) {
      this.snakeTime += deltaTime;
      this.x = this.baseX + Math.sin(this.snakeTime / 100) * 30;
    } else {
      this.x = this.baseX;
    }

    if (this.y > GAME_HEIGHT || this.x < -this.width || this.x > GAME_WIDTH) {
      this.active = false;
    }
  }

  public render(sprite: SpriteRenderer): void {
    if (!this.active) return;
    sprite.drawMeat(this.x, this.y, this.width, this.height);
  }

  public checkCollision(target: IEntity): boolean {
    if (!this.active || !target.active) return false;
    return checkAABB(this, target);
  }

  public getCenterX(): number {
    return this.x + this.width / 2;
  }

  public getCenterY(): number {
    return this.y + this.height / 2;
  }

  public setSnakeMode(isSnake: boolean): void {
    this.isSnake = isSnake;
  }
}
