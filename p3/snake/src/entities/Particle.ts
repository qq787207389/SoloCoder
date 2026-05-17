import { GameObject } from '../core/GameObject';
import gameConfig from '../config/gameConfig.json';

export class Particle extends GameObject {
  private vx: number = 0;
  private vy: number = 0;
  private color: string = '#ffffff';
  private size: number = 4;
  private life: number = 1;
  private maxLife: number = 1;
  private gravity: number = gameConfig.particles.gravity;
  private friction: number = gameConfig.particles.friction;

  constructor() {
    super(0, 0);
    this.active = false;
  }

  public init(
    x: number,
    y: number,
    vx: number,
    vy: number,
    color: string,
    size: number,
    lifetime: number
  ): void {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.life = lifetime;
    this.maxLife = lifetime;
    this.active = true;
  }

  public reset(): void {
    this.active = false;
    this.vx = 0;
    this.vy = 0;
    this.life = 0;
  }

  public update(deltaTime: number): void {
    if (!this.active) return;

    this.life -= deltaTime;
    if (this.life <= 0) {
      this.active = false;
      return;
    }

    this.vy += this.gravity * (deltaTime / 16);
    this.vx *= this.friction;
    this.vy *= this.friction;

    this.x += this.vx * (deltaTime / 16);
    this.y += this.vy * (deltaTime / 16);
  }

  public render(ctx: CanvasRenderingContext2D, cellSize: number): void {
    if (!this.active) return;

    const alpha = this.life / this.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}