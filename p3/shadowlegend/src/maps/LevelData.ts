import { Platform, Layer, ShurikenType, TILE_SIZE, TILE_DECORATION } from '../utils/Constants';

export interface LevelConfig {
  id: string;
  theme: 'bamboo' | 'castle' | 'volcano';
  tiles: number[][];
  upperPlatforms: Platform[];
  enemySpawns: { type: string; x: number; y: number; layer: Layer }[];
  bossType: string;
  bossX: number;
  bossY: number;
  items: { type: string; x: number; y: number; layer: Layer }[];
  scrollItems: { type: ShurikenType; x: number; y: number; layer: Layer }[];
  moonPhase: number;
  ribbonX: number;
  ribbonY: number;
  width: number;
  height: number;
}

interface LevelBuilderResult {
  tiles: number[][];
  upperPlatforms: Platform[];
  enemySpawns: { type: string; x: number; y: number; layer: Layer }[];
  items: { type: string; x: number; y: number; layer: Layer }[];
  scrollItems: { type: ShurikenType; x: number; y: number; layer: Layer }[];
}

function createEmptyGrid(cols: number, rows: number): number[][] {
  const grid: number[][] = [];
  for (let r = 0; r < rows; r++) {
    grid.push(new Array(cols).fill(0));
  }
  return grid;
}

function fillRect(grid: number[][], x: number, y: number, w: number, h: number, val: number): void {
  for (let r = y; r < y + h && r < grid.length; r++) {
    for (let c = x; c < x + w && c < grid[0].length; c++) {
      if (r >= 0 && c >= 0) {
        grid[r][c] = val;
      }
    }
  }
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function buildBambooLevel(): LevelBuilderResult {
  const cols = 120;
  const rows = 20;
  const tiles = createEmptyGrid(cols, rows);
  const rng = seededRandom(42);
  const upperPlatforms: Platform[] = [];
  const enemySpawns: { type: string; x: number; y: number; layer: Layer }[] = [];
  const items: { type: string; x: number; y: number; layer: Layer }[] = [];
  const scrollItems: { type: ShurikenType; x: number; y: number; layer: Layer }[] = [];

  fillRect(tiles, 0, 15, cols, 5, 1);

  const waterGaps = [
    { start: 25, width: 5 },
    { start: 55, width: 6 },
    { start: 90, width: 4 },
  ];
  for (const gap of waterGaps) {
    fillRect(tiles, gap.start, 15, gap.width, 5, 0);
    fillRect(tiles, gap.start, 17, gap.width, 3, 3);
  }

  fillRect(tiles, 12, 11, 4, 1, 2);
  fillRect(tiles, 30, 9, 5, 1, 2);
  fillRect(tiles, 45, 10, 3, 1, 2);
  fillRect(tiles, 60, 8, 6, 1, 2);
  fillRect(tiles, 75, 10, 4, 1, 2);
  fillRect(tiles, 85, 9, 3, 1, 2);
  fillRect(tiles, 100, 11, 5, 1, 2);

  for (let c = 8; c < cols; c += 15 + Math.floor(rng() * 8)) {
    const platY = 6 + Math.floor(rng() * 4);
    const platW = 2 + Math.floor(rng() * 4);
    upperPlatforms.push({ x: c * TILE_SIZE, y: platY * TILE_SIZE, width: platW * TILE_SIZE, layer: 'upper' });
  }

  const bambooPositions = [5, 18, 35, 48, 65, 78, 95, 108];
  for (const bx of bambooPositions) {
    if (tiles[14]) tiles[14][bx] = 0;
    if (tiles[13]) tiles[13][bx] = 0;
    fillRect(tiles, bx, 3, 1, 12, TILE_DECORATION);
  }

  enemySpawns.push(
    { type: 'samurai', x: 20 * TILE_SIZE, y: 14 * TILE_SIZE, layer: 'ground' },
    { type: 'samurai', x: 40 * TILE_SIZE, y: 14 * TILE_SIZE, layer: 'ground' },
    { type: 'samurai', x: 70 * TILE_SIZE, y: 14 * TILE_SIZE, layer: 'ground' },
    { type: 'ninja', x: 35 * TILE_SIZE, y: 8 * TILE_SIZE, layer: 'ground' },
    { type: 'ninja', x: 65 * TILE_SIZE, y: 7 * TILE_SIZE, layer: 'ground' },
    { type: 'shuriken_thrower', x: 32 * TILE_SIZE, y: 5 * TILE_SIZE, layer: 'upper' },
    { type: 'shuriken_thrower', x: 62 * TILE_SIZE, y: 5 * TILE_SIZE, layer: 'upper' },
  );

  items.push(
    { type: 'green', x: 15 * TILE_SIZE, y: 14 * TILE_SIZE, layer: 'ground' },
    { type: 'green', x: 50 * TILE_SIZE, y: 14 * TILE_SIZE, layer: 'ground' },
    { type: 'white', x: 35 * TILE_SIZE, y: 8 * TILE_SIZE, layer: 'ground' },
    { type: 'red', x: 80 * TILE_SIZE, y: 14 * TILE_SIZE, layer: 'ground' },
  );

  scrollItems.push({
    type: 'piercing',
    x: 62 * TILE_SIZE,
    y: 5 * TILE_SIZE,
    layer: 'upper',
  });

  return { tiles, upperPlatforms, enemySpawns, items, scrollItems };
}

function buildCastleLevel(): LevelBuilderResult {
  const cols = 100;
  const rows = 20;
  const tiles = createEmptyGrid(cols, rows);
  const rng = seededRandom(137);
  const upperPlatforms: Platform[] = [];
  const enemySpawns: { type: string; x: number; y: number; layer: Layer }[] = [];
  const items: { type: string; x: number; y: number; layer: Layer }[] = [];
  const scrollItems: { type: ShurikenType; x: number; y: number; layer: Layer }[] = [];

  fillRect(tiles, 0, 15, cols, 5, 1);

  fillRect(tiles, 20, 8, 2, 7, TILE_DECORATION);
  fillRect(tiles, 20, 8, 8, 2, 2);
  fillRect(tiles, 26, 8, 2, 4, TILE_DECORATION);

  fillRect(tiles, 45, 10, 2, 5, TILE_DECORATION);
  fillRect(tiles, 45, 10, 6, 2, 2);
  fillRect(tiles, 49, 10, 2, 3, TILE_DECORATION);

  fillRect(tiles, 65, 6, 2, 9, TILE_DECORATION);
  fillRect(tiles, 65, 6, 10, 2, 2);
  fillRect(tiles, 73, 6, 2, 5, TILE_DECORATION);

  fillRect(tiles, 80, 12, 2, 3, TILE_DECORATION);
  fillRect(tiles, 80, 12, 5, 2, 2);

  fillRect(tiles, 30, 12, 5, 1, 2);
  fillRect(tiles, 55, 11, 4, 1, 2);
  fillRect(tiles, 70, 10, 3, 1, 2);
  fillRect(tiles, 85, 13, 4, 1, 2);

  for (let c = 10; c < cols; c += 12 + Math.floor(rng() * 6)) {
    const platY = 4 + Math.floor(rng() * 3);
    const platW = 3 + Math.floor(rng() * 3);
    upperPlatforms.push({ x: c * TILE_SIZE, y: platY * TILE_SIZE, width: platW * TILE_SIZE, layer: 'upper' });
  }

  enemySpawns.push(
    { type: 'samurai', x: 18 * TILE_SIZE, y: 14 * TILE_SIZE, layer: 'ground' },
    { type: 'samurai', x: 38 * TILE_SIZE, y: 14 * TILE_SIZE, layer: 'ground' },
    { type: 'samurai', x: 58 * TILE_SIZE, y: 14 * TILE_SIZE, layer: 'ground' },
    { type: 'samurai', x: 78 * TILE_SIZE, y: 14 * TILE_SIZE, layer: 'ground' },
    { type: 'ninja', x: 25 * TILE_SIZE, y: 7 * TILE_SIZE, layer: 'ground' },
    { type: 'ninja', x: 50 * TILE_SIZE, y: 9 * TILE_SIZE, layer: 'ground' },
    { type: 'ninja', x: 68 * TILE_SIZE, y: 5 * TILE_SIZE, layer: 'ground' },
    { type: 'shuriken_thrower', x: 47 * TILE_SIZE, y: 3 * TILE_SIZE, layer: 'upper' },
  );

  items.push(
    { type: 'green', x: 15 * TILE_SIZE, y: 14 * TILE_SIZE, layer: 'ground' },
    { type: 'green', x: 55 * TILE_SIZE, y: 14 * TILE_SIZE, layer: 'ground' },
    { type: 'red', x: 35 * TILE_SIZE, y: 14 * TILE_SIZE, layer: 'ground' },
    { type: 'red', x: 75 * TILE_SIZE, y: 14 * TILE_SIZE, layer: 'ground' },
    { type: 'white', x: 60 * TILE_SIZE, y: 10 * TILE_SIZE, layer: 'ground' },
  );

  scrollItems.push({
    type: 'spread',
    x: 25 * TILE_SIZE,
    y: 4 * TILE_SIZE,
    layer: 'upper',
  });

  return { tiles, upperPlatforms, enemySpawns, items, scrollItems };
}

function buildVolcanoLevel(): LevelBuilderResult {
  const cols = 110;
  const rows = 20;
  const tiles = createEmptyGrid(cols, rows);
  const rng = seededRandom(256);
  const upperPlatforms: Platform[] = [];
  const enemySpawns: { type: string; x: number; y: number; layer: Layer }[] = [];
  const items: { type: string; x: number; y: number; layer: Layer }[] = [];
  const scrollItems: { type: ShurikenType; x: number; y: number; layer: Layer }[] = [];

  fillRect(tiles, 0, 15, cols, 5, 1);

  const lavaGaps = [
    { start: 15, width: 5 },
    { start: 35, width: 6 },
    { start: 55, width: 4 },
    { start: 75, width: 5 },
    { start: 95, width: 4 },
  ];
  for (const gap of lavaGaps) {
    fillRect(tiles, gap.start, 15, gap.width, 5, 0);
    fillRect(tiles, gap.start, 17, gap.width, 3, 3);
  }

  fillRect(tiles, 10, 12, 3, 1, 2);
  fillRect(tiles, 22, 11, 4, 1, 2);
  fillRect(tiles, 40, 10, 3, 1, 2);
  fillRect(tiles, 50, 12, 5, 1, 2);
  fillRect(tiles, 62, 11, 3, 1, 2);
  fillRect(tiles, 80, 10, 4, 1, 2);
  fillRect(tiles, 92, 12, 3, 1, 2);

  fillRect(tiles, 8, 5, 2, 10, TILE_DECORATION);
  fillRect(tiles, 30, 7, 2, 8, TILE_DECORATION);
  fillRect(tiles, 60, 6, 2, 9, TILE_DECORATION);
  fillRect(tiles, 88, 5, 2, 10, TILE_DECORATION);

  for (let c = 12; c < cols; c += 10 + Math.floor(rng() * 8)) {
    const platY = 4 + Math.floor(rng() * 4);
    const platW = 2 + Math.floor(rng() * 4);
    upperPlatforms.push({ x: c * TILE_SIZE, y: platY * TILE_SIZE, width: platW * TILE_SIZE, layer: 'upper' });
  }

  fillRect(tiles, 45, 14, 2, 1, 4);
  fillRect(tiles, 70, 14, 2, 1, 4);
  fillRect(tiles, 100, 14, 2, 1, 4);

  enemySpawns.push(
    { type: 'samurai', x: 12 * TILE_SIZE, y: 14 * TILE_SIZE, layer: 'ground' },
    { type: 'samurai', x: 28 * TILE_SIZE, y: 14 * TILE_SIZE, layer: 'ground' },
    { type: 'samurai', x: 48 * TILE_SIZE, y: 14 * TILE_SIZE, layer: 'ground' },
    { type: 'samurai', x: 68 * TILE_SIZE, y: 14 * TILE_SIZE, layer: 'ground' },
    { type: 'samurai', x: 88 * TILE_SIZE, y: 14 * TILE_SIZE, layer: 'ground' },
    { type: 'ninja', x: 25 * TILE_SIZE, y: 6 * TILE_SIZE, layer: 'ground' },
    { type: 'ninja', x: 52 * TILE_SIZE, y: 9 * TILE_SIZE, layer: 'ground' },
    { type: 'ninja', x: 82 * TILE_SIZE, y: 4 * TILE_SIZE, layer: 'ground' },
    { type: 'shuriken_thrower', x: 35 * TILE_SIZE, y: 3 * TILE_SIZE, layer: 'upper' },
    { type: 'shuriken_thrower', x: 65 * TILE_SIZE, y: 3 * TILE_SIZE, layer: 'upper' },
  );

  items.push(
    { type: 'green', x: 10 * TILE_SIZE, y: 14 * TILE_SIZE, layer: 'ground' },
    { type: 'green', x: 38 * TILE_SIZE, y: 14 * TILE_SIZE, layer: 'ground' },
    { type: 'green', x: 72 * TILE_SIZE, y: 14 * TILE_SIZE, layer: 'ground' },
    { type: 'red', x: 50 * TILE_SIZE, y: 9 * TILE_SIZE, layer: 'ground' },
    { type: 'red', x: 85 * TILE_SIZE, y: 14 * TILE_SIZE, layer: 'ground' },
    { type: 'white', x: 30 * TILE_SIZE, y: 6 * TILE_SIZE, layer: 'ground' },
    { type: 'white', x: 60 * TILE_SIZE, y: 5 * TILE_SIZE, layer: 'ground' },
  );

  scrollItems.push({
    type: 'piercing',
    x: 65 * TILE_SIZE,
    y: 3 * TILE_SIZE,
    layer: 'upper',
  });

  return { tiles, upperPlatforms, enemySpawns, items, scrollItems };
}

export function getLevel(levelNum: number, cycle: number): LevelConfig {
  const adjustedLevel = levelNum % 3;

  let builderResult: LevelBuilderResult = buildBambooLevel();
  let theme: 'bamboo' | 'castle' | 'volcano' = 'bamboo';
  let id = 'bamboo';
  let bossType = 'giant_monk';
  let bossX = 0;
  let bossY = 0;
  let moonPhase = 0;
  let width = 120;
  let height = 20;

  if (adjustedLevel === 0) {
    builderResult = buildBambooLevel();
    theme = 'bamboo';
    id = 'bamboo';
    bossType = 'giant_monk';
    bossX = 100 * TILE_SIZE;
    bossY = 14 * TILE_SIZE;
    moonPhase = 0.25;
    width = 120;
    height = 20;
  } else if (adjustedLevel === 1) {
    builderResult = buildCastleLevel();
    theme = 'castle';
    id = 'castle';
    bossType = 'shadow_master';
    bossX = 80 * TILE_SIZE;
    bossY = 14 * TILE_SIZE;
    moonPhase = 0.6;
    width = 100;
    height = 20;
  } else {
    builderResult = buildVolcanoLevel();
    theme = 'volcano';
    id = 'volcano';
    bossType = 'fire_sorcerer';
    bossX = 90 * TILE_SIZE;
    bossY = 14 * TILE_SIZE;
    moonPhase = 0.9;
    width = 110;
    height = 20;
  }

  const extraEnemies = cycle * 2;
  for (let i = 0; i < extraEnemies; i++) {
    const types = ['samurai', 'ninja', 'shuriken_thrower'];
    const t = types[i % types.length];
    const spawnX = (15 + Math.floor(Math.random() * (width - 30))) * TILE_SIZE;
    const spawnY = 14 * TILE_SIZE;
    const layer: Layer = t === 'shuriken_thrower' ? 'upper' : 'ground';
    builderResult.enemySpawns.push({ type: t, x: spawnX, y: spawnY, layer });
  }

  return {
    id,
    theme,
    tiles: builderResult.tiles,
    upperPlatforms: builderResult.upperPlatforms,
    enemySpawns: builderResult.enemySpawns,
    bossType,
    bossX,
    bossY,
    items: builderResult.items,
    scrollItems: builderResult.scrollItems,
    moonPhase,
    ribbonX: 3 * TILE_SIZE,
    ribbonY: 13 * TILE_SIZE,
    width,
    height,
  };
}
