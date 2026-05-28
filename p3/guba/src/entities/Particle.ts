import { Entity } from './Entity';
import { Vector2 } from '../types';
import { generateId, randomRange } from '../utils';

export type ParticleType = 'explosion' | 'smoke' | 'spark' | 'trail' | 'debris';

export class Particle extends Entity {
  public type: ParticleType;
  public color: string;
  public lifetime: number;
  public maxLifetime: number;
  public startSize: number;
  public endSize: number;
  public gravity: number;
  public rotationSpeed: number;

  constructor(
    position: Vector2,
    velocity: Vector2,
    type: ParticleType,
    color: string,
    size: number,
    lifetime: number,
    gravity: number = 0
  ) {
    super(generateId(), position, { x: size, y: size }, 1);
    this.velocity = { ...velocity };
    this.type = type;
    this.color = color;
    this.lifetime = lifetime;
    this.maxLifetime = lifetime;
    this.startSize = size;
    this.endSize = type === 'smoke' ? size * 2 : 0;
    this.gravity = gravity;
    this.rotationSpeed = randomRange(-0.1, 0.1);
    this.zIndex = type === 'smoke' ? 5 : 15;
  }

  public update(deltaTime: number): void {
    if (!this.active) return;

    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;

    this.velocity.y += this.gravity * deltaTime;
    this.velocity.x *= 0.98;
    this.velocity.y *= 0.98;

    this.rotation += this.rotationSpeed;

    const lifePercent = 1 - this.lifetime / this.maxLifetime;
    this.size.x = this.startSize + (this.endSize - this.startSize) * lifePercent;
    this.size.y = this.size.x;

    this.lifetime -= deltaTime;
    if (this.lifetime <= 0) {
      this.active = false;
    }
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    if (!this.active) return;

    const screenX = this.position.x - cameraX;
    const screenY = this.position.y - cameraY;
    const alpha = this.lifetime / this.maxLifetime;

    ctx.save();
    ctx.globalAlpha = alpha;

    switch (this.type) {
      case 'explosion':
        this.renderExplosion(ctx, screenX, screenY);
        break;
      case 'smoke':
        this.renderSmoke(ctx, screenX, screenY);
        break;
      case 'spark':
        this.renderSpark(ctx, screenX, screenY);
        break;
      case 'trail':
        this.renderTrail(ctx, screenX, screenY);
        break;
      case 'debris':
        this.renderDebris(ctx, screenX, screenY);
        break;
    }

    ctx.restore();
  }

  private renderExplosion(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, this.size.x);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(0.3, this.color);
    gradient.addColorStop(0.6, '#ff6600');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, this.size.x, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderSmoke(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, this.size.x);
    gradient.addColorStop(0, this.color + '80');
    gradient.addColorStop(0.5, this.color + '40');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, this.size.x, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderSpark(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.translate(x, y);
    ctx.rotate(this.rotation);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size.x / 2, -this.size.x / 6, this.size.x, this.size.x / 3);
  }

  private renderTrail(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(x, y, this.size.x / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderDebris(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    ctx.translate(x, y);
    ctx.rotate(this.rotation);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size.x / 2, -this.size.y / 2, this.size.x, this.size.y);
  }
}

export class ParticleSystem {
  private particles: Particle[] = [];

  public update(deltaTime: number): void {
    this.particles.forEach((p) => p.update(deltaTime));
    this.particles = this.particles.filter((p) => p.active);
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    const sortedParticles = [...this.particles].sort((a, b) => a.zIndex - b.zIndex);
    sortedParticles.forEach((p) => p.render(ctx, cameraX, cameraY));
  }

  public addParticle(particle: Particle): void {
    this.particles.push(particle);
  }

  public createExplosion(position: Vector2, size: number = 30): void {
    for (let i = 0; i < 15; i++) {
      const angle = (Math.PI * 2 * i) / 15 + randomRange(-0.2, 0.2);
      const speed = randomRange(0.1, 0.3);
      this.addParticle(
        new Particle(
          { ...position },
          { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
          'explosion',
          '#ffaa00',
          size * randomRange(0.5, 1),
          randomRange(300, 500),
          0
        )
      );
    }

    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      const speed = randomRange(0.05, 0.15);
      this.addParticle(
        new Particle(
          { ...position },
          { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
          'smoke',
          '#555555',
          size * randomRange(0.8, 1.5),
          randomRange(600, 1000),
          -0.0001
        )
      );
    }

    for (let i = 0; i < 20; i++) {
      const angle = randomRange(0, Math.PI * 2);
      const speed = randomRange(0.2, 0.5);
      this.addParticle(
        new Particle(
          { ...position },
          { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
          'spark',
          i % 2 === 0 ? '#ffff00' : '#ff6600',
          randomRange(2, 5),
          randomRange(200, 400),
          0.001
        )
      );
    }

    for (let i = 0; i < 6; i++) {
      const angle = randomRange(0, Math.PI * 2);
      const speed = randomRange(0.1, 0.3);
      this.addParticle(
        new Particle(
          { ...position },
          { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
          'debris',
          '#666666',
          randomRange(3, 6),
          randomRange(500, 800),
          0.002
        )
      );
    }
  }

  public createMuzzleFlash(position: Vector2, direction: Vector2): void {
    const flashPos = {
      x: position.x + direction.x * 15,
      y: position.y + direction.y * 15
    };

    for (let i = 0; i < 3; i++) {
      this.addParticle(
        new Particle(
          { ...flashPos },
          { x: direction.x * 0.1, y: direction.y * 0.1 },
          'explosion',
          '#ffff00',
          8 - i * 2,
          80,
          0
        )
      );
    }
  }

  public createDamageEffect(position: Vector2): void {
    for (let i = 0; i < 5; i++) {
      const angle = randomRange(0, Math.PI * 2);
      const speed = randomRange(0.05, 0.15);
      this.addParticle(
        new Particle(
          { ...position },
          { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
          'spark',
          '#ff0000',
          3,
          200,
          0
        )
      );
    }
  }

  public clear(): void {
    this.particles = [];
  }
}
