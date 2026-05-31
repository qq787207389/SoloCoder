import { Beetle } from '../entities/Beetle';
import { Jellyfish } from '../entities/Jellyfish';
import { Dragon, DragonBullet } from '../entities/Dragon';
import { BossBullet } from '../entities/Boss';
import { RainbowArc } from '../systems/RainbowSystem';
import { CollisionSystem, Rect } from '../game/CollisionSystem';
import { EnemyType } from '../entities/Enemy';

export class EnemySystem {
  enemies: Array<Beetle | Jellyfish | Dragon>;
  dragonBullets: DragonBullet[];
  bossBullets: BossBullet[];

  constructor() {
    this.enemies = [];
    this.dragonBullets = [];
    this.bossBullets = [];
  }

  addEnemy(enemy: Beetle | Jellyfish | Dragon): void {
    this.enemies.push(enemy);
  }

  update(dt: number, gravity: number, playerX: number, playerY: number): void {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];

      if (enemy instanceof Dragon) {
        const newBullets = enemy.update(dt, gravity, playerX, playerY);
        if (newBullets && newBullets.length > 0) {
          this.dragonBullets.push(...newBullets);
        }
      } else {
        enemy.update(dt, gravity, playerX, playerY);
      }
    }

    for (let i = this.dragonBullets.length - 1; i >= 0; i--) {
      const bullet = this.dragonBullets[i];
      bullet.x += bullet.vx * dt;
      bullet.y += bullet.vy * dt;

      if (
        bullet.x < -50 ||
        bullet.x > 530 ||
        bullet.y < -50 ||
        bullet.y > 3200
      ) {
        this.dragonBullets.splice(i, 1);
      }
    }

    for (let i = this.bossBullets.length - 1; i >= 0; i--) {
      const bullet = this.bossBullets[i];
      bullet.x += bullet.vx * dt;
      bullet.y += bullet.vy * dt;

      if (
        bullet.x < -50 ||
        bullet.x > 530 ||
        bullet.y < -50 ||
        bullet.y > 3200
      ) {
        this.bossBullets.splice(i, 1);
      }
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (enemy.hp <= 0) {
        this.enemies.splice(i, 1);
      } else if (enemy.frozen && enemy.frozenTimer <= 0) {
        if (enemy.y > 3100 || enemy.x < -100 || enemy.x > 580) {
          this.enemies.splice(i, 1);
        }
      }
    }
  }

  checkRainbowCollisions(arcs: RainbowArc[], getArcPoints: (arc: RainbowArc) => { x: number; y: number }[]): number {
    let totalScore = 0;

    for (const arc of arcs) {
      const points = getArcPoints(arc);
      for (const enemy of this.enemies) {
        if (enemy.dead) continue;
        if (enemy.frozen) continue;

        const enemyRect = enemy.getRect();
        let hit = false;

        for (let i = 0; i < points.length - 1; i++) {
          if (CollisionSystem.lineIntersectsRect(
            points[i].x,
            points[i].y,
            points[i + 1].x,
            points[i + 1].y,
            enemyRect
          )) {
            hit = true;
            break;
          }
        }

        if (hit) {
          const direction = arc.facing;
          enemy.applyRainbowHit(direction);
          enemy.takeDamage();

          if (enemy.dead) {
            switch (enemy.type) {
              case EnemyType.BEETLE:
                totalScore += 100;
                break;
              case EnemyType.JELLYFISH:
                totalScore += 200;
                break;
              case EnemyType.DRAGON:
                totalScore += 500;
                break;
            }
          }
        }
      }
    }

    return totalScore;
  }

  checkPlayerCollisions(playerRect: Rect, playerInvincible: boolean): boolean {
    if (playerInvincible) return false;

    for (const enemy of this.enemies) {
      if (enemy.dead) continue;
      const enemyRect = enemy.getRect();
      if (CollisionSystem.aabb(playerRect, enemyRect)) {
        return true;
      }
    }

    for (const bullet of this.dragonBullets) {
      const bulletRect: Rect = { x: bullet.x, y: bullet.y, w: bullet.w, h: bullet.h };
      if (CollisionSystem.aabb(playerRect, bulletRect)) {
        return true;
      }
    }

    for (const bullet of this.bossBullets) {
      const bulletRect: Rect = { x: bullet.x, y: bullet.y, w: bullet.w, h: bullet.h };
      if (CollisionSystem.aabb(playerRect, bulletRect)) {
        return true;
      }
    }

    return false;
  }

  clear(): void {
    this.enemies = [];
    this.dragonBullets = [];
    this.bossBullets = [];
  }

  getEnemies(): Array<Beetle | Jellyfish | Dragon> {
    return this.enemies;
  }

  getDragonBullets(): DragonBullet[] {
    return this.dragonBullets;
  }

  getBossBullets(): BossBullet[] {
    return this.bossBullets;
  }

  addBossBullet(bullet: BossBullet): void {
    this.bossBullets.push(bullet);
  }
}
