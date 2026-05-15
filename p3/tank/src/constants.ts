export enum Direction {
  UP = 0,
  RIGHT = 1,
  DOWN = 2,
  LEFT = 3,
  UP_RIGHT = 4,
  DOWN_RIGHT = 5,
  DOWN_LEFT = 6,
  UP_LEFT = 7
}

export enum TileType {
  EMPTY = 0,
  BRICK = 1,
  STEEL = 2,
  WATER = 3,
  FOREST = 4,
  BASE = 5
}

export enum TankType {
  PLAYER1 = 0,
  PLAYER2 = 1,
  NORMAL = 2,
  CHASER = 3,
  DODGER = 4,
  ELITE = 5,
  BOSS = 6
}

export enum AIType {
  NORMAL = 'normal',
  CHASER = 'chaser',
  DODGER = 'dodger',
  ELITE = 'elite',
  BOSS = 'boss'
}

export enum AIState {
  IDLE = 'idle',
  PATROL = 'patrol',
  CHASE = 'chase',
  DODGE = 'dodge',
  ATTACK = 'attack',
  FLEE = 'flee'
}

export enum PowerupType {
  STAR = 'star',
  CLOCK = 'clock',
  BOMB = 'bomb',
  SHOVEL = 'shovel',
  HELMET = 'helmet'
}

export enum BulletType {
  NORMAL = 'normal',
  SPREAD = 'spread',
  SPIN = 'spin',
  TRACKING = 'tracking'
}

export enum GameState {
  MENU = 'menu',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAMEOVER = 'gameover',
  VICTORY = 'victory',
  EDITOR = 'editor'
}

export const COLORS = {
  BLACK: '#000000',
  WHITE: '#ffffff',
  GRAY: '#888888',
  BRICK: '#b5651d',
  STEEL: '#a0a0a0',
  WATER: '#4a90d9',
  FOREST: '#228b22',
  PLAYER1: '#00ff00',
  PLAYER2: '#00ffff',
  ENEMY: '#ff0000',
  BOSS: '#ff00ff',
  BASE: '#ffff00',
  UI: '#ffd700'
};

export const KEYS = {
  P1_UP: 'KeyW',
  P1_DOWN: 'KeyS',
  P1_LEFT: 'KeyA',
  P1_RIGHT: 'KeyD',
  P1_FIRE: 'Space',
  P2_UP: 'ArrowUp',
  P2_DOWN: 'ArrowDown',
  P2_LEFT: 'ArrowLeft',
  P2_RIGHT: 'ArrowRight',
  P2_FIRE: 'Enter',
  PAUSE: 'KeyP',
  EDITOR: 'KeyE'
};
