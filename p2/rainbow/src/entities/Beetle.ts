import { Enemy, EnemyType } from './Enemy';
import { BEETLE_SPEED } from '../utils/Constants';

export class Beetle extends Enemy {
  patrolMinX: number;
  patrolMaxX: number;
  speed: number = BEETLE_SPEED;

  constructor(x: number, y: number, patrolMinX: number, patrolMaxX: number) {
    super(x, y, 20, 16, EnemyType.BEETLE, 1);
    this.patrolMinX = patrolMinX;
    this.patrolMaxX = patrolMaxX;
    this.vx = this.speed;
  }

  update(dt: number, gravity: number): void {
    if (!this.frozen && !this.dead) {
      if (this.x <= this.patrolMinX) {
        this.vx = this.speed;
        this.facing = 1;
      }
      if (this.x >= this.patrolMaxX) {
        this.vx = -this.speed;
        this.facing = -1;
      }
      this.vy += gravity * dt;
    }
    super.update(dt, gravity);
  }
}
