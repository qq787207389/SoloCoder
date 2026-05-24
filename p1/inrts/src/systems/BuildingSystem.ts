import type { Unit, Building, UnitType, GameResources } from '../types';
import { EntityManager } from '../engine/EntityManager';
import { distance } from '../utils/math';

export class BuildingSystem {
  private entityManager: EntityManager;
  private tileSize: number = 32;

  constructor(entityManager: EntityManager) {
    this.entityManager = entityManager;
  }

  updateBuilding(
    unit: Unit,
    buildings: Building[],
    dt: number
  ): void {
    if (unit.unitType !== 'worker' || unit.state !== 'building') return;

    const targetBuilding = buildings.find(b => b.id === unit.buildingTargetId);
    if (!targetBuilding || targetBuilding.isComplete) {
      unit.state = 'idle';
      unit.buildingTargetId = null;
      return;
    }

    const dist = distance(
      { x: unit.x + unit.width / 2, y: unit.y + unit.height / 2 },
      { x: targetBuilding.x + targetBuilding.width / 2, y: targetBuilding.y + targetBuilding.height / 2 }
    );

    if (dist > this.tileSize * 3) {
      unit.state = 'moving';
      return;
    }

    const config = this.entityManager.getBuildingConfig(targetBuilding.buildingType);
    targetBuilding.buildProgress += dt * (100 / config.buildTime);
    targetBuilding.health = Math.min(
      targetBuilding.maxHealth,
      (targetBuilding.buildProgress / 100) * targetBuilding.maxHealth
    );

    if (targetBuilding.buildProgress >= 100) {
      targetBuilding.buildProgress = 100;
      targetBuilding.isComplete = true;
      targetBuilding.health = targetBuilding.maxHealth;
      unit.state = 'idle';
      unit.buildingTargetId = null;
    }
  }

  startProduction(
    building: Building,
    unitType: UnitType,
    resources: GameResources
  ): boolean {
    if (!building.isComplete) return false;

    const config = this.entityManager.getBuildingConfig(building.buildingType);
    if (!config.produces.includes(unitType)) return false;

    const unitConfig = this.entityManager.getUnitConfig(unitType);
    if (resources.gold < unitConfig.cost.gold || resources.wood < unitConfig.cost.wood) {
      return false;
    }
    if (resources.population + unitConfig.population > resources.maxPopulation) {
      return false;
    }

    resources.gold -= unitConfig.cost.gold;
    resources.wood -= unitConfig.cost.wood;
    resources.population += unitConfig.population;

    building.productionQueue.push({
      unitType,
      progress: 0,
      totalTime: unitConfig.buildTime
    });

    return true;
  }

  updateProduction(
    building: Building,
    units: Unit[],
    owner: 'player' | 'ai',
    dt: number
  ): void {
    if (!building.isComplete || building.productionQueue.length === 0) return;

    const current = building.productionQueue[0];
    current.progress += dt;

    if (current.progress >= current.totalTime) {
      building.productionQueue.shift();

      const angle = Math.random() * Math.PI * 2;
      const spawnX = building.x + building.width / 2 + Math.cos(angle) * 60;
      const spawnY = building.y + building.height / 2 + Math.sin(angle) * 60;

      const newUnit = this.entityManager.createUnit(
        current.unitType,
        spawnX,
        spawnY,
        owner
      );
      units.push(newUnit);
    }
  }

  canPlaceBuilding(
    x: number,
    y: number,
    buildingType: string,
    buildings: Building[],
    mapWidth: number,
    mapHeight: number
  ): boolean {
    const config = this.entityManager.getBuildingConfig(buildingType as any);
    const width = config.size.width * this.tileSize;
    const height = config.size.height * this.tileSize;

    if (x < 0 || y < 0 || x + width > mapWidth * this.tileSize || y + height > mapHeight * this.tileSize) {
      return false;
    }

    for (const building of buildings) {
      if (this.rectsOverlap(x, y, width, height, building.x, building.y, building.width, building.height)) {
        return false;
      }
    }

    return true;
  }

  private rectsOverlap(
    x1: number, y1: number, w1: number, h1: number,
    x2: number, y2: number, w2: number, h2: number
  ): boolean {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }
}
