import { EntityState, Vector2 } from '../utils/types';

export abstract class Entity {
  protected state: EntityState;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    health: number = 100
  ) {
    this.state = {
      position: { x, y },
      velocity: { x: 0, y: 0 },
      width,
      height,
      health,
      maxHealth: health,
      isActive: true,
      isInvincible: false,
      invincibleTimer: 0
    };
  }

  abstract update(deltaTime: number, ...args: any[]): void;

  public getPosition(): Vector2 {
    return { ...this.state.position };
  }

  public setPosition(x: number, y: number): void {
    this.state.position = { x, y };
  }

  public getVelocity(): Vector2 {
    return { ...this.state.velocity };
  }

  public setVelocity(x: number, y: number): void {
    this.state.velocity = { x, y };
  }

  public getWidth(): number {
    return this.state.width;
  }

  public getHeight(): number {
    return this.state.height;
  }

  public getHealth(): number {
    return this.state.health;
  }

  public getMaxHealth(): number {
    return this.state.maxHealth;
  }

  public setHealth(health: number): void {
    this.state.health = Math.max(0, Math.min(health, this.state.maxHealth));
  }

  public takeDamage(damage: number, ..._args: any[]): any {
    if (this.state.isInvincible) return;
    this.state.health -= damage;
    if (this.state.health <= 0) {
      this.state.health = 0;
      this.state.isActive = false;
    }
  }

  public isActive(): boolean {
    return this.state.isActive;
  }

  public setActive(active: boolean): void {
    this.state.isActive = active;
  }

  public setInvincible(time: number): void {
    this.state.isInvincible = true;
    this.state.invincibleTimer = time;
  }

  public isInvincible(): boolean {
    return this.state.isInvincible;
  }

  public getRect(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.state.position.x,
      y: this.state.position.y,
      width: this.state.position.x + this.state.width,
      height: this.state.position.y + this.state.height
    };
  }

  protected updateInvincibility(): void {
    if (this.state.isInvincible) {
      this.state.invincibleTimer--;
      if (this.state.invincibleTimer <= 0) {
        this.state.isInvincible = false;
      }
    }
  }
}
