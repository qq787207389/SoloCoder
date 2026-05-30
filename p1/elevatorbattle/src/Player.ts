import {
  Direction,
  TILE_SIZE,
  Rect,
  GameStats,
  ItemType,
  Bullet,
  FLOOR_HEIGHT,
} from './types';
import { Input } from './Input';
import { MapSystem } from './MapSystem';
import { ElevatorSystem } from './ElevatorSystem';
import { Collision } from './Collision';

export class Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  direction: Direction;
  stats: GameStats;
  isShooting: boolean;
  isKicking: boolean;
  kickTimer: number;
  shootCooldown: number;
  currentElevator: number | null;
  onEscalator: boolean;
  invincible: boolean;
  invincibleTimer: number;
  animFrame: number;
  animTimer: number;
  private nextBulletId: number = 0;

  constructor(startX: number, startY: number) {
    this.x = startX;
    this.y = startY;
    this.vx = 0;
    this.vy = 0;
    this.width = TILE_SIZE * 0.7;
    this.height = TILE_SIZE * 0.9;
    this.direction = Direction.RIGHT;
    this.stats = {
      health: 100,
      maxHealth: 100,
      ammo: 30,
      maxAmmo: 60,
      score: 0,
      filesCollected: 0,
      totalFiles: 0,
      hasSMG: false,
      hasArmor: false,
      armorTimer: 0,
      smgTimer: 0,
      level: 1,
    };
    this.isShooting = false;
    this.isKicking = false;
    this.kickTimer = 0;
    this.shootCooldown = 0;
    this.currentElevator = null;
    this.onEscalator = false;
    this.invincible = false;
    this.invincibleTimer = 0;
    this.animFrame = 0;
    this.animTimer = 0;
  }

  public update(
    dt: number,
    input: Input,
    mapSystem: MapSystem,
    elevatorSystem: ElevatorSystem,
    onShoot: (bullet: Bullet) => void,
    onKick: () => void,
    onCollectFile: () => void,
    onReachExit: () => void
  ): void {
    if (this.stats.armorTimer > 0) {
      this.stats.armorTimer -= dt;
      if (this.stats.armorTimer <= 0) {
        this.stats.hasArmor = false;
      }
    }
    if (this.stats.smgTimer > 0) {
      this.stats.smgTimer -= dt;
      if (this.stats.smgTimer <= 0) {
        this.stats.hasSMG = false;
      }
    }

    if (this.invincible) {
      this.invincibleTimer -= dt;
      if (this.invincibleTimer <= 0) {
        this.invincible = false;
      }
    }

    if (this.shootCooldown > 0) {
      this.shootCooldown -= dt;
    }

    if (this.isKicking) {
      this.kickTimer -= dt;
      if (this.kickTimer <= 0) {
        this.isKicking = false;
      }
    }

    this.vx = 0;
    this.vy = 0;

    const speed = 120;

    if (!this.isKicking) {
      if (input.isLeft()) {
        this.vx = -speed;
        this.direction = Direction.LEFT;
      }
      if (input.isRight()) {
        this.vx = speed;
        this.direction = Direction.RIGHT;
      }

      const playerRect = this.getRect();
      const escalator = elevatorSystem.getEscalatorAt(
        playerRect.x + playerRect.width / 2,
        playerRect.y + playerRect.height / 2
      );
      if (escalator) {
        this.onEscalator = true;
        const escDir = escalator.direction === 'up' ? -1 : 1;
        this.vy = escalator.speed * escDir;
      } else {
        this.onEscalator = false;
      }

      const elevator = elevatorSystem.isPlayerInElevator(playerRect);
      const nearbyElevator = elevatorSystem.getNearbyElevator(playerRect);

      if (elevator) {
        this.currentElevator = elevator.id;

        if (elevator.doorsOpen) {
          if (input.isElevatorUp()) {
            const targetFloor = Math.min(
              elevator.targetFloor + 1,
              mapSystem.getFloors().length - 1
            );
            elevatorSystem.callElevator(elevator.shaftX, targetFloor);
          }
          if (input.isElevatorDown()) {
            const targetFloor = Math.max(elevator.targetFloor - 1, 0);
            elevatorSystem.callElevator(elevator.shaftX, targetFloor);
          }
        }

        if (elevator.moving) {
          this.vy = elevator.speed * (elevator.direction === 'up' ? -1 : 1);
          this.x = elevator.shaftX * TILE_SIZE + TILE_SIZE / 2 - this.width / 2;
        }
      } else if (nearbyElevator) {
        if (input.isElevatorUp() || input.isElevatorDown()) {
          const playerFloor = mapSystem.getFloorForY(this.y + this.height / 2);
          if (playerFloor >= 0) {
            elevatorSystem.callElevator(nearbyElevator.shaftX, playerFloor);
          }
        }
      } else {
        this.currentElevator = null;
      }

      if (input.isShoot() && this.shootCooldown <= 0 && this.stats.ammo > 0) {
        this.shoot(onShoot);
      }

      if (input.isKick() && !this.isKicking) {
        this.isKicking = true;
        this.kickTimer = 0.3;
        onKick();
      }

      if (input.isInteract()) {
        this.checkRoomInteraction(mapSystem, onCollectFile);
      }
    }

    const solidTiles = mapSystem.getSolidTiles();

    const { newX, newY } = Collision.sweepTest(
      this.getRect(),
      this.vx,
      this.vy,
      solidTiles,
      dt
    );

    this.x = newX;
    this.y = newY;

    if (this.vx !== 0 || this.vy !== 0) {
      this.animTimer += dt;
      if (this.animTimer > 0.15) {
        this.animFrame = (this.animFrame + 1) % 4;
        this.animTimer = 0;
      }
    } else {
      this.animFrame = 0;
    }

    this.checkExit(mapSystem, onReachExit);
    this.checkElevatorCrush(elevatorSystem);
  }

  private shoot(onShoot: (bullet: Bullet) => void): void {
    const bulletSpeed = 400;
    const fireRate = this.stats.hasSMG ? 0.08 : 0.25;
    const damage = this.stats.hasSMG ? 15 : 25;

    this.shootCooldown = fireRate;
    this.stats.ammo--;
    this.isShooting = true;

    const bullet: Bullet = {
      id: this.nextBulletId++,
      x: this.x + this.width / 2,
      y: this.y + this.height * 0.3,
      vx: this.direction === Direction.RIGHT ? bulletSpeed : -bulletSpeed,
      vy: 0,
      damage,
      isPlayerBullet: true,
      life: 2,
    };

    onShoot(bullet);

    setTimeout(() => {
      this.isShooting = false;
    }, 100);
  }

  private checkRoomInteraction(
    mapSystem: MapSystem,
    onCollectFile: () => void
  ): void {
    const floors = mapSystem.getFloors();
    const playerTileX = Math.floor((this.x + this.width / 2) / TILE_SIZE);
    const playerTileY = Math.floor((this.y + this.height / 2) / TILE_SIZE);

    for (const floor of floors) {
      for (const room of floor.rooms) {
        if (
          playerTileX >= room.x &&
          playerTileX < room.x + room.width &&
          playerTileY >= room.y &&
          playerTileY < room.y + room.height
        ) {
          if (room.hasFile && !room.fileCollected) {
            if (mapSystem.collectFile(room.x, room.y)) {
              this.stats.filesCollected++;
              this.stats.score += 500;
              onCollectFile();
            }
          }
        }
      }
    }
  }

  private checkExit(mapSystem: MapSystem, onReachExit: () => void): void {
    if (!mapSystem.isExitOpen()) return;

    const playerRect = this.getRect();
    const exitX = (25 - 3) * TILE_SIZE;
    const exitY = (40 - 3) * TILE_SIZE;
    const exitRect: Rect = {
      x: exitX,
      y: exitY,
      width: TILE_SIZE,
      height: TILE_SIZE * 2,
    };

    if (Collision.rectIntersect(playerRect, exitRect)) {
      onReachExit();
    }
  }

  private checkElevatorCrush(elevatorSystem: ElevatorSystem): void {
    if (this.invincible) return;

    const playerRect = this.getRect();
    for (const elevator of elevatorSystem.getElevators()) {
      if (elevator.moving && !elevator.doorsOpen) {
        const elevRect = elevatorSystem.getElevatorRect(elevator);
        if (Collision.rectIntersect(playerRect, elevRect)) {
          const { overlapX, overlapY } = Collision.getOverlap(playerRect, elevRect);
          if (overlapY > TILE_SIZE * 0.2) {
            this.takeDamage(100);
          }
        }
      }
    }
  }

  public takeDamage(damage: number): void {
    if (this.invincible) return;

    let actualDamage = damage;
    if (this.stats.hasArmor) {
      actualDamage = Math.floor(damage * 0.3);
    }

    this.stats.health -= actualDamage;
    this.invincible = true;
    this.invincibleTimer = 1;

    if (this.stats.health <= 0) {
      this.stats.health = 0;
    }
  }

  public heal(amount: number): void {
    this.stats.health = Math.min(this.stats.health + amount, this.stats.maxHealth);
  }

  public addAmmo(amount: number): void {
    this.stats.ammo = Math.min(this.stats.ammo + amount, this.stats.maxAmmo);
  }

  public pickupItem(type: ItemType): void {
    switch (type) {
      case ItemType.SMG:
        this.stats.hasSMG = true;
        this.stats.smgTimer = 30;
        break;
      case ItemType.ARMOR:
        this.stats.hasArmor = true;
        this.stats.armorTimer = 20;
        break;
      case ItemType.HEALTH:
        this.heal(50);
        break;
      case ItemType.AMMO:
        this.addAmmo(15);
        break;
    }
    this.stats.score += 100;
  }

  public getRect(): Rect {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  public reset(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.stats.health = this.stats.maxHealth;
    this.stats.ammo = 30;
    this.stats.filesCollected = 0;
    this.stats.hasSMG = false;
    this.stats.hasArmor = false;
    this.stats.armorTimer = 0;
    this.stats.smgTimer = 0;
    this.currentElevator = null;
    this.invincible = false;
    this.invincibleTimer = 0;
    this.direction = Direction.RIGHT;
    this.isKicking = false;
    this.kickTimer = 0;
    this.shootCooldown = 0;
  }
}
