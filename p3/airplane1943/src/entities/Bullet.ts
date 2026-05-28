import Phaser from 'phaser';
import { WeaponType } from '../types/game';
import { COLORS } from '../config/gameConfig';

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  public damage: number = 0;
  public isPlayerBullet: boolean = true;
  public weaponType: WeaponType | 'enemy' = 'machinegun';

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'bullet');
  }

  public fire(
    x: number,
    y: number,
    vx: number,
    vy: number,
    damage: number,
    isPlayerBullet: boolean,
    weaponType: WeaponType | 'enemy'
  ): void {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.enableBody(true, x, y, true, true);
    this.setVelocity(vx, vy);
    this.damage = damage;
    this.isPlayerBullet = isPlayerBullet;
    this.weaponType = weaponType;
    this.updateBulletAppearance();
  }

  private updateBulletAppearance(): void {
    if (this.isPlayerBullet) {
      switch (this.weaponType) {
        case 'machinegun':
          this.setTint(COLORS.bullet_orange);
          this.setDisplaySize(4, 12);
          break;
        case 'torpedo':
          this.setTint(0x2F4F4F);
          this.setDisplaySize(8, 20);
          break;
        case 'rocket':
          this.setTint(0x8B0000);
          this.setDisplaySize(6, 16);
          break;
      }
    } else {
      this.setTint(0xFFFF00);
      this.setDisplaySize(6, 6);
    }
  }

  protected preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    if (
      this.y < -50 ||
      this.y > this.scene.scale.height + 50 ||
      this.x < -50 ||
      this.x > this.scene.scale.width + 50
    ) {
      this.setActive(false);
      this.setVisible(false);
      this.disableBody(true, true);
    }
  }
}
