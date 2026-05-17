import { Fruit, Payline, GameConfig, FruitType } from './types';

export const FRUITS: Record<FruitType, Fruit> = {
  cherry: { type: 'cherry', emoji: '🍒', color: '#ff4444', bgColor: '#ffcccc' },
  lemon: { type: 'lemon', emoji: '🍋', color: '#ffdd00', bgColor: '#ffffcc' },
  orange: { type: 'orange', emoji: '🍊', color: '#ff9900', bgColor: '#ffeecc' },
  plum: { type: 'plum', emoji: '🍇', color: '#9933ff', bgColor: '#eeccff' },
  watermelon: { type: 'watermelon', emoji: '🍉', color: '#00cc44', bgColor: '#ccffdd' },
  grape: { type: 'grape', emoji: '🍇', color: '#6600cc', bgColor: '#ddccff' },
  seven: { type: 'seven', emoji: '7️⃣', color: '#ff0000', bgColor: '#ffdd00' },
};

export const FRUIT_WEIGHTS: Record<FruitType, number> = {
  cherry: 25,
  lemon: 22,
  orange: 20,
  plum: 15,
  watermelon: 10,
  grape: 6,
  seven: 2,
};

export const PAYTABLE: Record<FruitType, number> = {
  cherry: 5,
  lemon: 8,
  orange: 12,
  plum: 18,
  watermelon: 25,
  grape: 40,
  seven: 100,
};

export const PAYLINES: Payline[] = [
  { indices: [0, 1, 2], name: '顶行' },
  { indices: [3, 4, 5], name: '中行' },
  { indices: [6, 7, 8], name: '底行' },
  { indices: [0, 4, 8], name: '左上→右下' },
  { indices: [6, 4, 2], name: '左下→右上' },
];

export const GAME_CONFIG: GameConfig = {
  initialCredits: 100,
  minBet: 1,
  maxBet: 10,
  reelCount: 3,
  visibleRows: 3,
  spinDuration: 2000,
  stopDelay: 500,
};

export const CELL_SIZE = 100;
export const CELL_PADDING = 8;