import { IEntity, checkAABB } from '../utils/collision';
import { PLAYER } from '../utils/constants';
import { SpriteRenderer } from '../rendering/Sprite';
import { Arrow } from './Arrow';

export class Player implements IEntity {
  public x: number;
  public y: number;
  public width: number = PLAYER.WIDTH;
  public height: number = PLAYER.HEIGHT;
  public active: boolean = true;

  private speed: number = PLAYER.SPEED;
  private minY: number = PLAYER.MIN_Y;
  private maxY: number = PLAYER.MAX_Y;
  private arrows: Arrow[] = [];
  private maxArrows: number = PLAYER.MAX_ARROWS;
  private shootCooldown: number = 0;
  private baseShootDelay: number = PLAYER.BASE_SHOOT_DELAY;
  private fireRateBoost: boolean = false;
  private ropeX: number = 200;
  private animFrame: number = 0;
  private animTimer: number = 0;
  private isMoving: boolean = false;

  constructor() {
    this.x = this.ropeX - this.width / 2;
    this.y = (this.minY + this.maxY) / 2;
  }

  public update(deltaTime: number): void {
    if (!this.active) return;

    if (this.shootCooldown > 0) {
      this.shootCooldown -= deltaTime;
    }

    this.animTimer += deltaTime;
    if (this.animTimer > 150) {
      if (this.isMoving) {
        this.animFrame = (this.animFrame + 1) % 2;
      }
      this.animTimer = 0;
    }

    this.arrows.forEach(arrow => arrow.update(deltaTime));
    this.arrows = this.arrows.filter(arrow => arrow.active);
  }

  public moveUp(deltaTime: number): void {
    this.isMoving = true;
    this.y -= this.speed * (deltaTime / 1000);
    this.y = Math.max(this.minY, this.y);
  }

  public moveDown(deltaTime: number): void {
    this.isMoving = true;
    this.y += this.speed * (deltaTime / 1000);
    this.y = Math.min(this.maxY, this.y);
  }

  public setMoving(moving: boolean): void {
    this.isMoving = moving;
  }

  public shoot(): Arrow | null {
    if (this.shootCooldown > 0) return null;
    if (this.arrows.length >= this.maxArrows) return null;

    const shootDelay = this.fireRateBoost ? this.baseShootDelay * 0.5 : this.baseShootDelay;
    this.shootCooldown = shootDelay;

    const arrow = new Arrow(
      this.x + this.width,
      this.y + this.height / 2 - 3,
      1
    );
    this.arrows.push(arrow);
    return arrow;
  }

  public render(sprite: SpriteRenderer): void {
    if (!this.active) return;

    sprite.drawRope(this.ropeX, 0, 600);

    sprite.drawBasket(this.x - 4, this.y + 20, this.width + 8, this.height - 16);

    sprite.drawMamaPig(this.x, this.y);

    this.arrows.forEach(arrow => arrow.render(sprite));
  }

  public getArrows(): Arrow[] {
    return this.arrows;
  }

  public getRopeX(): number {
    return this.ropeX;
  }

  public setFireRateBoost(boost: boolean): void {
    this.fireRateBoost = boost;
  }

  public hasFireRateBoost(): boolean {
    return this.fireRateBoost;
  }

  public getShootY(): number {
    return this.y + this.height / 2;
  }

  public getTopY(): number {
    return this.y + 20;
  }

  public getBottomY(): number {
    return this.y + this.height - 4;
  }

  public checkRockCollision(rock: IEntity): 'top' | 'bottom' | 'body' | null {
    if (!checkAABB(this, rock)) return null;

    const rockCenterY = rock.y + rock.height / 2;
    const basketTop = this.y + 20;
    const basketBottom = this.y + this.height - 4;

    if (rockCenterY < basketTop + 10) {
      return 'top';
    } else if (rockCenterY > basketBottom - 10) {
      return 'bottom';
    }
    return 'body';
  }

  public canShoot(): boolean {
    return this.shootCooldown <= 0 && this.arrows.length < this.maxArrows;
  }

  public getArrowCount(): number {
    return this.arrows.filter(a => a.active).length;
  }
}
