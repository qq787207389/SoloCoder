import Phaser from 'phaser';
import { FIREBALL_SPEED_MIN, FIREBALL_SPEED_MAX, GAME_WIDTH } from '../config/gameConfig';

export class Fireball extends Phaser.Physics.Arcade.Sprite {
  private speed: number;
  private direction: number;

  constructor(scene: Phaser.Scene, x: number, y: number, direction: number) {
    super(scene, x, y, 'fireball');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.direction = direction;
    this.speed = FIREBALL_SPEED_MIN + Math.random() * (FIREBALL_SPEED_MAX - FIREBALL_SPEED_MIN);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(true);
    body.setBounce(1, 0);
    body.setVelocityX(this.direction * this.speed);
    this.setSize(10, 10);
    this.setDepth(6);

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.2,
      scaleY: 0.8,
      duration: 150,
      yoyo: true,
      repeat: -1,
    });
  }

  update(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body.blocked.left || body.touching.left) {
      body.setVelocityX(this.speed);
      this.direction = 1;
    }
    if (body.blocked.right || body.touching.right) {
      body.setVelocityX(-this.speed);
      this.direction = -1;
    }

    if (this.y > 620 || this.x < -20 || this.x > GAME_WIDTH + 20) {
      this.destroy();
    }
  }
}
