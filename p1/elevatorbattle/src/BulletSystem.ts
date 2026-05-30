import { Bullet, Rect, Particle, TILE_SIZE } from './types';
import { MapSystem } from './MapSystem';
import { Collision } from './Collision';

export class BulletSystem {
  private bullets: Bullet[] = [];
  private particles: Particle[] = [];

  constructor() {}

  public addBullet(bullet: Bullet): void {
    this.bullets.push(bullet);
  }

  public update(
    dt: number,
    mapSystem: MapSystem,
    playerRect: Rect,
    enemyRects: { id: number; rect: Rect }[],
    onPlayerHit: (damage: number) => void,
    onEnemyHit: (enemyId: number, damage: number) => void
  ): void {
    const bulletsToRemove: number[] = [];

    for (let i = 0; i < this.bullets.length; i++) {
      const bullet = this.bullets[i];

      bullet.life -= dt;
      if (bullet.life <= 0) {
        bulletsToRemove.push(i);
        continue;
      }

      bullet.x += bullet.vx * dt;
      bullet.y += bullet.vy * dt;

      if (mapSystem.isSolid(bullet.x, bullet.y)) {
        this.createImpactParticles(bullet.x, bullet.y, '#888');
        bulletsToRemove.push(i);
        continue;
      }

      const bulletRect: Rect = {
        x: bullet.x - 3,
        y: bullet.y - 3,
        width: 6,
        height: 6,
      };

      if (bullet.isPlayerBullet) {
        for (const enemyInfo of enemyRects) {
          if (Collision.rectIntersect(bulletRect, enemyInfo.rect)) {
            onEnemyHit(enemyInfo.id, bullet.damage);
            this.createImpactParticles(bullet.x, bullet.y, '#ff4444');
            bulletsToRemove.push(i);
            break;
          }
        }
      } else {
        if (Collision.rectIntersect(bulletRect, playerRect)) {
          onPlayerHit(bullet.damage);
          this.createImpactParticles(bullet.x, bullet.y, '#ff0000');
          bulletsToRemove.push(i);
        }
      }
    }

    for (let i = bulletsToRemove.length - 1; i >= 0; i--) {
      this.bullets.splice(bulletsToRemove[i], 1);
    }

    this.updateParticles(dt);
  }

  private createImpactParticles(x: number, y: number, color: string): void {
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 100,
        vy: (Math.random() - 0.5) * 100,
        life: 0.3,
        maxLife: 0.3,
        color,
        size: 2 + Math.random() * 2,
      });
    }
  }

  public createMuzzleFlash(x: number, y: number, direction: number): void {
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: x + direction * 10,
        y,
        vx: direction * (50 + Math.random() * 50),
        vy: (Math.random() - 0.5) * 30,
        life: 0.1,
        maxLife: 0.1,
        color: '#ffff00',
        size: 3 + Math.random() * 3,
      });
    }
  }

  public createBloodParticles(x: number, y: number): void {
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 150,
        vy: (Math.random() - 0.5) * 150,
        life: 0.5,
        maxLife: 0.5,
        color: '#aa0000',
        size: 2 + Math.random() * 3,
      });
    }
  }

  private updateParticles(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 200 * dt;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  public getBullets(): Bullet[] {
    return this.bullets;
  }

  public getParticles(): Particle[] {
    return this.particles;
  }

  public clear(): void {
    this.bullets = [];
    this.particles = [];
  }
}
