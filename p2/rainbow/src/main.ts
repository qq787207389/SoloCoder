import { GAME_WIDTH, GAME_HEIGHT } from './utils/Constants';
import { Game } from './game/Game';

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

let PIXEL_SCALE = Math.min(
  Math.floor(window.innerWidth / GAME_WIDTH),
  Math.floor(window.innerHeight / GAME_HEIGHT)
);
PIXEL_SCALE = Math.max(PIXEL_SCALE, 1);

canvas.width = GAME_WIDTH * PIXEL_SCALE;
canvas.height = GAME_HEIGHT * PIXEL_SCALE;
canvas.style.width = `${canvas.width}px`;
canvas.style.height = `${canvas.height}px`;

ctx.scale(PIXEL_SCALE, PIXEL_SCALE);
ctx.imageSmoothingEnabled = false;

const game = new Game(canvas);
game.start();

const handleResize = () => {
  PIXEL_SCALE = Math.min(
    Math.floor(window.innerWidth / GAME_WIDTH),
    Math.floor(window.innerHeight / GAME_HEIGHT)
  );
  PIXEL_SCALE = Math.max(PIXEL_SCALE, 1);

  canvas.width = GAME_WIDTH * PIXEL_SCALE;
  canvas.height = GAME_HEIGHT * PIXEL_SCALE;
  canvas.style.width = `${canvas.width}px`;
  canvas.style.height = `${canvas.height}px`;

  ctx.setTransform(PIXEL_SCALE, 0, 0, PIXEL_SCALE, 0, 0);
  ctx.imageSmoothingEnabled = false;
};

window.addEventListener('resize', handleResize);

window.addEventListener('beforeunload', () => {
  game.stop();
});
