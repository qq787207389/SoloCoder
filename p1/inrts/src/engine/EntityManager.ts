import type {
  Unit, Building, UnitType, BuildingType, Owner, GameConfig, ResourceNode, ResourceType
} from '../types';
import { generateId } from '../utils/math';
import unitsConfig from '../config/units.json';
import buildingsConfig from '../config/buildings.json';

export class EntityManager {
  private config: GameConfig;

  constructor() {
    this.config = {
      units: unitsConfig as any,
      buildings: buildingsConfig as any
    };
  }

  createUnit(
    unitType: UnitType,
    x: number,
    y: number,
    owner: Owner
  ): Unit {
    const config = this.config.units[unitType];
    return {
      id: generateId(),
      type: 'unit',
      unitType,
      x,
      y,
      width: config.size,
      height: config.size,
      owner,
      health: config.health,
      maxHealth: config.health,
      speed: config.speed,
      attack: config.attack,
      range: config.range,
      attackSpeed: config.attackSpeed,
      attackCooldown: 0,
      state: 'idle',
      path: [],
      pathIndex: 0,
      targetId: null,
      targetType: null,
      carryingResource: null,
      gatheringProgress: 0,
      buildingProgress: 0,
      buildingTargetId: null,
      visionRange: config.visionRange
    };
  }

  createBuilding(
    buildingType: BuildingType,
    x: number,
    y: number,
    owner: Owner,
    isComplete: boolean = false
  ): Building {
    const config = this.config.buildings[buildingType];
    const tileSize = 32;
    return {
      id: generateId(),
      type: 'building',
      buildingType,
      x,
      y,
      width: config.size.width * tileSize,
      height: config.size.height * tileSize,
      owner,
      health: isComplete ? config.health : 1,
      maxHealth: config.health,
      isComplete,
      buildProgress: isComplete ? 100 : 0,
      productionQueue: [],
      isProducing: false,
      productionProgress: 0
    };
  }

  createResourceNode(
    type: ResourceType,
    x: number,
    y: number,
    amount: number
  ): ResourceNode {
    return {
      id: generateId(),
      type,
      x,
      y,
      amount,
      maxAmount: amount
    };
  }

  getUnitConfig(unitType: UnitType) {
    return this.config.units[unitType];
  }

  getBuildingConfig(buildingType: BuildingType) {
    return this.config.buildings[buildingType];
  }

  isUnitDead(unit: Unit): boolean {
    return unit.health <= 0 || unit.state === 'dead';
  }

  isBuildingDead(building: Building): boolean {
    return building.health <= 0;
  }
}
