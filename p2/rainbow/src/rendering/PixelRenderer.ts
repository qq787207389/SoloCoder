export class PixelRenderer {
  public ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  setPixelated(): void {
    this.ctx.imageSmoothingEnabled = false;
  }

  clear(color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
  }

  drawPixel(x: number, y: number, color: string, size: number = 1): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.floor(x), Math.floor(y), size, size);
  }

  drawRect(x: number, y: number, w: number, h: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
  }

  drawRectOutline(x: number, y: number, w: number, h: number, color: string, thickness: number = 1): void {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = thickness;
    this.ctx.strokeRect(Math.floor(x), Math.floor(y), w, h);
  }

  drawPixelRect(x: number, y: number, pixels: string[][]): void {
    for (let row = 0; row < pixels.length; row++) {
      for (let col = 0; col < pixels[row].length; col++) {
        const color = pixels[row][col];
        if (color && color !== '') {
          this.drawPixel(x + col, y + row, color, 1);
        }
      }
    }
  }

  drawCircle(x: number, y: number, r: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(Math.floor(x), Math.floor(y), r, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawLine(x1: number, y1: number, x2: number, y2: number, color: string, thickness: number = 1): void {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = thickness;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(Math.floor(x1), Math.floor(y1));
    this.ctx.lineTo(Math.floor(x2), Math.floor(y2));
    this.ctx.stroke();
  }

  drawRainbowLine(x1: number, y1: number, x2: number, y2: number, colors: string[], thickness: number = 4, alpha: number = 1): void {
    if (colors.length === 0) return;

    if (colors.length === 1) {
      this.drawLine(x1, y1, x2, y2, colors[0], thickness);
      return;
    }

    const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
    const step = 1 / (colors.length - 1);
    for (let i = 0; i < colors.length; i++) {
      gradient.addColorStop(i * step, colors[i]);
    }

    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = thickness;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(Math.floor(x1), Math.floor(y1));
    this.ctx.lineTo(Math.floor(x2), Math.floor(y2));
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawCurvedRainbow(x1: number, y1: number, x2: number, y2: number, arcHeight: number, colors: string[], thickness: number = 6, alpha: number = 1): void {
    if (colors.length === 0) return;

    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2 - arcHeight;

    if (colors.length === 1) {
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.strokeStyle = colors[0];
      this.ctx.lineWidth = thickness;
      this.ctx.lineCap = 'round';
      this.ctx.beginPath();
      this.ctx.moveTo(Math.floor(x1), Math.floor(y1));
      this.ctx.quadraticCurveTo(Math.floor(midX), Math.floor(midY), Math.floor(x2), Math.floor(y2));
      this.ctx.stroke();
      this.ctx.restore();
      return;
    }

    const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
    const step = 1 / (colors.length - 1);
    for (let i = 0; i < colors.length; i++) {
      gradient.addColorStop(i * step, colors[i]);
    }

    this.ctx.save();
    this.ctx.globalAlpha = alpha;
    this.ctx.strokeStyle = gradient;
    this.ctx.lineWidth = thickness;
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.ctx.moveTo(Math.floor(x1), Math.floor(y1));
    this.ctx.quadraticCurveTo(Math.floor(midX), Math.floor(midY), Math.floor(x2), Math.floor(y2));
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawText(text: string, x: number, y: number, color: string, size: number = 8, align: CanvasTextAlign = 'left'): void {
    this.ctx.fillStyle = color;
    this.ctx.font = `bold ${size}px 'Courier New', monospace`;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = 'top';
    this.ctx.fillText(text, Math.floor(x), Math.floor(y));
  }

  getTextWidth(text: string, size: number): number {
    this.ctx.font = `bold ${size}px 'Courier New', monospace`;
    return this.ctx.measureText(text).width;
  }
}
