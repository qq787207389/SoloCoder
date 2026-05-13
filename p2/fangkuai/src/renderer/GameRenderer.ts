import { TetrisGame } from '../engine/TetrisGame';
import { Piece } from '../engine/Piece';
import { BOARD_WIDTH, BOARD_HEIGHT, VISIBLE_HEIGHT, COLORS } from '../constants';
import { ParticleSystem } from './ParticleSystem';

export class GameRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private game: TetrisGame;
  private particleSystem: ParticleSystem;
  private blockSize: number;
  private offsetX: number;
  private offsetY: number;

  constructor(canvas: HTMLCanvasElement, game: TetrisGame) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.game = game;
    this.particleSystem = new ParticleSystem();
    this.blockSize = 30;
    this.offsetX = 0;
    this.offsetY = 0;
  }

  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    
    const maxBlockWidth = (width * 0.5) / BOARD_WIDTH;
    const maxBlockHeight = (height * 0.85) / VISIBLE_HEIGHT;
    this.blockSize = Math.min(maxBlockWidth, maxBlockHeight, 35);
    
    const boardPixelWidth = BOARD_WIDTH * this.blockSize;
    const boardPixelHeight = VISIBLE_HEIGHT * this.blockSize;
    
    this.offsetX = (width - boardPixelWidth) / 2 - 100;
    this.offsetY = (height - boardPixelHeight) / 2;
  }

  render(): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.drawBackground();
    this.drawBoard();
    this.drawGhostPiece();
    this.drawCurrentPiece();
    this.particleSystem.update();
    this.particleSystem.draw(ctx);
    this.drawGrid();
    this.drawUI();
  }

  private drawBackground(): void {
    const ctx = this.ctx;
    const gradient = ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(0.5, '#1a0a2e');
    gradient.addColorStop(1, '#0a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < this.canvas.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.canvas.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvas.width, y);
      ctx.stroke();
    }
  }

  private drawBoard(): void {
    const ctx = this.ctx;
    const board = this.game.board;
    const startY = BOARD_HEIGHT - VISIBLE_HEIGHT;
    
    for (let y = startY; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const cell = board.grid[y][x];
        const px = this.offsetX + x * this.blockSize;
        const py = this.offsetY + (y - startY) * this.blockSize;
        
        if (cell.filled) {
          this.drawBlock(px, py, cell.color);
        } else {
          ctx.fillStyle = 'rgba(10, 10, 30, 0.9)';
          ctx.fillRect(px + 1, py + 1, this.blockSize - 2, this.blockSize - 2);
        }
      }
    }
  }

  private drawGrid(): void {
    const ctx = this.ctx;
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    const startY = BOARD_HEIGHT - VISIBLE_HEIGHT;
    const pixelWidth = BOARD_WIDTH * this.blockSize;
    const pixelHeight = VISIBLE_HEIGHT * this.blockSize;
    
    for (let x = 0; x <= BOARD_WIDTH; x++) {
      ctx.beginPath();
      ctx.moveTo(this.offsetX + x * this.blockSize, this.offsetY);
      ctx.lineTo(this.offsetX + x * this.blockSize, this.offsetY + pixelHeight);
      ctx.stroke();
    }
    
    for (let y = 0; y <= VISIBLE_HEIGHT; y++) {
      ctx.beginPath();
      ctx.moveTo(this.offsetX, this.offsetY + y * this.blockSize);
      ctx.lineTo(this.offsetX + pixelWidth, this.offsetY + y * this.blockSize);
      ctx.stroke();
    }
  }

  private drawBlock(px: number, py: number, color: string, isGhost = false): void {
    const ctx = this.ctx;
    const padding = 2;
    const size = this.blockSize - padding * 2;
    
    ctx.save();
    
    if (isGhost) {
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(px + padding, py + padding, size, size);
    } else {
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
      
      const gradient = ctx.createLinearGradient(px, py, px + size, py + size);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, this.adjustBrightness(color, -30));
      ctx.fillStyle = gradient;
      ctx.fillRect(px + padding, py + padding, size, size);
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(px + padding, py + padding, size, 4);
      ctx.fillRect(px + padding, py + padding, 4, size);
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(px + padding + size - 4, py + padding, 4, size);
      ctx.fillRect(px + padding, py + padding + size - 4, size, 4);
    }
    
    ctx.restore();
  }

  private drawCurrentPiece(): void {
    if (!this.game.currentPiece) return;
    
    const piece = this.game.currentPiece;
    const blocks = piece.getBlocks();
    const startY = BOARD_HEIGHT - VISIBLE_HEIGHT;
    
    for (const block of blocks) {
      if (block.y >= startY) {
        const px = this.offsetX + block.x * this.blockSize;
        const py = this.offsetY + (block.y - startY) * this.blockSize;
        this.drawBlock(px, py, piece.color);
      }
    }
  }

  private drawGhostPiece(): void {
    if (!this.game.currentPiece) return;
    
    const ghostPiece = this.game.currentPiece.clone();
    ghostPiece.y = this.game.board.getGhostY(ghostPiece);
    
    const blocks = ghostPiece.getBlocks();
    const startY = BOARD_HEIGHT - VISIBLE_HEIGHT;
    
    for (const block of blocks) {
      if (block.y >= startY) {
        const px = this.offsetX + block.x * this.blockSize;
        const py = this.offsetY + (block.y - startY) * this.blockSize;
        this.drawBlock(px, py, ghostPiece.color, true);
      }
    }
  }

  private drawUI(): void {
    const ctx = this.ctx;
    const rightPanelX = this.offsetX + BOARD_WIDTH * this.blockSize + 30;
    const panelWidth = 140;
    
    this.drawPanel(rightPanelX, this.offsetY, panelWidth, 120, 'NEXT');
    this.drawNextPieces(rightPanelX + 10, this.offsetY + 35);
    
    this.drawPanel(rightPanelX, this.offsetY + 140, panelWidth, 80, 'HOLD');
    this.drawHoldPiece(rightPanelX + 10, this.offsetY + 175);
    
    this.drawScorePanel(rightPanelX, this.offsetY + 240);
    
    if (this.game.state.isBossMode) {
      this.drawBossPanel(rightPanelX, this.offsetY + 380);
    }
  }

  private drawPanel(x: number, y: number, width: number, height: number, title: string): void {
    const ctx = this.ctx;
    
    ctx.save();
    ctx.strokeStyle = '#00ffff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 10;
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.moveTo(x + 10, y);
    ctx.lineTo(x + width - 10, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + 10);
    ctx.lineTo(x + width, y + height - 10);
    ctx.quadraticCurveTo(x + width, y + height, x + width - 10, y + height);
    ctx.lineTo(x + 10, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - 10);
    ctx.lineTo(x, y + 10);
    ctx.quadraticCurveTo(x, y, x + 10, y);
    ctx.closePath();
    ctx.stroke();
    
    ctx.fillStyle = 'rgba(0, 20, 40, 0.8)';
    ctx.fill();
    
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(title, x + width / 2, y + 18);
    
    ctx.restore();
  }

  private drawNextPieces(x: number, y: number): void {
    const smallBlockSize = 18;
    this.game.nextPieces.forEach((type, i) => {
      const piece = new Piece(type);
      const blocks = piece.getBlocks();
      const minX = Math.min(...blocks.map(b => b.x));
      const minY = Math.min(...blocks.map(b => b.y));
      
      blocks.forEach(block => {
        this.drawSmallBlock(
          x + (block.x - minX) * smallBlockSize + 40,
          y + i * 45 + (block.y - minY) * smallBlockSize,
          COLORS[type],
          smallBlockSize
        );
      });
    });
  }

  private drawHoldPiece(x: number, y: number): void {
    if (!this.game.holdPiece) return;
    
    const smallBlockSize = 20;
    const piece = new Piece(this.game.holdPiece);
    const blocks = piece.getBlocks();
    const minX = Math.min(...blocks.map(b => b.x));
    const minY = Math.min(...blocks.map(b => b.y));
    
    blocks.forEach(block => {
      this.drawSmallBlock(
        x + (block.x - minX) * smallBlockSize + 40,
        y + (block.y - minY) * smallBlockSize,
        COLORS[this.game.holdPiece!],
        smallBlockSize
      );
    });
  }

  private drawSmallBlock(x: number, y: number, color: string, size: number): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size - 2, size - 2);
    ctx.restore();
  }

  private drawScorePanel(x: number, y: number): void {
    const ctx = this.ctx;
    const width = 140;
    const height = 130;
    
    this.drawPanel(x, y, width, height, 'SCORE');
    
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'left';
    
    const lines = [
      `Score: ${this.game.state.score.toLocaleString()}`,
      `Level: ${this.game.state.level}`,
      `Lines: ${this.game.state.lines}`,
      `Combo: ${Math.max(0, this.game.state.combo)}x`,
      this.game.state.b2b ? 'B2B!' : ''
    ];
    
    lines.forEach((text, i) => {
      if (text) {
        if (text.includes('B2B')) {
          ctx.fillStyle = '#ff00ff';
          ctx.shadowColor = '#ff00ff';
          ctx.shadowBlur = 5;
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 0;
        }
        ctx.fillText(text, x + 10, y + 35 + i * 18);
      }
    });
    
    ctx.restore();
  }

  private drawBossPanel(x: number, y: number): void {
    const ctx = this.ctx;
    const width = 140;
    const height = 100;
    
    this.drawPanel(x, y, width, height, 'BOSS MODE');
    
    ctx.save();
    ctx.fillStyle = '#ff0066';
    ctx.shadowColor = '#ff0066';
    ctx.shadowBlur = 5;
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('HP:', x + 10, y + 35);
    
    const hpBarWidth = width - 40;
    const hpPercent = this.game.state.bossHP / 100;
    
    ctx.fillStyle = 'rgba(255, 0, 102, 0.3)';
    ctx.fillRect(x + 40, y + 28, hpBarWidth, 12);
    
    ctx.fillStyle = hpPercent > 0.3 ? '#ff0066' : '#ff0000';
    ctx.fillRect(x + 40, y + 28, hpBarWidth * hpPercent, 12);
    
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#00ffff';
    ctx.fillText('Charge:', x + 10, y + 60);
    
    const chargeWidth = width - 40;
    const chargePercent = Math.min(this.game.state.playerCharge / 100, 1);
    
    ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
    ctx.fillRect(x + 40, y + 53, chargeWidth, 12);
    
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(x + 40, y + 53, chargeWidth * chargePercent, 12);
    
    if (this.game.state.playerCharge >= 50) {
      ctx.fillStyle = '#00ff00';
      ctx.font = 'bold 10px Arial';
      ctx.fillText('Press [1-4] to use items!', x + 10, y + 85);
    }
    
    ctx.restore();
  }

  emitLineParticles(lineY: number, colors: string[]): void {
    const startY = BOARD_HEIGHT - VISIBLE_HEIGHT;
    const visualY = lineY - startY;
    this.particleSystem.emitLine(visualY, this.blockSize, colors, this.offsetX);
  }

  private adjustBrightness(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}
