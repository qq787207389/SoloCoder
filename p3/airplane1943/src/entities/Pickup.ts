import Phaser from 'phaser';
import { PickupType } from '../types/game';
import { COLORS } from '../config/gameConfig';

export class Pickup extends Phaser.Physics.Arcade.Sprite {
  public pickupType: PickupType = 'fuel';
  public value: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'pickup');

    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  public spawn(x: number, y: number, type: PickupType, value: number): void {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.setVelocityY(50);
    this.pickupType = type;
    this.value = value;
    this.updateAppearance();
  }

  private updateAppearance(): void {
    switch (this.pickupType) {
      case 'fuel':
        this.setTint(0x8B4513);
        this.setDisplaySize(20, 25);
        break;
      case 'energy_red':
        this.setTint(COLORS.energy_red);
        this.setDisplaySize(15, 15);
        break;
      case 'energy_blue':
        this.setTint(COLORS.energy_blue);
        this.setDisplaySize(15, 15);
        break;
      case 'energy_green':
        this.setTint(COLORS.energy_green);
        this.setDisplaySize(15, 15);
        break;
    }
  }

  public collect(): void {
    this.setActive(false);
    this.setVisible(false);
    this.disableBody(true, true);
  }

  protected preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    if (this.y > this.scene.scale.height + 50) {
      this.setActive(false);
      this.setVisible(false);
      this.disableBody(true, true);
    }
  }
}
