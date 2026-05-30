import Phaser from 'phaser';
import { PowerUpType } from '../types/game';

export class PowerUp extends Phaser.Physics.Arcade.Sprite {
  private powerUpType: PowerUpType;
  private bobOffset = 0;
  private baseY: number;

  constructor(scene: Phaser.Scene, x: number, y: number, type: PowerUpType) {
    super(scene, x, y, `powerup_${type}`);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.powerUpType = type;
    this.baseY = y;

    this.setSize(24, 24);
    this.setOffset(4, 4);
    this.setGravityY(200);
    this.setBounce(0.5);
    this.setCollideWorldBounds(true);

    this.setScale(0);
    this.scene.tweens.add({
      targets: this,
      scale: 1,
      duration: 300,
      ease: 'Back.out'
    });
  }

  update(time: number, delta: number) {
    this.bobOffset += delta * 0.005;
    this.setY(this.baseY + Math.sin(this.bobOffset) * 3);

    this.rotation += 0.02;
  }

  public getType(): PowerUpType {
    return this.powerUpType;
  }

  public collect() {
    this.scene.events.emit('powerUpCollected', this.powerUpType, this.x, this.y);
    this.scene.tweens.add({
      targets: this,
      scale: 1.5,
      alpha: 0,
      duration: 200,
      ease: 'Cubic.in',
      onComplete: () => {
        this.destroy();
      }
    });
  }
}
