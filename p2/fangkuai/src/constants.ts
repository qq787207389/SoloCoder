export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 40;
export const VISIBLE_HEIGHT = 20;
export const BLOCK_SIZE = 30;

export const COLORS: Record<string, string> = {
  I: '#00FFFF',
  O: '#FFFF00',
  T: '#AA00FF',
  S: '#00FF00',
  Z: '#FF0000',
  J: '#0000FF',
  L: '#FFAA00',
  GHOST: 'rgba(255, 255, 255, 0.2)',
  EMPTY: 'rgba(0, 0, 0, 0.8)'
};

export const SHAPES: Record<string, number[][]> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  O: [
    [1, 1],
    [1, 1]
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0]
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0]
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0]
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0]
  ]
};

export const PIECE_TYPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'] as const;

export const WALL_KICKS: Record<string, number[][][]> = {
  JLSTZ: [
    [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
    [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
    [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
    [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]]
  ],
  I: [
    [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
    [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
    [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
    [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]]
  ],
  O: [[[0, 0]], [[0, 0]], [[0, 0]], [[0, 0]]]
};

export const LOCK_DELAY = 500;
export const LEVEL_SPEEDS = [
  1000, 800, 600, 450, 350, 250, 200, 150, 120, 100,
  80, 70, 60, 50, 40, 30, 20, 15, 10
];

export const SCORE_TABLE = {
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800,
  T_SPIN_MINI: 100,
  T_SPIN_MINI_SINGLE: 200,
  T_SPIN_MINI_DOUBLE: 400,
  T_SPIN: 400,
  T_SPIN_SINGLE: 800,
  T_SPIN_DOUBLE: 1200,
  T_SPIN_TRIPLE: 1600,
  PERFECT_CLEAR: 2000,
  COMBO_MULTIPLIER: 50,
  SOFT_DROP: 1,
  HARD_DROP: 2
};

export const ITEM_TYPES = ['ADD_LINES', 'SPEED_UP', 'SHUFFLE', 'HEAL'] as const;
export type ItemType = typeof ITEM_TYPES[number];

export const BOSS_MAX_HP = 100;
export const CHARGE_PER_LINE = 10;
