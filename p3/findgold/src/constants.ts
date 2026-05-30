export const TILE_SIZE = 32;
export const MAP_COLS = 28;
export const MAP_ROWS = 16;
export const CANVAS_WIDTH = TILE_SIZE * MAP_COLS;
export const CANVAS_HEIGHT = TILE_SIZE * MAP_ROWS;

export const TILE = {
  EMPTY: 0,
  BRICK: 1,
  LADDER: 2,
  GOLD: 3,
  EXIT: 4,
  STEEL: 5,
  HOLE: 6,
  PLAYER_SPAWN: 7,
  ENEMY_SPAWN: 8,
} as const;

export type TileType = typeof TILE[keyof typeof TILE];

export const COLORS: Record<string, string> = {
  BG: '#0a0a1a',
  BRICK: '#8b4513',
  BRICK_HIGHLIGHT: '#a0522d',
  BRICK_SHADOW: '#654321',
  BRICK_LINE: '#4a2c00',
  LADDER: '#daa520',
  LADDER_SHADE: '#b8860b',
  GOLD: '#ffd700',
  GOLD_SHADE: '#ff8c00',
  STEEL: '#708090',
  STEEL_HIGHLIGHT: '#a9a9a9',
  STEEL_SHADOW: '#2f4f4f',
  HOLE: '#1a0a00',
  PLAYER_BODY: '#4169e1',
  PLAYER_HEAD: '#ffdbac',
  PLAYER_FACE: '#8b4513',
  ENEMY1: '#dc143c',
  ENEMY2: '#ff6347',
  ENEMY3: '#9932cc',
  TEXT: '#ffffff',
  EXIT: '#32cd32',
};

export const HOLE_DURATION = 3000;
export const ENEMY_TRAP_DURATION = 2500;
export const PLAYER_SPEED = 120;
export const ENEMY_SPEED = 90;
export const CLIMB_SPEED = 80;

export const ENEMY_AI = {
  PATROL: 'patrol',
  CHASE: 'chase',
  CLIMB: 'climb',
} as const;

export type EnemyAIType = typeof ENEMY_AI[keyof typeof ENEMY_AI];
