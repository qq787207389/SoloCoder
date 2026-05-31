import { IEntity, checkAABB } from '../utils/collision';
import { GAME_HEIGHT, BONUS_VALUES } from '../utils/constants';
import { SpriteRenderer } from '../rendering/Sprite';

export type BonusType = 'strawberry' | 'cherry' | 'orange' | 'apple' | 'melon' | 'famicom' | 'face';

const BONUS_TYPES: BonusType[] = ['strawberry', 'cherry', 'orange', 'apple', 'melon', 'famicom', 'face'];

export class BonusItem implements IEntity {
  public x: number;
  public y: number;
  public width: number = 20;
  public height: number = 20;
  public active: boolean = true;

  private type: BonusType;
  private velocityX: number;
  private velocityY: number;
  private gravity: number = 200;
  private level: number = 0;

  constructor(x: number, y: number, startLevel: number = 0) {
    this.x = x;
    this.y = y;
    this.level = Math.min(startLevel, BONUS_TYPES.length - 1);
    this.type = BONUS_TYPES[this.level];
    this.velocityX = (Math.random() - 0.5) * 100;
    this.velocityY = -50 - Math.random() * 50;
  }

  public update(deltaTime: number): void {
    if (!this.active) return;

    const dt = deltaTime / 1000;
    
    this.velocityY += this.gravity * dt;
    this.x += this.velocityX * dt;
    this.y += this.velocityY * dt;

    if (this.y > GAME_HEIGHT) {
      this.active = false;
    }
  }

  public render(sprite: SpriteRenderer): void {
    if (!this.active) return;
    sprite.drawBonusItem(this.x, this.y, this.type);
  }

  public checkCollision(target: IEntity): boolean {
    if (!this.active || !target.active) return false;
    return checkAABB(this, target);
  }

  public upgrade(): boolean {
    if (this.level >= BONUS_TYPES.length - 1) {
      return false;
    }
    this.level++;
    this.type = BONUS_TYPES[this.level];
    return true;
  }

  public getValue(): number {
    return BONUS_VALUES[this.type.toUpperCase() as keyof typeof BONUS_VALUES] || 100;
  }

  public getType(): BonusType {
    return this.type;
  }
}
