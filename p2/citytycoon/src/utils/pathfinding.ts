import { Position, TileType, Tile } from '../types';

interface Node {
  position: Position;
  g: number;
  h: number;
  f: number;
  parent: Node | null;
}

function heuristic(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function getNeighbors(position: Position, map: Tile[][]): Position[] {
  const neighbors: Position[] = [];
  const directions = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 }
  ];

  for (const dir of directions) {
    const newX = position.x + dir.x;
    const newY = position.y + dir.y;

    if (
      newX >= 0 &&
      newX < map[0].length &&
      newY >= 0 &&
      newY < map.length
    ) {
      const tile = map[newY][newX];
      if (tile.type === TileType.ROAD || tile.type === TileType.EMPTY) {
        neighbors.push({ x: newX, y: newY });
      }
    }
  }

  return neighbors;
}

export function findPath(
  start: Position,
  end: Position,
  map: Tile[][]
): Position[] {
  const openSet: Node[] = [];
  const closedSet = new Set<string>();

  const startNode: Node = {
    position: start,
    g: 0,
    h: heuristic(start, end),
    f: heuristic(start, end),
    parent: null
  };

  openSet.push(startNode);

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;

    if (current.position.x === end.x && current.position.y === end.y) {
      const path: Position[] = [];
      let node: Node | null = current;
      while (node) {
        path.unshift(node.position);
        node = node.parent;
      }
      return path;
    }

    const key = `${current.position.x},${current.position.y}`;
    closedSet.add(key);

    const neighbors = getNeighbors(current.position, map);

    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      if (closedSet.has(neighborKey)) continue;

      const g = current.g + 1;
      const h = heuristic(neighbor, end);
      const f = g + h;

      const existingNode = openSet.find(
        n => n.position.x === neighbor.x && n.position.y === neighbor.y
      );

      if (existingNode) {
        if (g < existingNode.g) {
          existingNode.g = g;
          existingNode.f = f;
          existingNode.parent = current;
        }
      } else {
        openSet.push({
          position: neighbor,
          g,
          h,
          f,
          parent: current
        });
      }
    }
  }

  return [];
}

export function findNearestRoad(
  position: Position,
  map: Tile[][]
): Position | null {
  const maxDistance = 10;
  
  for (let distance = 1; distance <= maxDistance; distance++) {
    for (let dx = -distance; dx <= distance; dx++) {
      for (let dy = -distance; dy <= distance; dy++) {
        if (Math.abs(dx) + Math.abs(dy) !== distance) continue;
        
        const x = position.x + dx;
        const y = position.y + dy;
        
        if (x >= 0 && x < map[0].length && y >= 0 && y < map.length) {
          if (map[y][x].type === TileType.ROAD) {
            return { x, y };
          }
        }
      }
    }
  }
  
  return null;
}
