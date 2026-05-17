export type FruitType = 'cherry' | 'lemon' | 'orange' | 'plum' | 'watermelon' | 'grape' | 'seven';

export interface Fruit {
  type: FruitType;
  emoji: string;
  color: string;
  bgColor: string;
}

export interface Payline {
  indices: [number, number, number];
  name: string;
}

export interface WinResult {
  paylineIndex: number;
  fruit: FruitType;
  payout: number;
}

export interface GameConfig {
  initialCredits: number;
  minBet: number;
  maxBet: number;
  reelCount: number;
  visibleRows: number;
  spinDuration: number;
  stopDelay: number;
}

export interface AudioConfig {
  enabled: boolean;
  volume: number;
}