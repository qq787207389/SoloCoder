import { GameState, LevelData } from '../types';

export class UIManager {
  private container: HTMLElement;
  private overlay: HTMLElement;
  
  private menuScreen: HTMLElement | null = null;
  private hud: HTMLElement | null = null;
  private pauseScreen: HTMLElement | null = null;
  private gameOverScreen: HTMLElement | null = null;
  private victoryScreen: HTMLElement | null = null;
  private levelSelectScreen: HTMLElement | null = null;
  
  private onStartGame: (() => void) | null = null;

  private onResume: (() => void) | null = null;
  private onRestart: (() => void) | null = null;
  private onBackToMenu: (() => void) | null = null;
  
  constructor(container: HTMLElement) {
    this.container = container;
    this.overlay = container.querySelector('.ui-overlay') as HTMLElement;
    if (!this.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.className = 'ui-overlay';
      this.container.appendChild(this.overlay);
    }
  }
  
  setCallbacks(callbacks: {
    onStartGame?: () => void;
    onSelectLevel?: (level: LevelData) => void;
    onResume?: () => void;
    onRestart?: () => void;
    onBackToMenu?: () => void;
  }): void {
    this.onStartGame = callbacks.onStartGame || null;
    this.onResume = callbacks.onResume || null;
    this.onRestart = callbacks.onRestart || null;
    this.onBackToMenu = callbacks.onBackToMenu || null;
  }
  
  showMenu(): void {
    this.hideAll();
    if (!this.menuScreen) {
      this.menuScreen = this.createMenuScreen();
    }
    this.menuScreen.classList.remove('hidden');
  }
  
  private createMenuScreen(): HTMLElement {
    const screen = document.createElement('div');
    screen.className = 'screen menu-screen';
    screen.innerHTML = `
      <style>
        .screen {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(10px);
        }
        
        .hidden {
          display: none !important;
        }
        
        .menu-screen h1 {
          font-size: 4rem;
          font-weight: bold;
          background: linear-gradient(90deg, #00ffff, #ff00ff, #ffff00);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 50px rgba(0, 255, 255, 0.5);
          margin-bottom: 1rem;
          animation: glow 2s ease-in-out infinite alternate;
        }
        
        @keyframes glow {
          from { filter: drop-shadow(0 0 20px rgba(0, 255, 255, 0.5)); }
          to { filter: drop-shadow(0 0 40px rgba(255, 0, 255, 0.5)); }
        }
        
        .menu-screen .subtitle {
          color: #888;
          font-size: 1.2rem;
          margin-bottom: 3rem;
          letter-spacing: 0.3em;
        }
        
        .menu-btn {
          padding: 1rem 3rem;
          font-size: 1.2rem;
          font-weight: bold;
          border: 2px solid #00ffff;
          background: transparent;
          color: #00ffff;
          cursor: pointer;
          margin: 0.5rem;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          min-width: 200px;
        }
        
        .menu-btn:hover {
          background: #00ffff;
          color: #000;
          box-shadow: 0 0 30px rgba(0, 255, 255, 0.5);
          transform: scale(1.05);
        }
        
        .controls-info {
          position: absolute;
          bottom: 2rem;
          color: #666;
          font-size: 0.9rem;
          text-align: center;
        }
        
        .controls-info span {
          color: #00ffff;
          font-weight: bold;
        }
      </style>
      <h1>MUSIC RUN</h1>
      <p class="subtitle">感受节奏，飞驰人生</p>
      <button class="menu-btn start-btn">开始游戏</button>
      <button class="menu-btn levels-btn">选择关卡</button>
      <div class="controls-info">
        <p><span>↑/W/空格</span> 跳跃 | <span>↓/S</span> 滑铲 | <span>←→/AD</span> 变道</p>
        <p>在节拍上操作获得 PERFECT 判定！</p>
      </div>
    `;
    
    screen.querySelector('.start-btn')?.addEventListener('click', () => {
      this.onStartGame?.();
    });
    
    screen.querySelector('.levels-btn')?.addEventListener('click', () => {
      this.showLevelSelect();
    });
    
    this.overlay.appendChild(screen);
    return screen;
  }
  
  showLevelSelect(_levels: LevelData[] = []): void {
    this.hideAll();
    if (!this.levelSelectScreen) {
      this.levelSelectScreen = this.createLevelSelectScreen();
    }
    this.overlay.appendChild(this.levelSelectScreen);
    this.levelSelectScreen.classList.remove('hidden');
  }
  
  private createLevelSelectScreen(): HTMLElement {
    const screen = document.createElement('div');
    screen.className = 'screen level-select-screen hidden';
    screen.innerHTML = `
      <style>
        .level-select-screen h2 {
          font-size: 2.5rem;
          color: #00ffff;
          margin-bottom: 2rem;
        }
        
        .levels-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          max-width: 800px;
          width: 100%;
          padding: 0 2rem;
          max-height: 60vh;
          overflow-y: auto;
        }
        
        .level-card {
          padding: 1.5rem;
          border: 2px solid #333;
          background: rgba(0, 0, 0, 0.5);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .level-card:hover:not(.locked) {
          border-color: #00ffff;
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 255, 255, 0.3);
        }
        
        .level-card.locked {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .level-card .level-name {
          font-size: 1.3rem;
          font-weight: bold;
          color: #fff;
          margin-bottom: 0.5rem;
        }
        
        .level-card .level-artist {
          color: #888;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }
        
        .level-card .level-difficulty {
          display: inline-block;
          padding: 0.2rem 0.8rem;
          font-size: 0.8rem;
          border-radius: 1rem;
        }
        
        .level-difficulty.easy { background: #00aa00; }
        .level-difficulty.normal { background: #0088aa; }
        .level-difficulty.hard { background: #aa6600; }
        .level-difficulty.expert { background: #aa0000; }
        
        .back-btn {
          position: absolute;
          top: 2rem;
          left: 2rem;
          padding: 0.8rem 1.5rem;
          font-size: 1rem;
          border: 2px solid #666;
          background: transparent;
          color: #888;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .back-btn:hover {
          border-color: #00ffff;
          color: #00ffff;
        }
      </style>
      <button class="back-btn">← 返回</button>
      <h2>选择关卡</h2>
      <div class="levels-container"></div>
    `;
    
    screen.querySelector('.back-btn')?.addEventListener('click', () => {
      this.showMenu();
    });
    
    return screen;
  }
  
  showHUD(): void {
    this.hideAll();
    if (!this.hud) {
      this.hud = this.createHUD();
    }
    this.hud.classList.remove('hidden');
  }
  
  private createHUD(): HTMLElement {
    const hud = document.createElement('div');
    hud.className = 'hud hidden';
    hud.innerHTML = `
      <style>
        .hud {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        
        .hud > * {
          pointer-events: auto;
        }
        
        .hud-top {
          position: absolute;
          top: 1rem;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          padding: 0 2rem;
        }
        
        .hud-left, .hud-right {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .hud-right {
          align-items: flex-end;
        }
        
        .score-display {
          font-size: 2rem;
          font-weight: bold;
          color: #00ffff;
          text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        }
        
        .combo-display {
          font-size: 1.5rem;
          font-weight: bold;
          color: #ffff00;
          text-shadow: 0 0 10px rgba(255, 255, 0, 0.5);
        }
        
        .combo-display .combo-count {
          font-size: 2rem;
        }
        
        .energy-bar-container {
          width: 200px;
          height: 20px;
          background: rgba(0, 0, 0, 0.5);
          border: 2px solid #333;
          position: relative;
          overflow: hidden;
        }
        
        .energy-bar {
          height: 100%;
          background: linear-gradient(90deg, #ff00ff, #ffff00);
          transition: width 0.3s ease;
          box-shadow: 0 0 10px rgba(255, 0, 255, 0.5);
        }
        
        .energy-bar.super-sonic {
          animation: pulse 0.3s ease infinite alternate;
        }
        
        @keyframes pulse {
          from { box-shadow: 0 0 10px #ffff00; }
          to { box-shadow: 0 0 30px #ffff00; }
        }
        
        .super-sonic-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #ffff00;
          font-weight: bold;
          font-size: 0.8rem;
          text-shadow: 0 0 10px #ffff00;
        }
        
        .stats-display {
          color: #888;
          font-size: 0.9rem;
        }
        
        .stats-display span {
          color: #ffff00;
        }
        
        .progress-bar-container {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 8px;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #00ffff, #ff00ff);
          transition: width 0.1s linear;
        }
        
        .pause-btn {
          position: absolute;
          top: 1rem;
          right: 2rem;
          width: 40px;
          height: 40px;
          border: 2px solid #666;
          background: rgba(0, 0, 0, 0.5);
          color: #888;
          cursor: pointer;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        
        .pause-btn:hover {
          border-color: #00ffff;
          color: #00ffff;
        }
        
        .judgment-popup {
          position: absolute;
          top: 30%;
          left: 50%;
          transform: translateX(-50%);
          font-size: 3rem;
          font-weight: bold;
          opacity: 0;
          animation: popup 0.8s ease-out forwards;
        }
        
        .judgment-popup.perfect {
          color: #00ff00;
          text-shadow: 0 0 30px #00ff00;
        }
        
        .judgment-popup.good {
          color: #ffff00;
          text-shadow: 0 0 20px #ffff00;
        }
        
        .judgment-popup.miss {
          color: #ff0000;
          text-shadow: 0 0 20px #ff0000;
        }
        
        @keyframes popup {
          0% { opacity: 0; transform: translateX(-50%) scale(0.5); }
          20% { opacity: 1; transform: translateX(-50%) scale(1.2); }
          100% { opacity: 0; transform: translateX(-50%) scale(1) translateY(-50px); }
        }
      </style>
      <div class="hud-top">
        <div class="hud-left">
          <div class="score-display">分数: <span class="score-value">0</span></div>
          <div class="combo-display">
            连击: <span class="combo-count">0</span>
          </div>
        </div>
        <div class="hud-right">
          <div class="energy-bar-container">
            <div class="energy-bar"></div>
          </div>
          <div class="stats-display">
            金币: <span class="coins-count">0</span> | 完美: <span class="perfect-count">0</span>
          </div>
        </div>
      </div>
      <button class="pause-btn">⏸</button>
      <div class="progress-bar-container">
        <div class="progress-bar" style="width: 0%"></div>
      </div>
    `;
    
    hud.querySelector('.pause-btn')?.addEventListener('click', () => {
      this.onResume?.();
    });
    
    this.overlay.appendChild(hud);
    return hud;
  }
  
  updateHUD(state: GameState, levelDuration: number = 1): void {
    if (!this.hud) return;
    
    const scoreEl = this.hud.querySelector('.score-value');
    if (scoreEl) scoreEl.textContent = Math.floor(state.score).toString();
    
    const comboEl = this.hud.querySelector('.combo-count');
    if (comboEl) comboEl.textContent = state.combo.toString();
    
    const energyBar = this.hud.querySelector('.energy-bar') as HTMLElement;
    if (energyBar) {
      const energyPercent = (state.energy / state.maxEnergy) * 100;
      energyBar.style.width = `${energyPercent}%`;
      
      if (state.isSuperSonic) {
        energyBar.classList.add('super-sonic');
        if (!energyBar.querySelector('.super-sonic-text')) {
          const text = document.createElement('div');
          text.className = 'super-sonic-text';
          text.textContent = '超音速!';
          energyBar.appendChild(text);
        }
      } else {
        energyBar.classList.remove('super-sonic');
        const text = energyBar.querySelector('.super-sonic-text');
        if (text) text.remove();
      }
    }
    
    const coinsEl = this.hud.querySelector('.coins-count');
    if (coinsEl) coinsEl.textContent = `${state.coinsCollected}/${state.totalCoins}`;
    
    const perfectEl = this.hud.querySelector('.perfect-count');
    if (perfectEl) perfectEl.textContent = state.perfectCount.toString();
    
    const progressBar = this.hud.querySelector('.progress-bar') as HTMLElement;
    if (progressBar) {
      const progress = (state.currentTime / levelDuration) * 100;
      progressBar.style.width = `${Math.min(100, progress)}%`;
    }
  }
  
  showPause(): void {
    if (!this.pauseScreen) {
      this.pauseScreen = this.createPauseScreen();
    }
    this.pauseScreen.classList.remove('hidden');
  }
  
  private createPauseScreen(): HTMLElement {
    const screen = document.createElement('div');
    screen.className = 'screen pause-screen hidden';
    screen.innerHTML = `
      <style>
        .pause-screen {
          background: rgba(0, 0, 0, 0.8);
        }
        
        .pause-screen h2 {
          font-size: 3rem;
          color: #00ffff;
          margin-bottom: 2rem;
        }
      </style>
      <h2>游戏暂停</h2>
      <button class="menu-btn resume-btn">继续游戏</button>
      <button class="menu-btn restart-btn">重新开始</button>
      <button class="menu-btn menu-btn-secondary back-btn">返回主菜单</button>
    `;
    
    screen.querySelector('.resume-btn')?.addEventListener('click', () => {
      this.onResume?.();
    });
    
    screen.querySelector('.restart-btn')?.addEventListener('click', () => {
      this.onRestart?.();
    });
    
    screen.querySelector('.back-btn')?.addEventListener('click', () => {
      this.onBackToMenu?.();
    });
    
    this.overlay.appendChild(screen);
    return screen;
  }
  
  hidePause(): void {
    if (this.pauseScreen) {
      this.pauseScreen.classList.add('hidden');
    }
  }
  
  showGameOver(_score: number, _perfectRate: number): void {
    this.hideAll();
    if (!this.gameOverScreen) {
      this.gameOverScreen = this.createGameOverScreen();
    }
    this.gameOverScreen.classList.remove('hidden');
  }
  
  private createGameOverScreen(): HTMLElement {
    const screen = document.createElement('div');
    screen.className = 'screen gameover-screen hidden';
    screen.innerHTML = `
      <style>
        .gameover-screen h2 {
          font-size: 3rem;
          color: #ff0000;
          margin-bottom: 2rem;
          text-shadow: 0 0 30px rgba(255, 0, 0, 0.5);
        }
        
        .result-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem 3rem;
          margin: 2rem 0;
          text-align: center;
        }
        
        .stat-item .stat-value {
          font-size: 2rem;
          font-weight: bold;
          color: #00ffff;
        }
        
        .stat-item .stat-label {
          color: #888;
          font-size: 0.9rem;
        }
      </style>
      <h2>游戏结束</h2>
      <div class="result-stats">
        <div class="stat-item">
          <div class="stat-value final-score">0</div>
          <div class="stat-label">最终分数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value perfect-rate">0%</div>
          <div class="stat-label">完美率</div>
        </div>
        <div class="stat-item">
          <div class="stat-value max-combo">0</div>
          <div class="stat-label">最高连击</div>
        </div>
        <div class="stat-item">
          <div class="stat-value coins-collected">0/0</div>
          <div class="stat-label">金币收集</div>
        </div>
      </div>
      <button class="menu-btn restart-btn">再来一次</button>
      <button class="menu-btn menu-btn-secondary back-btn">返回主菜单</button>
    `;
    
    screen.querySelector('.restart-btn')?.addEventListener('click', () => {
      this.onRestart?.();
    });
    
    screen.querySelector('.back-btn')?.addEventListener('click', () => {
      this.onBackToMenu?.();
    });
    
    this.overlay.appendChild(screen);
    return screen;
  }
  
  showVictory(state: GameState): void {
    this.hideAll();
    if (!this.victoryScreen) {
      this.victoryScreen = this.createVictoryScreen();
    }
    
    const perfectRate = state.totalActions > 0 
      ? Math.round((state.perfectCount / state.totalActions) * 100) 
      : 0;
    
    let rank = 'C';
    if (perfectRate >= 90) rank = 'S';
    else if (perfectRate >= 70) rank = 'A';
    else if (perfectRate >= 50) rank = 'B';
    
    const rankEl = this.victoryScreen.querySelector('.rank-display');
    if (rankEl) {
      rankEl.textContent = rank;
      rankEl.className = `rank-display rank-${rank.toLowerCase()}`;
    }
    
    const finalScoreEl = this.victoryScreen.querySelector('.final-score');
    if (finalScoreEl) finalScoreEl.textContent = Math.floor(state.score).toString();
    
    const perfectRateEl = this.victoryScreen.querySelector('.perfect-rate');
    if (perfectRateEl) perfectRateEl.textContent = `${perfectRate}%`;
    
    const maxComboEl = this.victoryScreen.querySelector('.max-combo');
    if (maxComboEl) maxComboEl.textContent = state.maxCombo.toString();
    
    const coinsEl = this.victoryScreen.querySelector('.coins-collected');
    if (coinsEl) coinsEl.textContent = `${state.coinsCollected}/${state.totalCoins}`;
    
    this.victoryScreen.classList.remove('hidden');
  }
  
  private createVictoryScreen(): HTMLElement {
    const screen = document.createElement('div');
    screen.className = 'screen victory-screen hidden';
    screen.innerHTML = `
      <style>
        .victory-screen h2 {
          font-size: 3rem;
          color: #00ff00;
          margin-bottom: 1rem;
          text-shadow: 0 0 30px rgba(0, 255, 0, 0.5);
        }
        
        .rank-display {
          font-size: 6rem;
          font-weight: bold;
          margin: 1rem 0;
          animation: rankGlow 1s ease-in-out infinite alternate;
        }
        
        .rank-s { color: #ffff00; text-shadow: 0 0 50px #ffff00; }
        .rank-a { color: #00ff00; text-shadow: 0 0 40px #00ff00; }
        .rank-b { color: #00ffff; text-shadow: 0 0 30px #00ffff; }
        .rank-c { color: #ff8800; text-shadow: 0 0 20px #ff8800; }
        
        @keyframes rankGlow {
          from { filter: brightness(1); }
          to { filter: brightness(1.5); }
        }
        
        .victory-screen .result-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem 3rem;
          margin: 2rem 0;
          text-align: center;
        }
        
        .victory-screen .stat-item .stat-value {
          font-size: 2rem;
          font-weight: bold;
          color: #00ffff;
        }
        
        .victory-screen .stat-item .stat-label {
          color: #888;
          font-size: 0.9rem;
        }
      </style>
      <h2>关卡完成!</h2>
      <div class="rank-display">S</div>
      <div class="result-stats">
        <div class="stat-item">
          <div class="stat-value final-score">0</div>
          <div class="stat-label">最终分数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value perfect-rate">0%</div>
          <div class="stat-label">完美率</div>
        </div>
        <div class="stat-item">
          <div class="stat-value max-combo">0</div>
          <div class="stat-label">最高连击</div>
        </div>
        <div class="stat-item">
          <div class="stat-value coins-collected">0/0</div>
          <div class="stat-label">金币收集</div>
        </div>
      </div>
      <button class="menu-btn restart-btn">再来一次</button>
      <button class="menu-btn menu-btn-secondary back-btn">返回主菜单</button>
    `;
    
    screen.querySelector('.restart-btn')?.addEventListener('click', () => {
      this.onRestart?.();
    });
    
    screen.querySelector('.back-btn')?.addEventListener('click', () => {
      this.onBackToMenu?.();
    });
    
    this.overlay.appendChild(screen);
    return screen;
  }
  
  private hideAll(): void {
    this.menuScreen?.classList.add('hidden');
    this.levelSelectScreen?.classList.add('hidden');
    this.hud?.classList.add('hidden');
    this.pauseScreen?.classList.add('hidden');
    this.gameOverScreen?.classList.add('hidden');
    this.victoryScreen?.classList.add('hidden');
  }
  
  dispose(): void {
    this.menuScreen?.remove();
    this.levelSelectScreen?.remove();
    this.hud?.remove();
    this.pauseScreen?.remove();
    this.gameOverScreen?.remove();
    this.victoryScreen?.remove();
  }
}
