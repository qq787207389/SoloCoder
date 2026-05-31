import './style.css';
import { GameLoop } from './core/GameLoop';

function init(): void {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas element not found');
    return;
  }

  const game = new GameLoop(canvas);
  game.start();

  window.addEventListener('beforeunload', () => {
    console.log('Game closed');
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
