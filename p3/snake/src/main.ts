import { GameManager } from './core/GameManager';
import { UISystem } from './systems/UISystem';
import { GameMode, Theme } from './types';

class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameManager: GameManager;
  private uiSystem: UISystem;
  private animationFrameId: number | null = null;

  constructor() {
    this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    if (!this.canvas) {
      throw new Error('Canvas element not found');
    }

    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = ctx;

    this.gameManager = new GameManager(this.canvas);
    this.uiSystem = new UISystem(this.canvas, this.ctx);

    this.setupEventListeners();
    this.startMenuLoop();
  }

  private setupEventListeners(): void {
    this.uiSystem.setOnStartGame((mode: GameMode, theme: Theme, wrapWalls: boolean) => {
      this.startGame(mode, theme, wrapWalls);
    });
  }

  private startMenuLoop(): void {
    const render = () => {
      this.uiSystem.render();

      if (this.uiSystem.getCurrentScreen() !== 'game') {
        this.animationFrameId = requestAnimationFrame(render);
      }
    };
    render();
  }

  private startGame(mode: GameMode, theme: Theme, wrapWalls: boolean): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    this.gameManager.init(mode, theme, wrapWalls);
    this.gameManager.start();
    this.startGameLoop();
  }

  private startGameLoop(): void {
    const gameLoop = () => {
      if (!this.gameManager.getIsRunning()) {
        this.uiSystem.showGameOver();
        this.startMenuLoop();
        return;
      }

      this.uiSystem.renderHUD(
        this.gameManager.getSnakeScores(),
        this.gameManager.getTheme(),
        this.gameManager.getElapsedTime()
      );

      this.animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();
  }
}

window.addEventListener('load', () => {
  new Game();
});
