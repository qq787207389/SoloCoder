import type { Position, MapData } from '../types';
import { manhattanDistance } from '../utils/math';

interface PathNode {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: PathNode | null;
}

export class Pathfinding {
  private map: MapData;
  private walkableCache: boolean[][];
  private cacheTime: number = 0;

  constructor(map: MapData) {
    this.map = map;
    this.walkableCache = [];
  }

  updateMap(map: MapData): void {
    this.map = map;
    this.walkableCache = [];
  }

  private isWalkable(
    gridX: number,
    gridY: number,
    buildings: Array<{ x: number; y: number; width: number; height: number }>,
    resources: Array<{ x: number; y: number }>
  ): boolean {
    if (gridX < 0 || gridX >= this.map.width || gridY < 0 || gridY >= this.map.height) {
      return false;
    }

    if (this.map.tiles[gridY]?.[gridX] === 1) {
      return false;
    }

    for (const building of buildings) {
      const bx = Math.floor(building.x / this.map.tileSize);
      const by = Math.floor(building.y / this.map.tileSize);
      const bw = Math.ceil(building.width / this.map.tileSize);
      const bh = Math.ceil(building.height / this.map.tileSize);
      if (
        gridX >= bx &&
        gridX < bx + bw &&
        gridY >= by &&
        gridY < by + bh
      ) {
        return false;
      }
    }

    for (const resource of resources) {
      const rx = Math.floor(resource.x / this.map.tileSize);
      const ry = Math.floor(resource.y / this.map.tileSize);
      if (gridX === rx && gridY === ry) {
        return false;
      }
    }

    return true;
  }

  private canMoveDiagonal(
    x: number,
    y: number,
    dx: number,
    dy: number,
    buildings: Array<{ x: number; y: number; width: number; height: number }>,
    resources: Array<{ x: number; y: number }>
  ): boolean {
    const canMoveX = this.isWalkable(x + dx, y, buildings, resources);
    const canMoveY = this.isWalkable(x, y + dy, buildings, resources);
    return canMoveX && canMoveY;
  }

  findPath(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    buildings: Array<{ x: number; y: number; width: number; height: number }>,
    resources: Array<{ x: number; y: number }>
  ): Position[] {
    const startGridX = Math.floor(startX / this.map.tileSize);
    const startGridY = Math.floor(startY / this.map.tileSize);
    const endGridX = Math.floor(endX / this.map.tileSize);
    const endGridY = Math.floor(endY / this.map.tileSize);

    if (startGridX === endGridX && startGridY === endGridY) {
      return [{ x: endX, y: endY }];
    }

    const openList: PathNode[] = [];
    const closedSet = new Set<string>();

    const startNode: PathNode = {
      x: startGridX,
      y: startGridY,
      g: 0,
      h: manhattanDistance({ x: startGridX, y: startGridY }, { x: endGridX, y: endGridY }),
      f: 0,
      parent: null
    };
    startNode.f = startNode.g + startNode.h;
    openList.push(startNode);

    const directions = [
      { dx: 0, dy: -1, cost: 1 },
      { dx: 1, dy: 0, cost: 1 },
      { dx: 0, dy: 1, cost: 1 },
      { dx: -1, dy: 0, cost: 1 },
      { dx: 1, dy: -1, cost: 1.4, diagonal: true },
      { dx: 1, dy: 1, cost: 1.4, diagonal: true },
      { dx: -1, dy: 1, cost: 1.4, diagonal: true },
      { dx: -1, dy: -1, cost: 1.4, diagonal: true }
    ];

    let iterations = 0;
    const maxIterations = 2000;

    while (openList.length > 0 && iterations < maxIterations) {
      iterations++;
      openList.sort((a, b) => a.f - b.f);
      const current = openList.shift()!;

      if (current.x === endGridX && current.y === endGridY) {
        return this.reconstructPath(current);
      }

      closedSet.add(`${current.x},${current.y}`);

      for (const dir of directions) {
        const nx = current.x + dir.dx;
        const ny = current.y + dir.dy;
        const key = `${nx},${ny}`;

        if (closedSet.has(key)) continue;
        if (!this.isWalkable(nx, ny, buildings, resources)) continue;

        if (dir.diagonal && !this.canMoveDiagonal(current.x, current.y, dir.dx, dir.dy, buildings, resources)) {
          continue;
        }

        const g = current.g + dir.cost;
        const h = manhattanDistance({ x: nx, y: ny }, { x: endGridX, y: endGridY });
        const f = g + h;

        const existing = openList.find(n => n.x === nx && n.y === ny);
        if (existing) {
          if (g < existing.g) {
            existing.g = g;
            existing.f = f;
            existing.parent = current;
          }
        } else {
          openList.push({ x: nx, y: ny, g, h, f, parent: current });
        }
      }
    }

    return this.findNearestWalkableDirect(endGridX, endGridY, buildings, resources);
  }

  private findNearestWalkableDirect(
    targetX: number,
    targetY: number,
    buildings: Array<{ x: number; y: number; width: number; height: number }>,
    resources: Array<{ x: number; y: number }>
  ): Position[] {
    for (let radius = 1; radius < 15; radius++) {
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          const nx = targetX + dx;
          const ny = targetY + dy;
          if (this.isWalkable(nx, ny, buildings, resources)) {
            return [{
              x: nx * this.map.tileSize + this.map.tileSize / 2,
              y: ny * this.map.tileSize + this.map.tileSize / 2
            }];
          }
        }
      }
    }
    return [];
  }

  private reconstructPath(node: PathNode): Position[] {
    const path: Position[] = [];
    let current: PathNode | null = node;

    while (current) {
      path.unshift({
        x: current.x * this.map.tileSize + this.map.tileSize / 2,
        y: current.y * this.map.tileSize + this.map.tileSize / 2
      });
      current = current.parent;
    }

    return path;
  }
}
