import { Game } from './engine/Game';

class SuperContraGame {
  private game: Game;

  constructor() {
    this.game = new Game('gameCanvas');
    this.setupEventListeners();
    this.game.start();
  }

  private setupEventListeners(): void {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyR' && this.game.gameOver) {
        this.restart();
      }
    });
  }

  private restart(): void {
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    if (canvas) {
      this.game = new Game('gameCanvas');
      this.game.start();
    }
  }
}

window.onload = () => {
  new SuperContraGame();
};
