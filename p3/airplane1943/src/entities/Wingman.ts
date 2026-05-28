import Phaser from 'phaser';
import { FormationType } from '../types/game';
import { WEAPON_CONFIGS } from '../config/gameConfig';
import { Bullet } from './Bullet';
import { Player } from './Player';

export class Wingman extends Phaser.Physics.Arcade.Sprite {
  private player: Player;
  private side: number;
  private targetOffset: Phaser.Math.Vector2 = new Phaser.Math.Vector2();
  private bulletPool: Phaser.Physics.Arcade.Group;
  private lastFireTime: number = 0;

  constructor(
    scene: Phaser.Scene,
    player: Player,
    side: number,
    bulletPool: Phaser.Physics.Arcade.Group
  ) {
    super(scene, player.x + side * 50, player.y, 'wingman');
    this.player = player;
    this.side = side;
    this.bulletPool = bulletPool;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDisplaySize(25, 30);
    this.setBodySize(15, 20);
  }

  public update(formation: FormationType, weaponLevel: number): void {
    this.updatePosition(formation);
    this.updateFiring(weaponLevel);
  }

  private updatePosition(formation: FormationType): void {
    if (formation === 'focus') {
      this.targetOffset.set(this.side * 30, 10);
    } else {
      this.targetOffset.set(this.side * 60, 20);
    }

    const targetX = this.player.x + this.targetOffset.x;
    const targetY = this.player.y + this.targetOffset.y;

    this.x = Phaser.Math.Linear(this.x, targetX, 0.1);
    this.y = Phaser.Math.Linear(this.y, targetY, 0.1);
  }

  private updateFiring(weaponLevel: number): void {
    const currentTime = this.scene.time.now;
    const weaponConfig = WEAPON_CONFIGS[this.player.currentWeapon];
    const fireRate = weaponConfig.fireRate * 1.5;

    if (currentTime - this.lastFireTime > fireRate) {
      this.fire(weaponLevel);
      this.lastFireTime = currentTime;
    }
  }

  private fire(weaponLevel: number): void {
    const weaponConfig = WEAPON_CONFIGS[this.player.currentWeapon];
    const bullet = this.bulletPool.get() as Bullet;

    if (!bullet) return;

    bullet.fire(
      this.x,
      this.y - 10,
      0,
      -weaponConfig.speed,
      weaponConfig.damage * 0.5 * (1 + (weaponLevel - 1) * 0.2),
      true,
      this.player.currentWeapon
    );
  }
}
