import { Enemy, EnemyType } from './Enemy';
import { JELLYFISH_SPEED } from '../utils/Constants';

export class Jellyfish extends Enemy {
  baseY: number;
  floatAmplitude: number;
  floatSpeed: number;
  chaseRange: number = 150;

  constructor(x: number, y: number) {
    super(x, y, 18, 18, EnemyType.JELLYFISH, 1);
    this.baseY = y;
    this.floatAmplitude = 15;
    this.floatSpeed = 2;
  }

  update(dt: number, gravity: number, playerX: number, playerY: number): void {
    if (!this.frozen && !this.dead) {
      this.y = this.baseY + Math.sin(this.animTime * this.floatSpeed) * this.floatAmplitude;
      const dx = playerX - this.x;
      if (Math.abs(dx) < this.chaseRange) {
        this.vx = Math.sign(dx) * JELLYFISH_SPEED;
      } else {
        this.vx = 0;
      }
    }
    super.update(dt, 0);
  }
}
