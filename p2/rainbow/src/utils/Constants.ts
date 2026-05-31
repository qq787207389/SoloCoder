export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 270;

export const PIXEL_SCALE = Math.min(
  Math.floor(window.innerWidth / GAME_WIDTH),
  Math.floor(window.innerHeight / GAME_HEIGHT)
);

export const GRAVITY = 800;

export const PLAYER_SPEED = 150;
export const PLAYER_JUMP_FORCE = -380;
export const PLAYER_WIDTH = 20;
export const PLAYER_HEIGHT = 28;

export const RAINBOW_ARC_SPEED = 300;
export const RAINBOW_ARC_WIDTH = 60;
export const RAINBOW_ARC_HEIGHT = 30;
export const RAINBOW_LIFETIME = 5;
export const RAINBOW_FADE_TIME = 2;

export const RAINBOW_COLORS: string[] = [
  '#FF0000',
  '#FF7F00',
  '#FFFF00',
  '#00FF00',
  '#0000FF',
  '#4B0082',
  '#9400D3',
];

export const BEETLE_SPEED = 40;
export const JELLYFISH_SPEED = 30;
export const DRAGON_SPEED = 50;
export const DRAGON_FIRE_INTERVAL = 2;

export const BOSS_HP = 30;
export const BOSS_SPEED = 60;
export const BOSS_BULLET_SPEED = 200;

export const LEVEL_HEIGHT = 3000;
export const TILE_SIZE = 16;
export const HUD_HEIGHT = 30;
export const MAX_LIVES = 5;
export const INVINCIBLE_TIME = 1.5;
export const CAMERA_SMOOTH = 0.08;
export const SEA_LEVEL_Y = LEVEL_HEIGHT - 50;

export enum GameState {
  TITLE,
  PLAYING,
  PAUSED,
  GAMEOVER,
  LEVELCLEAR,
  BOSS_INTRO,
  BOSS,
}
