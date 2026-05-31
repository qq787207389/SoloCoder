import type { Ball as BallType, BallType as BallTypeEnum } from '../types/game';
import { PHYSICS, BALL_COLORS } from '../config/constants';

export class Ball implements BallType {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  number: number;
  rotation: number;
  isPotted: boolean;
  isStriped: boolean;
  type: BallTypeEnum;
  isSleeping: boolean;
  squash: number;
  pottedAnimation: number;
  pocketX: number;
  pocketY: number;

  constructor(id: number, x: number, y: number) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = PHYSICS.BALL_RADIUS;
    this.color = BALL_COLORS[id] || '#FFFFFF';
    this.number = id;
    this.rotation = 0;
    this.isPotted = false;
    this.isStriped = id >= 9 && id <= 15;
    this.isSleeping = false;
    this.squash = 0;
    this.pottedAnimation = 0;
    this.pocketX = 0;
    this.pocketY = 0;

    if (id === 0) {
      this.type = 'cue';
    } else if (id === 8) {
      this.type = 'eight';
    } else if (this.isStriped) {
      this.type = 'stripe';
    } else {
      this.type = 'solid';
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (this.isPotted) {
      if (this.pottedAnimation < 1) {
        this.pottedAnimation += 0.05;
        const scale = 1 - this.pottedAnimation * 0.5;
        const alpha = 1 - this.pottedAnimation;
        const px = this.x + (this.pocketX - this.x) * this.pottedAnimation;
        const py = this.y + (this.pocketY - this.y) * this.pottedAnimation;
        this.drawBall(ctx, px, py, scale, alpha);
      }
      return;
    }

    this.drawBall(ctx, this.x, this.y, 1, 1);
  }

  private drawBall(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    alpha: number
  ): void {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);

    const squashX = 1 + this.squash * 0.2;
    const squashY = 1 - this.squash * 0.2;
    ctx.scale(squashX * scale, squashY * scale);

    const gradient = ctx.createRadialGradient(
      -this.radius * 0.3,
      -this.radius * 0.3,
      0,
      0,
      0,
      this.radius
    );

    if (this.type === 'cue') {
      gradient.addColorStop(0, '#FFFFFF');
      gradient.addColorStop(0.5, '#F0F0F0');
      gradient.addColorStop(1, '#D0D0D0');
    } else if (this.isStriped) {
      gradient.addColorStop(0, '#FFFFFF');
      gradient.addColorStop(0.3, '#FFFFFF');
      gradient.addColorStop(0.4, this.color);
      gradient.addColorStop(0.6, this.color);
      gradient.addColorStop(0.7, '#FFFFFF');
      gradient.addColorStop(1, '#E0E0E0');
    } else {
      gradient.addColorStop(0, this.lightenColor(this.color, 50));
      gradient.addColorStop(0.5, this.color);
      gradient.addColorStop(1, this.darkenColor(this.color, 30));
    }

    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.save();
    ctx.rotate(this.rotation);
    const stripeGradient = ctx.createLinearGradient(-this.radius, 0, this.radius, 0);
    if (this.isStriped) {
      stripeGradient.addColorStop(0, 'transparent');
      stripeGradient.addColorStop(0.25, 'transparent');
      stripeGradient.addColorStop(0.3, this.color);
      stripeGradient.addColorStop(0.7, this.color);
      stripeGradient.addColorStop(0.75, 'transparent');
      stripeGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = stripeGradient;
      ctx.fill();
    }
    ctx.restore();

    if (this.id !== 0) {
      ctx.save();
      ctx.rotate(this.rotation);
      const circleRadius = this.radius * 0.45;
      
      ctx.beginPath();
      ctx.arc(0, 0, circleRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#CCCCCC';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#1a1a1a';
      ctx.font = `bold ${this.radius * 0.55}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.id.toString(), 0, 1);
      ctx.restore();
    }

    if (this.type === 'cue') {
      ctx.beginPath();
      ctx.arc(-this.radius * 0.25, -this.radius * 0.25, this.radius * 0.3, 0, Math.PI * 2);
      const highlightGrad = ctx.createRadialGradient(
        -this.radius * 0.25,
        -this.radius * 0.25,
        0,
        -this.radius * 0.25,
        -this.radius * 0.25,
        this.radius * 0.3
      );
      highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = highlightGrad;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  private lightenColor(color: string, percent: number): string {
    const num = parseInt(color.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
    const B = Math.min(255, (num & 0x0000ff) + amt);
    return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
  }

  private darkenColor(color: string, percent: number): string {
    const num = parseInt(color.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
    const B = Math.max(0, (num & 0x0000ff) - amt);
    return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
  }

  setPocketPosition(pocketX: number, pocketY: number): void {
    this.pocketX = pocketX;
    this.pocketY = pocketY;
  }

  reset(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.rotation = 0;
    this.isPotted = false;
    this.isSleeping = false;
    this.squash = 0;
    this.pottedAnimation = 0;
  }
}
