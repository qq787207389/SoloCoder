import { Game } from '../engine/Game';
import { WeaponType } from '../weapons/Weapon';
import { Boss } from '../bosses/Boss';

export class UIManager {
  private game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    this.renderLives(ctx);
    this.renderWeapon(ctx);
    this.renderBombs(ctx);
    this.renderScore(ctx);
    this.renderBossHealth(ctx);
    this.renderDebug(ctx);
    this.renderGameOver(ctx);
  }

  private renderDebug(ctx: CanvasRenderingContext2D): void {
    const player = this.game.player;
    ctx.fillStyle = '#00ff00';
    ctx.font = '12px Arial';
    ctx.fillText(`Pos: ${Math.floor(player.x)}, ${Math.floor(player.y)}`, 20, 130);
    ctx.fillText(`Vel: ${player.velocity.x.toFixed(1)}, ${player.velocity.y.toFixed(1)}`, 20, 145);
    ctx.fillText(`Grounded: ${player.grounded}`, 20, 160);
    ctx.fillText(`Camera: ${Math.floor(this.game.camera.x)}`, 20, 175);
  }

  private renderLives(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('LIVES:', 20, 30);

    ctx.fillStyle = '#ff6b6b';
    for (let i = 0; i < this.game.lives; i++) {
      ctx.beginPath();
      ctx.arc(90 + i * 20, 26, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderWeapon(ctx: CanvasRenderingContext2D): void {
    const weapon = this.game.player.weapon;
    const weaponNames: Record<WeaponType, string> = {
      [WeaponType.RIFLE]: 'RIFLE',
      [WeaponType.SHOTGUN]: 'SHOTGUN',
      [WeaponType.MACHINEGUN]: 'M-GUN',
      [WeaponType.LASER]: 'LASER'
    };

    const weaponColors: Record<WeaponType, string> = {
      [WeaponType.RIFLE]: '#ffd700',
      [WeaponType.SHOTGUN]: '#00ffff',
      [WeaponType.MACHINEGUN]: '#ff00ff',
      [WeaponType.LASER]: '#ff4444'
    };

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('WEAPON:', 20, 55);

    ctx.fillStyle = weaponColors[weapon.type];
    ctx.fillText(weaponNames[weapon.type], 100, 55);

    ctx.fillStyle = '#fff';
    ctx.fillText('Lv.' + weapon.level, 180, 55);
  }

  private renderBombs(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('BOMBS:', 20, 80);

    ctx.fillStyle = '#ff6600';
    for (let i = 0; i < this.game.bombs; i++) {
      ctx.beginPath();
      ctx.arc(90 + i * 18, 76, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderScore(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('SCORE: ' + this.game.score.toString().padStart(8, '0'), this.game.canvas.width - 20, 30);
  }

  private renderBossHealth(ctx: CanvasRenderingContext2D): void {
    const activeBoss = this.game.bosses.find(boss => boss.active);
    if (!activeBoss) return;

    const barWidth = 300;
    const barHeight = 20;
    const x = (this.game.canvas.width - barWidth) / 2;
    const y = 50;

    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, barWidth, barHeight);

    const healthPercent = activeBoss.health / activeBoss.getMaxHealth();
    const healthColor = this.getHealthColor(healthPercent);
    ctx.fillStyle = healthColor;
    ctx.fillRect(x + 2, y + 2, (barWidth - 4) * healthPercent, barHeight - 4);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, barWidth, barHeight);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('BOSS', this.game.canvas.width / 2, y + 15);

    const phase = activeBoss.getPhase();
    ctx.fillStyle = '#ffd700';
    ctx.fillText('PHASE ' + phase, this.game.canvas.width / 2, y - 8);
  }

  private getHealthColor(percent: number): string {
    if (percent > 0.66) return '#44ff44';
    if (percent > 0.33) return '#ffaa00';
    return '#ff4444';
  }

  private renderGameOver(ctx: CanvasRenderingContext2D): void {
    if (!this.game.gameOver) return;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, this.game.canvas.width, this.game.canvas.height);

    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', this.game.canvas.width / 2, this.game.canvas.height / 2 - 30);

    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('FINAL SCORE: ' + this.game.score, this.game.canvas.width / 2, this.game.canvas.height / 2 + 20);

    ctx.fillStyle = '#fff';
    ctx.font = '18px Arial';
    ctx.fillText('Press R to Restart', this.game.canvas.width / 2, this.game.canvas.height / 2 + 60);
  }
}