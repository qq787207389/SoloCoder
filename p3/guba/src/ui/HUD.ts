import { Player } from '../entities/Player';
import { GameStats } from '../types';

export class HUD {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  public render(players: Player[], stats: GameStats, isPaused: boolean = false): void {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.save();

    this.renderBackground(ctx, width);
    players.forEach((player, index) => {
      this.renderPlayerHUD(ctx, player, index, players.length);
    });

    this.renderStats(ctx, stats, width);

    if (isPaused) {
      this.renderPauseOverlay(ctx, width, height);
    }

    ctx.restore();
  }

  private renderBackground(ctx: CanvasRenderingContext2D, width: number): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, width, 60);

    ctx.strokeStyle = '#4a4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 60);
    ctx.lineTo(width, 60);
    ctx.stroke();
  }

  private renderPlayerHUD(
    ctx: CanvasRenderingContext2D,
    player: Player,
    playerIndex: number,
    totalPlayers: number
  ): void {
    const startX = playerIndex * (this.canvas.width / totalPlayers) + 10;
    const color = player.color;

    ctx.fillStyle = color;
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`P${playerIndex + 1}`, startX, 18);

    this.renderHealthBar(ctx, startX + 40, 10, 100, 12, player.health, player.maxHealth);

    const weapon = player.weaponSystem.getCurrentWeapon();
    ctx.fillStyle = '#fff';
    ctx.font = '10px monospace';
    ctx.fillText(`武器: ${weapon.name}`, startX, 38);

    if (weapon.type !== 'machinegun') {
      ctx.fillStyle = '#ffcc00';
      ctx.fillText(`弹药: ${weapon.ammo}/${weapon.maxAmmo}`, startX, 52);
    } else {
      ctx.fillStyle = '#888';
      ctx.fillText(`弹药: ∞`, startX, 52);
    }

    const grenadePercent = 1 - player.weaponSystem.getSecondaryCooldownPercent();
    ctx.fillStyle = grenadePercent >= 1 ? '#ff6600' : '#666';
    ctx.fillText(`手雷: ${grenadePercent >= 1 ? '就绪' : '冷却中'}`, startX + 100, 52);

    ctx.fillStyle = '#00ff00';
    ctx.fillText(`人质: ${player.getHostageCount()}/${player.maxHostages}`, startX + 100, 38);
  }

  private renderHealthBar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    current: number,
    max: number
  ): void {
    const percent = current / max;

    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, width, height);

    ctx.fillStyle = percent > 0.5 ? '#00ff00' : percent > 0.25 ? '#ffff00' : '#ff0000';
    ctx.fillRect(x, y, width * percent, height);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, width, height);

    ctx.fillStyle = '#fff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.floor(current)}/${max}`, x + width / 2, y + 10);
  }

  private renderStats(ctx: CanvasRenderingContext2D, stats: GameStats, width: number): void {
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`分数: ${stats.score.toString().padStart(8, '0')}`, width - 10, 20);

    ctx.font = '10px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText(`关卡 ${stats.level}`, width - 10, 35);

    ctx.fillStyle = '#00ff88';
    ctx.fillText(`人质: ${stats.hostagesRescued}/${stats.hostagesTotal}`, width - 10, 48);

    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    const hearts = '❤'.repeat(Math.max(0, stats.lives));
    ctx.fillText(hearts, width / 2, 20);
  }

  private renderPauseOverlay(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('暂停', width / 2, height / 2 - 40);

    ctx.font = '16px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText('按 ESC 或 P 继续游戏', width / 2, height / 2 + 10);
    ctx.fillText('按 R 重新开始', width / 2, height / 2 + 40);
  }

  public renderMenu(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    selectedOption: number
  ): void {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    this.renderTitleBackground(ctx, width, height);

    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 56px monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 20;
    ctx.fillText('赤色要塞', width / 2, height / 3);
    ctx.shadowBlur = 0;

    ctx.font = '24px monospace';
    ctx.fillStyle = '#ffaa00';
    ctx.fillText('— 古巴战士 致敬版 —', width / 2, height / 3 + 40);

    const options = ['单人游戏', '双人合作', '操作说明'];
    options.forEach((option, index) => {
      const isSelected = index === selectedOption;
      ctx.font = isSelected ? 'bold 20px monospace' : '18px monospace';
      ctx.fillStyle = isSelected ? '#ffff00' : '#888';
      const prefix = isSelected ? '▶ ' : '  ';
      ctx.fillText(prefix + option, width / 2, height / 2 + index * 35);
    });

    ctx.font = '12px monospace';
    ctx.fillStyle = '#666';
    ctx.fillText('使用 WASD 或 方向键 选择，按 空格 或 回车 开始', width / 2, height - 50);
  }

  private renderTitleBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): void {
    const time = Date.now() / 1000;

    ctx.fillStyle = '#2D5A27';
    ctx.fillRect(0, height * 0.6, width, height * 0.4);

    ctx.fillStyle = '#3D7A37';
    for (let i = 0; i < 20; i++) {
      const x = ((i * 100 + time * 50) % (width + 100)) - 50;
      ctx.fillRect(x, height * 0.65 + Math.sin(i) * 20, 30, 8);
    }

    ctx.fillStyle = '#4a4';
    ctx.fillRect(0, height * 0.7, width, 4);

    const jeepX = ((time * 80) % (width + 200)) - 100;
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(jeepX, height * 0.68, 40, 20);
    ctx.fillStyle = '#333';
    ctx.fillRect(jeepX - 5, height * 0.66, 50, 6);
    ctx.fillRect(jeepX - 5, height * 0.80, 50, 6);
  }

  public renderGameOver(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    stats: GameStats
  ): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 56px monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 20;
    ctx.fillText('任务失败', width / 2, height / 3);
    ctx.shadowBlur = 0;

    ctx.font = '18px monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText(`最终分数: ${stats.score}`, width / 2, height / 2);
    ctx.fillText(`人质营救: ${stats.hostagesRescued}/${stats.hostagesTotal}`, width / 2, height / 2 + 30);
    ctx.fillText(`击杀敌人: ${stats.enemiesKilled}`, width / 2, height / 2 + 60);

    ctx.font = '16px monospace';
    ctx.fillStyle = '#888';
    ctx.fillText('按 空格 或 回车 返回主菜单', width / 2, height - 60);
  }

  public renderVictory(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    stats: GameStats
  ): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 56px monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 20;
    ctx.fillText('任务完成!', width / 2, height / 4);
    ctx.shadowBlur = 0;

    const hostageRate = stats.hostagesTotal > 0 ? stats.hostagesRescued / stats.hostagesTotal : 0;
    const rating = hostageRate >= 0.9 ? 'S' : hostageRate >= 0.7 ? 'A' : hostageRate >= 0.5 ? 'B' : hostageRate >= 0.3 ? 'C' : 'D';

    ctx.fillStyle = rating === 'S' ? '#ffd700' : rating === 'A' ? '#c0c0c0' : '#cd7f32';
    ctx.font = 'bold 80px monospace';
    ctx.fillText(rating, width / 2, height / 2 - 20);

    ctx.font = '16px monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText(`综合评级`, width / 2, height / 2 + 30);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#aaa';
    ctx.fillText(`最终分数: ${stats.score}`, width / 2, height / 2 + 70);
    ctx.fillText(`人质营救率: ${Math.floor(hostageRate * 100)}% (${stats.hostagesRescued}/${stats.hostagesTotal})`, width / 2, height / 2 + 95);
    ctx.fillText(`击杀敌人: ${stats.enemiesKilled}`, width / 2, height / 2 + 120);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#888';
    ctx.fillText('按 空格 或 回车 返回主菜单', width / 2, height - 50);
  }

  public renderControls(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): void {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('操作说明', width / 2, 60);

    ctx.font = '14px monospace';
    ctx.textAlign = 'left';

    const startX = width / 2 - 200;
    let y = 120;

    ctx.fillStyle = '#ffcc00';
    ctx.fillText('【玩家1】', startX, y);
    y += 25;
    ctx.fillStyle = '#fff';
    ctx.fillText('W A S D - 移动', startX + 20, y); y += 22;
    ctx.fillText('J - 射击', startX + 20, y); y += 22;
    ctx.fillText('K - 手雷', startX + 20, y); y += 22;
    ctx.fillText('L - 切换武器', startX + 20, y); y += 35;

    ctx.fillStyle = '#00ccff';
    ctx.fillText('【玩家2】', startX, y);
    y += 25;
    ctx.fillStyle = '#fff';
    ctx.fillText('↑ ← ↓ → - 移动', startX + 20, y); y += 22;
    ctx.fillText('1 (小键盘) - 射击', startX + 20, y); y += 22;
    ctx.fillText('2 (小键盘) - 手雷', startX + 20, y); y += 22;
    ctx.fillText('3 (小键盘) - 切换武器', startX + 20, y); y += 35;

    ctx.fillStyle = '#aaa';
    ctx.fillText('ESC / P - 暂停游戏', startX, y); y += 25;

    y = 120;
    const rightX = width / 2 + 50;

    ctx.fillStyle = '#ff6600';
    ctx.fillText('【游戏目标】', rightX, y); y += 25;
    ctx.fillStyle = '#fff';
    ctx.fillText('• 驾驶吉普车深入敌后', rightX + 20, y); y += 22;
    ctx.fillText('• 击毁敌方设施和敌人', rightX + 20, y); y += 22;
    ctx.fillText('• 解救并护送人质上车', rightX + 20, y); y += 22;
    ctx.fillText('• 到达撤离点完成任务', rightX + 20, y); y += 35;

    ctx.fillStyle = '#00ff88';
    ctx.fillText('【提示】', rightX, y); y += 25;
    ctx.fillStyle = '#fff';
    ctx.fillText('• 每辆车最多载8名人质', rightX + 20, y); y += 22;
    ctx.fillText('• 死亡会失去所有人质', rightX + 20, y); y += 22;
    ctx.fillText('• 收集补给恢复生命弹药', rightX + 20, y);

    ctx.font = '14px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#888';
    ctx.fillText('按 ESC 返回主菜单', width / 2, height - 40);
  }
}
