import { Particle } from '../entities/Particle';
import { ObjectPool } from '../core/ObjectPool';
import gameConfig from '../config/gameConfig.json';

export class ParticleSystem {
  private particles: Particle[] = [];
  private pool: ObjectPool<Particle>;
  private maxParticles: number = gameConfig.particles.maxParticles;

  constructor() {
    this.pool = new ObjectPool<Particle>(
      () => new Particle(),
      (p) => p.reset(),
      100,
      this.maxParticles
    );
  }

  public emit(
    x: number,
    y: number,
    count: number,
    color: string,
    speed: number = 3,
    size: number = 4,
    lifetime: number = 1000
  ): void {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;

      const particle = this.pool.acquire();
      const angle = Math.random() * Math.PI * 2;
      const vx = Math.cos(angle) * speed * (0.5 + Math.random() * 0.5);
      const vy = Math.sin(angle) * speed * (0.5 + Math.random() * 0.5);

      particle.init(x, y, vx, vy, color, size, lifetime);
      this.particles.push(particle);
    }
  }

  public update(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.update(deltaTime);

      if (!particle.isActive()) {
        this.pool.release(particle);
        this.particles.splice(i, 1);
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D): void {
    for (const particle of this.particles) {
      particle.render(ctx, 1);
    }
  }

  public clear(): void {
    for (const particle of this.particles) {
      this.pool.release(particle);
    }
    this.particles = [];
  }

  public getActiveCount(): number {
    return this.particles.length;
  }
}