export type ThemeType = 'forest' | 'city' | 'cave';

export interface ThemeColors {
  ground: number;
  groundDark: number;
  sky: number;
  fog: number;
  ambient: number;
  sun: number;
  obstacle: number;
  coin: number;
}

export const ThemeConfig: Record<ThemeType, ThemeColors> = {
  forest: {
    ground: 0x5d8a4a,
    groundDark: 0x3d5a2a,
    sky: 0x87ceeb,
    fog: 0x98d8c8,
    ambient: 0xffffff,
    sun: 0xffeedd,
    obstacle: 0x4a3728,
    coin: 0xffd700,
  },
  city: {
    ground: 0x555555,
    groundDark: 0x333333,
    sky: 0x8899aa,
    fog: 0xaaaaaa,
    ambient: 0xeeeeff,
    sun: 0xffffff,
    obstacle: 0x444444,
    coin: 0xffd700,
  },
  cave: {
    ground: 0x2a2a3a,
    groundDark: 0x1a1a2a,
    sky: 0x1a1a2a,
    fog: 0x2a2a3a,
    ambient: 0x4444aa,
    sun: 0x6666aa,
    obstacle: 0x3a3a4a,
    coin: 0xffd700,
  },
};

export const ObstacleConfig = {
  treeStump: { width: 1, height: 1, depth: 1, jumpable: true, slideable: false },
  fence: { width: 0.5, height: 2, depth: 2, jumpable: true, slideable: false },
  rock: { width: 1.5, height: 1.2, depth: 1.5, jumpable: true, slideable: false },
  beam: { width: 2, height: 0.8, depth: 0.5, jumpable: false, slideable: true, heightOffset: 1.5 },
  branch: { width: 1.5, height: 0.6, depth: 0.5, jumpable: false, slideable: true, heightOffset: 1.8 },
  spikes: { width: 2, height: 0.3, depth: 1, jumpable: true, slideable: false },
  fire: { width: 1.5, height: 2, depth: 1.5, jumpable: true, slideable: false, dynamic: true },
};
