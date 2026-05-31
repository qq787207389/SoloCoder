export enum EnemyType {
  BEETLE = 'beetle',
  JELLYFISH = 'jellyfish',
  DRAGON = 'dragon',
}

export class Enemy {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  type: EnemyType;
  hp: number;
  maxHp: number;
  dead: boolean;
  frozen: boolean;
  frozenTimer: number;
  facing: number;
  animTime: number;
  knockbackVx: number;
  knockbackVy: number;

  constructor(x: number, y: number, w: number, h: number, type: EnemyType, hp: number) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.vx = 0;
    this.vy = 0;
    this.type = type;
    this.hp = hp;
    this.maxHp = hp;
    this.dead = false;
    this.frozen = false;
    this.frozenTimer = 0;
    this.facing = 1;
    this.animTime = 0;
    this.knockbackVx = 0;
    this.knockbackVy = 0;
  }

  update(dt: number, gravity: number, playerX?: number, playerY?: number): void | any[] {
    if (this.frozen) {
      this.frozenTimer -= dt;
      if (this.frozenTimer <= 0) {
        this.frozen = false;
      }
      this.vx = this.knockbackVx;
      this.vy = this.knockbackVy;
      if (this.frozenTimer < 0.1) {
        this.knockbackVx *= 1.1;
        this.knockbackVy *= 1.1;
      }
    } else {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.vy += gravity * dt;
    }
    this.animTime += dt;
  }

  applyRainbowHit(knockbackDir: number): void {
    this.frozen = true;
    this.frozenTimer = 0.8;
    this.knockbackVx = knockbackDir * 300;
    this.knockbackVy = -250;
  }

  takeDamage(): boolean {
    this.hp--;
    if (this.hp <= 0) {
      this.dead = true;
      return true;
    }
    return false;
  }

  getRect(): { x: number; y: number; w: number; h: number } {
    return {
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h,
    };
  }
}
