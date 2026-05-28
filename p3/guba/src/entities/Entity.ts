import { Vector2, Rect } from '../types';

export abstract class Entity {
  public id: string;
  public position: Vector2;
  public velocity: Vector2;
  public size: Vector2;
  public health: number;
  public maxHealth: number;
  public active: boolean;
  public rotation: number;
  public zIndex: number;

  constructor(
    id: string,
    position: Vector2,
    size: Vector2,
    health: number = 100
  ) {
    this.id = id;
    this.position = { ...position };
    this.velocity = { x: 0, y: 0 };
    this.size = { ...size };
    this.health = health;
    this.maxHealth = health;
    this.active = true;
    this.rotation = 0;
    this.zIndex = 0;
  }

  public getRect(): Rect {
    return {
      x: this.position.x - this.size.x / 2,
      y: this.position.y - this.size.y / 2,
      width: this.size.x,
      height: this.size.y
    };
  }

  public getCenter(): Vector2 {
    return { ...this.position };
  }

  public takeDamage(amount: number): void {
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.onDeath();
    }
  }

  public heal(amount: number): void {
    this.health = Math.min(this.maxHealth, this.health + amount);
  }

  public isAlive(): boolean {
    return this.health > 0 && this.active;
  }

  public onDeath(): void {
    this.active = false;
  }

  public abstract update(deltaTime: number, ...args: any[]): void;
  public abstract render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void;

  protected drawHealthBar(
    ctx: CanvasRenderingContext2D,
    screenX: number,
    screenY: number,
    width: number = 30,
    height: number = 4,
    yOffset: number = -20
  ): void {
    const barX = screenX - width / 2;
    const barY = screenY + yOffset;
    const healthPercent = this.health / this.maxHealth;

    ctx.fillStyle = '#333';
    ctx.fillRect(barX, barY, width, height);

    ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffff00' : '#ff0000';
    ctx.fillRect(barX, barY, width * healthPercent, height);

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, width, height);
  }
}
