import {
  Elevator,
  Escalator,
  TILE_SIZE,
  FLOOR_HEIGHT,
  Rect,
  Direction,
} from './types';
import { MapSystem } from './MapSystem';
import { Collision } from './Collision';

export class ElevatorSystem {
  private elevators: Elevator[] = [];
  private escalators: Escalator[] = [];
  private nextId: number = 0;
  private mapSystem: MapSystem;

  constructor(mapSystem: MapSystem) {
    this.mapSystem = mapSystem;
  }

  public initialize(level: number): void {
    this.elevators = [];
    this.escalators = [];

    const floors = this.mapSystem.getFloors();
    const baseSpeed = 60 + level * 10;

    for (const floor of floors) {
      for (const ex of floor.elevatorPositions) {
        if (!this.elevators.find(e => e.shaftX === ex)) {
          this.elevators.push({
            id: this.nextId++,
            shaftX: ex,
            currentFloor: 0,
            targetFloor: 0,
            y: (floor.yOffset + FLOOR_HEIGHT - 2) * TILE_SIZE,
            speed: baseSpeed,
            moving: false,
            direction: null,
            hasPlayer: false,
            passengers: [],
            doorsOpen: true,
            doorTimer: 2,
          });
        }
      }

      for (const es of floor.escalatorPositions) {
        const exists = this.escalators.find(e => e.x === es.x);
        if (!exists) {
          const startY = (floor.yOffset + 1) * TILE_SIZE;
          const endY = (floor.yOffset + FLOOR_HEIGHT - 2) * TILE_SIZE;
          this.escalators.push({
            x: es.x * TILE_SIZE,
            startY: es.direction === 'up' ? endY : startY,
            endY: es.direction === 'up' ? startY : endY,
            direction: es.direction,
            speed: 40,
          });
        }
      }
    }

    for (const elevator of this.elevators) {
      elevator.y = (floors[0].yOffset + FLOOR_HEIGHT - 2) * TILE_SIZE;
    }
  }

  public update(dt: number, playerRect: Rect): void {
    for (const elevator of this.elevators) {
      if (elevator.doorsOpen) {
        elevator.doorTimer -= dt;
        if (elevator.doorTimer <= 0) {
          elevator.doorsOpen = false;
          if (elevator.targetFloor !== elevator.currentFloor) {
            elevator.moving = true;
            elevator.direction = elevator.targetFloor > elevator.currentFloor ? 'up' : 'down';
          }
        }
      }

      if (elevator.moving && !elevator.doorsOpen) {
        const floors = this.mapSystem.getFloors();
        const targetY = (floors[elevator.targetFloor].yOffset + FLOOR_HEIGHT - 2) * TILE_SIZE;
        const moveDir = elevator.direction === 'up' ? -1 : 1;
        const moveAmount = elevator.speed * dt * moveDir;
        elevator.y += moveAmount;

        if ((elevator.direction === 'up' && elevator.y <= targetY) ||
            (elevator.direction === 'down' && elevator.y >= targetY)) {
          elevator.y = targetY;
          elevator.currentFloor = elevator.targetFloor;
          elevator.moving = false;
          elevator.direction = null;
          elevator.doorsOpen = true;
          elevator.doorTimer = 2;
        }

        this.checkElevatorCrush(elevator, playerRect);
      }

      const elevatorRect = this.getElevatorRect(elevator);
      if (Collision.rectIntersect(playerRect, elevatorRect) && elevator.doorsOpen) {
        elevator.hasPlayer = true;
      } else if (elevator.hasPlayer && !Collision.rectIntersect(playerRect, elevatorRect)) {
        elevator.hasPlayer = false;
      }
    }
  }

  private checkElevatorCrush(elevator: Elevator, playerRect: Rect): void {
    const elevatorRect = this.getElevatorRect(elevator);
    if (Collision.rectIntersect(playerRect, elevatorRect) && !elevator.doorsOpen) {
      const { overlapX, overlapY } = Collision.getOverlap(playerRect, elevatorRect);
      if (overlapY < overlapX * 0.5) {
        if (elevator.direction === 'down') {
          // Player is under elevator - crush damage handled in Player
        }
      }
    }
  }

  public getElevatorRect(elevator: Elevator): Rect {
    return {
      x: elevator.shaftX * TILE_SIZE,
      y: elevator.y,
      width: TILE_SIZE,
      height: TILE_SIZE,
    };
  }

  public getElevators(): Elevator[] {
    return this.elevators;
  }

  public getEscalators(): Escalator[] {
    return this.escalators;
  }

  public callElevator(shaftX: number, targetFloor: number): void {
    const elevator = this.elevators.find(e => e.shaftX === shaftX);
    if (elevator && !elevator.moving) {
      elevator.targetFloor = targetFloor;
      if (elevator.currentFloor !== targetFloor && elevator.doorsOpen) {
        elevator.doorTimer = 0.5;
      }
    }
  }

  public getElevatorAt(shaftX: number): Elevator | undefined {
    return this.elevators.find(e => e.shaftX === shaftX);
  }

  public isPlayerInElevator(playerRect: Rect): Elevator | undefined {
    for (const elevator of this.elevators) {
      const rect = this.getElevatorRect(elevator);
      if (Collision.rectIntersect(playerRect, rect)) {
        return elevator;
      }
    }
    return undefined;
  }

  public getNearbyElevator(playerRect: Rect): Elevator | undefined {
    const detectRange = TILE_SIZE * 1.5;
    for (const elevator of this.elevators) {
      const rect = this.getElevatorRect(elevator);
      const expandedRect: Rect = {
        x: rect.x - detectRange,
        y: rect.y - detectRange / 2,
        width: rect.width + detectRange * 2,
        height: rect.height + detectRange,
      };
      if (Collision.rectIntersect(playerRect, expandedRect)) {
        return elevator;
      }
    }
    return undefined;
  }

  public getEscalatorAt(x: number, y: number): Escalator | undefined {
    for (const escalator of this.escalators) {
      if (x >= escalator.x && x < escalator.x + TILE_SIZE &&
          y >= Math.min(escalator.startY, escalator.endY) &&
          y <= Math.max(escalator.startY, escalator.endY)) {
        return escalator;
      }
    }
    return undefined;
  }

  public checkEnemyCrush(enemyRect: Rect, enemyFloor: number): boolean {
    for (const elevator of this.elevators) {
      if (elevator.moving) {
        const elevatorRect = this.getElevatorRect(elevator);
        if (Collision.rectIntersect(enemyRect, elevatorRect)) {
          const { overlapY } = Collision.getOverlap(enemyRect, elevatorRect);
          if (overlapY > TILE_SIZE * 0.3) {
            return true;
          }
        }
      }
    }
    return false;
  }

  public canKickEnemy(playerRect: Rect, playerDir: Direction, enemyRect: Rect): boolean {
    const kickRange = TILE_SIZE * 1.5;
    const dx = enemyRect.x - playerRect.x;
    const dy = Math.abs(enemyRect.y - playerRect.y);

    if (dy > TILE_SIZE * 0.8) return false;
    if (playerDir === Direction.RIGHT && dx < 0) return false;
    if (playerDir === Direction.LEFT && dx > 0) return false;

    return Math.abs(dx) < kickRange;
  }
}
