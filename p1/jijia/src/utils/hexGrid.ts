
import { HexCoord, HexTile, TerrainType } from '../types';

export const HEX_DIRECTIONS: HexCoord[] = [
  { q: 1, r: 0 },
  { q: 1, r: -1 },
  { q: 0, r: -1 },
  { q: -1, r: 0 },
  { q: -1, r: 1 },
  { q: 0, r: 1 },
];

export function hexEquals(a: HexCoord, b: HexCoord): boolean {
  return a.q === b.q && a.r === b.r;
}

export function hexAdd(a: HexCoord, b: HexCoord): HexCoord {
  return { q: a.q + b.q, r: a.r + b.r };
}

export function hexSubtract(a: HexCoord, b: HexCoord): HexCoord {
  return { q: a.q - b.q, r: a.r - b.r };
}

export function hexMultiply(hex: HexCoord, scalar: number): HexCoord {
  return { q: hex.q * scalar, r: hex.r * scalar };
}

export function hexLength(hex: HexCoord): number {
  return (Math.abs(hex.q) + Math.abs(hex.q + hex.r) + Math.abs(hex.r)) / 2;
}

export function hexDistance(a: HexCoord, b: HexCoord): number {
  return hexLength(hexSubtract(a, b));
}

export function hexNeighbor(hex: HexCoord, direction: number): HexCoord {
  return hexAdd(hex, HEX_DIRECTIONS[direction]);
}

export function hexNeighbors(hex: HexCoord): HexCoord[] {
  return HEX_DIRECTIONS.map((dir) => hexAdd(hex, dir));
}

export function hexRing(center: HexCoord, radius: number): HexCoord[] {
  const results: HexCoord[] = [];
  if (radius === 0) return [center];

  let hex = hexAdd(center, hexMultiply(HEX_DIRECTIONS[4], radius));

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < radius; j++) {
      results.push(hex);
      hex = hexNeighbor(hex, i);
    }
  }

  return results;
}

export function hexRange(center: HexCoord, radius: number): HexCoord[] {
  const results: HexCoord[] = [];
  for (let q = -radius; q <= radius; q++) {
    for (let r = Math.max(-radius, -q - radius); r <= Math.min(radius, -q + radius); r++) {
      results.push({ q: center.q + q, r: center.r + r });
    }
  }
  return results;
}

export function hexToPixel(hex: HexCoord, size: number): { x: number; y: number } {
  const x = size * (3 / 2) * hex.q;
  const y = size * ((Math.sqrt(3) / 2) * hex.q + Math.sqrt(3) * hex.r);
  return { x, y };
}

export function pixelToHex(x: number, y: number, size: number): HexCoord {
  const q = ((2 / 3) * x) / size;
  const r = ((-1 / 3) * x + (Math.sqrt(3) / 3) * y) / size;
  return hexRound({ q, r });
}

export function hexRound(hex: { q: number; r: number }): HexCoord {
  let q = Math.round(hex.q);
  let r = Math.round(hex.r);
  const s = Math.round(-hex.q - hex.r);

  const qDiff = Math.abs(q - hex.q);
  const rDiff = Math.abs(r - hex.r);
  const sDiff = Math.abs(s - (-hex.q - hex.r));

  if (qDiff > rDiff && qDiff > sDiff) {
    q = -r - s;
  } else if (rDiff > sDiff) {
    r = -q - s;
  }

  return { q, r };
}

export function createHexGrid(radius: number): HexTile[][] {
  const grid: HexTile[][] = [];

  for (let q = -radius; q <= radius; q++) {
    const row: HexTile[] = [];
    for (let r = Math.max(-radius, -q - radius); r <= Math.min(radius, -q + radius); r++) {
      let terrain: TerrainType = 'normal';
      const rand = Math.random();
      if (rand < 0.1) terrain = 'cover';
      else if (rand < 0.15) terrain = 'highGround';
      else if (rand < 0.18) terrain = 'explosive';
      else if (rand < 0.22) terrain = 'obstacle';

      row.push({
        coord: { q, r },
        terrain,
      });
    }
    grid.push(row);
  }

  return grid;
}

export function findPath(
  start: HexCoord,
  goal: HexCoord,
  grid: HexTile[][],
  maxCost: number
): HexCoord[] | null {
  const flatGrid = grid.flat();
  const getTile = (coord: HexCoord) => flatGrid.find((t) => hexEquals(t.coord, coord));

  const openSet: HexCoord[] = [start];
  const cameFrom = new Map<string, HexCoord>();
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();

  const key = (h: HexCoord) => `${h.q},${h.r}`;

  gScore.set(key(start), 0);
  fScore.set(key(start), hexDistance(start, goal));

  while (openSet.length > 0) {
    openSet.sort((a, b) => (fScore.get(key(a)) || Infinity) - (fScore.get(key(b)) || Infinity));
    const current = openSet.shift()!;

    if (hexEquals(current, goal)) {
      const path: HexCoord[] = [current];
      let c = current;
      while (cameFrom.has(key(c))) {
        c = cameFrom.get(key(c))!;
        path.unshift(c);
      }
      return path;
    }

    for (const neighbor of hexNeighbors(current)) {
      const tile = getTile(neighbor);
      if (!tile || tile.terrain === 'obstacle' || tile.occupiedBy) continue;

      const moveCost = tile.terrain === 'highGround' ? 2 : 1;
      const tentativeG = (gScore.get(key(current)) || 0) + moveCost;

      if (tentativeG > maxCost) continue;

      if (tentativeG < (gScore.get(key(neighbor)) || Infinity)) {
        cameFrom.set(key(neighbor), current);
        gScore.set(key(neighbor), tentativeG);
        fScore.set(key(neighbor), tentativeG + hexDistance(neighbor, goal));

        if (!openSet.some((h) => hexEquals(h, neighbor))) {
          openSet.push(neighbor);
        }
      }
    }
  }

  return null;
}

export function getMovableRange(
  start: HexCoord,
  grid: HexTile[][],
  movePoints: number
): HexCoord[] {
  const result: HexCoord[] = [];
  const flatGrid = grid.flat();
  const getTile = (coord: HexCoord) => flatGrid.find((t) => hexEquals(t.coord, coord));

  const visited = new Set<string>();
  const queue: { coord: HexCoord; cost: number }[] = [{ coord: start, cost: 0 }];
  const key = (h: HexCoord) => `${h.q},${h.r}`;

  while (queue.length > 0) {
    queue.sort((a, b) => a.cost - b.cost);
    const { coord, cost } = queue.shift()!;

    if (visited.has(key(coord))) continue;
    visited.add(key(coord));

    if (cost <= movePoints && !hexEquals(coord, start)) {
      result.push(coord);
    }

    for (const neighbor of hexNeighbors(coord)) {
      const tile = getTile(neighbor);
      if (!tile || tile.terrain === 'obstacle' || tile.occupiedBy) continue;

      const moveCost = tile.terrain === 'highGround' ? 2 : 1;
      const newCost = cost + moveCost;

      if (newCost <= movePoints && !visited.has(key(neighbor))) {
        queue.push({ coord: neighbor, cost: newCost });
      }
    }
  }

  return result;
}

export function getAttackRange(
  start: HexCoord,
  grid: HexTile[][],
  minRange: number,
  maxRange: number
): HexCoord[] {
  const result: HexCoord[] = [];
  const flatGrid = grid.flat();
  const getTile = (coord: HexCoord) => flatGrid.find((t) => hexEquals(t.coord, coord));

  for (let r = minRange; r <= maxRange; r++) {
    const ring = hexRing(start, r);
    for (const coord of ring) {
      const tile = getTile(coord);
      if (tile && tile.terrain !== 'obstacle') {
        result.push(coord);
      }
    }
  }

  return result;
}
