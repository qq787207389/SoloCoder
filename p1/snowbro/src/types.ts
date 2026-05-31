export const CANVAS_W = 480
export const CANVAS_H = 320
export const TILE = 16
export const GRAVITY = 0.26
export const MAX_FALL = 5
export const PLAYER_SPEED = 1.0
export const PLAYER_JUMP = -6.2
export const PLAYER_W = 14
export const PLAYER_H = 20
export const SNOWBALL_SPEED = 2.0
export const SNOWBALL_SMALL_R = 4
export const SNOWBALL_BIG_R = 6
export const SNOWBALL_ROLL_R = 10
export const SNOWBALL_BIG_ROLL_R = 14
export const KICK_SPEED = 3.0
export const ESCAPE_TIME_NORMAL = 720
export const ESCAPE_TIME_FAST = 360
export const BOSS_STUN_TIME = 120
export const ITEM_DURATION = 480
export const ENEMY_W = 14
export const ENEMY_H = 16
export const BOSS_W = 28
export const BOSS_H = 28
export const THROW_SPEED = 1.8
export const THROW_INTERVAL = 160
export const SNOW_THROW_W = 8
export const SNOW_THROW_H = 6
export const ITEM_SIZE = 10
export const FLOAT_SPEED = 0.5
export const FLOAT_RANGE = 16

export const COLOR = {
  SKY_TOP: '#1a2a4a',
  SKY_BOT: '#3a5a8a',
  ICE: '#8ad4f0',
  ICE_DARK: '#5ab8d8',
  ICE_LIGHT: '#c0efff',
  SNOW: '#f0f8ff',
  SNOW_SHADOW: '#c8dce8',
  PILLAR: '#6090b0',
  PILLAR_LIGHT: '#90c0e0',
  PLAYER_BODY: '#f0f8ff',
  PLAYER_SHADOW: '#b0c8d8',
  PLAYER_HAT: '#2040a0',
  PLAYER_HAT_BAND: '#ff8c42',
  PLAYER_NOSE: '#ff6030',
  PLAYER_EYES: '#1a1a2e',
  ENEMY_PATROL: '#e04040',
  ENEMY_JUMP: '#40c040',
  ENEMY_THROW: '#c040c0',
  ENEMY_FAST: '#e0a020',
  BOSS_BODY: '#a04020',
  BOSS_EYES: '#ff2020',
  SNOWBALL: '#e8f4ff',
  SNOWBALL_SHINE: '#ffffff',
  RED_POTION: '#ff3030',
  BLUE_POTION: '#3080ff',
  YELLOW_POTION: '#ffcc00',
  HUD_BG: 'rgba(10,20,40,0.7)',
  HUD_TEXT: '#f0f0f0',
  HUD_ACCENT: '#ff8c42',
}

export type EnemyType = 'patrol' | 'jump' | 'throw' | 'fast' | 'boss'
export type PlatformType = 'ice' | 'slope' | 'float'
export type ItemType = 'red' | 'blue' | 'yellow'
export type SnowballState = 'flying' | 'rolling' | 'kicked' | 'wallbreak' | 'chainhit'
export type GameState = 'title' | 'playing' | 'stageclear' | 'gameover'

export interface Vec2 {
  x: number
  y: number
}

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface PlatformData {
  x: number
  y: number
  w: number
  h: number
  type: PlatformType
}

export interface IcePillarData {
  x: number
  y: number
  h: number
}

export interface EnemySpawn {
  type: EnemyType
  x: number
  y: number
}

export interface LevelData {
  id: number
  platforms: PlatformData[]
  icePillars: IcePillarData[]
  enemies: EnemySpawn[]
  isBoss: boolean
}

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  type: 'snow' | 'ice' | 'sparkle' | 'struggle'
}

export interface PowerUp {
  type: ItemType
  timer: number
  maxTimer: number
}
