import { Direction, Layer, Rect, EntityBase, TILE_SIZE, GRAVITY, MAX_FALL_SPEED } from '../../utils/Constants';
import { aabb } from '../../utils/Collision';

export class Enemy implements EntityBase {
  x=0; y=0; width=14; height=18; vx=0; vy=0;
  layer:Layer='ground'; hp=3; maxHp=3; facing:Direction='left'; active=true;
  type:string='samurai'; grounded=false; attackCooldown=0;
  invincible=0; animTimer=0; blocking=false; alert=false;
  alertRange=150; attackRange=30; attackCooldownMax=60;
  speed=1; damage=1; dropsShuriken=true;

  spawn(x:number, y:number, type:string, layer:Layer, cycle:number): void {
    this.x=x; this.y=y; this.type=type; this.layer=layer; this.active=true;
    this.facing='left'; this.hp=3+cycle; this.maxHp=this.hp;
    this.vx=0; this.vy=0; this.alert=false; this.attackCooldown=0;
    switch(type) {
      case 'samurai':
        this.width=14; this.height=18; this.speed=1.2; this.attackRange=28;
        this.alertRange=150; this.attackCooldownMax=45; this.blocking=true; this.damage=1; break;
      case 'ninja':
        this.width=12; this.height=16; this.speed=1.5; this.attackRange=0;
        this.alertRange=180; this.attackCooldownMax=70; this.blocking=false; this.damage=1;
        this.dropsShuriken=true; break;
      case 'shuriken_thrower':
        this.width=12; this.height=16; this.speed=0; this.attackRange=0;
        this.alertRange=200; this.attackCooldownMax=80; this.blocking=false; this.damage=1;
        this.dropsShuriken=false; break;
    }
  }

  update(playerX:number, playerY:number, tileMap:any, dt:number): {shouldShoot:boolean, shootVx:number, shootVy:number} {
    let shouldShoot = false;
    let shootVx = 0;
    let shootVy = 0;

    if (!this.active) return {shouldShoot, shootVx, shootVy};

    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx*dx + dy*dy);

    this.facing = dx < 0 ? 'left' : 'right';
    if (this.invincible > 0) this.invincible--;
    if (this.attackCooldown > 0) this.attackCooldown--;
    this.animTimer++;

    if (dist < this.alertRange) this.alert = true;
    if (dist > this.alertRange * 2) this.alert = false;

    if (this.type === 'samurai' && this.alert) {
      if (dist > this.attackRange) {
        this.vx = this.facing === 'right' ? this.speed : -this.speed;
      } else {
        this.vx = 0;
        if (this.attackCooldown <= 0) this.attackCooldown = this.attackCooldownMax;
      }
    } else if (this.type === 'ninja' && this.alert) {
      const idealDist = 80;
      if (dist < idealDist - 20) {
        this.vx = this.facing === 'right' ? -this.speed : this.speed;
      } else if (dist > idealDist + 20) {
        this.vx = this.facing === 'right' ? this.speed * 0.7 : -this.speed * 0.7;
      } else {
        this.vx = 0;
      }
      if (this.attackCooldown <= 0 && dist < this.alertRange) {
        shouldShoot = true;
        const angle = Math.atan2(dy, dx);
        shootVx = Math.cos(angle) * 3;
        shootVy = Math.sin(angle) * 3;
        this.attackCooldown = this.attackCooldownMax;
      }
    } else if (this.type === 'shuriken_thrower') {
      if (this.alert && this.attackCooldown <= 0) {
        shouldShoot = true;
        const angle = Math.atan2(dy, dx);
        shootVx = Math.cos(angle) * 3;
        shootVy = Math.sin(angle) * 3;
        this.attackCooldown = this.attackCooldownMax;
      }
    } else if (!this.alert) {
      this.vx *= 0.8;
    }

    this.vy += GRAVITY;
    if (this.vy > MAX_FALL_SPEED) this.vy = MAX_FALL_SPEED;

    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0) {
      this.x = 0;
      this.vx = 0;
    }

    const result = tileMap.resolveCollision(this);
    this.grounded = result.grounded;

    return {shouldShoot, shootVx, shootVy};
  }

  takeDamage(amount:number, fromDirection:Direction): boolean {
    if (this.invincible > 0) return false;
    const midCooldown = this.attackCooldown > 10 && this.attackCooldown < this.attackCooldownMax - 15;
    const canBlock = this.blocking && midCooldown && Math.abs(this.vx) < 0.5;
    if (canBlock && this.facing !== fromDirection) {
      return false;
    }
    this.hp -= amount;
    this.invincible = 30;
    if (this.hp <= 0) {
      this.active = false;
    }
    return true;
  }

  getAttackHitbox(): Rect | null {
    if (this.type !== 'samurai' || this.attackCooldown > this.attackCooldownMax - 15) return null;
    const w = 20;
    if (this.facing === 'right') return {x:this.x+this.width, y:this.y+4, width:w, height:this.height-8};
    return {x:this.x-w, y:this.y+4, width:w, height:this.height-8};
  }

  getRect(): Rect { return {x:this.x, y:this.y, width:this.width, height:this.height}; }
}
