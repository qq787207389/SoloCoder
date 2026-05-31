import { IEntity, checkAABB } from '../utils/collision';
import { ARROW, GAME_WIDTH } from '../utils/constants';
import { SpriteRenderer } from '../rendering/Sprite';

export class Arrow implements IEntity {
  public x: number;
  public y: number;
  public width: number = ARROW.WIDTH;
  public height: number = ARROW.HEIGHT;
  public active: boolean = true;

  private speed: number = ARROW.SPEED;
  private direction: 1 | -1 = 1;

  constructor(x: number, y: number, direction: 1 | -1 = 1) {
    this.x = x;
    this.y = y;
    this.direction = direction;
  }

  public update(deltaTime: number): void {
    if (!this.active) return;

    this.x += this.speed * this.direction * (deltaTime / 1000);

    if (this.x < -this.width || this.x > GAME_WIDTH + this.width) {
      this.active = false;
    }
  }

  public render(sprite: SpriteRenderer): void {
    if (!this.active) return;
    
    if (this.direction === 1) {
      sprite.drawArrow(this.x, this.y, this.width);
    } else {
      const ctx = (sprite as any).ctx;
      ctx.save();
      ctx.translate(this.x + this.width, this.y);
      ctx.scale(-1, 1);
      sprite.drawArrow(0, 0, this.width);
      ctx.restore();
    }
  }

  public checkCollision(target: IEntity): boolean {
    if (!this.active || !target.active) return false;
    return checkAABB(this, target);
  }

  public getDirection(): 1 | -1 {
    return this.direction;
  }
}
