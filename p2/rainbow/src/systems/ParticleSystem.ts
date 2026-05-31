import { RAINBOW_COLORS } from '../utils/Constants';
import { CollisionSystem } from '../game/CollisionSystem';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  gravity: number;
  active: boolean;
}

export class ParticleSystem {
  pool: Particle[];
  maxParticles: number = 300;

  constructor(maxParticles: number = 300) {
    this.maxParticles = maxParticles;
    this.pool = [];
    for (let i = 0; i < this.maxParticles; i++) {
      this.pool.push({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        life: 0,
        maxLife: 0,
        color: '#ffffff',
        size: 2,
        gravity: 200,
        active: false,
      });
    }
  }

  update(dt: number): void {
    for (const particle of this.pool) {
      if (particle.active) {
        particle.vy += particle.gravity * dt;
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.life -= dt;
        if (particle.life <= 0) {
          particle.active = false;
        }
      }
    }
  }

  spawn(
    x: number,
    y: number,
    vx: number,
    vy: number,
    color: string,
    life: number,
    size: number = 2,
    gravity: number = 200
  ): void {
    for (const particle of this.pool) {
      if (!particle.active) {
        particle.x = x;
        particle.y = y;
        particle.vx = vx;
        particle.vy = vy;
        particle.color = color;
        particle.life = life;
        particle.maxLife = life;
        particle.size = size;
        particle.gravity = gravity;
        particle.active = true;
        break;
      }
    }
  }

  spawnBurst(
    x: number,
    y: number,
    count: number,
    colors: string[],
    speed: number = 100,
    life: number = 0.8
  ): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.spawn(x, y, vx, vy, color, life);
    }
  }

  spawnRainbowBurst(x: number, y: number, count: number = 20): void {
    this.spawnBurst(x, y, count, RAINBOW_COLORS);
  }

  clear(): void {
    for (const particle of this.pool) {
      particle.active = false;
    }
  }

  getActiveParticles(): Particle[] {
    return this.pool.filter((p) => p.active);
  }
}
