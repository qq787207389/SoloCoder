import { GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
  type: string;
  rotation: number;
  rotSpeed: number;
  startX: number;
}

export class ParticleSystem {
  particles: Particle[] = [];
  afterimagePositions: { x: number; y: number; life: number }[] = [];
  private backgroundLeafTimer = 0;
  private frameCount = 0;

  emit(x: number, y: number, count: number, type: string): void {
    for (let i = 0; i < count; i++) {
      const p = this.createParticle(x, y, type);
      if (p) this.particles.push(p);
    }
  }

  private createParticle(x: number, y: number, type: string): Particle | null {
    switch (type) {
      case 'sakura': {
        const colors = ['#ffb7c5', '#ff8fa3'];
        return {
          x, y,
          vx: (Math.random() - 0.5) * 1,
          vy: 0.3 + Math.random() * 0.7,
          life: 60 + Math.random() * 60,
          maxLife: 120,
          size: 3 + Math.random() * 2,
          color: colors[Math.random() < 0.5 ? 0 : 1],
          alpha: 1,
          type,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.05,
          startX: x,
        };
      }
      case 'spark': {
        const colors = ['#ff6600', '#ffaa00'];
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 2;
        return {
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 10 + Math.random() * 10,
          maxLife: 20,
          size: 2 + Math.random() * 1,
          color: colors[Math.random() < 0.5 ? 0 : 1],
          alpha: 1,
          type,
          rotation: 0,
          rotSpeed: 0,
          startX: x,
        };
      }
      case 'hit_spark': {
        const colors = ['#ff6600', '#ffaa00', '#ffffff'];
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 4;
        return {
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 8 + Math.random() * 12,
          maxLife: 20,
          size: 3 + Math.random() * 5,
          color: colors[Math.floor(Math.random() * 3)],
          alpha: 1,
          type,
          rotation: 0,
          rotSpeed: 0,
          startX: x,
        };
      }
      case 'leaf': {
        const colors = ['#c0392b', '#e67e22', '#d35400'];
        return {
          x, y,
          vx: (Math.random() - 0.5) * 0.5,
          vy: 0.3 + Math.random() * 0.5,
          life: 120 + Math.random() * 120,
          maxLife: 240,
          size: 4 + Math.random() * 2,
          color: colors[Math.floor(Math.random() * 3)],
          alpha: 1,
          type,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.02,
          startX: x,
        };
      }
      case 'ribbon': {
        const colors = ['#e8e0d0', '#ffb7c5'];
        return {
          x, y,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -0.2 + Math.random() * 0.4,
          life: 80 + Math.random() * 70,
          maxLife: 150,
          size: 3,
          color: colors[Math.random() < 0.5 ? 0 : 1],
          alpha: 1,
          type,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.03,
          startX: x,
        };
      }
      case 'afterimage': {
        return {
          x, y,
          vx: 0,
          vy: 0,
          life: 8 + Math.random() * 4,
          maxLife: 12,
          size: 0,
          color: '#2d2d5e',
          alpha: 0.5,
          type,
          rotation: 0,
          rotSpeed: 0,
          startX: x,
        };
      }
      case 'ember': {
        return {
          x, y,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -0.5 - Math.random() * 1,
          life: 40 + Math.random() * 40,
          maxLife: 80,
          size: 2,
          color: '#e74c3c',
          alpha: 1,
          type,
          rotation: 0,
          rotSpeed: 0,
          startX: x,
        };
      }
      default:
        return null;
    }
  }

  update(_dt: number): void {
    this.frameCount++;
    this.backgroundLeafTimer--;
    if (this.backgroundLeafTimer <= 0) {
      const lx = Math.random() * GAME_WIDTH;
      const ly = -10;
      this.emit(lx, ly, 1, 'leaf');
      this.backgroundLeafTimer = 30 + Math.random() * 30;
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life--;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx;
      p.y += p.vy;
      p.alpha = p.life / p.maxLife;

      if (p.type === 'leaf') {
        p.x = p.startX + Math.sin(this.frameCount * 0.03 + p.startX * 0.1) * 15;
        p.rotation += p.rotSpeed;
      } else if (p.type === 'sakura') {
        p.rotation += p.rotSpeed;
      } else if (p.type === 'ribbon') {
        p.x = p.startX + Math.sin(this.frameCount * 0.04 + p.startX * 0.15) * 8;
        p.rotation += p.rotSpeed;
      } else if (p.type === 'spark' || p.type === 'hit_spark') {
        p.vx *= 0.95;
        p.vy *= 0.95;
      } else if (p.type === 'ember') {
        p.x += Math.sin(this.frameCount * 0.1 + p.startX) * 0.3;
      }
    }

    for (let i = this.afterimagePositions.length - 1; i >= 0; i--) {
      this.afterimagePositions[i].life--;
      if (this.afterimagePositions[i].life <= 0) {
        this.afterimagePositions.splice(i, 1);
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number): void {
    for (const p of this.particles) {
      if (p.type === 'afterimage') continue;

      const sx = p.x - cameraX;
      if (sx < -20 || sx > GAME_WIDTH + 20) continue;

      ctx.save();
      ctx.globalAlpha = p.alpha;

      if (p.type === 'sakura' || p.type === 'leaf' || p.type === 'ribbon') {
        ctx.translate(sx, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else if (p.type === 'spark' || p.type === 'hit_spark') {
        ctx.fillStyle = p.color;
        ctx.fillRect(sx - p.size / 2, p.y - p.size / 2, p.size, p.size);
      } else if (p.type === 'ember') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(sx, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = p.color;
        ctx.fillRect(sx - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }

      ctx.restore();
    }

    for (const ai of this.afterimagePositions) {
      const sx = ai.x - cameraX;
      if (sx < -30 || sx > GAME_WIDTH + 30) continue;
      const alpha = (ai.life / 12) * 0.3;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#2d2d5e';
      ctx.fillRect(sx - 6, ai.y - 8, 12, 16);
      ctx.restore();
    }
  }
}
