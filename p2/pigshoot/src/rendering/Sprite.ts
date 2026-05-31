import { COLORS } from '../utils/constants';

export class SpriteRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public drawPixelRect(
    x: number, y: number,
    w: number, h: number,
    color: string
  ): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(Math.floor(x), Math.floor(y), w, h);
  }

  public drawMamaPig(x: number, y: number, scale: number = 1): void {
    const s = scale;
    const px = 2 * s;
    
    this.drawPixelRect(x + 4*px, y + 0*px, 8*px, 4*px, COLORS.PIG_PINK);
    this.drawPixelRect(x + 2*px, y + 2*px, 12*px, 6*px, COLORS.PIG_PINK);
    
    this.drawPixelRect(x + 4*px, y + 4*px, 2*px, 2*px, '#000');
    this.drawPixelRect(x + 10*px, y + 4*px, 2*px, 2*px, '#000');
    
    this.drawPixelRect(x + 7*px, y + 6*px, 2*px, 1*px, '#FF6B6B');
    
    this.drawPixelRect(x + 3*px, y + 7*px, 2*px, 2*px, COLORS.PIG_PINK);
    this.drawPixelRect(x + 11*px, y + 7*px, 2*px, 2*px, COLORS.PIG_PINK);
    
    this.drawPixelRect(x + 4*px, y + 1*px, 8*px, 2*px, COLORS.PIG_PINK_DARK);
    this.drawPixelRect(x + 6*px, y + 0*px, 4*px, 1*px, COLORS.PIG_PINK_DARK);
    
    this.drawPixelRect(x + 2*px, y + 8*px, 12*px, 8*px, COLORS.PIG_PINK);
    
    this.drawPixelRect(x + 4*px, y + 12*px, 8*px, 1*px, COLORS.PIG_PINK_DARK);
    
    this.drawPixelRect(x + 2*px, y + 16*px, 3*px, 4*px, COLORS.PIG_PINK_DARK);
    this.drawPixelRect(x + 11*px, y + 16*px, 3*px, 4*px, COLORS.PIG_PINK_DARK);
    
    this.drawPixelRect(x + 14*px, y + 8*px, 2*px, 6*px, COLORS.ARROW_BROWN);
    this.drawPixelRect(x + 16*px, y + 6*px, 1*px, 2*px, COLORS.ARROW_BROWN);
    this.drawPixelRect(x + 16*px, y + 14*px, 1*px, 2*px, COLORS.ARROW_BROWN);
    this.ctx.strokeStyle = COLORS.ARROW_BROWN;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(x + 16*px + 0.5, y + 7*px + 0.5);
    this.ctx.quadraticCurveTo(x + 19*px, y + 11*px, x + 16*px + 0.5, y + 15*px + 0.5);
    this.ctx.stroke();
  }

  public drawWolf(x: number, y: number, isPink: boolean = false, scale: number = 1): void {
    const s = scale;
    const px = 2 * s;
    const bodyColor = isPink ? COLORS.WOLF_PINK : COLORS.WOLF_GRAY;
    const darkColor = isPink ? COLORS.WOLF_PINK_LIGHT : COLORS.WOLF_GRAY_DARK;
    
    this.drawPixelRect(x + 2*px, y + 0*px, 3*px, 4*px, bodyColor);
    this.drawPixelRect(x + 9*px, y + 0*px, 3*px, 4*px, bodyColor);
    
    this.drawPixelRect(x + 1*px, y + 2*px, 12*px, 6*px, bodyColor);
    
    this.drawPixelRect(x + 3*px, y + 4*px, 2*px, 2*px, isPink ? '#FF0000' : '#FFFF00');
    this.drawPixelRect(x + 9*px, y + 4*px, 2*px, 2*px, isPink ? '#FF0000' : '#FFFF00');
    this.drawPixelRect(x + 3.5*px, y + 4.5*px, 1*px, 1*px, '#000');
    this.drawPixelRect(x + 9.5*px, y + 4.5*px, 1*px, 1*px, '#000');
    
    this.drawPixelRect(x + 5*px, y + 6*px, 4*px, 2*px, '#000');
    this.drawPixelRect(x + 6*px, y + 6*px, 2*px, 1*px, darkColor);
    
    this.drawPixelRect(x + 0*px, y + 8*px, 14*px, 8*px, bodyColor);
    
    this.drawPixelRect(x + 2*px, y + 16*px, 3*px, 4*px, darkColor);
    this.drawPixelRect(x + 9*px, y + 16*px, 3*px, 4*px, darkColor);
    
    this.drawPixelRect(x + 13*px, y + 10*px, 3*px, 2*px, bodyColor);
    this.drawPixelRect(x + 15*px, y + 12*px, 2*px, 2*px, bodyColor);
  }

  public drawBalloon(x: number, y: number, radius: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.ellipse(x, y, radius, radius * 1.2, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    this.ctx.beginPath();
    this.ctx.ellipse(x - radius * 0.3, y - radius * 0.4, radius * 0.25, radius * 0.35, -0.3, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.fillStyle = color;
    this.drawPixelRect(x - 3, y + radius * 1.2, 6, 4, color);
    
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + radius * 1.2 + 4);
    this.ctx.lineTo(x, y + radius * 1.2 + 16);
    this.ctx.stroke();
  }

  public drawBasket(x: number, y: number, width: number, height: number): void {
    this.drawPixelRect(x, y + height - 12, width, 12, COLORS.WOOD_BROWN);
    this.drawPixelRect(x + 2, y + height - 10, width - 4, 8, COLORS.WOOD_DARK);
    
    for (let i = 0; i < 4; i++) {
      this.drawPixelRect(x + 4 + i * 12, y + height - 8, 8, 4, COLORS.WOOD_BROWN);
    }
    
    this.drawPixelRect(x, y, 4, height - 12, COLORS.WOOD_BROWN);
    this.drawPixelRect(x + width - 4, y, 4, height - 12, COLORS.WOOD_BROWN);
    
    this.drawPixelRect(x, y, width, 4, COLORS.WOOD_BROWN);
    this.drawPixelRect(x, y + height - 16, width, 4, COLORS.WOOD_BROWN);
  }

  public drawRope(x: number, topY: number, bottomY: number): void {
    this.ctx.strokeStyle = COLORS.ROPE_GRAY;
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(x, topY);
    this.ctx.lineTo(x, bottomY);
    this.ctx.stroke();
    
    this.ctx.strokeStyle = '#555';
    this.ctx.lineWidth = 1;
    for (let y = topY; y < bottomY; y += 8) {
      this.ctx.beginPath();
      this.ctx.moveTo(x - 2, y);
      this.ctx.lineTo(x + 2, y + 4);
      this.ctx.stroke();
    }
  }

  public drawArrow(x: number, y: number, width: number): void {
    this.drawPixelRect(x, y + 2, width - 8, 2, COLORS.ARROW_BROWN);
    
    this.ctx.fillStyle = '#C0C0C0';
    this.ctx.beginPath();
    this.ctx.moveTo(x + width, y + 3);
    this.ctx.lineTo(x + width - 10, y);
    this.ctx.lineTo(x + width - 10, y + 6);
    this.ctx.closePath();
    this.ctx.fill();
    
    this.drawPixelRect(x, y, 2, 6, '#FF6B6B');
    this.drawPixelRect(x, y, 6, 2, '#FF6B6B');
    this.drawPixelRect(x, y + 4, 6, 2, '#FF6B6B');
  }

  public drawMeat(x: number, y: number, width: number, height: number): void {
    this.drawPixelRect(x + 8, y + 2, width - 12, height - 4, COLORS.MEAT_PINK);
    
    this.drawPixelRect(x + 10, y + 4, 4, 2, '#FF8888');
    this.drawPixelRect(x + 16, y + 6, 3, 2, '#FF8888');
    
    this.drawPixelRect(x, y + 4, 10, height - 8, COLORS.MEAT_BONE);
    this.drawPixelRect(x, y + 2, 4, 2, COLORS.MEAT_BONE);
    this.drawPixelRect(x, y + height - 4, 4, 2, COLORS.MEAT_BONE);
    
    this.drawPixelRect(x + width - 6, y + 4, 6, height - 8, COLORS.MEAT_BONE);
    this.drawPixelRect(x + width - 4, y + 2, 4, 2, COLORS.MEAT_BONE);
    this.drawPixelRect(x + width - 4, y + height - 4, 4, 2, COLORS.MEAT_BONE);
  }

  public drawRock(x: number, y: number, size: number): void {
    this.ctx.fillStyle = COLORS.ROCK_GRAY;
    this.ctx.beginPath();
    this.ctx.moveTo(x + size * 0.5, y);
    this.ctx.lineTo(x + size, y + size * 0.3);
    this.ctx.lineTo(x + size * 0.9, y + size);
    this.ctx.lineTo(x + size * 0.1, y + size);
    this.ctx.lineTo(x, y + size * 0.4);
    this.ctx.closePath();
    this.ctx.fill();
    
    this.ctx.fillStyle = COLORS.ROCK_DARK;
    this.ctx.beginPath();
    this.ctx.moveTo(x + size * 0.3, y + size * 0.6);
    this.ctx.lineTo(x + size * 0.5, y + size * 0.8);
    this.ctx.lineTo(x + size * 0.4, y + size * 0.9);
    this.ctx.closePath();
    this.ctx.fill();
  }

  public drawLadder(x: number, y: number, width: number, height: number): void {
    this.drawPixelRect(x, y, 4, height, COLORS.LADDER_BROWN);
    this.drawPixelRect(x + width - 4, y, 4, height, COLORS.LADDER_BROWN);
    
    for (let rungY = y + 10; rungY < y + height - 10; rungY += 20) {
      this.drawPixelRect(x, rungY, width, 4, COLORS.LADDER_BROWN);
    }
  }

  public drawCliffSide(x: number, y: number, width: number, height: number, isGreen: boolean): void {
    const baseColor = isGreen ? COLORS.GREEN_CLIFF : COLORS.BROWN_CLIFF;
    const darkColor = isGreen ? COLORS.GREEN_CLIFF_DARK : COLORS.BROWN_CLIFF_DARK;
    const lightColor = isGreen ? COLORS.GREEN_CLIFF_LIGHT : COLORS.BROWN_CLIFF_LIGHT;
    
    this.drawPixelRect(x, y, width, height, baseColor);
    
    for (let py = y; py < y + height; py += 16) {
      for (let px = x; px < x + width; px += 16) {
        if ((px + py) % 32 === 0) {
          this.drawPixelRect(px, py, 8, 8, darkColor);
        } else if ((px + py) % 48 === 0) {
          this.drawPixelRect(px + 4, py + 4, 6, 6, lightColor);
        }
      }
    }
    
    if (isGreen) {
      for (let py = y; py < y + height; py += 24) {
        this.drawPixelRect(x + width - 6, py, 6, 4, lightColor);
      }
    }
  }

  public drawBonusItem(x: number, y: number, type: string): void {
    const size = 20;
    switch (type) {
      case 'strawberry':
        this.drawPixelRect(x, y + 4, size, size - 4, '#FF4444');
        this.drawPixelRect(x + 6, y, 8, 6, '#228B22');
        break;
      case 'cherry':
        this.drawPixelRect(x, y + 4, 8, 8, '#FF0000');
        this.drawPixelRect(x + 10, y + 6, 8, 8, '#FF0000');
        this.drawPixelRect(x + 6, y, 6, 6, '#228B22');
        break;
      case 'orange':
        this.drawPixelRect(x + 2, y + 2, size - 4, size - 4, '#FFA500');
        break;
      case 'apple':
        this.drawPixelRect(x + 2, y + 4, size - 4, size - 4, '#FF0000');
        this.drawPixelRect(x + 8, y, 4, 6, '#228B22');
        break;
      case 'melon':
        this.drawPixelRect(x, y + 4, size, size - 4, '#228B22');
        this.drawPixelRect(x + 2, y + 6, size - 4, size - 8, '#FF6B6B');
        break;
      case 'famicom':
        this.drawPixelRect(x, y + 4, size, size - 4, '#808080');
        this.drawPixelRect(x + 2, y + 6, 6, 4, '#FF0000');
        this.drawPixelRect(x + 12, y + 6, 6, 4, '#0000FF');
        break;
      case 'face':
        this.drawPixelRect(x + 2, y, size - 4, size, '#FFD5B5');
        this.drawPixelRect(x + 5, y + 6, 3, 3, '#000');
        this.drawPixelRect(x + 12, y + 6, 3, 3, '#000');
        this.drawPixelRect(x + 7, y + 12, 6, 2, '#FF6B6B');
        break;
    }
  }

  public drawHiddenItem(x: number, y: number, type: string): void {
    switch (type) {
      case 'leaf':
        this.ctx.fillStyle = '#32CD32';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, 12, 8, 0.5, 0, Math.PI * 2);
        this.ctx.fill();
        break;
      case 'mushroom':
        this.drawPixelRect(x - 6, y, 12, 10, '#FF4444');
        this.drawPixelRect(x - 4, y + 10, 8, 8, '#F5F5DC');
        this.drawPixelRect(x - 4, y + 2, 3, 3, '#FFFFFF');
        this.drawPixelRect(x + 2, y + 4, 2, 2, '#FFFFFF');
        break;
      case 'butterfly':
        this.ctx.fillStyle = '#FF69B4';
        this.ctx.beginPath();
        this.ctx.ellipse(x - 6, y, 8, 6, -0.3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.ellipse(x + 6, y, 8, 6, 0.3, 0, Math.PI * 2);
        this.ctx.fill();
        this.drawPixelRect(x - 1, y - 2, 2, 8, '#333');
        break;
      case 'bird':
        this.drawPixelRect(x - 6, y, 12, 8, '#FFD700');
        this.drawPixelRect(x + 4, y + 2, 4, 2, '#FFA500');
        this.drawPixelRect(x - 2, y - 2, 2, 2, '#000');
        break;
      case 'caterpillar':
        for (let i = 0; i < 4; i++) {
          this.drawPixelRect(x - 8 + i * 6, y, 6, 6, i % 2 === 0 ? '#32CD32' : '#228B22');
        }
        break;
      case 'beetle':
        this.drawPixelRect(x - 8, y, 16, 12, '#4B0082');
        this.drawPixelRect(x - 2, y - 4, 4, 4, '#4B0082');
        break;
    }
  }

  public drawCloud(x: number, y: number, scale: number = 1): void {
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    const s = scale;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 20 * s, 0, Math.PI * 2);
    this.ctx.arc(x + 25 * s, y - 5 * s, 25 * s, 0, Math.PI * 2);
    this.ctx.arc(x + 55 * s, y, 20 * s, 0, Math.PI * 2);
    this.ctx.arc(x + 25 * s, y + 10 * s, 18 * s, 0, Math.PI * 2);
    this.ctx.fill();
  }
}
