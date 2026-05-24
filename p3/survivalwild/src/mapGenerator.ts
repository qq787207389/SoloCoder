import { PerlinNoise } from './utils/noise';
import { TerrainType, MapTile, ItemType, ResourceNode, Animal, AnimalType, AnimalState } from './types';

export const MAP_SIZE = 128;
export const TILE_SIZE = 32;

export class MapGenerator {
  private noise: PerlinNoise;
  private moistureNoise: PerlinNoise;
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
    this.noise = new PerlinNoise(seed);
    this.moistureNoise = new PerlinNoise(seed + 1000);
  }

  generateMap(): MapTile[][] {
    const map: MapTile[][] = [];
    const centerX = MAP_SIZE / 2;
    const centerY = MAP_SIZE / 2;
    const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);

    for (let y = 0; y < MAP_SIZE; y++) {
      map[y] = [];
      for (let x = 0; x < MAP_SIZE; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;
        
        const elevation = this.noise.octaveNoise2D(x * 0.03, y * 0.03, 4, 0.5);
        const moisture = this.moistureNoise.octaveNoise2D(x * 0.04, y * 0.04, 3, 0.6);
        
        const islandFactor = 1 - dist * 1.5;
        const finalElevation = (elevation + 1) / 2 * islandFactor;
        const finalMoisture = (moisture + 1) / 2;

        let terrain: TerrainType;
        if (finalElevation < 0.1) {
          terrain = TerrainType.WATER;
        } else if (finalElevation < 0.18) {
          terrain = TerrainType.SAND;
        } else if (finalElevation > 0.7) {
          terrain = TerrainType.MOUNTAIN;
        } else if (finalElevation > 0.55 && finalMoisture < 0.4) {
          terrain = TerrainType.CAVE;
        } else if (finalMoisture > 0.6) {
          terrain = TerrainType.FOREST;
        } else {
          terrain = TerrainType.GRASS;
        }

        map[y][x] = {
          terrain,
          elevation: finalElevation,
          moisture: finalMoisture
        };
      }
    }

    return map;
  }

  generateResources(map: MapTile[][]): ResourceNode[] {
    const resources: ResourceNode[] = [];
    let id = 0;

    for (let y = 0; y < MAP_SIZE; y++) {
      for (let x = 0; x < MAP_SIZE; x++) {
        const tile = map[y][x];
        if (tile.terrain === TerrainType.WATER) continue;

        const rand = this.randomAt(x, y);
        const worldX = x * TILE_SIZE + TILE_SIZE / 2;
        const worldY = y * TILE_SIZE + TILE_SIZE / 2;

        if (tile.terrain === TerrainType.FOREST) {
          if (rand < 0.4) {
            resources.push({
              id: `res_${id++}`,
              type: ItemType.WOOD,
              x: worldX,
              y: worldY,
              amount: 5,
              maxAmount: 5
            });
          } else if (rand < 0.5) {
            resources.push({
              id: `res_${id++}`,
              type: ItemType.BERRY,
              x: worldX,
              y: worldY,
              amount: 3,
              maxAmount: 3
            });
          } else if (rand < 0.55) {
            resources.push({
              id: `res_${id++}`,
              type: ItemType.VINE,
              x: worldX,
              y: worldY,
              amount: 4,
              maxAmount: 4
            });
          }
        } else if (tile.terrain === TerrainType.GRASS) {
          if (rand < 0.15) {
            resources.push({
              id: `res_${id++}`,
              type: ItemType.TWIG,
              x: worldX,
              y: worldY,
              amount: 3,
              maxAmount: 3
            });
          } else if (rand < 0.25) {
            resources.push({
              id: `res_${id++}`,
              type: ItemType.FIBER,
              x: worldX,
              y: worldY,
              amount: 4,
              maxAmount: 4
            });
          } else if (rand < 0.28) {
            resources.push({
              id: `res_${id++}`,
              type: ItemType.BERRY,
              x: worldX,
              y: worldY,
              amount: 2,
              maxAmount: 2
            });
          }
        } else if (tile.terrain === TerrainType.MOUNTAIN) {
          if (rand < 0.35) {
            resources.push({
              id: `res_${id++}`,
              type: ItemType.STONE,
              x: worldX,
              y: worldY,
              amount: 6,
              maxAmount: 6
            });
          } else if (rand < 0.45) {
            resources.push({
              id: `res_${id++}`,
              type: ItemType.IRON_ORE,
              x: worldX,
              y: worldY,
              amount: 3,
              maxAmount: 3
            });
          }
        } else if (tile.terrain === TerrainType.SAND) {
          if (rand < 0.1) {
            resources.push({
              id: `res_${id++}`,
              type: ItemType.FRESH_WATER,
              x: worldX,
              y: worldY,
              amount: 10,
              maxAmount: 10
            });
          } else if (rand < 0.15) {
            resources.push({
              id: `res_${id++}`,
              type: ItemType.TWIG,
              x: worldX,
              y: worldY,
              amount: 2,
              maxAmount: 2
            });
          }
        } else if (tile.terrain === TerrainType.CAVE) {
          if (rand < 0.5) {
            resources.push({
              id: `res_${id++}`,
              type: ItemType.IRON_ORE,
              x: worldX,
              y: worldY,
              amount: 5,
              maxAmount: 5
            });
          } else if (rand < 0.6) {
            resources.push({
              id: `res_${id++}`,
              type: ItemType.MEDKIT,
              x: worldX,
              y: worldY,
              amount: 1,
              maxAmount: 1
            });
          } else if (rand < 0.65) {
            resources.push({
              id: `res_${id++}`,
              type: ItemType.DIARY_FRAGMENT,
              x: worldX,
              y: worldY,
              amount: 1,
              maxAmount: 1
            });
          }
        }
      }
    }

    return resources;
  }

  generateShipParts(map: MapTile[][]): ResourceNode[] {
    const parts: ResourceNode[] = [];
    const specialLocations: { x: number; y: number }[] = [];

    for (let y = 0; y < MAP_SIZE; y++) {
      for (let x = 0; x < MAP_SIZE; x++) {
        const tile = map[y][x];
        if (tile.terrain === TerrainType.CAVE || 
            (tile.terrain === TerrainType.SAND && this.randomAt(x, y + 100) < 0.05)) {
          specialLocations.push({ x, y });
        }
      }
    }

    const shuffled = specialLocations.sort(() => this.seededRandom() - 0.5);
    const selected = shuffled.slice(0, 5);

    selected.forEach((loc, i) => {
      parts.push({
        id: `ship_part_${i}`,
        type: ItemType.SHIP_PART,
        x: loc.x * TILE_SIZE + TILE_SIZE / 2,
        y: loc.y * TILE_SIZE + TILE_SIZE / 2,
        amount: 1,
        maxAmount: 1
      });
    });

    return parts;
  }

  generateAnimals(map: MapTile[][]): Animal[] {
    const animals: Animal[] = [];
    let id = 0;

    for (let y = 0; y < MAP_SIZE; y++) {
      for (let x = 0; x < MAP_SIZE; x++) {
        const tile = map[y][x];
        const rand = this.randomAt(x + 500, y + 500);
        const worldX = x * TILE_SIZE + TILE_SIZE / 2;
        const worldY = y * TILE_SIZE + TILE_SIZE / 2;

        if (tile.terrain === TerrainType.FOREST) {
          if (rand < 0.03) {
            animals.push({
              id: `animal_${id++}`,
              type: AnimalType.BOAR,
              x: worldX,
              y: worldY,
              health: 50,
              maxHealth: 50,
              state: AnimalState.PATROL,
              targetX: worldX,
              targetY: worldY,
              lastAttackTime: 0
            });
          } else if (rand < 0.04) {
            animals.push({
              id: `animal_${id++}`,
              type: AnimalType.SNAKE,
              x: worldX,
              y: worldY,
              health: 20,
              maxHealth: 20,
              state: AnimalState.PATROL,
              targetX: worldX,
              targetY: worldY,
              lastAttackTime: 0
            });
          }
        } else if (tile.terrain === TerrainType.GRASS) {
          if (rand < 0.015) {
            animals.push({
              id: `animal_${id++}`,
              type: AnimalType.WOLF,
              x: worldX,
              y: worldY,
              health: 60,
              maxHealth: 60,
              state: AnimalState.PATROL,
              targetX: worldX,
              targetY: worldY,
              lastAttackTime: 0
            });
          }
        }
      }
    }

    return animals;
  }

  findSpawnPoint(map: MapTile[][]): { x: number; y: number } {
    const centerX = MAP_SIZE / 2;
    const centerY = MAP_SIZE / 2;

    for (let r = 5; r < 30; r++) {
      for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
        const x = Math.floor(centerX + Math.cos(angle) * r);
        const y = Math.floor(centerY + Math.sin(angle) * r);
        if (x >= 0 && x < MAP_SIZE && y >= 0 && y < MAP_SIZE) {
          if (map[y][x].terrain === TerrainType.SAND || map[y][x].terrain === TerrainType.GRASS) {
            return {
              x: x * TILE_SIZE + TILE_SIZE / 2,
              y: y * TILE_SIZE + TILE_SIZE / 2
            };
          }
        }
      }
    }

    return { x: centerX * TILE_SIZE, y: centerY * TILE_SIZE };
  }

  private randomAt(x: number, y: number): number {
    const n = Math.sin(x * 12.9898 + y * 78.233 + this.seed) * 43758.5453;
    return n - Math.floor(n);
  }

  private seededRandom(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}
