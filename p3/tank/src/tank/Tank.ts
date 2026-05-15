import { GameObject } from '../core/GameObject';
import { Vector2 } from '../math/Vector2';
import { Direction, COLORS, TankType } from '../constants';
import { TileMap } from '../map/TileMap';
import gameConfig from '../config/gameConfig.json';

const TILE_SIZE = gameConfig.game.tileSize;

export abstract class Tank extends GameObject {
  public direction: Direction;
  public speed: number;
  public fireCooldown: number;
  public lastFireTime: number;
  public health: number;
  public maxHealth: number;
  public level: number;
  public tankType: TankType;
  public isInvincible: boolean = false;
  public invincibleTimer: number = 0;
  protected color: string;

  constructor(x: number, y: number, tankType: TankType, speed: number) {
    super(x, y, TILE_SIZE - 4, TILE_SIZE - 4);
    this.direction = Direction.UP;
    this.speed = speed;
    this.fireCooldown = gameConfig.tank.fireCooldown;
    this.lastFireTime = 0;
    this.health = 1;
    this.maxHealth = 1;
    this.level = 1;
    this.tankType = tankType;
    this.color = this.getColor();
  }

  private getColor(): string {
    switch (this.tankType) {
      case TankType.PLAYER1: return COLORS.PLAYER1;
      case TankType.PLAYER2: return COLORS.PLAYER2;
      case TankType.BOSS: return COLORS.BOSS;
      default: return COLORS.ENEMY;
    }
  }

  move(direction: Direction, deltaTime: number, map: TileMap): void {
    this.direction = direction;
    const moveVec = this.getDirectionVector().mul(this.speed * deltaTime / 16);
    const newPos = Vector2.add(this.position, moveVec);
    
    if (!this.checkCollision(newPos, map)) {
      this.position.copy(newPos);
      this.updateBounds();
    }
  }

  protected getDirectionVector(): Vector2 {
    switch (this.direction) {
      case Direction.UP: return new Vector2(0, -1);
      case Direction.DOWN: return new Vector2(0, 1);
      case Direction.LEFT: return new Vector2(-1, 0);
      case Direction.RIGHT: return new Vector2(1, 0);
      default: return new Vector2(0, -1);
    }
  }

  protected checkCollision(newPos: Vector2, map: TileMap): boolean {
    const testBounds = this.bounds.clone();
    testBounds.x = newPos.x;
    testBounds.y = newPos.y;

    const startTileX = Math.floor(testBounds.left / TILE_SIZE);
    const endTileX = Math.ceil(testBounds.right / TILE_SIZE);
    const startTileY = Math.floor(testBounds.top / TILE_SIZE);
    const endTileY = Math.ceil(testBounds.bottom / TILE_SIZE);

    for (let y = startTileY; y <= endTileY; y++) {
      for (let x = startTileX; x <= endTileX; x++) {
        if (map.isSolid(x, y)) {
          const tileBounds = map.getTileBounds(x, y);
          if (testBounds.intersects(tileBounds)) {
            return true;
          }
        }
      }
    }

    const worldBounds = map.getWorldBounds();
    return !worldBounds.contains(testBounds.left, testBounds.top) ||
           !worldBounds.contains(testBounds.right, testBounds.bottom);
  }

  canFire(currentTime: number): boolean {
    return currentTime - this.lastFireTime >= this.fireCooldown;
  }

  fire(currentTime: number): void {
    this.lastFireTime = currentTime;
  }

  takeDamage(amount: number = 1): boolean {
    if (this.isInvincible) return false;
    this.health -= amount;
    if (this.health <= 0) {
      this.destroy();
      return true;
    }
    return false;
  }

  setInvincible(duration: number): void {
    this.isInvincible = true;
    this.invincibleTimer = duration;
  }

  levelUp(): void {
    this.level = Math.min(this.level + 1, 3);
    this.speed += 0.3;
    this.fireCooldown = Math.max(this.fireCooldown - 50, 200);
  }

  update(deltaTime: number): void {
    if (this.isInvincible) {
      this.invincibleTimer -= deltaTime;
      if (this.invincibleTimer <= 0) {
        this.isInvincible = false;
      }
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    const x = this.position.x;
    const y = this.position.y;
    const size = this.bounds.width;

    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate((this.direction * Math.PI) / 2);
    ctx.translate(-size / 2, -size / 2);

    if (this.isInvincible && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    ctx.fillStyle = this.color;
    ctx.fillRect(2, 4, size - 4, size - 8);

    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, size, 6);
    ctx.fillRect(0, size - 6, size, 6);

    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#666';
    ctx.fillRect(size / 2 - 3, 0, 6, size / 2 + 4);

    if (this.tankType === TankType.BOSS) {
      ctx.strokeStyle = '#ff00ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, size, size);
    }

    ctx.restore();

    if (this.maxHealth > 1) {
      const barWidth = size;
      const barHeight = 4;
      const healthPercent = this.health / this.maxHealth;
      ctx.fillStyle = '#333';
      ctx.fillRect(x, y - 8, barWidth, barHeight);
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(x, y - 8, barWidth * healthPercent, barHeight);
    }
  }
}
