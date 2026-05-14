import { Entity, Vector2 } from '../engine/Entity';
import { Game } from '../engine/Game';

export class Bullet extends Entity {
  public damage: number;
  public speed: number;
  public isEnemyBullet: boolean;
  public color: string;
  public size: number;
  public piercing: boolean;
  public lifetime: number;

  constructor(game: Game) {
    super(game, 0, 0, 8, 8);
    this.damage = 1;
    this.speed = 600;
    this.isEnemyBullet = false;
    this.color = '#ffff00';
    this.size = 4;
    this.piercing = false;
    this.lifetime = 2;
    this.active = false;
  }

  public reset(): void {
    this.x = 0;
    this.y = 0;
    this.velocity = { x: 0, y: 0 };
    this.active = false;
    this.damage = 1;
    this.speed = 600;
    this.isEnemyBullet = false;
    this.color = '#ffff00';
    this.size = 4;
    this.piercing = false;
    this.lifetime = 2;
  }

  public init(x: number, y: number, direction: Vector2, isEnemy: boolean, damage: number = 1, speed: number = 600, color: string = '#ffff00', size: number = 4): void {
    this.x = x;
    this.y = y;
    this.velocity = {
      x: direction.x * speed,
      y: direction.y * speed
    };
    this.isEnemyBullet = isEnemy;
    this.damage = damage;
    this.speed = speed;
    this.color = color;
    this.size = size;
    this.active = true;
    this.lifetime = 2;
  }

  public update(deltaTime: number): void {
    if (!this.active) return;

    this.x += this.velocity.x * deltaTime;
    this.y += this.velocity.y * deltaTime;

    this.lifetime -= deltaTime;
    if (this.lifetime <= 0) {
      this.active = false;
      return;
    }

    if (this.isEnemyBullet) {
      if (this.x < this.game.camera.x - 50 || this.x > this.game.camera.x + this.game.canvas.width + 50) {
        this.active = false;
      }
    } else {
      if (this.x < 0 || this.x > 200 * 32) {
        this.active = false;
      }
    }

    if (this.y < -50 || this.y > this.game.canvas.height + 50) {
      this.active = false;
    }
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number): void {
    const screenX = this.x - cameraX;
    
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(screenX, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}