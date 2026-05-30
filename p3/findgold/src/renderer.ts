import { TILE_SIZE, COLORS, TILE, type TileType } from './constants';
import type { Player, Enemy, Gold, Hole, Particle } from './types';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');
    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;
    ctx.imageSmoothingEnabled = false;
  }

  clear(): void {
    const ctx = this.ctx;
    ctx.fillStyle = COLORS.BG;
    ctx.fillRect(0, 0, this.width, this.height);
    this.drawBackgroundPattern();
  }

  private drawBackgroundPattern(): void {
    const ctx = this.ctx;
    ctx.fillStyle = '#0f0f2a';
    for (let y = 0; y < this.height; y += 8) {
      for (let x = (y / 8) % 2 === 0 ? 0 : 4; x < this.width; x += 8) {
        ctx.fillRect(x, y, 2, 2);
      }
    }
  }

  drawTile(col: number, row: number, tile: TileType): void {
    const x = col * TILE_SIZE;
    const y = row * TILE_SIZE;

    switch (tile) {
      case TILE.BRICK:
        this.drawBrick(x, y);
        break;
      case TILE.STEEL:
        this.drawSteel(x, y);
        break;
      case TILE.LADDER:
        this.drawLadder(x, y);
        break;
      case TILE.HOLE:
        this.drawHoleTile(x, y);
        break;
      case TILE.EXIT:
        this.drawExit(x, y);
        break;
    }
  }

  private drawBrick(x: number, y: number): void {
    const ctx = this.ctx;
    const s = TILE_SIZE;
    ctx.fillStyle = COLORS.BRICK;
    ctx.fillRect(x, y, s, s);
    ctx.fillStyle = COLORS.BRICK_HIGHLIGHT;
    ctx.fillRect(x, y, s, 4);
    ctx.fillRect(x, y, 4, s);
    ctx.fillStyle = COLORS.BRICK_SHADOW;
    ctx.fillRect(x, y + s - 4, s, 4);
    ctx.fillRect(x + s - 4, y, 4, s);
    ctx.fillStyle = COLORS.BRICK_LINE;
    ctx.fillRect(x, y + s / 2 - 1, s, 2);
    ctx.fillRect(x + s / 2 - 1, y, 2, s / 2);
    ctx.fillRect(x + s / 4 - 1, y + s / 2, 2, s / 2);
    ctx.fillRect(x + s * 3 / 4 - 1, y + s / 2, 2, s / 2);
  }

  private drawSteel(x: number, y: number): void {
    const ctx = this.ctx;
    const s = TILE_SIZE;
    ctx.fillStyle = COLORS.STEEL;
    ctx.fillRect(x, y, s, s);
    ctx.fillStyle = COLORS.STEEL_HIGHLIGHT;
    ctx.fillRect(x, y, s, 3);
    ctx.fillRect(x, y, 3, s);
    ctx.fillStyle = COLORS.STEEL_SHADOW;
    ctx.fillRect(x, y + s - 3, s, 3);
    ctx.fillRect(x + s - 3, y, 3, s);
    ctx.fillStyle = '#4a5568';
    for (let i = 4; i < s - 4; i += 6) {
      ctx.fillRect(x + i, y + 4, 2, s - 8);
      ctx.fillRect(x + 4, y + i, s - 8, 2);
    }
    ctx.fillStyle = '#6b7280';
    ctx.fillRect(x + 8, y + 8, 4, 4);
    ctx.fillRect(x + s - 12, y + 8, 4, 4);
    ctx.fillRect(x + 8, y + s - 12, 4, 4);
    ctx.fillRect(x + s - 12, y + s - 12, 4, 4);
  }

  private drawLadder(x: number, y: number): void {
    const ctx = this.ctx;
    const s = TILE_SIZE;
    ctx.fillStyle = COLORS.LADDER_SHADE;
    ctx.fillRect(x + 6, y, 4, s);
    ctx.fillRect(x + s - 10, y, 4, s);
    ctx.fillStyle = COLORS.LADDER;
    ctx.fillRect(x + 8, y, 4, s);
    ctx.fillRect(x + s - 8, y, 4, s);
    for (let i = 4; i < s; i += 8) {
      ctx.fillStyle = COLORS.LADDER_SHADE;
      ctx.fillRect(x + 6, y + i, s - 12, 3);
      ctx.fillStyle = COLORS.LADDER;
      ctx.fillRect(x + 6, y + i, s - 12, 2);
    }
  }

  private drawHoleTile(x: number, y: number): void {
    const ctx = this.ctx;
    const s = TILE_SIZE;
    ctx.fillStyle = COLORS.HOLE;
    ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(x + 4, y + 4, s - 8, 4);
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 6, y + 10, s - 12, s - 14);
    ctx.fillStyle = COLORS.BRICK_SHADOW;
    ctx.fillRect(x, y, s, 4);
    ctx.fillRect(x, y, 4, s);
    ctx.fillRect(x, y + s - 4, s, 4);
    ctx.fillRect(x + s - 4, y, 4, s);
  }

  private drawExit(x: number, y: number): void {
    const ctx = this.ctx;
    const s = TILE_SIZE;
    const time = Date.now() / 200;
    const glow = 0.5 + Math.sin(time) * 0.3;
    ctx.fillStyle = `rgba(50, 205, 50, ${glow * 0.3})`;
    ctx.fillRect(x - 4, y - 4, s + 8, s + 8);
    this.drawLadder(x, y);
    ctx.fillStyle = COLORS.EXIT;
    ctx.fillRect(x + 4, y + 2, s - 8, 4);
    ctx.fillStyle = '#228b22';
    ctx.fillRect(x + 4, y + 2, s - 8, 2);
    ctx.fillStyle = '#90ee90';
    ctx.fillRect(x + 10, y + 6, 4, 6);
    ctx.fillRect(x + s - 14, y + 6, 4, 6);
  }

  drawGold(gold: Gold, time: number): void {
    if (gold.collected) return;
    const ctx = this.ctx;
    const x = gold.col * TILE_SIZE + TILE_SIZE / 2;
    const y = gold.row * TILE_SIZE + TILE_SIZE / 2;
    const bounce = Math.sin(time / 300 + gold.col * 0.5) * 3;
    const glow = 0.5 + Math.sin(time / 200 + gold.row) * 0.3;
    ctx.fillStyle = `rgba(255, 215, 0, ${glow * 0.4})`;
    ctx.beginPath();
    ctx.arc(x, y + bounce, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.GOLD;
    ctx.beginPath();
    ctx.ellipse(x, y + bounce, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.GOLD_SHADE;
    ctx.beginPath();
    ctx.ellipse(x, y + bounce + 2, 8, 6, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#fff8dc';
    ctx.beginPath();
    ctx.ellipse(x - 3, y + bounce - 2, 3, 2, -0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  drawPlayer(player: Player, time: number): void {
    if (!player.alive) return;
    const ctx = this.ctx;
    const x = player.x;
    const y = player.y;
    const w = player.width;
    const h = player.height;
    const anim = player.onGround && Math.abs(player.vx) > 0
      ? Math.floor(time / 120) % 2
      : 0;
    ctx.save();
    if (player.facing === 'left') {
      ctx.translate(x + w, y);
      ctx.scale(-1, 1);
      ctx.translate(-x, -y);
    }
    ctx.fillStyle = COLORS.PLAYER_BODY;
    ctx.fillRect(x + 6, y + 12, w - 12, h - 16);
    ctx.fillStyle = '#1e90ff';
    ctx.fillRect(x + 6, y + 12, w - 12, 4);
    ctx.fillStyle = COLORS.PLAYER_HEAD;
    ctx.fillRect(x + 8, y + 2, w - 16, 12);
    ctx.fillStyle = '#f5deb3';
    ctx.fillRect(x + 8, y + 2, w - 16, 3);
    ctx.fillStyle = COLORS.PLAYER_FACE;
    ctx.fillRect(x + 16, y + 6, 4, 4);
    ctx.fillRect(x + 10, y + 10, 10, 2);
    ctx.fillStyle = '#8b4513';
    if (player.isClimbing) {
      ctx.fillRect(x + 6, y + 12, 4, h - 16);
      ctx.fillRect(x + w - 10, y + 12, 4, h - 16);
    } else {
      const legOffset = anim * 2;
      ctx.fillRect(x + 8, y + h - 6, 6, 6 - legOffset);
      ctx.fillRect(x + w - 14, y + h - 6 + legOffset, 6, 6 - legOffset);
    }
    ctx.fillStyle = '#2c1810';
    ctx.fillRect(x + 10, y + 2, w - 20, 3);
    ctx.fillRect(x + 8, y + 4, 3, 4);
    ctx.fillRect(x + w - 11, y + 4, 3, 4);
    ctx.restore();
  }

  drawEnemy(enemy: Enemy, time: number): void {
    const ctx = this.ctx;
    const x = enemy.x;
    const y = enemy.y;
    const w = enemy.width;
    const h = enemy.height;
    let bodyColor = COLORS.ENEMY1;
    let accentColor = '#8b0000';
    if (enemy.aiType === 'chase') {
      bodyColor = COLORS.ENEMY2;
      accentColor = '#cc4125';
    } else if (enemy.aiType === 'climb') {
      bodyColor = COLORS.ENEMY3;
      accentColor = '#6a0dad';
    }
    if (enemy.trapped) {
      ctx.globalAlpha = 0.6;
    }
    ctx.save();
    if (enemy.facing === 'left') {
      ctx.translate(x + w, y);
      ctx.scale(-1, 1);
      ctx.translate(-x, -y);
    }
    ctx.fillStyle = bodyColor;
    ctx.fillRect(x + 4, y + 8, w - 8, h - 12);
    ctx.fillStyle = accentColor;
    ctx.fillRect(x + 4, y + 8, w - 8, 3);
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(x + w / 2, y + 8, 10, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 10, y + 6, 5, 5);
    ctx.fillRect(x + w - 15, y + 6, 5, 5);
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 12, y + 8, 3, 3);
    ctx.fillRect(x + w - 13, y + 8, 3, 3);
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(x + 8, y + 14);
    ctx.lineTo(x + 14, y + 18);
    ctx.lineTo(x + 8, y + 22);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + w - 8, y + 14);
    ctx.lineTo(x + w - 14, y + 18);
    ctx.lineTo(x + w - 8, y + 22);
    ctx.fill();
    if (!enemy.trapped) {
      const anim = Math.floor(time / 150) % 2;
      ctx.fillStyle = accentColor;
      ctx.fillRect(x + 6, y + h - 5, 6, 5 - anim * 2);
      ctx.fillRect(x + w - 12, y + h - 5 + anim * 2, 6, 5 - anim * 2);
    }
    if (enemy.hasGold) {
      ctx.fillStyle = COLORS.GOLD;
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + 2, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  drawHole(hole: Hole): void {
    const x = hole.col * TILE_SIZE;
    const y = hole.row * TILE_SIZE;
    this.drawHoleTile(x, y);
    const progress = hole.timer / 3000;
    if (progress > 0.7) {
      const ctx = this.ctx;
      const flash = Math.sin(Date.now() / 100) > 0;
      if (flash) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
      }
    }
  }

  drawParticles(particles: Particle[]): void {
    const ctx = this.ctx;
    for (const p of particles) {
      const alpha = p.life / p.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  drawPauseOverlay(): void {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.fillStyle = COLORS.GOLD;
    ctx.font = 'bold 48px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('暂 停', this.width / 2, this.height / 2);
    ctx.fillStyle = '#fff';
    ctx.font = '18px "Courier New", monospace';
    ctx.fillText('按 P 继续游戏', this.width / 2, this.height / 2 + 40);
  }

  drawLevelComplete(level: number, score: number, time: number): void {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.fillStyle = COLORS.GOLD;
    ctx.font = 'bold 48px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('✓ 过关!', this.width / 2, this.height / 2 - 60);
    ctx.fillStyle = '#fff';
    ctx.font = '24px "Courier New", monospace';
    ctx.fillText(`第 ${level} 关完成`, this.width / 2, this.height / 2 - 10);
    ctx.fillStyle = COLORS.GOLD;
    ctx.fillText(`得分: ${score}`, this.width / 2, this.height / 2 + 30);
    ctx.fillStyle = '#ccc';
    ctx.fillText(`用时: ${time.toFixed(1)} 秒`, this.width / 2, this.height / 2 + 65);
    ctx.fillStyle = '#fff';
    ctx.font = '18px "Courier New", monospace';
    ctx.fillText('按 空格 进入下一关', this.width / 2, this.height / 2 + 110);
  }

  drawGameOver(score: number): void {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.fillStyle = '#dc143c';
    ctx.font = 'bold 56px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束', this.width / 2, this.height / 2 - 40);
    ctx.fillStyle = COLORS.GOLD;
    ctx.font = '28px "Courier New", monospace';
    ctx.fillText(`最终得分: ${score}`, this.width / 2, this.height / 2 + 20);
    ctx.fillStyle = '#fff';
    ctx.font = '18px "Courier New", monospace';
    ctx.fillText('按 R 重新开始', this.width / 2, this.height / 2 + 70);
  }

  drawVictory(score: number, totalTime: number): void {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, this.width, this.height);
    const glow = 0.5 + Math.sin(Date.now() / 300) * 0.5;
    ctx.fillStyle = `rgba(255, 215, 0, ${glow})`;
    ctx.font = 'bold 56px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('★ 通关成功! ★', this.width / 2, this.height / 2 - 60);
    ctx.fillStyle = COLORS.GOLD;
    ctx.font = '28px "Courier New", monospace';
    ctx.fillText(`总得分: ${score}`, this.width / 2, this.height / 2);
    ctx.fillStyle = '#ccc';
    ctx.fillText(`总用时: ${totalTime.toFixed(1)} 秒`, this.width / 2, this.height / 2 + 40);
    ctx.fillStyle = '#fff';
    ctx.font = '18px "Courier New", monospace';
    ctx.fillText('按 R 再玩一次', this.width / 2, this.height / 2 + 90);
  }
}
