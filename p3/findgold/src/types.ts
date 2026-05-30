import type { TileType, EnemyAIType } from './constants';

export interface Position {
  x: number;
  y: number;
}

export interface TilePosition {
  col: number;
  row: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export interface Hole {
  col: number;
  row: number;
  timer: number;
  originalTile: TileType;
}

export interface Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  onGround: boolean;
  onLadder: boolean;
  facing: 'left' | 'right';
  animFrame: number;
  animTimer: number;
  isClimbing: boolean;
  alive: boolean;
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  onGround: boolean;
  onLadder: boolean;
  facing: 'left' | 'right';
  aiType: EnemyAIType;
  trapped: boolean;
  trapTimer: number;
  patrolDir: number;
  animFrame: number;
  animTimer: number;
  hasGold: boolean;
}

export interface Gold {
  col: number;
  row: number;
  collected: boolean;
  animFrame: number;
}

export interface Level {
  id: number;
  name: string;
  map: number[][];
  enemies: Array<{
    col: number;
    row: number;
    aiType: EnemyAIType;
  }>;
  playerStart: Position;
  parTime: number;
}

export interface GameState {
  level: number;
  score: number;
  lives: number;
  goldCollected: number;
  totalGold: number;
  time: number;
  state: 'menu' | 'playing' | 'paused' | 'levelComplete' | 'gameOver' | 'victory';
  exitActive: boolean;
}

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  dig: boolean;
  digPressed: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}
