export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 320;
export const TILE_SIZE = 16;
export const SCALE = 2;

export const GRAVITY = 0.4;
export const MAX_FALL_SPEED = 6;
export const FLOAT_GRAVITY = 0.1;

export const PLAYER_SPEED = 2.5;
export const PLAYER_JUMP_FORCE = -7;
export const PLAYER_MAX_HP = 5;

export const SWORD_RANGE = 32;
export const SWORD_DURATION = 8;
export const SWORD_COOLDOWN = 12;

export const SHURIKEN_SPEED = 4;
export const SHURIKEN_INITIAL_COUNT = 5;
export const SHURIKEN_MAX = 10;

export const TILE_EMPTY = 0;
export const TILE_SOLID = 1;
export const TILE_PLATFORM = 2;
export const TILE_DAMAGE = 3;
export const TILE_SPIKE = 4;
export const TILE_DECORATION = 5;

export type Direction = 'left' | 'right';
export type Layer = 'ground' | 'upper';
export type GameState = 'title' | 'cutscene' | 'playing' | 'boss' | 'gameover' | 'victory';
export type ShurikenType = 'normal' | 'piercing' | 'spread';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Platform {
  x: number;
  y: number;
  width: number;
  layer: Layer;
}

export interface EntityBase {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  layer: Layer;
  hp: number;
  maxHp: number;
  facing: Direction;
  active: boolean;
}
