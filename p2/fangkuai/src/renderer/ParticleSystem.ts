export class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  size: number;

  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.vx = (Math.random() - 0.5) * 10;
    this.vy = (Math.random() - 0.5) * 10;
    this.maxLife = 60 + Math.random() * 30;
    this.life = this.maxLife;
    this.size = 3 + Math.random() * 4;
  }

  update(): boolean {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.2;
    this.vx *= 0.98;
    this.life--;
    return this.life > 0;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const alpha = this.life / this.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export class ParticleSystem {
  private particles: Particle[];

  constructor() {
    this.particles = [];
  }

  emit(x: number, y: number, color: string, count: number = 15): void {
    for (let i = 0; i < count; i++) {
      this.particles.push(new Particle(x, y, color));
    }
  }

  emitLine(lineY: number, blockSize: number, colors: string[], offsetX: number = 0): void {
    const centerY = lineY * blockSize + blockSize / 2;
    colors.forEach((color, i) => {
      const x = offsetX + i * blockSize + blockSize / 2;
      this.emit(x, centerY, color, 5);
    });
  }

  update(): void {
    this.particles = this.particles.filter(p => p.update());
  }

  draw(ctx: CanvasRenderingContext2D): void {
    this.particles.forEach(p => p.draw(ctx));
  }

  clear(): void {
    this.particles = [];
  }
}
