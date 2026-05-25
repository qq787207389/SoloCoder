
import * as PIXI from 'pixi.js';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: number;
  sprite: PIXI.Graphics;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private container: PIXI.Container;
  private pool: PIXI.Graphics[] = [];

  constructor(container: PIXI.Container) {
    this.container = container;
  }

  spawn(x: number, y: number, color: number, count: number = 5): void {
    for (let i = 0; i &lt; count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 100 + 50;
      const size = Math.random() * 4 + 2;
      
      let sprite: PIXI.Graphics;
      if (this.pool.length &gt; 0) {
        sprite = this.pool.pop()!;
        sprite.visible = true;
      } else {
        sprite = new PIXI.Graphics();
        this.container.addChild(sprite);
      }
      
      sprite.clear();
      sprite.beginFill(color);
      sprite.drawCircle(0, 0, size);
      sprite.endFill();

      const particle: Particle = {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 0.5 + Math.random() * 0.5,
        size,
        color,
        sprite
      };
      
      this.particles.push(particle);
    }
  }

  update(delta: number): void {
    for (let i = this.particles.length - 1; i &gt;= 0; i--) {
      const p = this.particles[i];
      p.life += delta;
      p.x += p.vx * delta;
      p.y += p.vy * delta;
      p.vx *= 0.95;
      p.vy *= 0.95;
      
      const alpha = 1 - p.life / p.maxLife;
      p.sprite.alpha = alpha;
      p.sprite.position.set(p.x, p.y);

      if (p.life &gt;= p.maxLife) {
        p.sprite.visible = false;
        this.pool.push(p.sprite);
        this.particles.splice(i, 1);
      }
    }
  }

  clear(): void {
    for (const p of this.particles) {
      p.sprite.visible = false;
      this.pool.push(p.sprite);
    }
    this.particles = [];
  }
}
