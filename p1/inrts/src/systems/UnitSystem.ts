import type { Unit, Building, ResourceNode, Position } from '../types';
import { Pathfinding } from '../engine/Pathfinding';
import { SpatialGrid } from '../engine/SpatialGrid';
import { distance, normalize } from '../utils/math';

export class UnitSystem {
  private pathfinding: Pathfinding;
  private tileSize: number = 32;
  private pathRecalculateCooldown: Map<string, number> = new Map();

  constructor(pathfinding: Pathfinding) {
    this.pathfinding = pathfinding;
  }

  updateMovement(
    unit: Unit,
    buildings: Building[],
    resources: ResourceNode[],
    spatialGrid: SpatialGrid,
    dt: number
  ): void {
    if (unit.state === 'dead') return;
    if (unit.state !== 'moving') return;

    if (unit.path.length === 0 || unit.pathIndex >= unit.path.length) {
      if (unit.targetId) {
        if (unit.targetType === 'resource') {
          unit.state = 'gathering';
        } else if (unit.targetType === 'building' && unit.carryingResource) {
          unit.state = 'returning';
        } else if (unit.targetType === 'unit' || unit.targetType === 'building') {
          unit.state = 'attacking';
        } else if (unit.buildingTargetId) {
          unit.state = 'building';
        } else {
          unit.state = 'idle';
        }
      } else {
        unit.state = 'idle';
      }
      return;
    }

    const target = unit.path[unit.pathIndex];
    const unitCenterX = unit.x + unit.width / 2;
    const unitCenterY = unit.y + unit.height / 2;

    const dist = distance({ x: unitCenterX, y: unitCenterY }, target);

    const arrivalThreshold = 12;
    if (dist < arrivalThreshold) {
      unit.pathIndex++;
      return;
    }

    const dir = normalize(target.x - unitCenterX, target.y - unitCenterY);
    let moveX = dir.x * unit.speed * dt * 60;
    let moveY = dir.y * unit.speed * dt * 60;

    const newX = unit.x + moveX;
    const newY = unit.y + moveY;

    if (this.canMoveTo(newX, newY, unit.width, unit.height, buildings, resources)) {
      unit.x = newX;
      unit.y = newY;
    } else {
      const cooldown = this.pathRecalculateCooldown.get(unit.id) || 0;
      if (cooldown <= 0) {
        const finalTarget = unit.path[unit.path.length - 1];
        unit.path = this.pathfinding.findPath(
          unit.x + unit.width / 2,
          unit.y + unit.height / 2,
          finalTarget.x,
          finalTarget.y,
          buildings,
          resources
        );
        unit.pathIndex = 0;
        this.pathRecalculateCooldown.set(unit.id, 0.5);
      } else {
        this.pathRecalculateCooldown.set(unit.id, cooldown - dt);
        const slideX = this.canMoveTo(newX, unit.y, unit.width, unit.height, buildings, resources);
        const slideY = this.canMoveTo(unit.x, newY, unit.width, unit.height, buildings, resources);
        if (slideX) unit.x = newX;
        else if (slideY) unit.y = newY;
      }
    }

    this.separateUnits(unit, spatialGrid, dt);
  }

  private canMoveTo(
    x: number,
    y: number,
    width: number,
    height: number,
    buildings: Building[],
    resources: ResourceNode[]
  ): boolean {
    const mapMaxX = 64 * this.tileSize - width;
    const mapMaxY = 64 * this.tileSize - height;
    if (x < 0 || y < 0 || x > mapMaxX || y > mapMaxY) {
      return false;
    }

    for (const building of buildings) {
      if (this.rectsOverlap(
        x, y, width, height,
        building.x, building.y, building.width, building.height
      )) {
        return false;
      }
    }

    for (const resource of resources) {
      if (resource.amount <= 0) continue;
      const rx = resource.x - this.tileSize / 2;
      const ry = resource.y - this.tileSize / 2;
      if (this.rectsOverlap(
        x, y, width, height,
        rx, ry, this.tileSize, this.tileSize
      )) {
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

  private separateUnits(unit: Unit, spatialGrid: SpatialGrid, dt: number): void {
    const nearbyUnits = spatialGrid.getNearbyUnits(unit, unit.width * 2);

    for (const other of nearbyUnits) {
      if (other.state === 'dead') continue;

      const dx = (unit.x + unit.width / 2) - (other.x + other.width / 2);
      const dy = (unit.y + unit.height / 2) - (other.y + other.height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = (unit.width + other.width) / 2;

      if (dist < minDist && dist > 0) {
        const pushX = (dx / dist) * 0.5 * dt * 60;
        const pushY = (dy / dist) * 0.5 * dt * 60;
        unit.x += pushX;
        unit.y += pushY;
      }
    }
  }

  moveTo(unit: Unit, targetX: number, targetY: number, buildings: Building[], resources: ResourceNode[]): void {
    unit.path = this.pathfinding.findPath(
      unit.x + unit.width / 2,
      unit.y + unit.height / 2,
      targetX,
      targetY,
      buildings,
      resources
    );
    unit.pathIndex = 0;
    unit.targetId = null;
    unit.targetType = null;
    unit.buildingTargetId = null;
    unit.state = unit.path.length > 0 ? 'moving' : 'idle';
  }

  attackTarget(unit: Unit, targetId: string, targetType: 'unit' | 'building', targetX: number, targetY: number, buildings: Building[], resources: ResourceNode[]): void {
    unit.targetId = targetId;
    unit.targetType = targetType;
    unit.path = this.pathfinding.findPath(
      unit.x + unit.width / 2,
      unit.y + unit.height / 2,
      targetX,
      targetY,
      buildings,
      resources
    );
    unit.pathIndex = 0;
    unit.buildingTargetId = null;
    unit.state = unit.path.length > 0 ? 'moving' : 'idle';
  }

  gatherResource(unit: Unit, resourceId: string, resourceX: number, resourceY: number, buildings: Building[], resources: ResourceNode[]): void {
    unit.targetId = resourceId;
    unit.targetType = 'resource';
    unit.path = this.pathfinding.findPath(
      unit.x + unit.width / 2,
      unit.y + unit.height / 2,
      resourceX,
      resourceY,
      buildings,
      resources
    );
    unit.pathIndex = 0;
    unit.buildingTargetId = null;
    unit.state = unit.path.length > 0 ? 'moving' : 'idle';
  }

  buildBuilding(unit: Unit, buildingId: string, buildingX: number, buildingY: number, buildings: Building[], resources: ResourceNode[]): void {
    unit.buildingTargetId = buildingId;
    unit.targetId = null;
    unit.targetType = null;
    unit.path = this.pathfinding.findPath(
      unit.x + unit.width / 2,
      unit.y + unit.height / 2,
      buildingX,
      buildingY,
      buildings,
      resources
    );
    unit.pathIndex = 0;
    unit.state = unit.path.length > 0 ? 'moving' : 'idle';
  }

  stop(unit: Unit): void {
    unit.state = 'idle';
    unit.path = [];
    unit.pathIndex = 0;
    unit.targetId = null;
    unit.targetType = null;
    unit.buildingTargetId = null;
  }
}
