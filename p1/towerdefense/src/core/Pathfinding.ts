export interface GridCell {
  x: number;
  y: number;
  walkable: boolean;
  cost: number;
}

export interface PathNode {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: PathNode | null;
}

export class Grid {
  private cells: GridCell[][];
  public width: number;
  public height: number;
  public cellSize: number;

  constructor(width: number, height: number, cellSize: number) {
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.cells = [];
    this.initialize();
  }

  private initialize(): void {
    for (let y = 0; y < this.height; y++) {
      this.cells[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.cells[y][x] = {
          x,
          y,
          walkable: true,
          cost: 1
        };
      }
    }
  }

  getCell(x: number, y: number): GridCell | null {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return null;
    }
    return this.cells[y][x];
  }

  setWalkable(x: number, y: number, walkable: boolean): void {
    const cell = this.getCell(x, y);
    if (cell) {
      cell.walkable = walkable;
    }
  }

  isWalkable(x: number, y: number): boolean {
    const cell = this.getCell(x, y);
    return cell ? cell.walkable : false;
  }

  worldToGrid(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: Math.floor(worldX / this.cellSize),
      y: Math.floor(worldY / this.cellSize)
    };
  }

  gridToWorld(gridX: number, gridY: number): { x: number; y: number } {
    return {
      x: gridX * this.cellSize + this.cellSize / 2,
      y: gridY * this.cellSize + this.cellSize / 2
    };
  }

  getNeighbors(x: number, y: number, allowDiagonal: boolean = true): GridCell[] {
    const neighbors: GridCell[] = [];
    const directions = allowDiagonal
      ? [
          { dx: 0, dy: -1 }, { dx: 1, dy: -1 }, { dx: 1, dy: 0 }, { dx: 1, dy: 1 },
          { dx: 0, dy: 1 }, { dx: -1, dy: 1 }, { dx: -1, dy: 0 }, { dx: -1, dy: -1 }
        ]
      : [
          { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }
        ];

    for (const dir of directions) {
      const cell = this.getCell(x + dir.dx, y + dir.dy);
      if (cell && cell.walkable) {
        neighbors.push(cell);
      }
    }

    return neighbors;
  }
}

export class AStar {
  private grid: Grid;

  constructor(grid: Grid) {
    this.grid = grid;
  }

  findPath(startX: number, startY: number, endX: number, endY: number): { x: number; y: number }[] {
    const startGrid = this.grid.worldToGrid(startX, startY);
    const endGrid = this.grid.worldToGrid(endX, endY);

    if (!this.grid.isWalkable(startGrid.x, startGrid.y) || 
        !this.grid.isWalkable(endGrid.x, endGrid.y)) {
      return [];
    }

    const openList: PathNode[] = [];
    const closedSet = new Set<string>();

    const startNode: PathNode = {
      x: startGrid.x,
      y: startGrid.y,
      g: 0,
      h: this.heuristic(startGrid.x, startGrid.y, endGrid.x, endGrid.y),
      f: 0,
      parent: null
    };
    startNode.f = startNode.g + startNode.h;
    openList.push(startNode);

    while (openList.length > 0) {
      openList.sort((a, b) => a.f - b.f);
      const current = openList.shift()!;

      if (current.x === endGrid.x && current.y === endGrid.y) {
        return this.reconstructPath(current);
      }

      closedSet.add(`${current.x},${current.y}`);

      const neighbors = this.grid.getNeighbors(current.x, current.y, false);
      
      for (const neighbor of neighbors) {
        if (closedSet.has(`${neighbor.x},${neighbor.y}`)) {
          continue;
        }

        const dx = Math.abs(neighbor.x - current.x);
        const dy = Math.abs(neighbor.y - current.y);
        const moveCost = dx === 1 && dy === 1 ? 1.4 : 1;
        const tentativeG = current.g + moveCost * neighbor.cost;

        const existingNode = openList.find(n => n.x === neighbor.x && n.y === neighbor.y);
        
        if (!existingNode) {
          const newNode: PathNode = {
            x: neighbor.x,
            y: neighbor.y,
            g: tentativeG,
            h: this.heuristic(neighbor.x, neighbor.y, endGrid.x, endGrid.y),
            f: 0,
            parent: current
          };
          newNode.f = newNode.g + newNode.h;
          openList.push(newNode);
        } else if (tentativeG < existingNode.g) {
          existingNode.g = tentativeG;
          existingNode.f = existingNode.g + existingNode.h;
          existingNode.parent = current;
        }
      }
    }

    return [];
  }

  private heuristic(x1: number, y1: number, x2: number, y2: number): number {
    const dx = Math.abs(x1 - x2);
    const dy = Math.abs(y1 - y2);
    return (dx + dy) + (1.4 - 2) * Math.min(dx, dy);
  }

  private reconstructPath(node: PathNode): { x: number; y: number }[] {
    const path: { x: number; y: number }[] = [];
    let current: PathNode | null = node;

    while (current) {
      const worldPos = this.grid.gridToWorld(current.x, current.y);
      path.unshift(worldPos);
      current = current.parent;
    }

    return path;
  }
}

export class PathSmoother {
  static smoothPath(path: { x: number; y: number }[], grid: Grid): { x: number; y: number }[] {
    if (path.length < 3) return path;

    const smoothed: { x: number; y: number }[] = [path[0]];
    let currentIndex = 0;

    while (currentIndex < path.length - 1) {
      let found = false;
      
      for (let i = path.length - 1; i > currentIndex; i--) {
        if (this.hasLineOfSight(path[currentIndex], path[i], grid)) {
          smoothed.push(path[i]);
          currentIndex = i;
          found = true;
          break;
        }
      }

      if (!found) {
        currentIndex++;
        smoothed.push(path[currentIndex]);
      }
    }

    return smoothed;
  }

  private static hasLineOfSight(
    start: { x: number; y: number }, 
    end: { x: number; y: number }, 
    grid: Grid
  ): boolean {
    const startGrid = grid.worldToGrid(start.x, start.y);
    const endGrid = grid.worldToGrid(end.x, end.y);

    let x0 = startGrid.x;
    let y0 = startGrid.y;
    const x1 = endGrid.x;
    const y1 = endGrid.y;

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (x0 !== x1 || y0 !== y1) {
      if (!grid.isWalkable(x0, y0)) {
        return false;
      }

      const e2 = 2 * err;
      
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }

    return grid.isWalkable(x1, y1);
  }
}
