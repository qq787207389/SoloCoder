import Phaser from 'phaser';

export class HammerItem extends Phaser.GameObjects.Container {
  public sprite: Phaser.GameObjects.Sprite;
  public declare body: Phaser.Physics.Arcade.Body;
  public isCollected: boolean = false;
  private floatOffset: number = 0;
  private baseY: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.baseY = y;
    this.sprite = scene.add.sprite(0, 0, 'hammer_item');
    this.sprite.setOrigin(0.5, 0.5);
    this.add(this.sprite);
    scene.add.existing(this);

    scene.physics.add.existing(this, true);
    this.body.setSize(14, 14);
    this.body.setOffset(-7, -7);
  }

  update(delta: number) {
    if (this.isCollected) return;
    this.floatOffset += delta * 0.003;
    this.sprite.y = Math.sin(this.floatOffset) * 3;
  }

  collect() {
    this.isCollected = true;
    this.body.enable = false;
    this.setVisible(false);
  }

  reset() {
    this.isCollected = false;
    this.body.enable = true;
    this.setVisible(true);
    this.y = this.baseY;
    this.floatOffset = 0;
  }
}
