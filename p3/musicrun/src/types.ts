export interface BeatData {
  time: number;
  intensity: number;
}

export interface Beatmap {
  id: string;
  name: string;
  bpm: number;
  beats: BeatData[];
  duration: number;
  musicUrl: string;
}

export interface ObstacleData {
  id: string;
  type: 'jump' | 'slide' | 'lane';
  lane: number;
  beatTime: number;
  duration?: number;
}

export interface CoinData {
  lane: number;
  beatTime: number;
}

export interface LevelData {
  id: string;
  name: string;
  artist: string;
  difficulty: 'easy' | 'normal' | 'hard' | 'expert';
  bpm: number;
  musicUrl: string;
  beatmap: Beatmap;
  obstacles: ObstacleData[];
  coins: CoinData[];
  duration: number;
  unlocked: boolean;
}

export interface GameState {
  status: 'menu' | 'playing' | 'paused' | 'gameover' | 'victory';
  score: number;
  combo: number;
  maxCombo: number;
  perfectCount: number;
  totalActions: number;
  energy: number;
  maxEnergy: number;
  isSuperSonic: boolean;
  superSonicTime: number;
  currentTime: number;
  distance: number;
  coinsCollected: number;
  totalCoins: number;
}

export interface JudgmentResult {
  type: 'perfect' | 'good' | 'miss';
  timingOffset: number;
}

export type PlayerAction = 'jump' | 'slide' | 'left' | 'right';

export interface LanePosition {
  x: number;
  z: number;
}

export interface ParticleData {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  color: number;
  size: number;
}
