import { GameObject } from '../core/GameObject';
import { Vector2 } from '../math/Vector2';
import { Direction, BulletType, COLORS } from '../constants';
import { TileMap } from '../map/TileMap';
import { Tank } from '../tank/Tank';
import { PlayerTank } from '../tank/PlayerTank';
import gameConfig from '../config/gameConfig.json';

const TILE_SIZE = gameConfig.game.tileSize;

export class Bullet extends GameObject {
  public direction: Direction;
  public speed: number;
  public damage: number;
  public bulletType: BulletType;
  public owner: Tank;
  private angle: number = 0;
  private trackingTarget: PlayerTank | null = null;

  constructor(x: number, y: number, direction: Direction, owner: Tank, type: BulletType = BulletType.NORMAL) {
    super(x, y, 8, 8);
    this.direction = direction;
    this.speed = gameConfig.tank.bulletSpeed;
    this.damage = 1;
    this.bulletType = type;
    this.owner = owner;
  }

  setTrackingTarget(target: PlayerTank): void {
    this.trackingTarget = target;
  }

  update(deltaTime: number, map: TileMap): boolean {
    let moveVec: Vector2;

    if (this.bulletType === BulletType.TRACKING && this.trackingTarget && this.trackingTarget.active) {
      const toTarget = Vector2.sub(this.trackingTarget.getCenter(), this.getCenter());
      toTarget.normalize();
      moveVec = toTarget.mul(this.speed * deltaTime / 16);
    } else if (this.bulletType === BulletType.SPIN) {
      this.angle += 0.3;
      const dirVec = new Vector2(Math.cos(this.angle), Math.sin(this.angle));
      dirVec.normalize();
      moveVec = dirVec.mul(this.speed * deltaTime / 16);
    } else {
      moveVec = this.getDirectionVector().mul(this.speed * deltaTime / 16);
    }

    this.position.add(moveVec);
    this.updateBounds();

    const tileX = Math.floor(this.bounds.centerX / TILE_SIZE);
    const tileY = Math.floor(this.bounds.centerY / TILE_SIZE);
    
    if (map.isSolid(tileX, tileY)) {
      if (map.isDestructible(tileX, tileY)) {
        map.destroyTile(tileX, tileY);
      }
      return true;
    }

    const worldBounds = map.getWorldBounds();
    if (!worldBounds.contains(this.bounds.centerX, this.bounds.centerY)) {
      return true;
    }

    return false;
  }

  private getDirectionVector(): Vector2 {
    switch (this.direction) {
      case Direction.UP: return new Vector2(0, -1);
      case Direction.DOWN: return new Vector2(0, 1);
      case Direction.LEFT: return new Vector2(-1, 0);
      case Direction.RIGHT: return new Vector2(1, 0);
      case Direction.UP_RIGHT: return new Vector2(0.707, -0.707);
      case Direction.DOWN_RIGHT: return new Vector2(0.707, 0.707);
      case Direction.DOWN_LEFT: return new Vector2(-0.707, 0.707);
      case Direction.UP_LEFT: return new Vector2(-0.707, -0.707);
      default: return new Vector2(0, -1);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    let color = COLORS.WHITE;
    if (this.bulletType === BulletType.SPREAD) color = '#ffff00';
    if (this.bulletType === BulletType.SPIN) color = '#00ffff';
    if (this.bulletType === BulletType.TRACKING) color = '#ff00ff';

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(this.bounds.centerX, this.bounds.centerY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(this.bounds.centerX, this.bounds.centerY, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  isFromPlayer(): boolean {
    return this.owner instanceof PlayerTank;
  }
}
