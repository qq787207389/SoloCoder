import type { Unit, Building, ResourceNode, GameResources, ResourceType } from '../types';
import { distance } from '../utils/math';

export class ResourceSystem {
  private tileSize: number = 32;

  updateGathering(
    unit: Unit,
    resources: ResourceNode[],
    buildings: Building[],
    playerResources: GameResources,
    dt: number
  ): void {
    if (unit.unitType !== 'worker' || unit.state !== 'gathering') return;

    const targetResource = resources.find(r => r.id === unit.targetId);
    if (!targetResource || targetResource.amount <= 0) {
      unit.state = 'idle';
      unit.targetId = null;
      return;
    }

    const unitCenterX = unit.x + unit.width / 2;
    const unitCenterY = unit.y + unit.height / 2;
    const dist = distance(
      { x: unitCenterX, y: unitCenterY },
      { x: targetResource.x, y: targetResource.y }
    );

    if (dist > this.tileSize * 3) {
      unit.state = 'idle';
      unit.targetId = null;
      return;
    }

    if (dist > this.tileSize) {
      const dx = targetResource.x - unitCenterX;
      const dy = targetResource.y - unitCenterY;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        unit.x += (dx / len) * unit.speed * dt * 60;
        unit.y += (dy / len) * unit.speed * dt * 60;
      }
      return;
    }

    unit.gatheringProgress += dt * 60;
    if (unit.gatheringProgress >= 120) {
      unit.gatheringProgress = 0;
      const gatherAmount = Math.min(20, targetResource.amount);
      targetResource.amount -= gatherAmount;
      unit.carryingResource = { type: targetResource.type, amount: gatherAmount };

      const base = buildings.find(b => b.buildingType === 'base' && b.owner === unit.owner && b.isComplete);
      if (base) {
        unit.targetId = base.id;
        unit.targetType = 'building';
        unit.state = 'returning';
      } else {
        unit.state = 'idle';
      }
    }
  }

  updateReturning(
    unit: Unit,
    buildings: Building[],
    playerResources: GameResources,
    resources: ResourceNode[],
    dt: number
  ): void {
    if (unit.unitType !== 'worker' || unit.state !== 'returning') return;

    const base = buildings.find(b => b.id === unit.targetId && b.isComplete);
    if (!base) {
      unit.carryingResource = null;
      unit.state = 'idle';
      return;
    }

    const unitCenterX = unit.x + unit.width / 2;
    const unitCenterY = unit.y + unit.height / 2;
    const baseCenterX = base.x + base.width / 2;
    const baseCenterY = base.y + base.height / 2;
    const dist = distance(
      { x: unitCenterX, y: unitCenterY },
      { x: baseCenterX, y: baseCenterY }
    );

    if (dist > this.tileSize * 3) {
      const dx = baseCenterX - unitCenterX;
      const dy = baseCenterY - unitCenterY;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        unit.x += (dx / len) * unit.speed * dt * 60;
        unit.y += (dy / len) * unit.speed * dt * 60;
      }
      return;
    }

    if (unit.carryingResource) {
      if (unit.carryingResource.type === 'gold') {
        playerResources.gold += unit.carryingResource.amount;
      } else {
        playerResources.wood += unit.carryingResource.amount;
      }
      unit.carryingResource = null;
    }

    const nearestResource = this.findNearestResource(unit, resources);
    if (nearestResource) {
      unit.targetId = nearestResource.id;
      unit.targetType = 'resource';
      unit.state = 'gathering';
    } else {
      unit.state = 'idle';
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

  canAfford(cost: { gold: number; wood: number }, resources: GameResources): boolean {
    return resources.gold >= cost.gold && resources.wood >= cost.wood;
  }

  spendResources(cost: { gold: number; wood: number }, resources: GameResources): void {
    resources.gold -= cost.gold;
    resources.wood -= cost.wood;
  }

  addResources(type: ResourceType, amount: number, resources: GameResources): void {
    if (type === 'gold') {
      resources.gold += amount;
    } else {
      resources.wood += amount;
    }
  }
}
