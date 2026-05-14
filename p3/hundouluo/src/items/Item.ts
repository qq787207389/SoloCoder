import { Entity } from '../engine/Entity';
import { Game } from '../engine/Game';
import { Player } from '../entities/Player';
import { WeaponType } from '../weapons/Weapon';

export enum ItemType {
  WEAPON_RIFLE = 'rifle',
  WEAPON_SHOTGUN = 'shotgun',
  WEAPON_MACHINEGUN = 'machinegun',
  WEAPON_LASER = 'laser',
  BOMB = 'bomb',
  SHIELD = 'shield',
  HEALTH = 'health',
  SCORE = 'score'
}

export class Item extends Entity {
  private itemType: ItemType;
  private floatOffset: number;
  private floatSpeed: number;

  constructor(game: Game, x: number, y: number, type: ItemType) {
    super(game, x, y, 24, 24);
    this.itemType = type;
    this.floatOffset = 0;
    this.floatSpeed = 2;
  }

  public update(deltaTime: number): void {
    this.floatOffset += deltaTime * this.floatSpeed;
    this.y += Math.sin(this.floatOffset) * 10 * deltaTime;
    
    if (this.x < this.game.camera.x - 50) {
      this.active = false;
    }
  }

  public collect(player: Player): void {
    switch (this.itemType) {
      case ItemType.WEAPON_RIFLE:
        player.weapon.setType(WeaponType.RIFLE);
        player.weapon.upgrade();
        break;
      case ItemType.WEAPON_SHOTGUN:
        player.weapon.setType(WeaponType.SHOTGUN);
        player.weapon.upgrade();
        break;
      case ItemType.WEAPON_MACHINEGUN:
        player.weapon.setType(WeaponType.MACHINEGUN);
        player.weapon.upgrade();
        break;
      case ItemType.WEAPON_LASER:
        player.weapon.setType(WeaponType.LASER);
        player.weapon.upgrade();
        break;
      case ItemType.BOMB:
        this.game.bombs = Math.min(this.game.bombs + 1, 9);
        break;
      case ItemType.SHIELD:
        player.setInvincible(5);
        break;
      case ItemType.HEALTH:
        player.health = Math.min(player.health + 1, player.maxHealth);
        break;
      case ItemType.SCORE:
        this.game.score += 500;
        break;
    }
    this.active = false;
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number): void {
    const screenX = this.x - cameraX;
    const colors: Record<ItemType, string> = {
      [ItemType.WEAPON_RIFLE]: '#ffd700',
      [ItemType.WEAPON_SHOTGUN]: '#00ffff',
      [ItemType.WEAPON_MACHINEGUN]: '#ff00ff',
      [ItemType.WEAPON_LASER]: '#ff4444',
      [ItemType.BOMB]: '#ff6600',
      [ItemType.SHIELD]: '#4488ff',
      [ItemType.HEALTH]: '#44ff44',
      [ItemType.SCORE]: '#ffff00'
    };
    
    ctx.fillStyle = colors[this.itemType];
    ctx.shadowColor = colors[this.itemType];
    ctx.shadowBlur = 10;
    
    ctx.beginPath();
    ctx.arc(screenX + 12, this.y + 12, 12, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const icons: Record<ItemType, string> = {
      [ItemType.WEAPON_RIFLE]: 'R',
      [ItemType.WEAPON_SHOTGUN]: 'S',
      [ItemType.WEAPON_MACHINEGUN]: 'M',
      [ItemType.WEAPON_LASER]: 'L',
      [ItemType.BOMB]: 'B',
      [ItemType.SHIELD]: '◇',
      [ItemType.HEALTH]: '+',
      [ItemType.SCORE]: '$'
    };
    
    ctx.fillText(icons[this.itemType], screenX + 12, this.y + 12);
  }
}