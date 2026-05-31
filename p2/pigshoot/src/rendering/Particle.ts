import { GAME_HEIGHT } from '../utils/constants';

export interface ParticleData {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'circle' | 'square' | 'star';
}

export class ParticleSystem {
  private particles: ParticleData[] = [];

  public update(deltaTime: number): void {
    const dt = deltaTime / 1000;
    
    this.particles.forEach(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 200 * dt;
      p.life -= deltaTime;
    });

    this.particles = this.particles.filter(p => p.life > 0 && p.y < GAME_HEIGHT + 20);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.particles.forEach(p => {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      switch (p.type) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'square':
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
          break;
        case 'star':
          this.drawStar(ctx, p.x, p.y, p.size, p.size * 0.5, 5);
          break;
      }
    });
    ctx.globalAlpha = 1;
  }

  private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, outerR: number, innerR: number, points: number): void {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();
  }

  public emit(x: number, y: number, count: number, options: Partial<ParticleData> = {}): void {
    for (let i = 0; i < count; i++) {
      const particle: ParticleData = {
        x,
        y,
        vx: (Math.random() - 0.5) * 200,
        vy: (Math.random() - 0.5) * 200 - 100,
        life: 500 + Math.random() * 500,
        maxLife: 1000,
        color: '#FFFFFF',
        size: 3 + Math.random() * 3,
        type: 'circle',
        ...options
      };
      this.particles.push(particle);
    }
  }

  public emitBalloonPop(x: number, y: number, color: string): void {
    this.emit(x, y, 12, {
      color,
      size: 4,
      vx: (Math.random() - 0.5) * 300,
      vy: (Math.random() - 0.5) * 300,
      type: 'circle',
      life: 400,
      maxLife: 400
    });
  }

  public emitScorePopup(x: number, y: number, score: number, ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#FFFF00';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`+${score}`, x, y);
  }

  public emitWolfHit(x: number, y: number): void {
    this.emit(x, y, 8, {
      color: '#808080',
      size: 3,
      type: 'square',
      life: 300,
      maxLife: 300
    });
  }

  public emitBonusCollect(x: number, y: number, color: string): void {
    this.emit(x, y, 15, {
      color,
      size: 4,
      type: 'star',
      vx: (Math.random() - 0.5) * 250,
      vy: -150 - Math.random() * 100,
      life: 600,
      maxLife: 600
    });
  }

  public emitHiddenItem(x: number, y: number): void {
    this.emit(x, y, 20, {
      color: '#FFD700',
      size: 5,
      type: 'star',
      life: 800,
      maxLife: 800
    });
  }

  public clear(): void {
    this.particles = [];
  }
}
