import { PixelRenderer } from './PixelRenderer';

export class HUDRenderer {
  ctx: CanvasRenderingContext2D;
  pixelRenderer: PixelRenderer;
  width: number;

  constructor(ctx: CanvasRenderingContext2D, pixelRenderer: PixelRenderer, width: number) {
    this.ctx = ctx;
    this.pixelRenderer = pixelRenderer;
    this.width = width;
  }

  render(
    lives: number,
    maxLives: number,
    score: number,
    currentHeight: number,
    levelHeight: number,
    bossHp?: number,
    bossMaxHp?: number
  ): void {
    this.ctx.save();

    this.drawHearts(10, 10, lives, maxLives);

    this.pixelRenderer.drawText(`分数: ${score}`, this.width - 10, 10, '#FFFFFF', 10, 'right');

    this.drawHeightBar(this.width / 2 - 60, 8, 120, 8, currentHeight, levelHeight);

    if (bossHp !== undefined && bossMaxHp !== undefined) {
      this.drawBossHealthBar(this.width / 2 - 100, 25, 200, 12, bossHp, bossMaxHp);
    }

    this.ctx.restore();
  }

  private drawHearts(x: number, y: number, lives: number, maxLives: number): void {
    const heartSize = 12;
    const spacing = 16;

    for (let i = 0; i < maxLives; i++) {
      const heartX = x + i * spacing;
      const filled = i < lives;
      this.drawHeart(heartX, y, heartSize, filled);
    }
  }

  private drawHeart(x: number, y: number, size: number, filled: boolean): void {
    const color = filled ? '#FF0000' : '#FFFFFF';
    const outlineColor = '#000000';

    const pixels = [
      ['', 'X', '', '', 'X', ''],
      ['X', 'X', 'X', 'X', 'X', 'X'],
      ['X', 'X', 'X', 'X', 'X', 'X'],
      ['', 'X', 'X', 'X', 'X', ''],
      ['', '', 'X', 'X', '', ''],
      ['', '', '', '', '', ''],
    ];

    for (let row = 0; row < pixels.length; row++) {
      for (let col = 0; col < pixels[row].length; col++) {
        if (pixels[row][col] === 'X') {
          const px = x + col * 2;
          const py = y + row * 2;
          this.ctx.fillStyle = filled ? color : 'transparent';
          this.ctx.fillRect(px, py, 2, 2);
          if (!filled) {
            this.ctx.strokeStyle = outlineColor;
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(px, py, 2, 2);
          }
        }
      }
    }
  }

  private drawHeightBar(
    x: number,
    y: number,
    width: number,
    height: number,
    currentHeight: number,
    levelHeight: number
  ): void {
    const progress = Math.max(0, Math.min(1, 1 - currentHeight / levelHeight));

    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(x, y, width, height);

    const gradient = this.ctx.createLinearGradient(x, y, x + width, y);
    gradient.addColorStop(0, '#FF0000');
    gradient.addColorStop(0.2, '#FF7F00');
    gradient.addColorStop(0.4, '#FFFF00');
    gradient.addColorStop(0.6, '#00FF00');
    gradient.addColorStop(0.8, '#0000FF');
    gradient.addColorStop(1, '#9400D3');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, y, width * progress, height);

    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x, y, width, height);

    this.pixelRenderer.drawText('高度', x + width / 2, y + height + 2, '#FFFFFF', 8, 'center');
  }

  private drawBossHealthBar(
    x: number,
    y: number,
    width: number,
    height: number,
    bossHp: number,
    bossMaxHp: number
  ): void {
    const progress = Math.max(0, Math.min(1, bossHp / bossMaxHp));

    this.ctx.fillStyle = '#330000';
    this.ctx.fillRect(x, y, width, height);

    const gradient = this.ctx.createLinearGradient(x, y, x + width, y);
    gradient.addColorStop(0, '#FF0000');
    gradient.addColorStop(0.5, '#FF6600');
    gradient.addColorStop(1, '#FF0000');

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(x, y, width * progress, height);

    this.ctx.strokeStyle = '#FFD700';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, width, height);

    this.pixelRenderer.drawText('BOSS', x + width / 2, y - 12, '#FF0000', 10, 'center');
  }
}
