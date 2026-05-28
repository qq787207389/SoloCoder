import { Game } from './Game';
import './style.css';

const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;

if (canvas) {
  const game = new Game(canvas);
  game.start();

  window.addEventListener('beforeunload', () => {
    game.stop();
  });
} else {
  console.error('Canvas element not found!');
}
