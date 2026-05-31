import { BOSS_HP, BOSS_SPEED, BOSS_BULLET_SPEED, GRAVITY } from '../utils/Constants';

export enum BossPhase {
  INTRO,
  IDLE,
  SHOOT,
  CHARGE,
  ENRAGED,
  DEAD,
}

export interface BossBullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  active: boolean;
  type: 'normal' | 'big';
}

export class Boss {
  public x: number;
  public y: number;
  public w: number;
  public h: number;
  public vx: number;
  public vy: number;
  public hp: number;
  public maxHp: number;
  public phase: BossPhase;
  public phaseTimer: number;
  public animTime: number;
  public bullets: BossBullet[];
  public targetX: number;
  public targetY: number;
  public hitTimer: number;
  public active: boolean;
  public facing: number;
  private shootTimer: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.w = 96;
    this.h = 72;
    this.vx = 0;
    this.vy = 0;
    this.hp = BOSS_HP;
    this.maxHp = BOSS_HP;
    this.phase = BossPhase.INTRO;
    this.phaseTimer = 2;
    this.animTime = 0;
    this.bullets = [];
    this.targetX = x;
    this.targetY = y;
    this.hitTimer = 0;
    this.active = true;
    this.facing = -1;
    this.shootTimer = 0;
  }

  update(dt: number, playerX: number, playerY: number): BossBullet[] {
    this.animTime += dt;
    if (this.hitTimer > 0) {
      this.hitTimer -= dt;
    }

    const newBullets: BossBullet[] = [];
    const isEnraged = this.phase === BossPhase.ENRAGED;
    const speedMultiplier = isEnraged ? 1.5 : 1;

    switch (this.phase) {
      case BossPhase.INTRO:
        this.phaseTimer -= dt;
        this.vy = BOSS_SPEED * 0.3;
        this.vx = 0;
        if (this.phaseTimer <= 0) {
          this.phase = BossPhase.IDLE;
          this.phaseTimer = 1.5;
          this.targetY = this.y;
        }
        break;

      case BossPhase.IDLE:
        this.phaseTimer -= dt;
        const hoverOffset = Math.sin(this.animTime * 3) * 10;
        this.vy = (this.targetY + hoverOffset - this.y) * 3;
        this.vx = (playerX - this.x) * 0.5;
        this.facing = playerX < this.x ? -1 : 1;
        if (this.phaseTimer <= 0) {
          if (Math.random() < 0.5) {
            this.phase = BossPhase.SHOOT;
            this.phaseTimer = isEnraged ? 1.5 : 2;
            this.shootTimer = 0;
          } else {
            this.phase = BossPhase.CHARGE;
            this.phaseTimer = isEnraged ? 0.8 : 1.2;
            this.targetX = playerX;
            this.targetY = playerY;
          }
        }
        break;

      case BossPhase.SHOOT:
        this.phaseTimer -= dt;
        this.shootTimer -= dt;
        this.vx = (playerX - this.x) * 0.3;
        this.vy = (this.targetY + Math.sin(this.animTime * 2) * 15 - this.y) * 2;
        this.facing = playerX < this.x ? -1 : 1;
        if (this.shootTimer <= 0 && this.phaseTimer > 0) {
          this.shootTimer = isEnraged ? 0.2 : 0.3;
          const bulletCount = isEnraged ? 7 : 5;
          const spreadAngle = isEnraged ? Math.PI / 3 : Math.PI / 4;
          const baseAngle = Math.atan2(playerY - this.y, playerX - this.x);
          for (let i = 0; i < bulletCount; i++) {
            const angle = baseAngle + (i - (bulletCount - 1) / 2) * (spreadAngle / (bulletCount - 1));
            const bullet: BossBullet = {
              x: this.x + this.w / 2,
              y: this.y + this.h / 2,
              vx: Math.cos(angle) * BOSS_BULLET_SPEED,
              vy: Math.sin(angle) * BOSS_BULLET_SPEED,
              w: 6,
              h: 6,
              active: true,
              type: isEnraged && i === Math.floor(bulletCount / 2) ? 'big' : 'normal',
            };
            if (bullet.type === 'big') {
              bullet.w = 12;
              bullet.h = 12;
            }
            newBullets.push(bullet);
          }
        }
        if (this.phaseTimer <= 0) {
          this.phase = BossPhase.IDLE;
          this.phaseTimer = 1.5;
        }
        break;

      case BossPhase.CHARGE:
        this.phaseTimer -= dt;
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 5) {
          this.vx = (dx / dist) * BOSS_SPEED * 2 * speedMultiplier;
          this.vy = (dy / dist) * BOSS_SPEED * 2 * speedMultiplier;
        } else {
          this.vx *= 0.9;
          this.vy *= 0.9;
        }
        this.facing = dx < 0 ? -1 : 1;
        if (this.phaseTimer <= 0) {
          this.phase = BossPhase.IDLE;
          this.phaseTimer = 1.5;
        }
        break;

      case BossPhase.ENRAGED:
        this.phaseTimer -= dt;
        this.shootTimer -= dt;
        this.vx = (playerX - this.x) * 0.6;
        this.vy = (this.targetY + Math.sin(this.animTime * 4) * 20 - this.y) * 3;
        this.facing = playerX < this.x ? -1 : 1;
        if (this.shootTimer <= 0 && this.phaseTimer > 0) {
          this.shootTimer = 0.15;
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + this.animTime;
            const bullet: BossBullet = {
              x: this.x + this.w / 2,
              y: this.y + this.h / 2,
              vx: Math.cos(angle) * BOSS_BULLET_SPEED * 0.8,
              vy: Math.sin(angle) * BOSS_BULLET_SPEED * 0.8,
              w: 6,
              h: 6,
              active: true,
              type: 'normal',
            };
            newBullets.push(bullet);
          }
        }
        if (this.phaseTimer <= 0) {
          if (Math.random() < 0.5) {
            this.phase = BossPhase.SHOOT;
            this.phaseTimer = 1.5;
            this.shootTimer = 0;
          } else {
            this.phase = BossPhase.CHARGE;
            this.phaseTimer = 0.8;
            this.targetX = playerX;
            this.targetY = playerY;
          }
        }
        break;

      case BossPhase.DEAD:
        this.vy += GRAVITY * dt;
        this.vx *= 0.98;
        this.animTime += dt * 5;
        break;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    return newBullets;
  }

  takeRainbowDamage(amount: number = 1): boolean {
    if (this.hitTimer <= 0 && this.phase !== BossPhase.DEAD) {
      this.hp -= amount;
      this.hitTimer = 0.3;
      if (this.hp <= 0) {
        this.phase = BossPhase.DEAD;
        this.active = false;
        return true;
      }
      if (this.hp < this.maxHp * 0.3 && this.phase !== BossPhase.ENRAGED) {
        this.phase = BossPhase.ENRAGED;
        this.phaseTimer = 3;
        this.shootTimer = 0;
      }
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
