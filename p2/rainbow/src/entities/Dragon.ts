import { Enemy, EnemyType } from './Enemy';
import { DRAGON_SPEED, DRAGON_FIRE_INTERVAL, BOSS_BULLET_SPEED } from '../utils/Constants';

export interface DragonBullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  active: boolean;
}

export class Dragon extends Enemy {
  fireTimer: number;
  fireInterval: number = DRAGON_FIRE_INTERVAL;
  bullets: DragonBullet[];

  constructor(x: number, y: number) {
    super(x, y, 40, 24, EnemyType.DRAGON, 3);
    this.fireTimer = this.fireInterval;
    this.bullets = [];
  }

  update(dt: number, gravity: number, playerX: number, playerY: number): DragonBullet[] {
    const newBullets: DragonBullet[] = [];

    if (!this.frozen && !this.dead) {
      this.fireTimer -= dt;

      if (this.fireTimer <= 0) {
        this.fireTimer = this.fireInterval;

        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const baseVx = (dx / dist) * BOSS_BULLET_SPEED;
        const baseVy = (dy / dist) * BOSS_BULLET_SPEED;

        const spreadAngles = [-0.3, 0, 0.3];
        for (const angle of spreadAngles) {
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          const bulletVx = baseVx * cos - baseVy * sin;
          const bulletVy = baseVx * sin + baseVy * cos;

          newBullets.push({
            x: this.x + this.w / 2,
            y: this.y + this.h / 2,
            vx: bulletVx,
            vy: bulletVy,
            w: 4,
            h: 4,
            active: true,
          });
        }
      }

      this.vx = Math.sign(playerX - this.x) * DRAGON_SPEED;
      this.vy = Math.sign(playerY - this.y) * 20;
      this.facing = playerX > this.x ? 1 : -1;
    }

    super.update(dt, 0);
    return newBullets;
  }
}
