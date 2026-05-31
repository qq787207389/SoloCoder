import { GAME_WIDTH, GAME_HEIGHT } from '../utils/Constants';

type Theme = 'forest' | 'castle' | 'volcano';

export class ParallaxBG {
  private stars: { x: number; y: number; size: number; brightness: number }[] = [];

  constructor() {
    for (let i = 0; i < 60; i++) {
      this.stars.push({
        x: Math.random() * GAME_WIDTH * 3,
        y: Math.random() * GAME_HEIGHT * 0.6,
        size: Math.random() < 0.3 ? 2 : 1,
        brightness: 0.3 + Math.random() * 0.7,
      });
    }
  }

  render(ctx: CanvasRenderingContext2D, cameraX: number, moonPhase: number, theme: Theme): void {
    this.drawFarLayer(ctx, cameraX, moonPhase);
    this.drawMidLayer(ctx, cameraX, theme);
    this.drawNearLayer(ctx, cameraX);
  }

  private drawFarLayer(ctx: CanvasRenderingContext2D, cameraX: number, moonPhase: number): void {
    const grad = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    grad.addColorStop(0, '#0a0a1a');
    grad.addColorStop(1, '#1a1a3e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    for (const star of this.stars) {
      const sx = ((star.x - cameraX * 0.05) % (GAME_WIDTH * 3) + GAME_WIDTH * 3) % (GAME_WIDTH * 3);
      if (sx > GAME_WIDTH + 5) continue;
      const alpha = star.brightness;
      ctx.fillStyle = `rgba(232,224,208,${alpha})`;
      ctx.fillRect(Math.round(sx), Math.round(star.y), star.size, star.size);
    }

    this.drawMoon(ctx, 350 - cameraX * 0.1, 50, 30, moonPhase);

    ctx.fillStyle = '#15152e';
    ctx.beginPath();
    ctx.moveTo(0, GAME_HEIGHT);
    const mw = GAME_WIDTH + 40;
    for (let x = -20; x <= mw; x += 60) {
      const ox = ((x - cameraX * 0.1) % mw + mw) % mw - 20;
      const h = 40 + Math.sin(ox * 0.01 + 1) * 30 + Math.sin(ox * 0.023) * 20;
      ctx.lineTo(ox, GAME_HEIGHT - h);
    }
    ctx.lineTo(GAME_WIDTH + 20, GAME_HEIGHT);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#10102a';
    ctx.beginPath();
    ctx.moveTo(0, GAME_HEIGHT);
    for (let x = -20; x <= mw; x += 40) {
      const ox = ((x - cameraX * 0.15) % mw + mw) % mw - 20;
      const h = 25 + Math.sin(ox * 0.015 + 3) * 20 + Math.sin(ox * 0.03 + 1) * 15;
      ctx.lineTo(ox, GAME_HEIGHT - h);
    }
    ctx.lineTo(GAME_WIDTH + 20, GAME_HEIGHT);
    ctx.closePath();
    ctx.fill();
  }

  drawMoon(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, phase: number): void {
    const sx = ((x % (GAME_WIDTH + radius * 4)) + GAME_WIDTH + radius * 4) % (GAME_WIDTH + radius * 4);

    ctx.save();
    ctx.beginPath();
    ctx.arc(sx, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#e8e0d0';
    ctx.fill();

    ctx.globalCompositeOperation = 'destination-out';
    const offset = radius * 2 * (1 - phase);
    ctx.beginPath();
    ctx.arc(sx + offset - radius, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    ctx.beginPath();
    ctx.arc(sx, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#e8e0d0';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(sx, y, radius + 4, 0, Math.PI * 2);
    const glowAlpha = phase * 0.15;
    ctx.fillStyle = `rgba(232,224,208,${glowAlpha})`;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(sx, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#e8e0d0';
    ctx.fill();

    const shadowOffset = radius * 2 * (1 - phase);
    ctx.save();
    ctx.beginPath();
    ctx.arc(sx, y, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.beginPath();
    ctx.arc(sx - radius + shadowOffset, y, radius + 1, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0a1a';
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  private drawMidLayer(ctx: CanvasRenderingContext2D, cameraX: number, theme: Theme): void {
    const scrollX = cameraX * 0.3;

    if (theme === 'forest') {
      this.drawBamboo(ctx, scrollX);
    } else if (theme === 'castle') {
      this.drawCastleWalls(ctx, scrollX);
    } else {
      this.drawVolcanicRock(ctx, scrollX);
    }
  }

  private drawBamboo(ctx: CanvasRenderingContext2D, scrollX: number): void {
    ctx.fillStyle = '#2d5a2e';
    for (let i = 0; i < 12; i++) {
      const bx = ((i * 80 + 20 - scrollX) % (GAME_WIDTH + 100) + GAME_WIDTH + 100) % (GAME_WIDTH + 100) - 50;
      const bh = 100 + (i % 3) * 30;
      ctx.fillRect(bx, GAME_HEIGHT - bh, 4, bh);
      ctx.fillStyle = '#1a4a1e';
      for (let ny = GAME_HEIGHT - bh + 15; ny < GAME_HEIGHT; ny += 20) {
        ctx.fillRect(bx - 1, ny, 6, 2);
      }
      ctx.fillStyle = '#2d5a2e';
      if (i % 2 === 0) {
        ctx.fillRect(bx + 4, GAME_HEIGHT - bh + 10, 15, 2);
        ctx.fillRect(bx + 4, GAME_HEIGHT - bh + 8, 2, 4);
        ctx.fillRect(bx + 14, GAME_HEIGHT - bh + 6, 8, 2);
      }
    }
  }

  private drawCastleWalls(ctx: CanvasRenderingContext2D, scrollX: number): void {
    ctx.fillStyle = '#2a2a3e';
    for (let i = 0; i < 6; i++) {
      const wx = ((i * 100 - scrollX) % (GAME_WIDTH + 200) + GAME_WIDTH + 200) % (GAME_WIDTH + 200) - 100;
      const wh = 60 + (i % 2) * 30;
      ctx.fillRect(wx, GAME_HEIGHT - wh, 80, wh);
      for (let bx = wx; bx < wx + 80; bx += 10) {
        ctx.fillRect(bx, GAME_HEIGHT - wh - 8, 6, 8);
      }
      if (i % 3 === 0) {
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(wx + 35, GAME_HEIGHT - wh + 20, 10, 20);
        ctx.fillStyle = '#2a2a3e';
      }
    }
  }

  private drawVolcanicRock(ctx: CanvasRenderingContext2D, scrollX: number): void {
    ctx.fillStyle = '#3a1a0a';
    for (let i = 0; i < 8; i++) {
      const rx = ((i * 70 + 10 - scrollX) % (GAME_WIDTH + 150) + GAME_WIDTH + 150) % (GAME_WIDTH + 150) - 75;
      const rh = 40 + (i % 3) * 25;
      ctx.beginPath();
      ctx.moveTo(rx, GAME_HEIGHT);
      ctx.lineTo(rx + 15, GAME_HEIGHT - rh);
      ctx.lineTo(rx + 35, GAME_HEIGHT - rh + 10);
      ctx.lineTo(rx + 50, GAME_HEIGHT - rh - 5);
      ctx.lineTo(rx + 60, GAME_HEIGHT);
      ctx.closePath();
      ctx.fill();
    }
  }

  private drawNearLayer(ctx: CanvasRenderingContext2D, cameraX: number): void {
    const scrollX = cameraX * 0.6;
    ctx.fillStyle = '#0a0a1a';

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 50);
    ctx.lineTo(30, 35);
    ctx.lineTo(60, 45);
    ctx.lineTo(80, 20);
    ctx.lineTo(110, 40);
    ctx.lineTo(130, 55);
    ctx.lineTo(150, 30);
    ctx.lineTo(170, 50);
    ctx.lineTo(190, 10);
    ctx.lineTo(210, 40);
    ctx.lineTo(230, 0);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(GAME_WIDTH, 0);
    ctx.lineTo(GAME_WIDTH, 40);
    ctx.lineTo(GAME_WIDTH - 25, 25);
    ctx.lineTo(GAME_WIDTH - 55, 45);
    ctx.lineTo(GAME_WIDTH - 80, 15);
    ctx.lineTo(GAME_WIDTH - 110, 35);
    ctx.lineTo(GAME_WIDTH - 140, 50);
    ctx.lineTo(GAME_WIDTH - 160, 20);
    ctx.lineTo(GAME_WIDTH - 185, 45);
    ctx.lineTo(GAME_WIDTH - 200, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#0d0d1a';
    for (let i = 0; i < 10; i++) {
      const gx = ((i * 55 + 10 - scrollX) % (GAME_WIDTH + 60) + GAME_WIDTH + 60) % (GAME_WIDTH + 60) - 30;
      ctx.fillRect(gx, GAME_HEIGHT - 6, 3, 6);
      ctx.fillRect(gx - 2, GAME_HEIGHT - 4, 2, 4);
      ctx.fillRect(gx + 3, GAME_HEIGHT - 5, 2, 5);
    }

    ctx.fillStyle = '#1a1a2e';
    for (let i = 0; i < 5; i++) {
      const rx = ((i * 110 + 50 - scrollX) % (GAME_WIDTH + 120) + GAME_WIDTH + 120) % (GAME_WIDTH + 120) - 60;
      ctx.beginPath();
      ctx.moveTo(rx, GAME_HEIGHT);
      ctx.lineTo(rx + 4, GAME_HEIGHT - 5);
      ctx.lineTo(rx + 8, GAME_HEIGHT - 3);
      ctx.lineTo(rx + 12, GAME_HEIGHT);
      ctx.closePath();
      ctx.fill();
    }
  }
}
