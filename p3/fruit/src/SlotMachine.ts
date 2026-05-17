import { GameState } from './GameState';
import { Reel } from './Reel';
import { AudioManager } from './AudioManager';
import { FRUITS, PAYTABLE, PAYLINES, GAME_CONFIG, CELL_SIZE, CELL_PADDING } from './config';
import { FruitType, WinResult } from './types';

export class SlotMachine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameState: GameState;
  private reels: Reel[];
  private audioManager: AudioManager;
  private animationId: number | null = null;
  private lastTime: number = 0;
  private winAnimationTime: number = 0;
  private message: { text: string; type: 'error' | 'success'; time: number } | null = null;
  private onStateChange: (() => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.gameState = new GameState();
    this.audioManager = new AudioManager();
    this.reels = [0, 1, 2].map(i => new Reel(i));
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  private resizeCanvas(): void {
    const width = CELL_SIZE * 3 + CELL_PADDING * 4;
    const height = CELL_SIZE * 3 + CELL_PADDING * 4;
    this.canvas.width = width;
    this.canvas.height = height;
  }

  setOnStateChange(callback: () => void): void {
    this.onStateChange = callback;
  }

  getGameState(): GameState {
    return this.gameState;
  }

  getAudioManager(): AudioManager {
    return this.audioManager;
  }

  getMessage(): { text: string; type: 'error' | 'success' } | null {
    return this.message;
  }

  init(): void {
    this.audioManager.init();
    this.startGameLoop();
  }

  private startGameLoop(): void {
    const loop = (timestamp: number) => {
      const deltaTime = timestamp - this.lastTime;
      this.lastTime = timestamp;

      this.update(deltaTime);
      this.render();

      this.animationId = requestAnimationFrame(loop);
    };

    this.animationId = requestAnimationFrame(loop);
  }

  private update(deltaTime: number): void {
    let allStopped = true;

    for (let i = 0; i < this.reels.length; i++) {
      this.reels[i].update(deltaTime);
      if (this.reels[i].isSpinningState()) {
        allStopped = false;
      }
    }

    if (this.gameState.isSpinningState() && allStopped) {
      this.finishSpin();
    }

    if (this.message && Date.now() - this.message.time > 3000) {
      this.message = null;
      this.notifyStateChange();
    }

    if (this.gameState.getLastWinResults().length > 0) {
      this.winAnimationTime += deltaTime;
    }
  }

  private render(): void {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.clearRect(0, 0, width, height);

    const cellWidth = CELL_SIZE;
    const cellHeight = CELL_SIZE;

    for (let reelIndex = 0; reelIndex < 3; reelIndex++) {
      const reel = this.reels[reelIndex];
      const symbols = reel.getSymbols();
      const position = reel.getPosition();
      const cellTotalHeight = cellHeight + CELL_PADDING;

      const startY = -position % cellTotalHeight;
      const startIndex = Math.floor(position / cellTotalHeight);

      for (let i = -1; i < 5; i++) {
        const symbolIndex = ((startIndex + i) % symbols.length + symbols.length) % symbols.length;
        const symbol = symbols[symbolIndex];
        const fruit = FRUITS[symbol];

        const x = CELL_PADDING + reelIndex * (cellWidth + CELL_PADDING);
        const y = startY + i * cellTotalHeight;

        if (y > -cellHeight && y < height + cellHeight) {
          ctx.fillStyle = fruit.bgColor;
          ctx.beginPath();
          ctx.roundRect(x, y, cellWidth, cellHeight, 8);
          ctx.fill();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.font = '48px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(fruit.emoji, x + cellWidth / 2, y + cellHeight / 2);
        }
      }
    }

    this.drawPaylines();

    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, width, height);
  }

  private drawPaylines(): void {
    const ctx = this.ctx;
    const winResults = this.gameState.getLastWinResults();

    if (winResults.length === 0) return;

    const pulse = Math.sin(this.winAnimationTime * 0.01) * 0.3 + 0.7;
    const cellWidth = CELL_SIZE;
    const cellHeight = CELL_SIZE;

    for (const result of winResults) {
      const payline = PAYLINES[result.paylineIndex];

      ctx.strokeStyle = `rgba(255, 215, 0, ${pulse})`;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();

      for (let i = 0; i < payline.indices.length; i++) {
        const index = payline.indices[i];
        const row = Math.floor(index / 3);
        const col = index % 3;

        const x = CELL_PADDING + col * (cellWidth + CELL_PADDING) + cellWidth / 2;
        const y = CELL_PADDING + row * (cellHeight + CELL_PADDING) + cellHeight / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();

      for (const index of payline.indices) {
        const row = Math.floor(index / 3);
        const col = index % 3;

        const x = CELL_PADDING + col * (cellWidth + CELL_PADDING);
        const y = CELL_PADDING + row * (cellHeight + CELL_PADDING);

        ctx.strokeStyle = `rgba(0, 255, 136, ${pulse})`;
        ctx.lineWidth = 3;
        ctx.strokeRect(x + 2, y + 2, cellWidth - 4, cellHeight - 4);
      }
    }
  }

  spin(): void {
    if (!this.gameState.canSpin()) {
      this.audioManager.playError();
      this.showMessage('余额不足，请降低下注金额！', 'error');
      return;
    }

    this.gameState.deductCredits(this.gameState.getCurrentBet());
    this.gameState.setSpinning(true);
    this.gameState.resetStoppingState();
    this.gameState.setLastWin(0);
    this.gameState.setLastWinResults([]);
    this.winAnimationTime = 0;

    this.audioManager.playSpin();

    for (const reel of this.reels) {
      reel.startSpin();
    }

    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.reels[i].prepareStop();
        this.audioManager.playReelStop();
      }, GAME_CONFIG.stopDelay * (i + 1));
    }

    this.notifyStateChange();
  }

  private finishSpin(): void {
    this.gameState.setSpinning(false);

    const results = this.checkWins();
    let totalPayout = 0;

    for (const result of results) {
      totalPayout += result.payout;
    }

    if (totalPayout > 0) {
      this.gameState.addCredits(totalPayout);
      this.gameState.setLastWin(totalPayout);
      this.gameState.setLastWinResults(results);
      this.audioManager.playWin();
      this.showMessage(`恭喜！赢得 ${totalPayout} 代币！`, 'success');

      let current = 0;
      const target = totalPayout;
      const animateWin = () => {
        if (current < target) {
          current += Math.ceil(target / 20);
          if (current > target) current = target;
          this.gameState.setLastWin(current);
          this.notifyStateChange();
          requestAnimationFrame(animateWin);
        } else {
          this.checkAutoSpin();
        }
      };
      animateWin();
    } else {
      this.notifyStateChange();
      this.checkAutoSpin();
    }
  }

  private checkWins(): WinResult[] {
    const results: WinResult[] = [];
    const grid: FruitType[] = [];

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const visible = this.reels[col].getVisibleSymbols();
        grid[row * 3 + col] = visible[row];
      }
    }

    for (let i = 0; i < PAYLINES.length; i++) {
      const payline = PAYLINES[i];
      const [a, b, c] = payline.indices;

      if (grid[a] === grid[b] && grid[b] === grid[c]) {
        const fruit = grid[a];
        const payout = this.gameState.getCurrentBet() * PAYTABLE[fruit];

        results.push({
          paylineIndex: i,
          fruit,
          payout,
        });
      }
    }

    return results;
  }

  private checkAutoSpin(): void {
    if (this.gameState.isAutoSpinState()) {
      if (this.gameState.canSpin()) {
        setTimeout(() => this.spin(), 1000);
      } else {
        this.gameState.setAutoSpin(false);
        this.showMessage('余额不足，自动旋转已停止！', 'error');
        this.notifyStateChange();
      }
    }
  }

  toggleAutoSpin(): void {
    const wasEnabled = this.gameState.isAutoSpinState();
    const isEnabled = this.gameState.toggleAutoSpin();

    if (!wasEnabled && isEnabled && this.gameState.canSpin()) {
      this.spin();
    }

    this.notifyStateChange();
  }

  incrementBet(): void {
    if (!this.gameState.isSpinningState()) {
      this.gameState.incrementBet();
      this.notifyStateChange();
    }
  }

  decrementBet(): void {
    if (!this.gameState.isSpinningState()) {
      this.gameState.decrementBet();
      this.notifyStateChange();
    }
  }

  private showMessage(text: string, type: 'error' | 'success'): void {
    this.message = { text, type, time: Date.now() };
    this.notifyStateChange();
  }

  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange();
    }
  }

  destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}