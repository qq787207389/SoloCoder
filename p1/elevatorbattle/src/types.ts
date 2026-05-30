export const TILE_SIZE = 32;
export const MAP_WIDTH = 25;
export const MAP_HEIGHT = 40;
export const FLOOR_HEIGHT = 8;
export const NUM_FLOORS = 5;

export const CANVAS_WIDTH = MAP_WIDTH * TILE_SIZE;
export const CANVAS_HEIGHT = MAP_HEIGHT * TILE_SIZE;

export enum TileType {
  EMPTY = 0,
  WALL = 1,
  FLOOR = 2,
  DOOR_RED = 3,
  DOOR_CLOSED = 4,
  ELEVATOR_SHAFT = 5,
  ESCALATOR_UP = 6,
  ESCALATOR_DOWN = 7,
  ROOM_FLOOR = 8,
  EXIT = 9,
}

export enum Direction {
  LEFT = -1,
  RIGHT = 1,
  UP = -1,
  DOWN = 1,
}

export enum GameState {
  MENU = 'menu',
  PLAYING = 'playing',
  PAUSED = 'paused',
  WIN = 'win',
  LOSE = 'lose',
}

export enum EnemyState {
  PATROL = 'patrol',
  ALERT = 'alert',
  CHASE = 'chase',
  DEAD = 'dead',
}

export enum EnemyType {
  GUARD = 'guard',
  AGENT = 'agent',
}

export enum ItemType {
  SMG = 'smg',
  ARMOR = 'armor',
  HEALTH = 'health',
  AMMO = 'ammo',
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GameStats {
  health: number;
  maxHealth: number;
  ammo: number;
  maxAmmo: number;
  score: number;
  filesCollected: number;
  totalFiles: number;
  hasSMG: boolean;
  hasArmor: boolean;
  armorTimer: number;
  smgTimer: number;
  level: number;
}

export interface FloorData {
  floorIndex: number;
  yOffset: number;
  rooms: RoomData[];
  elevatorPositions: number[];
  escalatorPositions: { x: number; direction: 'up' | 'down' }[];
  guardPatrolPaths: { x1: number; x2: number; y: number }[];
  agentPositions: Vector2[];
  cameraPositions: Vector2[];
  itemSpawns: { x: number; y: number; type: ItemType }[];
}

export interface RoomData {
  x: number;
  y: number;
  width: number;
  height: number;
  hasFile: boolean;
  fileCollected: boolean;
  doorX: number;
}

export interface Elevator {
  id: number;
  shaftX: number;
  currentFloor: number;
  targetFloor: number;
  y: number;
  speed: number;
  moving: boolean;
  direction: 'up' | 'down' | null;
  hasPlayer: boolean;
  passengers: number[];
  doorsOpen: boolean;
  doorTimer: number;
}

export interface Escalator {
  x: number;
  startY: number;
  endY: number;
  direction: 'up' | 'down';
  speed: number;
}

export interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  isPlayerBullet: boolean;
  life: number;
}

export interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  state: EnemyState;
  direction: Direction;
  patrolStart: number;
  patrolEnd: number;
  patrolY: number;
  alertTimer: number;
  shootCooldown: number;
  speed: number;
  reactionTime: number;
  floorIndex: number;
  stunned: boolean;
  stunTimer: number;
}

export interface Camera {
  id: number;
  x: number;
  y: number;
  angle: number;
  sweepSpeed: number;
  sweepRange: number;
  sweepDirection: 1 | -1;
  viewDistance: number;
  alertTimer: number;
  spotted: boolean;
}

export interface Item {
  id: number;
  type: ItemType;
  x: number;
  y: number;
  collected: boolean;
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
