import { Entity } from './Entity';
import { Vector2, ItemType, WeaponType } from '../types';
import { generateId } from '../utils';

export class Item extends Entity {
  public itemType: ItemType;
  public value: number;
  public weaponType?: WeaponType;
  public bobOffset: number;

  constructor(
    type: ItemType,
    position: Vector2,
    value: number = 1,
    weaponType?: WeaponType
  ) {
    super(generateId(), position, { x: 16, y: 16 }, 999);
    this.itemType = type;
    this.value = value;
    this.weaponType = weaponType;
    this.bobOffset = Math.random() * Math.PI * 2;
    this.zIndex = 1;
  }

  public update(_deltaTime: number): void {
    if (!this.active) return;
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number): void {
    if (!this.active) return;

    const bobY = Math.sin(Date.now() / 300 + this.bobOffset) * 2;
    const screenX = this.position.x - cameraX;
    const screenY = this.position.y - cameraY + bobY;

    ctx.save();
    ctx.translate(screenX, screenY);

    switch (this.itemType) {
      case 'health':
        this.drawHealth(ctx);
        break;
      case 'ammo':
        this.drawAmmo(ctx);
        break;
      case 'weapon':
        this.drawWeapon(ctx);
        break;
    }

    ctx.restore();
  }

  private drawHealth(ctx: CanvasRenderingContext2D): void {
    const size = this.size.x;

    ctx.fillStyle = '#ff4444';
    ctx.fillRect(-size / 2, -size / 2, size, size);

    ctx.fillStyle = '#cc0000';
    ctx.fillRect(-size / 2 + 2, -size / 2 + 2, size - 4, size - 4);

    ctx.fillStyle = '#fff';
    ctx.fillRect(-2, -6, 4, 12);
    ctx.fillRect(-6, -2, 12, 4);
  }

  private drawAmmo(ctx: CanvasRenderingContext2D): void {
    const size = this.size.x;

    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(-size / 2, -size / 2, size, size);

    ctx.fillStyle = '#cc8800';
    ctx.fillRect(-size / 2 + 2, -size / 2 + 2, size - 4, size - 4);

    ctx.fillStyle = '#886600';
    ctx.fillRect(-1, -5, 2, 10);
    ctx.fillRect(-4, -3, 2, 6);
    ctx.fillRect(2, -3, 2, 6);
  }

  private drawWeapon(ctx: CanvasRenderingContext2D): void {
    const size = this.size.x;

    ctx.fillStyle = '#00aaff';
    ctx.fillRect(-size / 2, -size / 2, size, size);

    ctx.fillStyle = '#0088cc';
    ctx.fillRect(-size / 2 + 2, -size / 2 + 2, size - 4, size - 4);

    ctx.fillStyle = '#005588';
    ctx.fillRect(-5, -2, 10, 4);
    ctx.fillRect(-2, -5, 4, 3);
  }
}
