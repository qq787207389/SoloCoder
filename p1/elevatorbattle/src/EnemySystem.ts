import {
  Enemy,
  EnemyState,
  EnemyType,
  Direction,
  TILE_SIZE,
  Rect,
  Bullet,
} from './types';
import { MapSystem } from './MapSystem';
import { ElevatorSystem } from './ElevatorSystem';
import { Collision } from './Collision';
import { Player } from './Player';

export class EnemySystem {
  private enemies: Enemy[] = [];
  private nextId: number = 0;
  private nextBulletId: number = 1000;
  private alerted: boolean = false;
  private alertLevel: number = 0;

  constructor() {}

  public initialize(mapSystem: MapSystem, level: number): void {
    this.enemies = [];
    this.alerted = false;
    this.alertLevel = 0;

    const floors = mapSystem.getFloors();

    for (const floor of floors) {
      for (const patrol of floor.guardPatrolPaths) {
        const speed = 40 + level * 5;
        const reactionTime = Math.max(0.3, 1.0 - level * 0.1);
        this.enemies.push({
          id: this.nextId++,
          type: EnemyType.GUARD,
          x: patrol.x1 * TILE_SIZE,
          y: patrol.y * TILE_SIZE,
          vx: 0,
          vy: 0,
          width: TILE_SIZE * 0.7,
          height: TILE_SIZE * 0.9,
          health: 50,
          maxHealth: 50,
          state: EnemyState.PATROL,
          direction: Direction.RIGHT,
          patrolStart: patrol.x1 * TILE_SIZE,
          patrolEnd: patrol.x2 * TILE_SIZE,
          patrolY: patrol.y * TILE_SIZE,
          alertTimer: 0,
          shootCooldown: 0,
          speed,
          reactionTime,
          floorIndex: floor.floorIndex,
          stunned: false,
          stunTimer: 0,
        });
      }

      for (const pos of floor.agentPositions) {
        const speed = 60 + level * 8;
        const reactionTime = Math.max(0.15, 0.5 - level * 0.05);
        this.enemies.push({
          id: this.nextId++,
          type: EnemyType.AGENT,
          x: pos.x * TILE_SIZE,
          y: pos.y * TILE_SIZE,
          vx: 0,
          vy: 0,
          width: TILE_SIZE * 0.7,
          height: TILE_SIZE * 0.9,
          health: 75,
          maxHealth: 75,
          state: EnemyState.PATROL,
          direction: Direction.RIGHT,
          patrolStart: (pos.x - 3) * TILE_SIZE,
          patrolEnd: (pos.x + 3) * TILE_SIZE,
          patrolY: pos.y * TILE_SIZE,
          alertTimer: 0,
          shootCooldown: 0,
          speed,
          reactionTime,
          floorIndex: floor.floorIndex,
          stunned: false,
          stunTimer: 0,
        });
      }
    }
  }

  public update(
    dt: number,
    player: Player,
    mapSystem: MapSystem,
    elevatorSystem: ElevatorSystem,
    onEnemyShoot: (bullet: Bullet) => void,
    onPlayerSpotted: () => void
  ): void {
    const playerRect = player.getRect();

    for (const enemy of this.enemies) {
      if (enemy.state === EnemyState.DEAD) continue;

      if (enemy.stunned) {
        enemy.stunTimer -= dt;
        if (enemy.stunTimer <= 0) {
          enemy.stunned = false;
        }
        continue;
      }

      if (enemy.shootCooldown > 0) {
        enemy.shootCooldown -= dt;
      }

      if (elevatorSystem.checkEnemyCrush(this.getEnemyRect(enemy), enemy.floorIndex)) {
        enemy.state = EnemyState.DEAD;
        continue;
      }

      if (this.alerted && enemy.type === EnemyType.AGENT) {
        if (enemy.state !== EnemyState.CHASE) {
          enemy.state = EnemyState.ALERT;
          enemy.alertTimer = enemy.reactionTime * 0.5;
        }
      }

      switch (enemy.state) {
        case EnemyState.PATROL:
          this.updatePatrol(enemy, dt, playerRect);
          break;
        case EnemyState.ALERT:
          this.updateAlert(enemy, dt, playerRect, onPlayerSpotted);
          break;
        case EnemyState.CHASE:
          this.updateChase(enemy, dt, playerRect, mapSystem, onEnemyShoot, player);
          break;
      }

      const { newX, newY } = Collision.sweepTest(
        this.getEnemyRect(enemy),
        enemy.vx,
        enemy.vy,
        mapSystem.getSolidTiles(),
        dt
      );
      enemy.x = newX;
      enemy.y = newY;
    }
  }

  private updatePatrol(enemy: Enemy, dt: number, playerRect: Rect): void {
    if (enemy.x <= enemy.patrolStart) {
      enemy.direction = Direction.RIGHT;
    } else if (enemy.x >= enemy.patrolEnd) {
      enemy.direction = Direction.LEFT;
    }

    enemy.vx = enemy.speed * enemy.direction * 0.5;

    if (this.canSeePlayer(enemy, playerRect)) {
      enemy.state = EnemyState.ALERT;
      enemy.alertTimer = enemy.reactionTime;
    }
  }

  private updateAlert(enemy: Enemy, dt: number, playerRect: Rect, onPlayerSpotted: () => void): void {
    enemy.vx = 0;
    enemy.alertTimer -= dt;

    const playerCenterX = playerRect.x + playerRect.width / 2;
    const enemyCenterX = enemy.x + enemy.width / 2;
    enemy.direction = playerCenterX > enemyCenterX ? Direction.RIGHT : Direction.LEFT;

    if (!this.canSeePlayer(enemy, playerRect)) {
      enemy.alertTimer -= dt * 0.5;
      if (enemy.alertTimer <= 0) {
        enemy.state = EnemyState.PATROL;
        return;
      }
    } else {
      if (enemy.alertTimer <= 0) {
        enemy.state = EnemyState.CHASE;
        this.alerted = true;
        this.alertLevel = Math.min(3, this.alertLevel + 1);
        onPlayerSpotted();
      }
    }
  }

  private updateChase(
    enemy: Enemy,
    dt: number,
    playerRect: Rect,
    mapSystem: MapSystem,
    onEnemyShoot: (bullet: Bullet) => void,
    player: Player
  ): void {
    const playerCenterX = playerRect.x + playerRect.width / 2;
    const enemyCenterX = enemy.x + enemy.width / 2;
    const dx = playerCenterX - enemyCenterX;
    const dy = Math.abs(playerRect.y - enemy.y);

    enemy.direction = dx > 0 ? Direction.RIGHT : Direction.LEFT;

    const shootRange = enemy.type === EnemyType.AGENT ? 250 : 180;
    const chaseRange = 400;

    if (dy < TILE_SIZE * 1.5) {
      if (Math.abs(dx) > shootRange * 0.3 && Math.abs(dx) < chaseRange) {
        enemy.vx = enemy.speed * enemy.direction;
      } else {
        enemy.vx = 0;
      }

      if (Math.abs(dx) < shootRange && enemy.shootCooldown <= 0 && this.hasLineOfSight(enemy, playerRect, mapSystem)) {
        this.enemyShoot(enemy, playerRect, onEnemyShoot);
      }
    } else {
      enemy.vx = 0;
    }

    if (!this.canSeePlayer(enemy, playerRect)) {
      enemy.alertTimer = 3;
      enemy.alertTimer -= dt;
      if (enemy.alertTimer <= 0) {
        enemy.state = EnemyState.PATROL;
      }
    }
  }

  private canSeePlayer(enemy: Enemy, playerRect: Rect): boolean {
    const viewDistance = enemy.type === EnemyType.AGENT ? 300 : 200;
    const dx = playerRect.x + playerRect.width / 2 - (enemy.x + enemy.width / 2);
    const dy = playerRect.y + playerRect.height / 2 - (enemy.y + enemy.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > viewDistance) return false;

    const isInFront = enemy.direction === Direction.RIGHT ? dx > -20 : dx < 20;
    if (!isInFront) return false;

    if (Math.abs(dy) > TILE_SIZE * 2) return false;

    return true;
  }

  private hasLineOfSight(enemy: Enemy, playerRect: Rect, mapSystem: MapSystem): boolean {
    const startX = enemy.x + enemy.width / 2;
    const startY = enemy.y + enemy.height / 2;
    const endX = playerRect.x + playerRect.width / 2;
    const endY = playerRect.y + playerRect.height / 2;

    const dx = endX - startX;
    const dy = endY - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const dirX = dx / dist;
    const dirY = dy / dist;

    const result = Collision.raycast(
      startX,
      startY,
      dirX,
      dirY,
      dist,
      (x, y) => mapSystem.isSolid(x, y)
    );

    return !result.hit || result.distance >= dist * 0.9;
  }

  private enemyShoot(
    enemy: Enemy,
    playerRect: Rect,
    onEnemyShoot: (bullet: Bullet) => void
  ): void {
    const bulletSpeed = 300;
    const fireRate = enemy.type === EnemyType.AGENT ? 0.8 : 1.5;
    const damage = enemy.type === EnemyType.AGENT ? 15 : 20;

    enemy.shootCooldown = fireRate;

    const playerCenterX = playerRect.x + playerRect.width / 2;
    const enemyCenterX = enemy.x + enemy.width / 2;
    const dirX = playerCenterX > enemyCenterX ? 1 : -1;

    const spread = (Math.random() - 0.5) * 0.2;

    const bullet: Bullet = {
      id: this.nextBulletId++,
      x: enemy.x + enemy.width / 2,
      y: enemy.y + enemy.height * 0.3,
      vx: dirX * bulletSpeed,
      vy: spread * bulletSpeed * 0.5,
      damage,
      isPlayerBullet: false,
      life: 1.5,
    };

    onEnemyShoot(bullet);
  }

  public getEnemies(): Enemy[] {
    return this.enemies.filter(e => e.state !== EnemyState.DEAD);
  }

  public getAllEnemies(): Enemy[] {
    return this.enemies;
  }

  public getEnemyRect(enemy: Enemy): Rect {
    return {
      x: enemy.x,
      y: enemy.y,
      width: enemy.width,
      height: enemy.height,
    };
  }

  public damageEnemy(enemyId: number, damage: number): boolean {
    const enemy = this.enemies.find(e => e.id === enemyId);
    if (!enemy || enemy.state === EnemyState.DEAD) return false;

    enemy.health -= damage;
    enemy.state = EnemyState.CHASE;
    enemy.alertTimer = 0;

    if (enemy.health <= 0) {
      enemy.state = EnemyState.DEAD;
      this.alerted = true;
      return true;
    }
    return false;
  }

  public kickEnemy(enemyId: number, direction: Direction): void {
    const enemy = this.enemies.find(e => e.id === enemyId);
    if (!enemy || enemy.state === EnemyState.DEAD) return;

    enemy.health -= 30;
    enemy.stunned = true;
    enemy.stunTimer = 1.5;
    enemy.x += direction * TILE_SIZE;

    if (enemy.health <= 0) {
      enemy.state = EnemyState.DEAD;
      this.alerted = true;
    } else {
      enemy.state = EnemyState.CHASE;
      enemy.alertTimer = 0;
    }
  }

  public alertAllEnemies(): void {
    this.alerted = true;
    this.alertLevel = Math.min(3, this.alertLevel + 1);
    for (const enemy of this.enemies) {
      if (enemy.state === EnemyState.PATROL || enemy.state === EnemyState.ALERT) {
        enemy.state = EnemyState.ALERT;
        enemy.alertTimer = Math.max(0.2, enemy.alertTimer - 0.3);
      }
    }
  }

  public isAlerted(): boolean {
    return this.alerted;
  }

  public getAlertLevel(): number {
    return this.alertLevel;
  }

  public spawnReinforcements(mapSystem: MapSystem, count: number): void {
    const floors = mapSystem.getFloors();
    const lowestFloor = floors[floors.length - 1];

    for (let i = 0; i < count; i++) {
      const x = 2 + Math.floor(Math.random() * (25 - 4));
      const speed = 70;
      const reactionTime = 0.3;

      this.enemies.push({
        id: this.nextId++,
        type: EnemyType.AGENT,
        x: x * TILE_SIZE,
        y: lowestFloor.yOffset * TILE_SIZE + (8 - 2) * TILE_SIZE,
        vx: 0,
        vy: 0,
        width: TILE_SIZE * 0.7,
        height: TILE_SIZE * 0.9,
        health: 60,
        maxHealth: 60,
        state: EnemyState.CHASE,
        direction: Direction.RIGHT,
        patrolStart: 1 * TILE_SIZE,
        patrolEnd: (25 - 2) * TILE_SIZE,
        patrolY: lowestFloor.yOffset * TILE_SIZE + (8 - 2) * TILE_SIZE,
        alertTimer: 0,
        shootCooldown: 1,
        speed,
        reactionTime,
        floorIndex: lowestFloor.floorIndex,
        stunned: false,
        stunTimer: 0,
      });
    }
  }

  public onPlayerShot(): void {
    for (const enemy of this.enemies) {
      if (enemy.type === EnemyType.AGENT && enemy.state === EnemyState.PATROL) {
        enemy.state = EnemyState.ALERT;
        enemy.alertTimer = enemy.reactionTime * 0.7;
      }
    }
  }
}
