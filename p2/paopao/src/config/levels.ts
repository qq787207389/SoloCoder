import { LevelConfig } from '../types/game';

export const LEVELS: LevelConfig[] = [
  {
    theme: 'cave',
    platforms: [
      { x: 0, y: 448, width: 640, height: 32 },
      { x: 80, y: 360, width: 160, height: 16 },
      { x: 400, y: 360, width: 160, height: 16 },
      { x: 240, y: 280, width: 160, height: 16 },
      { x: 80, y: 200, width: 128, height: 16 },
      { x: 432, y: 200, width: 128, height: 16 },
      { x: 288, y: 120, width: 64, height: 16 }
    ],
    enemies: [
      { type: 'basic', x: 150, y: 320 },
      { type: 'basic', x: 480, y: 320 },
      { type: 'basic', x: 320, y: 240 }
    ]
  },
  {
    theme: 'cave',
    platforms: [
      { x: 0, y: 448, width: 640, height: 32 },
      { x: 0, y: 360, width: 128, height: 16 },
      { x: 512, y: 360, width: 128, height: 16 },
      { x: 160, y: 300, width: 96, height: 16 },
      { x: 384, y: 300, width: 96, height: 16 },
      { x: 272, y: 220, width: 96, height: 16 },
      { x: 64, y: 160, width: 96, height: 16 },
      { x: 480, y: 160, width: 96, height: 16 },
      { x: 272, y: 100, width: 96, height: 16 }
    ],
    enemies: [
      { type: 'basic', x: 100, y: 400 },
      { type: 'basic', x: 540, y: 400 },
      { type: 'flying', x: 320, y: 180 },
      { type: 'basic', x: 320, y: 260 }
    ]
  },
  {
    theme: 'ice',
    platforms: [
      { x: 0, y: 448, width: 640, height: 32 },
      { x: 48, y: 380, width: 144, height: 16 },
      { x: 448, y: 380, width: 144, height: 16 },
      { x: 224, y: 340, width: 192, height: 16 },
      { x: 48, y: 260, width: 144, height: 16 },
      { x: 448, y: 260, width: 144, height: 16 },
      { x: 256, y: 200, width: 128, height: 16 },
      { x: 128, y: 140, width: 96, height: 16 },
      { x: 416, y: 140, width: 96, height: 16 },
      { x: 272, y: 80, width: 96, height: 16 }
    ],
    enemies: [
      { type: 'basic', x: 100, y: 340 },
      { type: 'basic', x: 540, y: 340 },
      { type: 'flying', x: 200, y: 200 },
      { type: 'flying', x: 440, y: 200 },
      { type: 'fire', x: 320, y: 300 }
    ]
  },
  {
    theme: 'ice',
    platforms: [
      { x: 0, y: 448, width: 200, height: 32 },
      { x: 440, y: 448, width: 200, height: 32 },
      { x: 240, y: 400, width: 160, height: 16 },
      { x: 80, y: 340, width: 128, height: 16 },
      { x: 432, y: 340, width: 128, height: 16 },
      { x: 256, y: 280, width: 128, height: 16 },
      { x: 64, y: 220, width: 128, height: 16 },
      { x: 448, y: 220, width: 128, height: 16 },
      { x: 272, y: 160, width: 96, height: 16 },
      { x: 160, y: 100, width: 96, height: 16 },
      { x: 384, y: 100, width: 96, height: 16 }
    ],
    enemies: [
      { type: 'fire', x: 150, y: 300 },
      { type: 'fire', x: 490, y: 300 },
      { type: 'flying', x: 320, y: 180 },
      { type: 'basic', x: 320, y: 240 },
      { type: 'flying', x: 200, y: 140 }
    ]
  },
  {
    theme: 'volcano',
    platforms: [
      { x: 0, y: 448, width: 640, height: 32 },
      { x: 32, y: 370, width: 128, height: 16 },
      { x: 480, y: 370, width: 128, height: 16 },
      { x: 208, y: 320, width: 224, height: 16 },
      { x: 32, y: 250, width: 128, height: 16 },
      { x: 480, y: 250, width: 128, height: 16 },
      { x: 256, y: 190, width: 128, height: 16 },
      { x: 96, y: 130, width: 96, height: 16 },
      { x: 448, y: 130, width: 96, height: 16 }
    ],
    enemies: [
      { type: 'fire', x: 100, y: 330 },
      { type: 'fire', x: 540, y: 330 },
      { type: 'fire', x: 320, y: 280 },
      { type: 'flying', x: 200, y: 180 },
      { type: 'flying', x: 440, y: 180 }
    ]
  },
  {
    theme: 'volcano',
    isBoss: true,
    platforms: [
      { x: 0, y: 448, width: 640, height: 32 },
      { x: 48, y: 360, width: 112, height: 16 },
      { x: 480, y: 360, width: 112, height: 16 },
      { x: 272, y: 300, width: 96, height: 16 },
      { x: 48, y: 240, width: 112, height: 16 },
      { x: 480, y: 240, width: 112, height: 16 },
      { x: 272, y: 180, width: 96, height: 16 }
    ],
    enemies: [
      { type: 'boss', x: 320, y: 360 }
    ]
  }
];
