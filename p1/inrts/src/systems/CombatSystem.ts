import type { Unit, Building, GameResources } from '../types';
import { SpatialGrid } from '../engine/SpatialGrid';
import { distance } from '../utils/math';

export class CombatSystem {
  private tileSize: number = 32;

  updateCombat(
    unit: Unit,
    spatialGrid: SpatialGrid,
    units: Unit[],
    buildings: Building[],
    resources: { player: GameResources; ai: GameResources },
    dt: number
  ): void {
    if (unit.state === 'dead') return;

    if (unit.attackCooldown > 0) {
      unit.attackCooldown -= dt;
    }

    if (unit.state === 'attacking' && unit.targetId) {
      const targetUnit = units.find(u => u.id === unit.targetId);
      const targetBuilding = buildings.find(b => b.id === unit.targetId);
      const target = targetUnit || targetBuilding;

      if (!target || target.health <= 0) {
        unit.state = 'idle';
        unit.targetId = null;
        unit.targetType = null;
        return;
      }

      const dist = distance(
        { x: unit.x + unit.width / 2, y: unit.y + unit.height / 2 },
        { x: target.x + target.width / 2, y: target.y + target.height / 2 }
      );

      const attackRange = unit.range * this.tileSize;

      if (dist > attackRange) {
        unit.state = 'moving';
        return;
      }

      if (unit.attackCooldown <= 0) {
        target.health -= unit.attack;
        unit.attackCooldown = 1 / unit.attackSpeed;

        if (target.health <= 0) {
          if (target.type === 'unit') {
            (target as Unit).state = 'dead';
            const targetOwner = target.owner;
            const unitConfig = this.getUnitPopulation((target as Unit).unitType);
            resources[targetOwner].population -= unitConfig;
          }
          unit.state = 'idle';
          unit.targetId = null;
          unit.targetType = null;
        }
      }
    }
  }

  updateTowerCombat(
    building: Building,
    spatialGrid: SpatialGrid,
    units: Unit[],
    dt: number,
    attackCooldownMap: Map<string, number>
  ): void {
    if (building.buildingType !== 'tower' || !building.isComplete) return;

    let cooldown = attackCooldownMap.get(building.id) || 0;
    if (cooldown > 0) {
      cooldown -= dt;
      attackCooldownMap.set(building.id, cooldown);
      return;
    }

    const config = this.getTowerConfig();
    const range = (config.range || 6) * this.tileSize;
    const centerX = building.x + building.width / 2;
    const centerY = building.y + building.height / 2;

    const enemies = spatialGrid.getNearbyEnemies(centerX, centerY, range, building.owner)
      .filter(e => e.type === 'unit') as Unit[];

    if (enemies.length > 0) {
      const target = enemies[0];
      target.health -= config.attack || 20;
      attackCooldownMap.set(building.id, 1 / (config.attackSpeed || 0.8));

      if (target.health <= 0) {
        target.state = 'dead';
      }
    }
  }

  findNearbyEnemies(
    unit: Unit,
    spatialGrid: SpatialGrid
  ): Unit | Building | null {
    const range = unit.range * this.tileSize * 3;
    const centerX = unit.x + unit.width / 2;
    const centerY = unit.y + unit.height / 2;

    const enemies = spatialGrid.getNearbyEnemies(centerX, centerY, range, unit.owner);
    if (enemies.length > 0) {
      return enemies[0];
    }
    return null;
  }

  autoAttack(
    unit: Unit,
    spatialGrid: SpatialGrid
  ): void {
    if (unit.state === 'dead' || unit.state === 'gathering' || unit.state === 'returning' || unit.state === 'building') return;
    if (unit.state === 'attacking' || unit.state === 'moving') return;

    const enemy = this.findNearbyEnemies(unit, spatialGrid);
    if (enemy) {
      unit.targetId = enemy.id;
      unit.targetType = enemy.type;
      unit.state = 'attacking';
    }
  }

  private getUnitPopulation(unitType: string): number {
    const populations: Record<string, number> = {
      worker: 1,
      infantry: 1,
      archer: 1,
      cavalry: 2
    };
    return populations[unitType] || 1;
  }

  private getTowerConfig(): { attack: number; range: number; attackSpeed: number } {
    return { attack: 20, range: 6, attackSpeed: 0.8 };
  }
}
