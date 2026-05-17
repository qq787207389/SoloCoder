import './style.css';
import { Game } from './game/Game';

class GameUI {
  private game: Game;
  private menuScreen: HTMLElement;
  private gameOverScreen: HTMLElement;
  private hud: HTMLElement;
  private scoreDisplay: HTMLElement;
  private distanceDisplay: HTMLElement;
  private coinsDisplay: HTMLElement;
  private speedBar: HTMLElement;
  private powerupTimers: HTMLElement;
  private finalScore: HTMLElement;
  private finalDistance: HTMLElement;
  private finalCoins: HTMLElement;
  private highScoreDisplay: HTMLElement;
  private highScoreMenu: HTMLElement;
  private resurrectBtn: HTMLButtonElement;
  private resurrectCost: HTMLElement;

  constructor() {
    const container = document.getElementById('game-container')!;
    this.game = new Game(container);

    this.menuScreen = document.getElementById('menu-screen')!;
    this.gameOverScreen = document.getElementById('game-over-screen')!;
    this.hud = document.getElementById('hud')!;
    this.scoreDisplay = document.getElementById('score-value')!;
    this.distanceDisplay = document.getElementById('distance-value')!;
    this.coinsDisplay = document.getElementById('coins-value')!;
    this.speedBar = document.getElementById('speed-bar')!;
    this.powerupTimers = document.getElementById('powerup-timers')!;
    this.finalScore = document.getElementById('final-score')!;
    this.finalDistance = document.getElementById('final-distance')!;
    this.finalCoins = document.getElementById('final-coins')!;
    this.highScoreDisplay = document.getElementById('high-score')!;
    this.highScoreMenu = document.getElementById('high-score-menu')!;
    this.resurrectBtn = document.getElementById('resurrect-btn') as HTMLButtonElement;
    this.resurrectCost = document.getElementById('resurrect-cost')!;

    this.setupEventListeners();
    this.updateHighScoreDisplay();
    this.gameLoop();
  }

  private setupEventListeners(): void {
    const startBtn = document.getElementById('start-btn')!;
    startBtn.addEventListener('click', () => this.startGame());

    const restartBtn = document.getElementById('restart-btn')!;
    restartBtn.addEventListener('click', () => this.startGame());

    const menuBtn = document.getElementById('menu-btn')!;
    menuBtn.addEventListener('click', () => this.showMenu());

    this.resurrectBtn.addEventListener('click', () => this.tryResurrect());
  }

  private startGame(): void {
    this.menuScreen.classList.add('hidden');
    this.gameOverScreen.classList.add('hidden');
    this.hud.classList.remove('hidden');
    this.game.start();
  }

  private showMenu(): void {
    this.gameOverScreen.classList.add('hidden');
    this.hud.classList.add('hidden');
    this.menuScreen.classList.remove('hidden');
    this.updateHighScoreDisplay();
  }

  private showGameOver(): void {
    this.hud.classList.add('hidden');
    this.gameOverScreen.classList.remove('hidden');
    
    this.finalScore.textContent = this.game.getScore().toString();
    this.finalDistance.textContent = this.game.getDistance().toString() + 'm';
    this.finalCoins.textContent = this.game.getCoins().toString();
    this.highScoreDisplay.textContent = this.game.getHighScore().toString();

    const cost = this.game.getResurrectionCost();
    const currentCoins = this.game.getCoins();
    this.resurrectCost.textContent = `Cost: ${cost} coins`;
    this.resurrectBtn.disabled = currentCoins < cost;
  }

  private tryResurrect(): void {
    if (this.game.resurrect()) {
      this.gameOverScreen.classList.add('hidden');
      this.hud.classList.remove('hidden');
    }
  }

  private updateHUD(): void {
    if (this.game.state !== 'playing') return;

    this.scoreDisplay.textContent = this.game.getScore().toString();
    this.distanceDisplay.textContent = this.game.getDistance().toString() + 'm';
    this.coinsDisplay.textContent = this.game.getCoins().toString();

    const speedPercent = ((this.game.getSpeed() - 15) / 30) * 100;
    this.speedBar.style.width = Math.min(speedPercent, 100) + '%';

    this.updatePowerupTimers();
  }

  private updatePowerupTimers(): void {
    const timers = this.game.getPowerupTimers();
    let html = '';

    if (timers.magnet > 0) {
      html += `<div class="powerup-timer magnet">🧲 ${timers.magnet.toFixed(1)}s</div>`;
    }
    if (timers.shield > 0) {
      html += `<div class="powerup-timer shield">🛡️ ${timers.shield.toFixed(1)}s</div>`;
    }
    if (timers.doubleScore > 0) {
      html += `<div class="powerup-timer double-score">✨ ${timers.doubleScore.toFixed(1)}s</div>`;
    }

    this.powerupTimers.innerHTML = html;
  }

  private updateHighScoreDisplay(): void {
    this.highScoreMenu.textContent = 'High Score: ' + this.game.getHighScore().toString();
  }

  private gameLoop(): void {
    this.updateHUD();

    if (this.game.state === 'gameOver' && !this.gameOverScreen.classList.contains('hidden')) {
    } else if (this.game.state === 'gameOver') {
      this.showGameOver();
    }

    requestAnimationFrame(() => this.gameLoop());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new GameUI();
});
