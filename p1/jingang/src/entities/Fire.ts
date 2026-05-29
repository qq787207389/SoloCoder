import Phaser from 'phaser';

export class Fire extends Phaser.GameObjects.Container {
  public sprite: Phaser.GameObjects.Sprite;
  public declare body: Phaser.Physics.Arcade.Body;
  public isAlive: boolean = true;
  private speed: number;
  private direction: number = 1;
  private animFrame: number = 0;
  private animTimer: number = 0;
  private minX: number;
  private maxX: number;

  constructor(scene: Phaser.Scene, x: number, y: number, speed: number, minX: number, maxX: number) {
    super(scene, x, y);
    this.speed = speed;
    this.minX = minX;
    this.maxX = maxX;
    this.direction = 1;
    this.sprite = scene.add.sprite(0, 0, 'fire_0');
    this.sprite.setOrigin(0.5, 1);
    this.add(this.sprite);
    scene.add.existing(this);

    scene.physics.add.existing(this);
    this.body.setSize(14, 12);
    this.body.setOffset(-7, -12);
    this.body.setAllowGravity(false);
    this.body.setVelocityX(speed);
  }

  update(delta: number) {
    if (!this.isAlive) return;
    this.animateFire(delta);

    if (this.x >= this.maxX) {
      this.direction = -1;
      this.body.setVelocityX(-this.speed);
    } else if (this.x <= this.minX) {
      this.direction = 1;
      this.body.setVelocityX(this.speed);
    }
  }

  private animateFire(delta: number) {
    this.animTimer += delta;
    if (this.animTimer > 100) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 4;
      this.sprite.setTexture(`fire_${this.animFrame}`);
    }
  }

  kill() {
    this.isAlive = false;
    this.body.enable = false;
    this.setVisible(false);
  }
}
