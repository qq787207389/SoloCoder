import { Direction, Layer, Rect, EntityBase, TILE_SIZE, GRAVITY, MAX_FALL_SPEED } from '../../utils/Constants';
import { aabb } from '../../utils/Collision';

type BossState = 'idle' | 'windup' | 'attack' | 'recovery' | 'stagger' | 'special';

export class Boss implements EntityBase {
  x=0; y=0; width=24; height=32; vx=0; vy=0;
  layer:Layer='ground'; hp=30; maxHp=30; facing:Direction='left'; active=true;
  type:string='giant_monk'; state:BossState='idle';
  stateTimer=0; phase=1; grounded=false; invincible=0;
  animTimer=0; attackHitbox:Rect|null=null;
  clones:Boss[]=[];
  isClone=false; cloneTimer=0;
  firePositions:{x:number;y:number;timer:number}[]=[];

  spawn(x:number, y:number, type:string, cycle:number): void {
    this.type=type; this.active=true;
    this.facing='left'; this.state='idle'; this.stateTimer=0;
    this.vx=0; this.vy=0; this.invincible=0; this.attackHitbox=null;
    this.clones=[]; this.firePositions=[];
    const hpMult = 1 + cycle * 0.5;
    switch(type) {
      case 'giant_monk':
        this.width=24; this.height=36; this.hp=Math.floor(30*hpMult); break;
      case 'shadow_master':
        this.width=20; this.height=28; this.hp=Math.floor(25*hpMult); break;
      case 'fire_sorcerer':
        this.width=20; this.height=30; this.hp=Math.floor(20*hpMult); break;
    }
    this.maxHp = this.hp;
    this.x = x;
    this.y = 15 * TILE_SIZE - this.height;
  }

  update(playerX:number, playerY:number, tileMap:any, dt:number): {shouldShoot:boolean, projectiles:{x:number,y:number,vx:number,vy:number,type:string}[]} {
    const projectiles:{x:number,y:number,vx:number,vy:number,type:string}[] = [];
    let shouldShoot = false;

    if (!this.active) return {shouldShoot, projectiles};

    this.animTimer++;
    this.stateTimer++;
    if (this.invincible > 0) this.invincible--;

    const dx = playerX - this.x;
    this.facing = dx < 0 ? 'left' : 'right';
    const dist = Math.abs(dx);

    const hpPercent = this.hp / this.maxHp;
    if (hpPercent < 0.33 && this.phase < 3) {
      this.phase = 3; this.state = 'stagger'; this.stateTimer = 0;
    } else if (hpPercent < 0.66 && this.phase < 2) {
      this.phase = 2; this.state = 'stagger'; this.stateTimer = 0;
    }

    this.attackHitbox = null;

    switch(this.type) {
      case 'giant_monk': this.updateMonk(dist, playerX, playerY, projectiles); break;
      case 'shadow_master': this.updateShadowMaster(dist, playerX, playerY, projectiles); break;
      case 'fire_sorcerer': this.updateSorcerer(dist, playerX, playerY, projectiles); break;
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

    return {shouldShoot, projectiles};
  }

  private updateMonk(dist:number, px:number, py:number, projs:{x:number,y:number,vx:number,vy:number,type:string}[]): void {
    const speedMult = 1 + (this.phase - 1) * 0.3;
    switch(this.state) {
      case 'idle':
        this.vx = this.facing === 'right' ? 0.8 * speedMult : -0.8 * speedMult;
        if (dist < 60) { this.state='windup'; this.stateTimer=0; this.vx=0; }
        if (this.stateTimer > 90) { this.state='windup'; this.stateTimer=0; this.vx=0; }
        break;
      case 'windup':
        if (this.stateTimer > 30) { this.state='attack'; this.stateTimer=0; }
        break;
      case 'attack':
        this.attackHitbox = this.facing === 'right'
          ? {x:this.x+this.width, y:this.y, width:40, height:this.height}
          : {x:this.x-40, y:this.y, width:40, height:this.height};
        if (this.stateTimer > 20) { this.state='recovery'; this.stateTimer=0; this.attackHitbox=null; }
        break;
      case 'recovery':
        this.vx = 0;
        if (this.stateTimer > 40) { this.state='idle'; this.stateTimer=0; }
        break;
      case 'stagger':
        this.vx = 0;
        if (this.stateTimer > 60) { this.state='idle'; this.stateTimer=0; }
        break;
    }
  }

  private updateShadowMaster(dist:number, px:number, py:number, projs:{x:number,y:number,vx:number,vy:number,type:string}[]): void {
    switch(this.state) {
      case 'idle':
        this.vx = this.facing === 'right' ? 1.2 : -1.2;
        if (dist < 80 || this.stateTimer > 60) {
          if (this.phase >= 2 && this.clones.length === 0) {
            this.spawnClones();
          }
          this.state='windup'; this.stateTimer=0; this.vx=0;
        }
        break;
      case 'windup':
        if (this.stateTimer > 20) { this.state='attack'; this.stateTimer=0; }
        break;
      case 'attack':
        this.attackHitbox = this.facing === 'right'
          ? {x:this.x+this.width, y:this.y+4, width:30, height:this.height-8}
          : {x:this.x-30, y:this.y+4, width:30, height:this.height-8};
        if (this.phase >= 2 && this.stateTimer === 5) {
          const dir = this.facing === 'right' ? 1 : -1;
          projs.push({x:this.x+this.width/2, y:this.y+8, vx:dir*3, vy:0, type:'enemy_shuriken'});
        }
        if (this.stateTimer > 15) { this.state='recovery'; this.stateTimer=0; this.attackHitbox=null; }
        break;
      case 'recovery':
        this.vx = this.facing === 'right' ? -0.5 : 0.5;
        if (this.stateTimer > 30) { this.state='idle'; this.stateTimer=0; }
        break;
      case 'stagger':
        this.vx = 0;
        this.clones = [];
        if (this.stateTimer > 45) { this.state='idle'; this.stateTimer=0; }
        break;
    }
    for (const clone of this.clones) {
      clone.cloneTimer--;
      if (clone.cloneTimer <= 0) { this.clones = this.clones.filter(c=>c!==clone); continue; }
      clone.x = this.x + (clone.facing === 'right' ? 40 : -40);
      clone.y = this.y;
      clone.animTimer++;
    }
  }

  private spawnClones(): void {
    for (let i = 0; i < 2; i++) {
      const clone = new Boss();
      clone.isClone = true;
      clone.cloneTimer = 180;
      clone.width = this.width;
      clone.height = this.height;
      clone.facing = i === 0 ? 'right' : 'left';
      clone.hp = 1; clone.maxHp = 1;
      clone.active = true;
      clone.type = 'shadow_master';
      this.clones.push(clone);
    }
  }

  private updateSorcerer(dist:number, px:number, py:number, projs:{x:number,y:number,vx:number,vy:number,type:string}[]): void {
    switch(this.state) {
      case 'idle':
        this.vx = 0;
        if (this.stateTimer > 40) {
          this.vx = this.facing === 'right' ? 1 : -1;
          if (this.phase >= 2 && this.stateTimer > 30) {
            const dir = this.facing === 'right' ? 1 : -1;
            projs.push({x:this.x, y:this.y+this.height/2, vx:dir*2, vy:-1, type:'fireball'});
          }
          this.state='windup'; this.stateTimer=0;
        }
        break;
      case 'windup':
        if (this.stateTimer === 20) {
          projs.push({x:px, y:15*TILE_SIZE-20, vx:0, vy:-2, type:'fireball'});
          if (this.phase >= 2) {
            projs.push({x:px-30, y:15*TILE_SIZE-20, vx:0, vy:-2, type:'fireball'});
            projs.push({x:px+30, y:15*TILE_SIZE-20, vx:0, vy:-2, type:'fireball'});
          }
        }
        if (this.stateTimer > 40) { this.state='recovery'; this.stateTimer=0; }
        break;
      case 'recovery':
        this.vx = 0;
        if (this.stateTimer > 50) { this.state='idle'; this.stateTimer=0; }
        break;
      case 'stagger':
        this.vx = 0;
        if (this.stateTimer > 40) { this.state='idle'; this.stateTimer=0; }
        break;
    }
  }

  takeDamage(amount:number): void {
    if (this.invincible > 0) return;
    if (this.isClone) { this.active = false; return; }
    this.hp -= amount;
    this.invincible = 20;
    if (this.hp <= 0) {
      this.active = false;
      this.clones = [];
    }
  }

  getRect(): Rect { return {x:this.x, y:this.y, width:this.width, height:this.height}; }
}
