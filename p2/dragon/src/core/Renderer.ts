import { getGameState, getCurrentMap } from './GameState';

const TILE_SIZE = 24;
const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 480;

const TILE_COLORS: Record<number, string> = {
  0: '#4a8a4a',
  1: '#2a5a2a',
  2: '#4a8aaa',
  3: '#6a6a6a',
  4: '#8a7a5a',
  5: '#5a5a5a',
  6: '#3a3a3a',
  7: '#8a6a4a'
};

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
  }

  public clear(): void {
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  public render(): void {
    const state = getGameState();
    
    if (state.gamePhase === 'map' || state.gamePhase === 'dialogue') {
      this.renderMap();
      this.renderPlayer();
      this.renderNPCs();
      this.renderChests();
    } else if (state.gamePhase === 'battle' && state.battleState) {
      this.renderBattle();
    }
  }

  private renderMap(): void {
    const map = getCurrentMap();
    const { player } = getGameState();
    
    const offsetX = Math.floor(CANVAS_WIDTH / 2) - player.position.x * TILE_SIZE;
    const offsetY = Math.floor(CANVAS_HEIGHT / 2) - player.position.y * TILE_SIZE;

    this.ctx.fillStyle = map.bgColor;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const tile = map.tiles[y][x];
        const screenX = x * TILE_SIZE + offsetX;
        const screenY = y * TILE_SIZE + offsetY;

        if (screenX > -TILE_SIZE && screenX < CANVAS_WIDTH && 
            screenY > -TILE_SIZE && screenY < CANVAS_HEIGHT) {
          this.ctx.fillStyle = TILE_COLORS[tile] || '#000';
          this.ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
          
          this.ctx.strokeStyle = 'rgba(0,0,0,0.2)';
          this.ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
        }
      }
    }
  }

  private renderPlayer(): void {
    const { player } = getGameState();
    const map = getCurrentMap();
    
    const offsetX = Math.floor(CANVAS_WIDTH / 2) - player.position.x * TILE_SIZE;
    const offsetY = Math.floor(CANVAS_HEIGHT / 2) - player.position.y * TILE_SIZE;

    const screenX = player.position.x * TILE_SIZE + offsetX;
    const screenY = player.position.y * TILE_SIZE + offsetY;

    this.ctx.fillStyle = '#4488ff';
    this.ctx.fillRect(screenX + 4, screenY + 4, TILE_SIZE - 8, TILE_SIZE - 8);
    
    this.ctx.fillStyle = '#ffcc99';
    this.ctx.fillRect(screenX + 6, screenY + 2, TILE_SIZE - 12, 10);
    
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(screenX + 8, screenY + 5, 3, 3);
    this.ctx.fillRect(screenX + 13, screenY + 5, 3, 3);
  }

  private renderNPCs(): void {
    const map = getCurrentMap();
    const { player } = getGameState();
    
    const offsetX = Math.floor(CANVAS_WIDTH / 2) - player.position.x * TILE_SIZE;
    const offsetY = Math.floor(CANVAS_HEIGHT / 2) - player.position.y * TILE_SIZE;

    map.npcs.forEach(npc => {
      const screenX = npc.position.x * TILE_SIZE + offsetX;
      const screenY = npc.position.y * TILE_SIZE + offsetY;

      this.ctx.fillStyle = npc.color;
      this.ctx.fillRect(screenX + 4, screenY + 4, TILE_SIZE - 8, TILE_SIZE - 8);
      
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '10px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(npc.name, screenX + TILE_SIZE / 2, screenY);
    });
  }

  private renderChests(): void {
    const map = getCurrentMap();
    const { player } = getGameState();
    
    const offsetX = Math.floor(CANVAS_WIDTH / 2) - player.position.x * TILE_SIZE;
    const offsetY = Math.floor(CANVAS_HEIGHT / 2) - player.position.y * TILE_SIZE;

    map.chests.forEach(chest => {
      if (chest.opened) return;
      
      const screenX = chest.position.x * TILE_SIZE + offsetX;
      const screenY = chest.position.y * TILE_SIZE + offsetY;

      this.ctx.fillStyle = '#ffd700';
      this.ctx.fillRect(screenX + 4, screenY + 8, TILE_SIZE - 8, TILE_SIZE - 12);
      
      this.ctx.fillStyle = '#b8860b';
      this.ctx.fillRect(screenX + 4, screenY + 6, TILE_SIZE - 8, 6);
    });
  }

  private renderBattle(): void {
    const state = getGameState();
    const battle = state.battleState!;

    this.ctx.fillStyle = '#1a1a3a';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const enemyX = CANVAS_WIDTH / 2;
    const enemyY = 120;
    
    this.ctx.fillStyle = battle.enemy.color;
    this.ctx.beginPath();
    this.ctx.arc(enemyX, enemyY, 50, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#fff';
    this.ctx.font = 'bold 24px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(battle.enemy.name, enemyX, enemyY - 70);

    const hpBarWidth = 150;
    const hpPercent = battle.enemy.hp / battle.enemy.maxHp;
    
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(enemyX - hpBarWidth / 2, enemyY + 70, hpBarWidth, 15);
    
    this.ctx.fillStyle = '#ff4444';
    this.ctx.fillRect(enemyX - hpBarWidth / 2, enemyY + 70, hpBarWidth * hpPercent, 15);
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '12px monospace';
    this.ctx.fillText(`${battle.enemy.hp}/${battle.enemy.maxHp}`, enemyX, enemyY + 100);

    const playerX = 100;
    const playerY = CANVAS_HEIGHT - 150;
    
    this.ctx.fillStyle = '#4488ff';
    this.ctx.fillRect(playerX - 25, playerY - 25, 50, 50);
    
    this.ctx.font = 'bold 16px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Lv.${state.player.stats.level}`, playerX + 40, playerY - 10);
    
    const playerHpPercent = state.player.stats.hp / state.player.stats.maxHp;
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(playerX + 40, playerY + 5, 150, 15);
    this.ctx.fillStyle = '#44ff44';
    this.ctx.fillRect(playerX + 40, playerY + 5, 150 * playerHpPercent, 15);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '12px monospace';
    this.ctx.fillText(`HP: ${state.player.stats.hp}/${state.player.stats.maxHp}`, playerX + 40, playerY + 35);

    const playerMpPercent = state.player.stats.mp / state.player.stats.maxMp;
    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(playerX + 40, playerY + 45, 150, 12);
    this.ctx.fillStyle = '#4444ff';
    this.ctx.fillRect(playerX + 40, playerY + 45, 150 * playerMpPercent, 12);
    this.ctx.fillStyle = '#fff';
    this.ctx.fillText(`MP: ${state.player.stats.mp}/${state.player.stats.maxMp}`, playerX + 40, playerY + 70);

    this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
    this.ctx.fillRect(10, CANVAS_HEIGHT - 120, CANVAS_WIDTH - 20, 100);
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '14px monospace';
    this.ctx.textAlign = 'left';
    
    const logStart = Math.max(0, battle.log.length - 4);
    for (let i = logStart; i < battle.log.length; i++) {
      this.ctx.fillText(battle.log[i], 25, CANVAS_HEIGHT - 100 + (i - logStart) * 22);
    }
  }
}
