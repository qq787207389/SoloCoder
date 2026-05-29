import Phaser from 'phaser';

export class Minecart extends Phaser.GameObjects.Container {
  public sprite: Phaser.GameObjects.Sprite;
  public declare body: Phaser.Physics.Arcade.Body;
  public speed: number;
  public direction: number = 1;
  private startX: number;
  private endX: number;

  constructor(scene: Phaser.Scene, x: number, y: number, startX: number, endX: number, speed: number) {
    super(scene, x, y);
    this.startX = startX;
    this.endX = endX;
    this.speed = speed;
    this.sprite = scene.add.sprite(0, 0, 'minecart');
    this.sprite.setOrigin(0.5, 1);
    this.add(this.sprite);
    scene.add.existing(this);

    scene.physics.add.existing(this);
    this.body.setSize(22, 10);
    this.body.setOffset(-11, -14);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.body.setVelocityX(speed);
  }

  update(delta: number) {
    if (this.x >= this.endX) {
      this.direction = -1;
      this.body.setVelocityX(-this.speed);
    } else if (this.x <= this.startX) {
      this.direction = 1;
      this.body.setVelocityX(this.speed);
    }
  }
}
