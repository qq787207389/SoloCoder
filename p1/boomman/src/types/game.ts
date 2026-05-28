export enum TileType {
  EMPTY = 0,
  WALL = 1,
  BOX = 2,
  CONVEYOR_UP = 3,
  CONVEYOR_DOWN = 4,
  CONVEYOR_LEFT = 5,
  CONVEYOR_RIGHT = 6,
  ONE_WAY_UP = 7,
  ONE_WAY_DOWN = 8,
  ONE_WAY_LEFT = 9,
  ONE_WAY_RIGHT = 10,
  FALLING = 11,
  FLAG_RED = 12,
  FLAG_BLUE = 13,
}

export enum PowerUpType {
  FIRE = 'fire',
  BOMB = 'bomb',
  SPEED = 'speed',
  KICK = 'kick',
  REMOTE = 'remote',
  PIERCE = 'pierce',
  SLOW = 'slow',
  SHIELD = 'shield',
}

export enum GameMode {
  CLASSIC = 'classic',
  TEAM = 'team',
  CTF = 'ctf',
}

export enum AIType {
  AGGRESSIVE = 'aggressive',
  DEFENSIVE = 'defensive',
  SMART = 'smart',
}

export interface Player {
  id: string;
  name: string;
  x: number;
  y: number;
  color: number;
  isAI: boolean;
  aiType?: AIType;
  team?: number;
  alive: boolean;
  bombCount: number;
  maxBombs: number;
  fireRange: number;
  speed: number;
  canKick: boolean;
  hasRemote: boolean;
  hasPierce: boolean;
  hasShield: boolean;
  isSlowed: boolean;
  kills: number;
  deaths: number;
  powerUpsCollected: number;
  selfDestructs: number;
}

export interface Bomb {
  id: string;
  x: number;
  y: number;
  ownerId: string;
  timer: number;
  maxTimer: number;
  range: number;
  isRemote: boolean;
  isMoving: boolean;
  direction?: 'up' | 'down' | 'left' | 'right';
  hasPierce: boolean;
}

export interface Explosion {
  id: string;
  x: number;
  y: number;
  direction: 'center' | 'up' | 'down' | 'left' | 'right';
  timer: number;
  ownerId: string;
}

export interface PowerUp {
  id: string;
  x: number;
  y: number;
  type: PowerUpType;
}

export interface GameState {
  mode: GameMode;
  players: Player[];
  bombs: Bomb[];
  explosions: Explosion[];
  powerUps: PowerUp[];
  map: TileType[][];
  fallingTiles: Set<string>;
  warningTiles: Set<string>;
  gameTime: number;
  isGameOver: boolean;
  winner?: Player;
  scores: { [key: string]: number };
  roundTime: number;
}

export interface GameConfig {
  mapWidth: number;
  mapHeight: number;
  tileSize: number;
  bombTimer: number;
  explosionDuration: number;
  playerSpeed: number;
  initialBombs: number;
  initialFireRange: number;
  boxDensity: number;
  powerUpChance: number;
  shrinkStartTime: number;
  shrinkInterval: number;
}

export const DEFAULT_CONFIG: GameConfig = {
  mapWidth: 15,
  mapHeight: 13,
  tileSize: 48,
  bombTimer: 3000,
  explosionDuration: 500,
  playerSpeed: 4,
  initialBombs: 1,
  initialFireRange: 2,
  boxDensity: 0.6,
  powerUpChance: 0.35,
  shrinkStartTime: 90,
  shrinkInterval: 10,
};
