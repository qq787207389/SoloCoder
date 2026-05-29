import Phaser from 'phaser';

export class Elevator extends Phaser.GameObjects.Container {
  public sprite: Phaser.GameObjects.Sprite;
  public declare body: Phaser.Physics.Arcade.Body;
  public speed: number;
  public direction: number = -1;
  private topY: number;
  private bottomY: number;

  constructor(scene: Phaser.Scene, x: number, y: number, topY: number, bottomY: number, speed: number) {
    super(scene, x, y);
    this.topY = topY;
    this.bottomY = bottomY;
    this.speed = speed;
    this.sprite = scene.add.sprite(0, 0, 'elevator');
    this.sprite.setOrigin(0.5, 1);
    this.add(this.sprite);
    scene.add.existing(this);

    scene.physics.add.existing(this);
    this.body.setSize(22, 6);
    this.body.setOffset(-11, -6);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.body.setVelocityY(-speed);
  }

  update(delta: number) {
    if (this.y <= this.topY) {
      this.direction = 1;
    } else if (this.y >= this.bottomY) {
      this.direction = -1;
    }
    this.body.setVelocityY(this.direction * this.speed);
  }
}
