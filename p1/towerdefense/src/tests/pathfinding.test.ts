import { describe, it, expect } from 'vitest';
import { Grid, AStar, PathSmoother } from '../core/Pathfinding';

describe('Grid System', () => {
  it('should create grid with correct dimensions', () => {
    const grid = new Grid(10, 10, 50);
    expect(grid.width).toBe(10);
    expect(grid.height).toBe(10);
    expect(grid.cellSize).toBe(50);
  });

  it('should set and check walkable state correctly', () => {
    const grid = new Grid(5, 5, 50);
    
    expect(grid.isWalkable(2, 2)).toBe(true);
    grid.setWalkable(2, 2, false);
    expect(grid.isWalkable(2, 2)).toBe(false);
  });

  it('should convert world coordinates to grid coordinates', () => {
    const grid = new Grid(10, 10, 50);
    
    const gridPos = grid.worldToGrid(125, 175);
    expect(gridPos.x).toBe(2);
    expect(gridPos.y).toBe(3);
  });

  it('should convert grid coordinates to world coordinates (center)', () => {
    const grid = new Grid(10, 10, 50);
    
    const worldPos = grid.gridToWorld(2, 3);
    expect(worldPos.x).toBe(125);
    expect(worldPos.y).toBe(175);
  });

  it('should return null for out of bounds cells', () => {
    const grid = new Grid(5, 5, 50);
    
    expect(grid.getCell(-1, 2)).toBeNull();
    expect(grid.getCell(5, 2)).toBeNull();
    expect(grid.getCell(2, -1)).toBeNull();
    expect(grid.getCell(2, 5)).toBeNull();
  });
});

describe('A* Pathfinding', () => {
  it('should find direct path when no obstacles', () => {
    const grid = new Grid(10, 10, 50);
    const astar = new AStar(grid);
    
    const startX = 25;
    const startY = 25;
    const endX = 425;
    const endY = 425;
    
    const path = astar.findPath(startX, startY, endX, endY);
    
    expect(path.length).toBeGreaterThan(0);
    expect(path[0].x).toBeCloseTo(25);
    expect(path[0].y).toBeCloseTo(25);
    expect(path[path.length - 1].x).toBeCloseTo(425);
    expect(path[path.length - 1].y).toBeCloseTo(425);
  });

  it('should find path around obstacles', () => {
    const grid = new Grid(10, 10, 50);
    const astar = new AStar(grid);
    
    for (let i = 0; i < 10; i++) {
      grid.setWalkable(5, i, false);
    }
    
    const startX = 125;
    const startY = 225;
    const endX = 375;
    const endY = 225;
    
    const path = astar.findPath(startX, startY, endX, endY);
    
    expect(path.length).toBeGreaterThan(0);
    
    for (const point of path) {
      const gridPos = grid.worldToGrid(point.x, point.y);
      expect(grid.isWalkable(gridPos.x, gridPos.y)).toBe(true);
    }
  });

  it('should return empty path when start is blocked', () => {
    const grid = new Grid(10, 10, 50);
    const astar = new AStar(grid);
    
    grid.setWalkable(0, 0, false);
    
    const path = astar.findPath(25, 25, 425, 425);
    
    expect(path).toHaveLength(0);
  });

  it('should return empty path when no path exists', () => {
    const grid = new Grid(10, 10, 50);
    const astar = new AStar(grid);
    
    for (let i = 0; i < 10; i++) {
      grid.setWalkable(5, i, false);
    }
    
    const path = astar.findPath(100, 250, 400, 250);
    
    expect(path).toHaveLength(0);
  });
});

describe('Path Smoother', () => {
  it('should return original path if too short', () => {
    const grid = new Grid(10, 10, 50);
    const shortPath = [
      { x: 25, y: 25 },
      { x: 75, y: 75 }
    ];
    
    const smoothed = PathSmoother.smoothPath(shortPath, grid);
    expect(smoothed).toHaveLength(2);
  });

  it('should smooth zigzag path', () => {
    const grid = new Grid(10, 10, 50);
    const zigzagPath = [
      { x: 25, y: 25 },
      { x: 75, y: 25 },
      { x: 75, y: 75 },
      { x: 125, y: 75 },
      { x: 125, y: 125 }
    ];
    
    const smoothed = PathSmoother.smoothPath(zigzagPath, grid);
    
    expect(smoothed.length).toBeLessThan(zigzagPath.length);
    expect(smoothed[0]).toEqual(zigzagPath[0]);
    expect(smoothed[smoothed.length - 1]).toEqual(zigzagPath[zigzagPath.length - 1]);
  });

  it('should not create path through obstacles', () => {
    const grid = new Grid(10, 10, 50);
    const astar = new AStar(grid);
    
    grid.setWalkable(5, 5, false);
    
    const path = astar.findPath(25, 25, 425, 425);
    const smoothed = PathSmoother.smoothPath(path, grid);
    
    for (const point of smoothed) {
      const gridPos = grid.worldToGrid(point.x, point.y);
      expect(grid.isWalkable(gridPos.x, gridPos.y)).toBe(true);
    }
  });
});
