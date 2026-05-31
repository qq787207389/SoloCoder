import {
  Rect,
  Direction,
  Layer,
  ShurikenType,
  EntityBase,
  TILE_SIZE,
  GRAVITY,
  MAX_FALL_SPEED,
  FLOAT_GRAVITY,
  PLAYER_SPEED,
  PLAYER_JUMP_FORCE,
  PLAYER_MAX_HP,
  SWORD_RANGE,
  SWORD_DURATION,
  SWORD_COOLDOWN,
  SHURIKEN_INITIAL_COUNT,
  SHURIKEN_MAX,
} from '../../utils/Constants';

export interface ShurikenSpawnInfo {
  x: number;
  y: number;
  direction: Direction;
  shurikenType: ShurikenType;
}

interface TileMapLike {
  resolveCollision(entity: {
    x: number;
    y: number;
    width: number;
    height: number;
    vx: number;
    vy: number;
    layer: string;
  }): { grounded: boolean; hitDamage: boolean };
  upperPlatforms: { x: number; y: number; width: number; layer: string }[];
  width: number;
}

interface InputLike {
  isPressed(key: string): boolean;
  isHeld(key: string): boolean;
  isReleased(key: string): boolean;
}

export class Player implements EntityBase {
  x = 0;
  y = 0;
  width = 12;
  height = 16;
  vx = 0;
  vy = 0;
  layer: Layer = 'ground';
  hp = PLAYER_MAX_HP;
  maxHp = PLAYER_MAX_HP;
  facing: Direction = 'right';
  active = true;

  grounded = false;
  jumping = false;
  floating = false;
  swordTimer = 0;
  swordCooldown = 0;
  attacking = false;
  throwCooldown = 0;

  shurikenCount = SHURIKEN_INITIAL_COUNT;
  shurikenType: ShurikenType = 'normal';
  shurikenTypes: ShurikenType[] = ['normal'];

  speedBoost = 0;
  attackBoost = 0;
  invincible = 0;

  animFrame = 0;
  animTimer = 0;

  afterimages: { x: number; y: number; facing: Direction; alpha: number }[] = [];

  update(input: InputLike, tileMap: TileMapLike, dt: number): ShurikenSpawnInfo | null {
    let shurikenSpawn: ShurikenSpawnInfo | null = null;

    const speedMult = this.speedBoost > 0 ? 1.5 : 1;

    if (input.isHeld('ArrowLeft') || input.isHeld('KeyA')) {
      this.vx = -PLAYER_SPEED * speedMult;
      this.facing = 'left';
    } else if (input.isHeld('ArrowRight') || input.isHeld('KeyD')) {
      this.vx = PLAYER_SPEED * speedMult;
      this.facing = 'right';
    } else {
      this.vx *= 0.7;
    }

    if (input.isPressed('KeyZ') && this.grounded) {
      this.vy = PLAYER_JUMP_FORCE;
      this.jumping = true;
    }

    this.floating = false;
    if (input.isHeld('KeyZ') && this.vy > 0 && !this.grounded) {
      this.floating = true;
    }
    if (input.isReleased('KeyZ')) {
      this.floating = false;
      if (this.vy < 0) {
        this.vy *= 0.5;
      }
    }

    if (this.floating) {
      this.vy += FLOAT_GRAVITY;
    } else {
      this.vy += GRAVITY;
    }
    if (this.vy > MAX_FALL_SPEED) {
      this.vy = MAX_FALL_SPEED;
    }

    if (input.isPressed('KeyX') && this.swordCooldown <= 0) {
      this.swordTimer = SWORD_DURATION;
      this.swordCooldown = SWORD_COOLDOWN;
      this.attacking = true;
    }
    if (this.swordTimer > 0) {
      this.swordTimer--;
    }
    if (this.swordTimer <= 0) {
      this.attacking = false;
    }
    if (this.swordCooldown > 0) {
      this.swordCooldown--;
    }

    if (input.isPressed('KeyC') && this.throwCooldown <= 0 && this.shurikenCount > 0) {
      this.throwCooldown = 15;
      this.shurikenCount--;
      shurikenSpawn = {
        x: this.facing === 'right' ? this.x + this.width : this.x,
        y: this.y + this.height / 2,
        direction: this.facing,
        shurikenType: this.shurikenType,
      };
    }
    if (this.throwCooldown > 0) {
      this.throwCooldown--;
    }

    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0) {
      this.x = 0;
      this.vx = 0;
    }

    const mapWidth = tileMap.width * TILE_SIZE;
    if (this.x + this.width > mapWidth) {
      this.x = mapWidth - this.width;
      this.vx = 0;
    }

    const collision = tileMap.resolveCollision(this);
    this.grounded = collision.grounded;
    if (collision.hitDamage) {
      this.takeDamage(1);
    }

    if (this.grounded) {
      this.jumping = false;
      this.floating = false;
    }

    const groundThreshold = 10 * TILE_SIZE;
    if (this.y < groundThreshold) {
      this.layer = 'upper';
    } else {
      this.layer = 'ground';
    }

    if (this.grounded) {
      for (const plat of tileMap.upperPlatforms) {
        if (
          this.x + this.width > plat.x &&
          this.x < plat.x + plat.width &&
          this.y + this.height >= plat.y &&
          this.y + this.height <= plat.y + 8
        ) {
          this.layer = 'upper';
          break;
        }
      }
    }

    if (Math.abs(this.vx) > 1 && this.animTimer % 3 === 0) {
      this.afterimages.push({ x: this.x, y: this.y, facing: this.facing, alpha: 0.5 });
      if (this.afterimages.length > 5) {
        this.afterimages.shift();
      }
    }

    for (let i = this.afterimages.length - 1; i >= 0; i--) {
      this.afterimages[i].alpha -= 0.08;
      if (this.afterimages[i].alpha <= 0) {
        this.afterimages.splice(i, 1);
      }
    }

    if (this.speedBoost > 0) this.speedBoost--;
    if (this.attackBoost > 0) this.attackBoost--;
    if (this.invincible > 0) this.invincible--;

    this.animTimer++;
    if (this.attacking) {
      this.animFrame = 0;
    } else if (!this.grounded && this.floating) {
      this.animFrame = 3;
    } else if (!this.grounded) {
      this.animFrame = 2;
    } else if (Math.abs(this.vx) > 0.5) {
      this.animFrame = Math.floor(this.animTimer / 8) % 4;
    } else {
      this.animFrame = 0;
    }

    return shurikenSpawn;
  }

  getSwordHitbox(): Rect {
    if (!this.attacking || this.swordTimer <= 0) {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    if (this.facing === 'right') {
      return { x: this.x + this.width, y: this.y + 2, width: SWORD_RANGE, height: this.height - 4 };
    }
    return { x: this.x - SWORD_RANGE, y: this.y + 2, width: SWORD_RANGE, height: this.height - 4 };
  }

  takeDamage(amount: number): void {
    if (this.invincible <= 0) {
      this.hp -= amount;
      this.invincible = 60;
    }
  }

  addShuriken(n: number): void {
    this.shurikenCount = Math.min(this.shurikenCount + n, SHURIKEN_MAX);
  }

  addShurikenType(type: ShurikenType): void {
    if (!this.shurikenTypes.includes(type)) {
      this.shurikenTypes.push(type);
    }
    this.shurikenType = type;
  }

  applyEffect(type: string): void {
    if (type === 'speed') {
      this.speedBoost = 600;
    } else if (type === 'attack') {
      this.attackBoost = 900;
    } else if (type === 'heal') {
      this.hp = Math.min(this.hp + 1, this.maxHp);
    }
  }

  getAttackPower(): number {
    return 1 + (this.attackBoost > 0 ? 1 : 0);
  }

  getRect(): Rect {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  getAnimState(): string {
    if (this.attacking) return 'sword';
    if (!this.grounded && this.floating) return 'float';
    if (!this.grounded) return 'jump';
    if (Math.abs(this.vx) > 0.5) return 'run';
    return 'stand';
  }
}
