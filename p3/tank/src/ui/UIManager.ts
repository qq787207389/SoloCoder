import { Game } from '../core/Game';
import { GameState } from '../constants';

export class UIManager {
  private game: Game;
  private ctx: CanvasRenderingContext2D;
  private uiCanvas: HTMLCanvasElement;
  private uiCtx: CanvasRenderingContext2D;
  private mapOffsetX: number;
  private mapOffsetY: number;

  constructor(gameCanvas: HTMLCanvasElement, uiCanvas: HTMLCanvasElement, game: Game) {
    this.game = game;
    this.ctx = gameCanvas.getContext('2d')!;
    this.uiCanvas = uiCanvas;
    this.uiCtx = uiCanvas.getContext('2d')!;
    
    const mapSize = game.getMapSize();
    this.mapOffsetX = (gameCanvas.width - mapSize) / 2;
    this.mapOffsetY = (gameCanvas.height - mapSize) / 2;
  }

  render(): void {
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    this.game.render(this.ctx, this.mapOffsetX, this.mapOffsetY);

    this.uiCtx.clearRect(0, 0, this.uiCanvas.width, this.uiCanvas.height);
    
    if (this.game.state === GameState.PLAYING || this.game.state === GameState.PAUSED) {
      this.renderHUD();
    }
    
    if (this.game.state === GameState.MENU) {
      this.renderMenu();
    }
    
    if (this.game.state === GameState.PAUSED) {
      this.renderPause();
    }
    
    if (this.game.state === GameState.GAMEOVER) {
      this.renderGameOver();
    }
  }

  private renderHUD(): void {
    const ctx = this.uiCtx;
    const width = this.uiCanvas.width;
    
    ctx.fillStyle = '#16213e';
    ctx.fillRect(0, 0, width, 60);
    
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`波次: ${this.game.getWave()}`, 20, 35);
    
    ctx.fillStyle = '#ff4444';
    ctx.fillText(`敌人: ${this.game.getEnemiesRemaining()}`, 150, 35);
    
    ctx.fillStyle = '#00ff00';
    ctx.fillText(`分数: ${this.game.getScore()}`, 300, 35);
    
    ctx.fillStyle = '#ffff00';
    ctx.fillText(`基地: ${this.game.getBaseHealth()}`, 450, 35);
    
    for (let i = 0; i < this.game.players.length; i++) {
      const player = this.game.players[i];
      const color = i === 0 ? '#00ff00' : '#00ffff';
      ctx.fillStyle = color;
      ctx.fillText(`P${i + 1} 生命: ${player.lives} 等级: ${player.level}`, 600 + i * 150, 35);
    }
    
    ctx.fillStyle = '#888';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('WASD/方向键移动 | 空格/回车射击 | P暂停', width / 2, 55);
  }

  private renderMenu(): void {
    const ctx = this.uiCtx;
    const width = this.uiCanvas.width;
    const height = this.uiCanvas.height;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('钢铁战神', width / 2, height / 3);
    
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 28px Arial';
    ctx.fillText('单人模式 [1]', width / 2, height / 2);
    ctx.fillText('双人模式 [2]', width / 2, height / 2 + 50);
    ctx.fillText('地图编辑器 [E]', width / 2, height / 2 + 100);
    
    ctx.fillStyle = '#888';
    ctx.font = '16px Arial';
    ctx.fillText('按对应的数字键开始游戏', width / 2, height - 50);
  }

  private renderPause(): void {
    const ctx = this.uiCtx;
    const width = this.uiCanvas.width;
    const height = this.uiCanvas.height;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏暂停', width / 2, height / 2);
    
    ctx.fillStyle = '#888';
    ctx.font = '18px Arial';
    ctx.fillText('按 P 继续游戏', width / 2, height / 2 + 40);
  }

  private renderGameOver(): void {
    const ctx = this.uiCtx;
    const width = this.uiCanvas.width;
    const height = this.uiCanvas.height;
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束', width / 2, height / 3);
    
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(`最终波次: ${this.game.getWave()}`, width / 2, height / 2);
    ctx.fillText(`最终分数: ${this.game.getScore()}`, width / 2, height / 2 + 50);
    
    ctx.fillStyle = '#888';
    ctx.font = '18px Arial';
    ctx.fillText('按 R 重新开始 | 按 M 返回菜单', width / 2, height - 50);
  }
}
