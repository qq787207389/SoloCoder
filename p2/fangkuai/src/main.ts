import { TetrisGame } from './engine/TetrisGame';
import { BossAI } from './engine/BossAI';
import { GameRenderer } from './renderer/GameRenderer';
import { InputManager } from './input/InputManager';
import { AudioSystem } from './audio/AudioSystem';
import { StorageManager } from './storage/StorageManager';
import { COLORS, ItemType } from './constants';
import { TSpinType } from './engine/TSpinDetector';

class GameApp {
  private game: TetrisGame;
  private renderer: GameRenderer;
  private input: InputManager;
  private audio: AudioSystem;
  private bossAI: BossAI;
  private canvas: HTMLCanvasElement;
  private animationId: number;
  private lastMoveTime: number;
  private menuVisible: boolean;
  private gameOverVisible: boolean;
  private bossMode: boolean;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.display = 'block';
    this.game = new TetrisGame(false);
    this.renderer = new GameRenderer(this.canvas, this.game);
    this.input = new InputManager(this.canvas);
    this.audio = new AudioSystem();
    this.bossAI = new BossAI();
    this.animationId = 0;
    this.lastMoveTime = 0;
    this.menuVisible = true;
    this.gameOverVisible = false;
    this.bossMode = false;

    this.setupGame();
    this.setupInput();
    this.createUI();
  }

  private setupGame(): void {
    this.game.setOnLineClearCallback((lines, isPerfectClear, tSpin) => {
      this.audio.playLineClear(lines, lines >= 4, tSpin !== 'none');
      
      const lineColors: string[] = [];
      for (let i = 0; i < this.game.board.width; i++) {
        lineColors.push(COLORS[tSpin === 'full' ? 'T' : 'I']);
      }
      this.renderer.emitLineParticles(this.game.board.height - 1, lineColors);
    });

    this.game.setOnGameOverCallback(() => {
      this.audio.playGameOver();
      StorageManager.saveScore(
        this.game.state.score,
        this.game.state.level,
        this.game.state.lines,
        this.bossMode ? 'Boss' : 'Classic'
      );
      this.showGameOver();
    });

    this.game.setOnPieceLockCallback(() => {
      this.audio.playLock();
    });

    this.bossAI.onAttack = (type) => {
      this.audio.playBossAttack();
      this.game.bossAttack(type);
    };
  }

  private setupInput(): void {
    this.input.onKeyPress('ArrowLeft', () => {
      if (!this.menuVisible && !this.gameOverVisible) {
        if (this.game.moveLeft()) {
          this.audio.playMove();
        }
      }
    });

    this.input.onKeyPress('ArrowRight', () => {
      if (!this.menuVisible && !this.gameOverVisible) {
        if (this.game.moveRight()) {
          this.audio.playMove();
        }
      }
    });

    this.input.onKeyPress('ArrowUp', () => {
      if (!this.menuVisible && !this.gameOverVisible) {
        if (this.game.rotate(1)) {
          this.audio.playRotate();
        }
      }
    });

    this.input.onKeyPress('ArrowDown', () => {
      if (!this.menuVisible && !this.gameOverVisible) {
        this.game.softDrop();
      }
    });

    this.input.onKeyPress('Space', () => {
      if (!this.menuVisible && !this.gameOverVisible) {
        this.game.hardDrop();
        this.audio.playDrop();
      }
    });

    this.input.onKeyPress('KeyC', () => {
      if (!this.menuVisible && !this.gameOverVisible) {
        if (this.game.hold()) {
          this.audio.playHold();
        }
      }
    });

    this.input.onKeyPress('KeyP', () => {
      if (!this.menuVisible && !this.gameOverVisible) {
        this.game.togglePause();
      }
    });

    this.input.onKeyPress('KeyM', () => {
      const enabled = this.audio.toggle();
      console.log('Audio:', enabled ? 'ON' : 'OFF');
    });

    this.input.onKeyPress('Digit1', () => this.useItem('ADD_LINES'));
    this.input.onKeyPress('Digit2', () => this.useItem('SPEED_UP'));
    this.input.onKeyPress('Digit3', () => this.useItem('SHUFFLE'));
    this.input.onKeyPress('Digit4', () => this.useItem('HEAL'));
  }

  private useItem(itemType: ItemType): void {
    if (this.bossMode && this.game.state.playerCharge >= 50) {
      if (this.game.useItem(itemType)) {
        this.audio.playItemUse();
        
        if (this.game.state.bossHP <= 0) {
          StorageManager.saveScore(
            this.game.state.score,
            this.game.state.level,
            this.game.state.lines,
            'Boss'
          );
          this.showVictory();
        }
      }
    }
  }

  private createUI(): void {
    const app = document.getElementById('app')!;
    app.appendChild(this.canvas);
    
    this.createMenu();
    this.createGameOverScreen();
    this.resize();
    
    window.addEventListener('resize', () => this.resize());
  }

  private createMenu(): void {
    const menu = document.createElement('div');
    menu.id = 'menu';
    menu.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: rgba(10, 10, 30, 0.95);
      z-index: 1000;
    `;

    const title = document.createElement('h1');
    title.textContent = 'AOER方块';
    title.style.cssText = `
      font-size: 4rem;
      color: #00ffff;
      text-shadow: 0 0 20px #00ffff, 0 0 40px #00ffff;
      margin-bottom: 2rem;
      font-family: 'Arial Black', sans-serif;
    `;
    menu.appendChild(title);

    const subtitle = document.createElement('p');
    subtitle.textContent = '赛博朋克俄罗斯方块';
    subtitle.style.cssText = `
      font-size: 1.2rem;
      color: #ff00ff;
      margin-bottom: 3rem;
      text-shadow: 0 0 10px #ff00ff;
    `;
    menu.appendChild(subtitle);

    const classicBtn = this.createButton(menu, '经典模式', '#00ffff', () => this.startGame(false));
    const bossBtn = this.createButton(menu, 'Boss对战模式', '#ff0066', () => this.startGame(true));
    
    const scoresBtn = this.createButton(menu, '排行榜', '#00ff00', () => this.showScores());
    
    const controls = document.createElement('div');
    controls.style.cssText = `
      margin-top: 2rem;
      color: #888;
      font-size: 0.9rem;
      text-align: center;
      line-height: 1.8;
    `;
    controls.innerHTML = `
      <p>←→移动 | ↑旋转 | ↓软降</p>
      <p>Space硬降 | C暂存 | P暂停 | M静音</p>
      <p>触屏：滑动控制，点击旋转</p>
    `;
    menu.appendChild(controls);

    document.body.appendChild(menu);
  }

  private createButton(parent: HTMLElement, text: string, color: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.style.cssText = `
      margin: 0.5rem;
      padding: 1rem 3rem;
      font-size: 1.2rem;
      background: transparent;
      border: 2px solid ${color};
      color: ${color};
      cursor: pointer;
      box-shadow: 0 0 10px ${color};
      transition: all 0.3s;
      font-family: Arial, sans-serif;
    `;
    
    btn.onmouseover = () => {
      btn.style.background = color;
      btn.style.color = '#000';
      btn.style.boxShadow = `0 0 20px ${color}, 0 0 40px ${color}`;
    };
    
    btn.onmouseout = () => {
      btn.style.background = 'transparent';
      btn.style.color = color;
      btn.style.boxShadow = `0 0 10px ${color}`;
    };
    
    btn.onclick = onClick;
    
    parent.appendChild(btn);
    
    return btn;
  }

  private createGameOverScreen(): void {
    const screen = document.createElement('div');
    screen.id = 'gameOver';
    screen.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: rgba(10, 10, 30, 0.95);
      z-index: 1000;
    `;

    const title = document.createElement('h2');
    title.id = 'gameOverTitle';
    title.style.cssText = `
      font-size: 3rem;
      color: #ff0066;
      text-shadow: 0 0 20px #ff0066;
      margin-bottom: 1rem;
    `;
    screen.appendChild(title);

    const score = document.createElement('p');
    score.id = 'finalScore';
    score.style.cssText = `
      font-size: 2rem;
      color: #00ffff;
      margin-bottom: 0.5rem;
    `;
    screen.appendChild(score);

    const stats = document.createElement('p');
    stats.id = 'finalStats';
    stats.style.cssText = `
      font-size: 1.2rem;
      color: #888;
      margin-bottom: 2rem;
    `;
    screen.appendChild(stats);

    const restartBtn = this.createScreenButton('重新开始', '#00ffff', () => {
      screen.style.display = 'none';
      this.startGame(this.bossMode);
    });

    const menuBtn = this.createScreenButton('返回菜单', '#ff00ff', () => {
      screen.style.display = 'none';
      this.showMenu();
    });

    screen.appendChild(restartBtn);
    screen.appendChild(menuBtn);

    document.body.appendChild(screen);
  }

  private createScreenButton(text: string, color: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.style.cssText = `
      margin: 0.5rem;
      padding: 0.8rem 2rem;
      font-size: 1rem;
      background: transparent;
      border: 2px solid ${color};
      color: ${color};
      cursor: pointer;
      box-shadow: 0 0 10px ${color};
      transition: all 0.3s;
    `;
    
    btn.onmouseover = () => {
      btn.style.background = color;
      btn.style.color = '#000';
    };
    
    btn.onmouseout = () => {
      btn.style.background = 'transparent';
      btn.style.color = color;
    };
    
    btn.onclick = onClick;
    
    return btn;
  }

  private startGame(isBossMode: boolean): void {
    this.bossMode = isBossMode;
    this.game = new TetrisGame(isBossMode);
    this.renderer = new GameRenderer(this.canvas, this.game);
    this.bossAI.reset();
    this.setupGame();
    this.hideMenu();
    this.resize();
    this.gameLoop();
  }

  private showMenu(): void {
    this.menuVisible = true;
    const menu = document.getElementById('menu')!;
    menu.style.display = 'flex';
    cancelAnimationFrame(this.animationId);
  }

  private hideMenu(): void {
    this.menuVisible = false;
    const menu = document.getElementById('menu')!;
    menu.style.display = 'none';
  }

  private showGameOver(): void {
    this.gameOverVisible = true;
    const screen = document.getElementById('gameOver')!;
    const title = document.getElementById('gameOverTitle')!;
    const score = document.getElementById('finalScore')!;
    const stats = document.getElementById('finalStats')!;

    title.textContent = '游戏结束';
    title.style.color = '#ff0066';
    score.textContent = `得分: ${this.game.state.score.toLocaleString()}`;
    stats.textContent = `等级: ${this.game.state.level} | 消除: ${this.game.state.lines}`;

    screen.style.display = 'flex';
  }

  private showVictory(): void {
    this.gameOverVisible = true;
    const screen = document.getElementById('gameOver')!;
    const title = document.getElementById('gameOverTitle')!;
    const score = document.getElementById('finalScore')!;
    const stats = document.getElementById('finalStats')!;

    title.textContent = '胜利!';
    title.style.color = '#00ff00';
    score.textContent = `得分: ${this.game.state.score.toLocaleString()}`;
    stats.textContent = `等级: ${this.game.state.level} | 消除: ${this.game.state.lines}`;

    screen.style.display = 'flex';
  }

  private showScores(): void {
    const scores = StorageManager.getScores();
    const menu = document.getElementById('menu')!;
    
    const oldScoresDiv = document.getElementById('scoresList');
    if (oldScoresDiv) oldScoresDiv.remove();
    
    const scoresDiv = document.createElement('div');
    scoresDiv.id = 'scoresList';
    scoresDiv.style.cssText = `
      margin-top: 1rem;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid #00ffff;
      max-height: 200px;
      overflow-y: auto;
      color: #fff;
    `;
    
    if (scores.length === 0) {
      scoresDiv.innerHTML = '<p style="color: #888; text-align: center;">暂无记录</p>';
    } else {
      scoresDiv.innerHTML = `
        <h3 style="color: #00ffff; margin-bottom: 0.5rem; text-align: center;">排行榜</h3>
        ${scores.map((s, i) => `
          <div style="display: flex; justify-content: space-between; padding: 0.3rem 0; border-bottom: 1px solid #333;">
            <span>#${i + 1} - ${s.mode}</span>
            <span style="color: #ff00ff;">${s.score.toLocaleString()}</span>
            <span style="color: #888;">${s.date}</span>
          </div>
        `).join('')}
      `;
    }
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '关闭';
    closeBtn.style.cssText = `
      margin-top: 1rem;
      padding: 0.5rem 2rem;
      background: transparent;
      border: 1px solid #888;
      color: #888;
      cursor: pointer;
    `;
    closeBtn.onclick = () => scoresDiv.remove();
    scoresDiv.appendChild(closeBtn);
    
    menu.appendChild(scoresDiv);
  }

  private resize(): void {
    this.renderer.resize(window.innerWidth, window.innerHeight);
  }

  private gameLoop(): void {
    const currentTime = performance.now();

    if (!this.game.state.paused && !this.game.state.gameOver) {
      this.game.update(currentTime);

      if (this.bossMode && this.game.state.isBossMode) {
        this.bossAI.update(
          currentTime,
          this.game.state.bossHP,
          100,
          this.game.state.lines,
          this.game.state.playerCharge,
          this.game.state.level
        );
      }

      if (currentTime - this.lastMoveTime >= 50) {
        if (this.input.isKeyPressed('ArrowLeft')) {
          this.game.moveLeft();
        }
        if (this.input.isKeyPressed('ArrowRight')) {
          this.game.moveRight();
        }
        if (this.input.isKeyPressed('ArrowDown')) {
          this.game.softDrop();
        }
        this.lastMoveTime = currentTime;
      }
    }

    this.renderer.render();
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new GameApp();
});
