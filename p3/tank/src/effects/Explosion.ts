import { GameObject } from '../core/GameObject';

export class Explosion extends GameObject {
  private timer: number;
  private duration: number;
  private maxSize: number;

  constructor(x: number, y: number, size: number = 40, duration: number = 300) {
    super(x, y, size, size);
    this.timer = duration;
    this.duration = duration;
    this.maxSize = size;
  }

  update(deltaTime: number): void {
    this.timer -= deltaTime;
    if (this.timer <= 0) {
      this.destroy();
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const progress = 1 - this.timer / this.duration;
    const currentSize = this.maxSize * progress;
    const alpha = 1 - progress;

    const centerX = this.position.x + this.maxSize / 2;
    const centerY = this.position.y + this.maxSize / 2;

    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, currentSize / 2);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
    gradient.addColorStop(0.3, `rgba(255, 200, 0, ${alpha})`);
    gradient.addColorStop(0.6, `rgba(255, 100, 0, ${alpha})`);
    gradient.addColorStop(1, `rgba(100, 0, 0, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, currentSize / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
