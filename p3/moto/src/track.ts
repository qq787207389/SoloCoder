import {
  TrackPoint, Obstacle, ObstacleType, TerrainType,
  TrackTheme, THEME_TERRAIN, TRACK_SEGMENT_LEN, TRACK_WIDTH,
  TRACK_TOTAL_SEGMENTS, PickupType, Pickup,
} from './types';
import { seededRandom, randomRange } from './utils';

interface TrackGenConfig {
  theme: TrackTheme;
  seed: number;
}

export class Track {
  points: TrackPoint[] = [];
  theme: TrackTheme;
  totalLength = 0;

  constructor(config: TrackGenConfig) {
    this.theme = config.theme;
    this.generate(config.seed);
  }

  private generate(seed: number) {
    const rand = seededRandom(seed);
    this.points = [];

    let x = 0;
    let y = 0;
    let angle = -Math.PI / 2;
    const baseTerrain = THEME_TERRAIN[this.theme];

    let curveBias = 0;
    let curveLength = 0;
    let nextCurveAt = 10 + Math.floor(rand() * 20);

    for (let i = 0; i < TRACK_TOTAL_SEGMENTS; i++) {
      const progress = i / TRACK_TOTAL_SEGMENTS;

      if (i > 20 && i < TRACK_TOTAL_SEGMENTS - 40) {
        if (i >= nextCurveAt && curveLength <= 0) {
          curveBias = (rand() - 0.5) * 0.07;
          curveLength = 15 + Math.floor(rand() * 30);
          nextCurveAt = i + curveLength + 10 + Math.floor(rand() * 25);
        }

        if (curveLength > 0) {
          angle += curveBias;
          curveLength--;
        } else {
          angle += (rand() - 0.5) * 0.015;
          angle += (-Math.PI / 2 - angle) * 0.002;
        }
      } else if (i >= TRACK_TOTAL_SEGMENTS - 40) {
        const target = -Math.PI / 2;
        angle += (target - angle) * 0.04;
      }

      const segX = x + Math.cos(angle) * TRACK_SEGMENT_LEN;
      const segY = y + Math.sin(angle) * TRACK_SEGMENT_LEN;
      x = segX;
      y = segY;

      let terrain: TerrainType = baseTerrain;
      const tr = rand();
      if (this.theme === TrackTheme.GRASSLAND) {
        if (tr < 0.4) terrain = TerrainType.GRASS;
        else if (tr < 0.7) terrain = TerrainType.DIRT;
        else if (tr < 0.82 && progress > 0.08 && progress < 0.92) terrain = TerrainType.BRIDGE;
        else terrain = TerrainType.GRASS;
      } else if (this.theme === TrackTheme.DESERT) {
        if (tr < 0.4) terrain = TerrainType.DESERT;
        else if (tr < 0.65) terrain = TerrainType.DIRT;
        else if (tr < 0.78 && progress > 0.08 && progress < 0.92) terrain = TerrainType.BRIDGE;
        else terrain = TerrainType.DESERT;
      } else if (this.theme === TrackTheme.SNOW) {
        if (tr < 0.4) terrain = TerrainType.SNOW;
        else if (tr < 0.6) terrain = TerrainType.DIRT;
        else if (tr < 0.75 && progress > 0.08 && progress < 0.92) terrain = TerrainType.BRIDGE;
        else terrain = TerrainType.SNOW;
      }

      const obstacles: Obstacle[] = [];
      const pickups: Pickup[] = [];

      if (i > 20 && i < TRACK_TOTAL_SEGMENTS - 15) {
        const obsRand = rand();
        if (obsRand < 0.07) {
          obstacles.push(this.createObstacle(ObstacleType.MUD, rand));
        } else if (obsRand < 0.13) {
          obstacles.push(this.createObstacle(ObstacleType.PUDDLE, rand));
        } else if (obsRand < 0.19) {
          obstacles.push(this.createObstacle(ObstacleType.BUMP, rand));
        } else if (obsRand < 0.23) {
          obstacles.push(this.createObstacle(ObstacleType.RAMP, rand));
        } else if (obsRand < 0.26) {
          obstacles.push(this.createObstacle(ObstacleType.WASHBOARD, rand));
        } else if (obsRand < 0.30) {
          obstacles.push(this.createObstacle(ObstacleType.ROCK, rand));
        }

        if (i > 30 && i % 50 > 40 && i % 50 < 48) {
          obstacles.push(this.createObstacle(ObstacleType.BUMP, rand));
          if (i % 100 > 90) {
            obstacles.push(this.createObstacle(ObstacleType.BUMP, rand));
          }
        }

        if (rand() < 0.035) {
          const relX = (rand() - 0.5) * TRACK_WIDTH * 0.5;
          const perpAngle = angle + Math.PI / 2;
          const px = segX + Math.cos(perpAngle) * relX;
          const py = segY + Math.sin(perpAngle) * relX;
          const pType = rand() < 0.55 ? PickupType.WRENCH : PickupType.FUEL;
          pickups.push({ type: pType, x: px, y: py, collected: false });
        }
      }

      const isStart = i < 6;
      const isFinish = i >= TRACK_TOTAL_SEGMENTS - 6;

      this.points.push({
        x: segX,
        y: segY,
        angle,
        width: TRACK_WIDTH,
        terrain,
        obstacles,
        pickups,
        isFinish,
        isStart,
      });
    }

    this.totalLength = this.points.length * TRACK_SEGMENT_LEN;
  }

  private createObstacle(type: ObstacleType, rand: () => number): Obstacle {
    let w = 0, h = 0;
    switch (type) {
      case ObstacleType.MUD: w = randomRange(16, 28); h = randomRange(12, 20); break;
      case ObstacleType.PUDDLE: w = randomRange(14, 24); h = randomRange(10, 18); break;
      case ObstacleType.BUMP: w = randomRange(12, 18); h = randomRange(12, 18); break;
      case ObstacleType.RAMP: w = randomRange(14, 20); h = randomRange(20, 30); break;
      case ObstacleType.WASHBOARD: w = TRACK_WIDTH * 0.75; h = randomRange(40, 60); break;
      case ObstacleType.ROCK: w = randomRange(6, 12); h = randomRange(6, 12); break;
      default: w = 16; h = 16;
    }

    const rx = (rand() - 0.5) * TRACK_WIDTH * 0.5;

    return { type, x: 0, y: 0, w, h, relX: rx };
  }

  getPointAt(distance: number): TrackPoint | null {
    const idx = Math.floor(distance / TRACK_SEGMENT_LEN);
    if (idx < 0 || idx >= this.points.length) return null;
    return this.points[idx];
  }

  getSegmentIndex(worldX: number, worldY: number): number {
    const guess = Math.floor((worldY - this.points[0].y) / TRACK_SEGMENT_LEN);
    const searchStart = Math.max(0, guess - 30);
    const searchEnd = Math.min(this.points.length, guess + 30);

    let closest = Math.max(0, Math.min(this.points.length - 1, guess));
    let closestDist = Infinity;

    for (let i = searchStart; i < searchEnd; i++) {
      const p = this.points[i];
      const d = (p.x - worldX) ** 2 + (p.y - worldY) ** 2;
      if (d < closestDist) {
        closestDist = d;
        closest = i;
      }
    }
    return closest;
  }

  getDistanceOnTrack(worldX: number, worldY: number): number {
    const idx = this.getSegmentIndex(worldX, worldY);
    return idx * TRACK_SEGMENT_LEN;
  }

  isOnTrack(worldX: number, worldY: number): boolean {
    const idx = this.getSegmentIndex(worldX, worldY);
    if (idx < 0 || idx >= this.points.length) return false;
    const p = this.points[idx];
    const perpAngle = p.angle + Math.PI / 2;
    const dx = worldX - p.x;
    const dy = worldY - p.y;
    const lateralDist = Math.abs(dx * Math.cos(perpAngle) + dy * Math.sin(perpAngle));
    return lateralDist < p.width / 2;
  }
}
