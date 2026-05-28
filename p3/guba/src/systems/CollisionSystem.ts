import { Entity } from '../entities/Entity';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { Hostage } from '../entities/Hostage';
import { Item } from '../entities/Item';
import { rectIntersect, circleIntersect } from '../utils';

export class CollisionSystem {
  private gridSize: number;
  private grid: Map<string, Entity[]>;

  constructor(gridSize: number = 50) {
    this.gridSize = gridSize;
    this.grid = new Map();
  }



  private addToGrid(entity: Entity): void {
    const keys = this.getEntityGridKeys(entity);
    for (const key of keys) {
      if (!this.grid.has(key)) {
        this.grid.set(key, []);
      }
      this.grid.get(key)!.push(entity);
    }
  }

  private getEntityGridKeys(entity: Entity): string[] {
    const keys: string[] = [];
    const rect = entity.getRect();

    const startX = Math.floor(rect.x / this.gridSize);
    const endX = Math.floor((rect.x + rect.width) / this.gridSize);
    const startY = Math.floor(rect.y / this.gridSize);
    const endY = Math.floor((rect.y + rect.height) / this.gridSize);

    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        keys.push(`${x},${y}`);
      }
    }

    return keys;
  }

  private getNearbyEntities(entity: Entity): Entity[] {
    const nearby = new Set<Entity>();
    const keys = this.getEntityGridKeys(entity);

    for (const key of keys) {
      if (this.grid.has(key)) {
        for (const e of this.grid.get(key)!) {
          if (e.id !== entity.id) {
            nearby.add(e);
          }
        }
      }
    }

    return Array.from(nearby);
  }

  public clear(): void {
    this.grid.clear();
  }

  public checkCollisions(
    players: Player[],
    enemies: Enemy[],
    bullets: Bullet[],
    hostages: Hostage[],
    items: Item[],
    onPlayerEnemyCollision: (player: Player, enemy: Enemy) => void,
    onBulletHit: (bullet: Bullet, target: Entity) => void,
    onPlayerItemPickup: (player: Player, item: Item) => void,
    _onPlayerHostagePickup: (player: Player, hostage: Hostage) => void
  ): void {
    this.clear();

    const allEntities = [...players, ...enemies, ...bullets, ...hostages, ...items];
    allEntities.filter(e => e.active).forEach(e => this.addToGrid(e));

    for (const player of players) {
      if (!player.active) continue;

      const nearby = this.getNearbyEntities(player);

      for (const entity of nearby) {
        if (!entity.active) continue;

        if (entity instanceof Enemy) {
          if (this.checkEntityCollision(player, entity)) {
            onPlayerEnemyCollision(player, entity);
          }
        }

        if (entity instanceof Item) {
          if (this.checkEntityCollision(player, entity)) {
            onPlayerItemPickup(player, entity);
          }
        }
      }
    }

    for (const bullet of bullets) {
      if (!bullet.active) continue;

      const nearby = this.getNearbyEntities(bullet);

      for (const entity of nearby) {
        if (!entity.active) continue;

        if (bullet.isPlayer) {
          if (entity instanceof Enemy || entity instanceof Hostage) {
            if (this.checkBulletCollision(bullet, entity)) {
              onBulletHit(bullet, entity);
            }
          }
        } else {
          if (entity instanceof Player) {
            if (this.checkBulletCollision(bullet, entity)) {
              onBulletHit(bullet, entity);
            }
          }
        }
      }
    }
  }

  private checkEntityCollision(a: Entity, b: Entity): boolean {
    return rectIntersect(a.getRect(), b.getRect());
  }

  private checkBulletCollision(bullet: Bullet, entity: Entity): boolean {
    const bulletRect = bullet.getRect();
    const entityRect = entity.getRect();
    return rectIntersect(bulletRect, entityRect);
  }

  public checkExplosionDamage(
    position: { x: number; y: number },
    radius: number,
    damage: number,
    enemies: Enemy[],
    hostages: Hostage[],
    onEnemyHit: (enemy: Enemy, damage: number) => void,
    onHostageHit: (hostage: Hostage, damage: number) => void
  ): void {
    for (const enemy of enemies) {
      if (!enemy.active) continue;
      if (circleIntersect(position, radius, enemy.position, Math.max(enemy.size.x, enemy.size.y) / 2)) {
        onEnemyHit(enemy, damage);
      }
    }

    for (const hostage of hostages) {
      if (!hostage.active) continue;
      if (circleIntersect(position, radius, hostage.position, Math.max(hostage.size.x, hostage.size.y) / 2)) {
        onHostageHit(hostage, damage);
      }
    }
  }
}
