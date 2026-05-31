import { IEntity, checkAABB } from '../utils/collision';
import { HiddenItemTypeType, GAME_HEIGHT } from '../utils/constants';
import { SpriteRenderer } from '../rendering/Sprite';

export class HiddenItem implements IEntity {
  public x: number;
  public y: number;
  public width: number = 24;
  public height: number = 24;
  public active: boolean = true;

  private type: HiddenItemTypeType;
  private velocityY: number = -80;
  private lifetime: number = 5000;
  private timer: number = 0;
  private floatOffset: number = 0;

  constructor(x: number, y: number, type: HiddenItemTypeType) {
    this.x = x;
    this.y = y;
    this.type = type;
  }

  public update(deltaTime: number): void {
    if (!this.active) return;

    this.timer += deltaTime;
    this.floatOffset += deltaTime;
    
    this.y += this.velocityY * (deltaTime / 1000);
    this.velocityY += 100 * (deltaTime / 1000);

    if (this.timer > this.lifetime || this.y > GAME_HEIGHT) {
      this.active = false;
    }
  }

  public render(sprite: SpriteRenderer): void {
    if (!this.active) return;
    
    const floatY = this.y + Math.sin(this.floatOffset / 200) * 5;
    sprite.drawHiddenItem(this.x + this.width / 2, floatY + this.height / 2, this.type);
  }

  public checkCollision(target: IEntity): boolean {
    if (!this.active || !target.active) return false;
    return checkAABB(this, target);
  }

  public getType(): HiddenItemTypeType {
    return this.type;
  }

  public collect(): void {
    this.active = false;
  }
}

export class HiddenItemSystem {
  private rapidMoveCount: number = 0;
  private emptyShotCount: number = 0;
  private emptyShotHeight: number | null = null;
  private reboundHitCount: number = 0;
  private consecutiveHits: number = 0;
  private leftBalloonHits: number = 0;
  private lastMoveTime: number = 0;
  private leafCooldown: number = 0;

  public recordMove(): void {
    const now = Date.now();
    if (now - this.lastMoveTime < 200) {
      this.rapidMoveCount++;
    } else {
      this.rapidMoveCount = 1;
    }
    this.lastMoveTime = now;
  }

  public recordEmptyShot(playerY: number): void {
    if (this.emptyShotHeight === null || Math.abs(playerY - this.emptyShotHeight) < 50) {
      this.emptyShotCount++;
    } else {
      this.emptyShotCount = 1;
    }
    this.emptyShotHeight = playerY;
    this.consecutiveHits = 0;
  }

  public recordHit(): void {
    this.consecutiveHits++;
    this.emptyShotCount = 0;
  }

  public recordReboundHit(): void {
    this.reboundHitCount++;
  }

  public recordLeftBalloonHit(): void {
    this.leftBalloonHits++;
  }

  public update(deltaTime: number): void {
    if (this.leafCooldown > 0) {
      this.leafCooldown -= deltaTime;
    }
  }

  public checkLeafTrigger(): boolean {
    if (this.rapidMoveCount >= 8 && this.leafCooldown <= 0) {
      this.rapidMoveCount = 0;
      this.leafCooldown = 3000;
      return true;
    }
    return false;
  }

  public checkMushroomTrigger(): boolean {
    if (this.emptyShotCount >= 12) {
      this.emptyShotCount = 0;
      this.emptyShotHeight = null;
      return true;
    }
    return false;
  }

  public checkButterflyTrigger(): boolean {
    if (this.reboundHitCount >= 3) {
      this.reboundHitCount = 0;
      return true;
    }
    return false;
  }

  public checkCaterpillarTrigger(): boolean {
    if (this.consecutiveHits >= 30) {
      this.consecutiveHits = 0;
      return true;
    }
    return false;
  }

  public checkBeetleTrigger(): boolean {
    if (this.leftBalloonHits >= 20) {
      this.leftBalloonHits = 0;
      return true;
    }
    return false;
  }

  public getConsecutiveHits(): number {
    return this.consecutiveHits;
  }

  public resetAll(): void {
    this.rapidMoveCount = 0;
    this.emptyShotCount = 0;
    this.emptyShotHeight = null;
    this.reboundHitCount = 0;
    this.consecutiveHits = 0;
    this.leftBalloonHits = 0;
  }
}
