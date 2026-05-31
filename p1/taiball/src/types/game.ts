export type BallType = 'solid' | 'stripe' | 'cue' | 'eight';
export type GameMode = 'eight-ball' | 'nine-ball' | 'irregular';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameScene = 'menu' | 'playing' | 'gameover';
export type TableShape = 'rectangle' | 'l-shape' | 'annular' | 'obstacle';

export interface Vector2 {
  x: number;
  y: number;
}

export interface Ball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  number: number;
  rotation: number;
  isPotted: boolean;
  isStriped: boolean;
  type: BallType;
  isSleeping: boolean;
  squash: number;
  pottedAnimation: number;
  pocketX: number;
  pocketY: number;
  reset(x: number, y: number): void;
  setPocketPosition(pocketX: number, pocketY: number): void;
  render(ctx: CanvasRenderingContext2D): void;
}

export interface Pocket {
  x: number;
  y: number;
  radius: number;
}

export interface Cue {
  angle: number;
  power: number;
  isCharging: boolean;
  pullBack: number;
}

export interface PlayArea {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface WallSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Obstacle {
  x: number;
  y: number;
  radius: number;
}

export interface Table {
  x: number;
  y: number;
  width: number;
  height: number;
  cushionWidth: number;
  playArea: PlayArea;
  pockets: Pocket[];
  shape: TableShape;
  walls: WallSegment[];
  obstacles: Obstacle[];
}

export interface GameState {
  scene: GameScene;
  mode: GameMode;
  difficulty: Difficulty;
  currentPlayer: 1 | 2;
  player1Score: number;
  player2Score: number;
  player1Type: 'solid' | 'stripe' | null;
  player2Type: 'solid' | 'stripe' | null;
  isAiming: boolean;
  isCharging: boolean;
  chargePower: number;
  aimAngle: number;
  isGameOver: boolean;
  winner: 1 | 2 | null;
  foul: string | null;
  foulTimer: number;
  frame: number;
  shakeAmount: number;
  shakeTimer: number;
  firstHitBallId: number | null;
  pottedThisShot: number[];
  cueBallPotted: boolean;
}

export interface PhysicsConfig {
  FRICTION: number;
  RESTITUTION_BALL: number;
  RESTITUTION_WALL: number;
  MIN_VELOCITY: number;
  BALL_RADIUS: number;
  TABLE_WIDTH: number;
  TABLE_HEIGHT: number;
  CUSHION_WIDTH: number;
  POCKET_RADIUS: number;
  MAX_POWER: number;
  POWER_RATE: number;
}

export interface Colors {
  TABLE_FELT: string;
  TABLE_FELT_DARK: string;
  CUSHION: string;
  CUSHION_DARK: string;
  POCKET: string;
  BALL_WHITE: string;
  BALL_YELLOW: string;
  BALL_BLUE: string;
  BALL_RED: string;
  BALL_PURPLE: string;
  BALL_ORANGE: string;
  BALL_GREEN: string;
  BALL_BROWN: string;
  BALL_BLACK: string;
  CUE: string;
  CUE_TIP: string;
  BACKGROUND: string;
  TEXT: string;
  TEXT_DARK: string;
  ACCENT: string;
  ERROR: string;
}

export interface AIShot {
  angle: number;
  power: number;
  targetBallId: number;
}

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  space: boolean;
  spacePressed: boolean;
  escape: boolean;
  enter: boolean;
}
