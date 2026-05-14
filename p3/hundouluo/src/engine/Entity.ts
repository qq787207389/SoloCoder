import { Game } from './Game';

export interface Vector2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export abstract class Entity {
  protected game: Game;
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public velocity: Vector2;
  public active: boolean;
  public health: number;
  public maxHealth: number;
  public invincible: boolean;
  public invincibleTimer: number;
  public facingRight: boolean;

  constructor(game: Game, x: number, y: number, width: number, height: number) {
    this.game = game;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.velocity = { x: 0, y: 0 };
    this.active = true;
    this.health = 1;
    this.maxHealth = 1;
    this.invincible = false;
    this.invincibleTimer = 0;
    this.facingRight = true;
  }

  public update(deltaTime: number): void {
    if (this.invincible) {
      this.invincibleTimer -= deltaTime;
      if (this.invincibleTimer <= 0) {
        this.invincible = false;
      }
    }
  }

  public abstract render(ctx: CanvasRenderingContext2D, cameraX: number): void;

  public getBounds(): Rect {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }

  public takeDamage(amount: number): void {
    if (this.invincible) return;
    this.health -= amount;
    if (this.health <= 0) {
      this.die();
    }
  }

  public die(): void {
    this.active = false;
  }

  public setInvincible(duration: number): void {
    this.invincible = true;
    this.invincibleTimer = duration;
  }

  protected drawInvincible(ctx: CanvasRenderingContext2D, cameraX: number, drawFn: () => void): void {
    if (this.invincible && Math.floor(this.invincibleTimer * 10) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }
    drawFn();
    ctx.globalAlpha = 1;
  }
}