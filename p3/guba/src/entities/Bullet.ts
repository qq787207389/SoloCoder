import { Entity } from './Entity';
import { Vector2, WeaponType } from '../types';
import { generateId } from '../utils';

export class Bullet extends Entity {
  public type: WeaponType;
  public isPlayer: boolean;
  public damage: number;
  public lifetime: number;
  public maxLifetime: number;
  public explosionRadius: number;
  public targetId?: string;
  public trail: Vector2[];

  constructor(
    position: Vector2,
    velocity: Vector2,
    type: WeaponType,
    isPlayer: boolean,
    damage: number,
    size: number = 4,
    lifetime: number = 3000
  ) {
    super(generateId(), position, { x: size, y: size }, 1);
    this.velocity = { ...velocity };
    this.type = type;
    this.isPlayer = isPlayer;
    this.damage = damage;
    this.lifetime = lifetime;
    this.maxLifetime = lifetime;
    this.explosionRadius = type === 'grenade' || type === 'missile' ? 50 : 0;
    this.trail = [];
    this.zIndex = 10;
  }

  public update(deltaTime: number): void {
    if (!this.active) return;

    this.trail.push({ ...this.position });
    if (this.trail.length > 5) {
      this.trail.shift();
    }

    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    this.lifetime -= deltaTime;
    if (this.lifetime <= 0) {
      this.active = false;
    }
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    if (!this.active) return;

    const screenX = this.position.x - cameraX;
    const screenY = this.position.y - cameraY;

    if (this.trail.length > 1 && this.type !== 'flame') {
      ctx.strokeStyle = this.getBulletColor() + '80';
      ctx.lineWidth = this.size.x / 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(this.trail[0].x - cameraX, this.trail[0].y - cameraY);
      for (let i = 1; i < this.trail.length; i++) {
        ctx.lineTo(this.trail[i].x - cameraX, this.trail[i].y - cameraY);
      }
      ctx.lineTo(screenX, screenY);
      ctx.stroke();
    }

    ctx.fillStyle = this.getBulletColor();
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.size.x / 2, 0, Math.PI * 2);
    ctx.fill();

    if (this.type === 'grenade' || this.type === 'missile') {
      ctx.fillStyle = '#ff6600';
      ctx.beginPath();
      ctx.arc(screenX, screenY, this.size.x / 2 + 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = this.getBulletColor();
      ctx.beginPath();
      ctx.arc(screenX, screenY, this.size.x / 2 - 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private getBulletColor(): string {
    if (!this.isPlayer) {
      return '#ff4444';
    }
    switch (this.type) {
      case 'machinegun': return '#ffff00';
      case 'grenade': return '#ff8800';
      case 'flame': return '#ff4400';
      case 'missile': return '#00ffff';
      default: return '#ffffff';
    }
  }

  public shouldExplode(): boolean {
    return this.explosionRadius > 0;
  }
}
