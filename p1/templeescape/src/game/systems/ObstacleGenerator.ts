import { GameConfig } from '../config/GameConfig';
import type { ObstacleType } from '../entities/Obstacle';
import { randomInt, randomRange, randomChoice } from '../utils/MathUtils';

interface SpawnPattern {
  obstacles: { lane: number; type: ObstacleType }[];
  minGap: number;
}

export class ObstacleGenerator {
  private difficulty: number = 1;
  private lastSpawnZ: number = 0;
  private patterns: SpawnPattern[] = [];

  constructor() {
    this.initializePatterns();
  }

  private initializePatterns(): void {
    this.patterns = [
      { obstacles: [{ lane: 0, type: 'treeStump' }], minGap: 8 },
      { obstacles: [{ lane: 1, type: 'fence' }], minGap: 8 },
      { obstacles: [{ lane: 2, type: 'rock' }], minGap: 8 },
      { obstacles: [{ lane: 1, type: 'beam' }], minGap: 10 },
      { obstacles: [{ lane: 0, type: 'spikes' }], minGap: 10 },
      { obstacles: [{ lane: 1, type: 'branch' }], minGap: 10 },
      { obstacles: [{ lane: 2, type: 'fire' }], minGap: 12 },
      {
        obstacles: [
          { lane: 0, type: 'treeStump' },
          { lane: 2, type: 'rock' },
        ],
        minGap: 12,
      },
      {
        obstacles: [
          { lane: 0, type: 'fence' },
          { lane: 1, type: 'beam' },
        ],
        minGap: 15,
      },
    ];
  }

  public updateDifficulty(_speed: number, distance: number): void {
    this.difficulty = 1 + Math.min(distance / 500, 2);
  }

  public shouldSpawn(currentZ: number, _speed: number): boolean {
    const baseGap = GameConfig.DIFFICULTY.OBSTACLE_MIN_GAP;
    const adjustedGap = baseGap / (1 + (this.difficulty - 1) * 0.3);
    return currentZ - this.lastSpawnZ > adjustedGap;
  }

  public generate(currentZ: number, speed: number): { lane: number; type: ObstacleType; z: number }[] {
    const results: { lane: number; type: ObstacleType; z: number }[] = [];
    
    if (!this.shouldSpawn(currentZ, speed)) {
      return results;
    }

    const densityFactor = Math.min(0.3 + this.difficulty * 0.1, 0.7);
    if (Math.random() > densityFactor) {
      return results;
    }

    const pattern = this.selectPattern();
    const spawnZ = currentZ - randomRange(5, 15);

    for (const obstacle of pattern.obstacles) {
      if (this.isValidPlacement(obstacle.lane, spawnZ, obstacle.type)) {
        results.push({
          lane: obstacle.lane,
          type: obstacle.type,
          z: spawnZ,
        });
      }
    }

    if (results.length > 0) {
      this.lastSpawnZ = spawnZ;
    }

    return results;
  }

  private selectPattern(): SpawnPattern {
    const filteredPatterns = this.patterns.filter((_, index) => {
      if (this.difficulty < 1.5 && index > 5) return false;
      if (this.difficulty < 2 && index > 7) return false;
      return true;
    });

    return randomChoice(filteredPatterns);
  }

  private isValidPlacement(_lane: number, _z: number, _type: ObstacleType): boolean {
    return true;
  }

  public generateCoins(currentZ: number): { lane: number; z: number; y: number }[] {
    const coins: { lane: number; z: number; y: number }[] = [];
    
    if (Math.random() > 0.4) {
      const lane = randomInt(0, GameConfig.LANE_COUNT - 1);
      const coinCount = randomInt(1, 5);
      const startZ = currentZ - randomRange(10, 20);

      for (let i = 0; i < coinCount; i++) {
        coins.push({
          lane,
          z: startZ - i * 2,
          y: 1 + Math.sin(i * 0.5) * 0.3,
        });
      }
    }

    return coins;
  }

  public generatePowerup(currentZ: number): { lane: number; type: 'magnet' | 'shield' | 'doubleScore'; z: number } | null {
    if (Math.random() > 0.02) return null;

    const types: ('magnet' | 'shield' | 'doubleScore')[] = ['magnet', 'shield', 'doubleScore'];
    return {
      lane: randomInt(0, GameConfig.LANE_COUNT - 1),
      type: randomChoice(types),
      z: currentZ - randomRange(20, 30),
    };
  }

  public reset(): void {
    this.difficulty = 1;
    this.lastSpawnZ = 0;
  }
}
