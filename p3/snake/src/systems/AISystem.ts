import { Snake } from '../entities/Snake';
import { Food } from '../entities/Food';
import { Obstacle } from '../entities/Obstacle';
import { Direction, AIStrategy } from '../types';
import gameConfig from '../config/gameConfig.json';

export class AISystem {
  private gridWidth: number;
  private gridHeight: number;
  private strategy: AIStrategy;

  constructor(gridWidth: number, gridHeight: number, strategy: AIStrategy = 'defensive') {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.strategy = strategy;
  }

  public update(
    snake: Snake,
    foods: Food[],
    otherSnakes: Snake[],
    obstacles: Obstacle[],
    wrapWalls: boolean
  ): void {
    if (!snake.getIsAlive()) return;

    const config = gameConfig.aiStrategies[this.strategy];
    const head = snake.getHeadPosition();
    const currentDirection = snake.getDirection();

    const possibleDirections: Direction[] = ['up', 'down', 'left', 'right'];
    const opposites: Record<Direction, Direction> = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left'
    };

    const validDirections = possibleDirections.filter((d) => d !== opposites[currentDirection]);

    const safeDirections = validDirections.filter((dir) =>
      this.isDirectionSafe(snake, dir, otherSnakes, obstacles, wrapWalls)
    );

    if (safeDirections.length === 0) {
      if (validDirections.length > 0) {
        snake.setDirection(validDirections[Math.floor(Math.random() * validDirections.length)]);
      }
      return;
    }

    let bestDirection: Direction = safeDirections[0];
    let bestScore = -Infinity;

    for (const dir of safeDirections) {
      const newPos = this.getNextPosition(head, dir);
      let score = 0;

      const nearestFood = this.findNearestFood(newPos, foods);
      if (nearestFood) {
        const dist = this.getDistance(newPos, nearestFood.getPosition());
        score += (100 - dist) * config.foodPriority;
      }

      for (const other of otherSnakes) {
        if (!other.getIsAlive()) continue;
        const otherHead = other.getHeadPosition();
        const dist = this.getDistance(newPos, otherHead);

        if (dist < 5) {
          if (this.strategy === 'aggressive') {
            score += (10 - dist) * config.playerChase;
          } else if (this.strategy === 'defensive') {
            score -= (10 - dist) * (1 - config.playerChase);
          }
        }
      }

      score += Math.random() * 10 * config.patrolChance;

      if (score > bestScore) {
        bestScore = score;
        bestDirection = dir;
      }
    }

    snake.setDirection(bestDirection);
  }

  private isDirectionSafe(
    snake: Snake,
    direction: Direction,
    otherSnakes: Snake[],
    obstacles: Obstacle[],
    wrapWalls: boolean
  ): boolean {
    const head = snake.getHeadPosition();
    const newPos = this.getNextPosition(head, direction);

    if (!wrapWalls && snake.getPowerUp() !== 'phase') {
      if (newPos.x < 0 || newPos.x >= this.gridWidth || newPos.y < 0 || newPos.y >= this.gridHeight) {
        return false;
      }
    }

    const segments = snake.getSegments();
    for (let i = 1; i < segments.length; i++) {
      if (segments[i].x === newPos.x && segments[i].y === newPos.y) {
        return false;
      }
    }

    for (const other of otherSnakes) {
      if (!other.getIsAlive()) continue;
      const otherSegments = other.getSegments();
      for (const seg of otherSegments) {
        if (seg.x === newPos.x && seg.y === newPos.y) {
          return false;
        }
      }
    }

    if (snake.getPowerUp() !== 'phase') {
      for (const obs of obstacles) {
        const pos = obs.getPosition();
        if (pos.x === newPos.x && pos.y === newPos.y) {
          return false;
        }
      }
    }

    return true;
  }

  private getNextPosition(pos: { x: number; y: number }, direction: Direction): { x: number; y: number } {
    switch (direction) {
      case 'up': return { x: pos.x, y: pos.y - 1 };
      case 'down': return { x: pos.x, y: pos.y + 1 };
      case 'left': return { x: pos.x - 1, y: pos.y };
      case 'right': return { x: pos.x + 1, y: pos.y };
    }
  }

  private findNearestFood(pos: { x: number; y: number }, foods: Food[]): Food | null {
    let nearest: Food | null = null;
    let minDist = Infinity;

    for (const food of foods) {
      const dist = this.getDistance(pos, food.getPosition());
      if (dist < minDist) {
        minDist = dist;
        nearest = food;
      }
    }

    return nearest;
  }

  private getDistance(a: { x: number; y: number }, b: { x: number; y: number }): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  public setStrategy(strategy: AIStrategy): void {
    this.strategy = strategy;
  }

  public getStrategy(): AIStrategy {
    return this.strategy;
  }
}