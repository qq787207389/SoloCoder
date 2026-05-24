import { Point, GameMap, Tile } from '../types/game';

interface PathNode {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: PathNode | null;
}

function heuristic(a: Point, b: Point): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function getNeighbors(point: Point, map: GameMap): Point[] {
  const neighbors: Point[] = [];
  const directions = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
  ];

  for (const dir of directions) {
    const nx = point.x + dir.x;
    const ny = point.y + dir.y;
    if (nx >= 0 && nx < map.width && ny >= 0 && ny < map.height) {
      neighbors.push({ x: nx, y: ny });
    }
  }

  return neighbors;
}

export function findPath(
  map: GameMap,
  start: Point,
  end: Point,
  passableCheck?: (tile: Tile) => boolean
): Point[] {
  const defaultPassable = (tile: Tile) => tile.passable;
  const isPassable = passableCheck || defaultPassable;

  if (!isPassable(map.tiles[end.y][end.x])) {
    return [];
  }

  const openList: PathNode[] = [];
  const closedSet = new Set<string>();

  const startNode: PathNode = {
    x: start.x,
    y: start.y,
    g: 0,
    h: heuristic(start, end),
    f: heuristic(start, end),
    parent: null,
  };

  openList.push(startNode);

  while (openList.length > 0) {
    openList.sort((a, b) => a.f - b.f);
    const current = openList.shift()!;

    if (current.x === end.x && current.y === end.y) {
      const path: Point[] = [];
      let node: PathNode | null = current;
      while (node) {
        path.unshift({ x: node.x, y: node.y });
        node = node.parent;
      }
      return path;
    }

    closedSet.add(`${current.x},${current.y}`);

    for (const neighbor of getNeighbors(current, map)) {
      const key = `${neighbor.x},${neighbor.y}`;
      if (closedSet.has(key)) continue;

      const tile = map.tiles[neighbor.y][neighbor.x];
      if (!isPassable(tile)) continue;

      const g = current.g + 1;
      const h = heuristic(neighbor, end);
      const f = g + h;

      const existingNode = openList.find((n) => n.x === neighbor.x && n.y === neighbor.y);
      if (existingNode) {
        if (g < existingNode.g) {
          existingNode.g = g;
          existingNode.f = f;
          existingNode.parent = current;
        }
      } else {
        openList.push({
          x: neighbor.x,
          y: neighbor.y,
          g,
          h,
          f,
          parent: current,
        });
      }
    }
  }

  return [];
}

export function findRandomPath(map: GameMap, start: Point, maxLength: number): Point[] {
  const path: Point[] = [{ ...start }];
  let current = { ...start };
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}`);

  for (let i = 0; i < maxLength; i++) {
    const neighbors = getNeighbors(current, map).filter((n) => {
      const tile = map.tiles[n.y][n.x];
      return tile.passable && !visited.has(`${n.x},${n.y}`);
    });

    if (neighbors.length === 0) break;

    const next = neighbors[Math.floor(Math.random() * neighbors.length)];
    path.push(next);
    visited.add(`${next.x},${next.y}`);
    current = next;
  }

  return path;
}
