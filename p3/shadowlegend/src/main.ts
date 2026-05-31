import { GAME_WIDTH, GAME_HEIGHT } from './utils/Constants';
import { GameEngine } from './engine/GameEngine';

const canvas = document.getElementById('game') as HTMLCanvasElement;
canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

const engine = new GameEngine(canvas);
engine.start();
