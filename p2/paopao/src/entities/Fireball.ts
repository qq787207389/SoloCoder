import Phaser from 'phaser';

export class Fireball extends Phaser.Physics.Arcade.Sprite {
  private lifeTime = 0;
  private maxLifeTime = 5000;
  private isBossFireball: boolean;

  constructor(scene: Phaser.Scene, x: number, y: number, direction: number, angleOffset: number = 0, isBoss: boolean = false) {
    super(scene, x, y, 'fireball_0');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.isBossFireball = isBoss;
    const speed = isBoss ? 200 : 150;
    const vx = direction * speed;
    const vy = angleOffset * speed;

    this.setVelocity(vx, vy);
    this.setBounce(1);
    this.setCollideWorldBounds(true);
    this.setSize(16, 16);
    this.setOffset(4, 4);
    this.setGravity(0);

    if (isBoss) {
      this.setScale(1.5);
    }

    this.play('fireball_fly');
  }

  update(time: number, delta: number) {
    this.lifeTime += delta;

    this.rotation += 0.1;

    if (this.body!.blocked.left || this.body!.blocked.right ||
        this.body!.blocked.up || this.body!.blocked.down) {
      this.scene.events.emit('fireballHitWall', this.x, this.y);
      this.destroy();
      return;
    }

    if (this.lifeTime > this.maxLifeTime) {
      this.destroy();
    }
  }

  public isBossBall(): boolean {
    return this.isBossFireball;
  }
}
