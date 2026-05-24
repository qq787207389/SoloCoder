import type {
  Unit, Building, ResourceNode, GameResources, Owner,
  BuildingType, UnitType, AIState
} from '../types';
import { EntityManager } from '../engine/EntityManager';
import { distance } from '../utils/math';

export class AISystem {
  private entityManager: EntityManager;
  private state: AIState;
  private tileSize: number = 32;
  private lastDecisionTime: number = 0;
  private decisionInterval: number = 3;

  constructor(entityManager: EntityManager) {
    this.entityManager = entityManager;
    this.state = {
      currentState: 'economy',
      armySize: 0,
      targetBaseId: null,
      lastHarassTime: 0
    };
  }

  update(
    units: Unit[],
    buildings: Building[],
    resources: ResourceNode[],
    playerBuildings: Building[],
    playerUnits: Unit[],
    aiResources: GameResources,
    dt: number,
    gameTime: number
  ): void {
    this.lastDecisionTime += dt;

    const aiUnits = units.filter(u => u.owner === 'ai');
    const aiBuildings = buildings.filter(b => b.owner === 'ai');
    const militaryUnits = aiUnits.filter(u => u.unitType !== 'worker');
    this.state.armySize = militaryUnits.length;

    if (this.lastDecisionTime >= this.decisionInterval) {
      this.lastDecisionTime = 0;
      this.makeDecisions(
        aiUnits, aiBuildings, resources, playerBuildings,
        playerUnits, aiResources, gameTime
      );
    }

    this.executeActions(
      aiUnits, aiBuildings, resources, playerBuildings, playerUnits, aiResources, dt
    );
  }

  private makeDecisions(
    aiUnits: Unit[],
    aiBuildings: Building[],
    resources: ResourceNode[],
    playerBuildings: Building[],
    playerUnits: Unit[],
    aiResources: GameResources,
    gameTime: number
  ): void {
    const workerCount = aiUnits.filter(u => u.unitType === 'worker').length;
    const hasBarracks = aiBuildings.some(b => b.buildingType === 'barracks' && b.isComplete);
    const hasBlacksmith = aiBuildings.some(b => b.buildingType === 'blacksmith' && b.isComplete);
    const hasTower = aiBuildings.some(b => b.buildingType === 'tower' && b.isComplete);
    const base = aiBuildings.find(b => b.buildingType === 'base' && b.isComplete);

    if (workerCount < 6 && base && aiResources.gold >= 50) {
      this.trainUnit(base, 'worker', aiResources);
    }

    if (workerCount >= 4 && !hasBarracks && aiResources.gold >= 200 && aiResources.wood >= 150) {
      this.buildBuilding(aiUnits, buildings => 'barracks', aiBuildings, resources);
    }

    if (hasBarracks && !hasTower && aiResources.gold >= 150 && aiResources.wood >= 100) {
      this.buildBuilding(aiUnits, buildings => 'tower', aiBuildings, resources);
    }

    if (hasBarracks && !hasBlacksmith && aiResources.gold >= 300 && aiResources.wood >= 200) {
      this.buildBuilding(aiUnits, buildings => 'blacksmith', aiBuildings, resources);
    }

    if (hasBarracks && this.state.armySize < 20) {
      const barracks = aiBuildings.filter(b => b.buildingType === 'barracks' && b.isComplete);
      for (const barrack of barracks) {
        if (barrack.productionQueue.length < 3) {
          const types: UnitType[] = ['infantry', 'archer'];
          const type = types[Math.floor(Math.random() * types.length)];
          this.trainUnit(barrack, type, aiResources);
        }
      }

      if (hasBlacksmith) {
        const blacksmith = aiBuildings.find(b => b.buildingType === 'blacksmith' && b.isComplete);
        if (blacksmith && blacksmith.productionQueue.length < 2 && aiResources.gold >= 250) {
          this.trainUnit(blacksmith, 'cavalry', aiResources);
        }
      }
    }

    if (this.state.armySize >= 15) {
      this.state.currentState = 'attack';
    } else if (this.state.armySize >= 5 && gameTime - this.state.lastHarassTime > 30) {
      this.state.currentState = 'harass';
      this.state.lastHarassTime = gameTime;
    } else {
      this.state.currentState = 'economy';
    }
  }

  private executeActions(
    aiUnits: Unit[],
    aiBuildings: Building[],
    resources: ResourceNode[],
    playerBuildings: Building[],
    playerUnits: Unit[],
    aiResources: GameResources,
    dt: number
  ): void {
    const workers = aiUnits.filter(u => u.unitType === 'worker');
    const military = aiUnits.filter(u => u.unitType !== 'worker');

    for (const worker of workers) {
      if (worker.state === 'dead') continue;

      if (worker.state === 'idle') {
        const nearestResource = this.findNearestResource(worker, resources);
        if (nearestResource) {
          worker.targetId = nearestResource.id;
          worker.targetType = 'resource';
          worker.state = 'moving';
        }
      }
    }

    if (this.state.currentState === 'attack' || this.state.currentState === 'harass') {
      const target = this.findAttackTarget(playerBuildings, playerUnits);
      if (target) {
        for (const unit of military) {
          if (unit.state === 'idle') {
            unit.targetId = target.id;
            unit.targetType = target.type;
            unit.state = 'moving';
          }
        }
      }
    }
  }

  private findNearestResource(unit: Unit, resources: ResourceNode[]): ResourceNode | null {
    let nearest: ResourceNode | null = null;
    let minDist = Infinity;

    for (const resource of resources) {
      if (resource.amount <= 0) continue;
      const dist = distance(
        { x: unit.x + unit.width / 2, y: unit.y + unit.height / 2 },
        { x: resource.x, y: resource.y }
      );
      if (dist < minDist) {
        minDist = dist;
        nearest = resource;
      }
    }
    return nearest;
  }

  private findAttackTarget(playerBuildings: Building[], playerUnits: Unit[]): { id: string; type: 'unit' | 'building'; x: number; y: number } | null {
    const base = playerBuildings.find(b => b.buildingType === 'base' && b.health > 0);
    if (base) {
      return { id: base.id, type: 'building', x: base.x + base.width / 2, y: base.y + base.height / 2 };
    }

    if (playerBuildings.length > 0) {
      const b = playerBuildings[0];
      return { id: b.id, type: 'building', x: b.x + b.width / 2, y: b.y + b.height / 2 };
    }

    if (playerUnits.length > 0) {
      const u = playerUnits[0];
      return { id: u.id, type: 'unit', x: u.x + u.width / 2, y: u.y + u.height / 2 };
    }

    return null;
  }

  private trainUnit(building: Building, unitType: UnitType, resources: GameResources): boolean {
    const config = this.entityManager.getUnitConfig(unitType);
    if (resources.gold < config.cost.gold || resources.wood < config.cost.wood) return false;
    if (resources.population + config.population > resources.maxPopulation) return false;
    if (building.productionQueue.length >= 5) return false;

    resources.gold -= config.cost.gold;
    resources.wood -= config.cost.wood;
    resources.population += config.population;

    building.productionQueue.push({
      unitType,
      progress: 0,
      totalTime: config.buildTime
    });

    return true;
  }

  private buildBuilding(
    aiUnits: Unit[],
    buildingTypeFn: (buildings: Building[]) => BuildingType,
    aiBuildings: Building[],
    allResources: ResourceNode[]
  ): Building | null {
    const idleWorkers = aiUnits.filter(u => u.unitType === 'worker' && u.state === 'idle');
    if (idleWorkers.length === 0) return null;

    const worker = idleWorkers[0];
    const base = aiBuildings.find(b => b.buildingType === 'base');
    if (!base) return null;

    const buildingType = buildingTypeFn(aiBuildings);
    const config = this.entityManager.getBuildingConfig(buildingType);

    const angle = Math.random() * Math.PI * 2;
    const dist = 150 + Math.random() * 100;
    const x = base.x + base.width / 2 + Math.cos(angle) * dist;
    const y = base.y + base.height / 2 + Math.sin(angle) * dist;

    const newBuilding = this.entityManager.createBuilding(
      buildingType,
      x,
      y,
      'ai',
      false
    );

    return newBuilding;
  }
}
