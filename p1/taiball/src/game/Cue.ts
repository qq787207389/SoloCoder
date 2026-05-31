import type { Cue as CueType } from '../types/game';
import { COLORS, PHYSICS } from '../config/constants';

export class Cue implements CueType {
  angle: number;
  power: number;
  isCharging: boolean;
  pullBack: number;
  private cueLength: number = 180;
  private cueWidth: number = 8;
  private tipWidth: number = 5;

  constructor() {
    this.angle = 0;
    this.power = 0;
    this.isCharging = false;
    this.pullBack = 0;
  }

  update(isCharging: boolean, power: number, angle: number): void {
    this.angle = angle;
    this.isCharging = isCharging;
    this.power = power;
    
    if (isCharging) {
      this.pullBack += (power * 60 - this.pullBack) * 0.2;
    } else {
      this.pullBack *= 0.85;
    }
  }

  render(ctx: CanvasRenderingContext2D, cueBallX: number, cueBallY: number): void {
    if (this.isCharging && this.pullBack < 1) {
      return;
    }

    ctx.save();
    ctx.translate(cueBallX, cueBallY);
    ctx.rotate(this.angle + Math.PI);

    const startOffset = PHYSICS.BALL_RADIUS + 5 + this.pullBack;
    const totalLength = this.cueLength + this.pullBack;

    const woodGrad = ctx.createLinearGradient(startOffset, 0, startOffset + totalLength, 0);
    woodGrad.addColorStop(0, '#D2691E');
    woodGrad.addColorStop(0.2, '#CD853F');
    woodGrad.addColorStop(0.5, '#D2691E');
    woodGrad.addColorStop(0.8, '#8B4513');
    woodGrad.addColorStop(1, '#654321');

    ctx.beginPath();
    ctx.moveTo(startOffset, -this.cueWidth / 2);
    ctx.lineTo(startOffset + 20, -this.tipWidth / 2);
    ctx.lineTo(startOffset + totalLength, -this.cueWidth / 2);
    ctx.lineTo(startOffset + totalLength, this.cueWidth / 2);
    ctx.lineTo(startOffset + 20, this.tipWidth / 2);
    ctx.lineTo(startOffset, this.cueWidth / 2);
    ctx.closePath();
    ctx.fillStyle = woodGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(startOffset, -this.tipWidth / 2);
    ctx.lineTo(startOffset + 18, -this.tipWidth / 2);
    ctx.lineTo(startOffset + 18, this.tipWidth / 2);
    ctx.lineTo(startOffset, this.tipWidth / 2);
    ctx.closePath();
    ctx.fillStyle = COLORS.CUE_TIP;
    ctx.fill();

    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(startOffset + 18, -this.tipWidth / 2 - 1, 3, this.tipWidth + 2);

    for (let i = 0; i < 8; i++) {
      const bandX = startOffset + 40 + i * 18;
      ctx.fillStyle = i % 2 === 0 ? '#8B4513' : '#CD853F';
      ctx.fillRect(bandX, -this.cueWidth / 2, 8, this.cueWidth);
    }

    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.beginPath();
    ctx.moveTo(startOffset, -this.cueWidth / 2);
    ctx.lineTo(startOffset + 20, -this.tipWidth / 2);
    ctx.lineTo(startOffset + totalLength, -this.cueWidth / 2);
    ctx.lineTo(startOffset + totalLength, this.cueWidth / 2);
    ctx.lineTo(startOffset + 20, this.tipWidth / 2);
    ctx.lineTo(startOffset, this.cueWidth / 2);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  renderAimLine(
    ctx: CanvasRenderingContext2D,
    cueBallX: number,
    cueBallY: number,
    power: number,
    _tableWidth: number,
    _tableHeight: number
  ): void {
    const lineLength = 80 + power * 200;
    const endX = cueBallX + Math.cos(this.angle) * lineLength;
    const endY = cueBallY + Math.sin(this.angle) * lineLength;

    ctx.save();
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + power * 0.5})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cueBallX + Math.cos(this.angle) * (PHYSICS.BALL_RADIUS + 8), cueBallY + Math.sin(this.angle) * (PHYSICS.BALL_RADIUS + 8));
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + power * 0.5})`;
    ctx.beginPath();
    ctx.arc(endX, endY, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  shoot(cueBall: { vx: number; vy: number }, power: number): void {
    cueBall.vx = Math.cos(this.angle) * power * PHYSICS.MAX_POWER;
    cueBall.vy = Math.sin(this.angle) * power * PHYSICS.MAX_POWER;
  }

  reset(): void {
    this.power = 0;
    this.isCharging = false;
    this.pullBack = 0;
  }
}
