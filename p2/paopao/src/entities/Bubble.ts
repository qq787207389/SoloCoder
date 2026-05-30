import Phaser from 'phaser';
import { BubbleState } from '../types/game';

export class Bubble extends Phaser.Physics.Arcade.Sprite {
  private bubbleState: BubbleState;
  private hasShockwave: boolean;
  private wobbleOffset = 0;
  private originalVy: number;
  private justFiredTimer = 300;

  constructor(scene: Phaser.Scene, x: number, y: number, vx: number, vy: number, hasShockwave: boolean = false) {
    super(scene, x, y, 'bubble');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setBounce(1);
    this.setCollideWorldBounds(true);
    this.setSize(24, 24);
    this.setOffset(4, 4);
    (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    this.setVelocity(vx, vy);

    this.originalVy = vy;
    this.bubbleState = {
      vx,
      vy,
      bounces: 0,
      trappedEnemy: null,
      trappingPlayer: false,
      lifeTime: 0,
      maxLifeTime: 8000
    };
    this.hasShockwave = hasShockwave;

    this.setAlpha(0.9);
    this.setScale(1);
  }

  update(time: number, delta: number) {
    this.bubbleState.lifeTime += delta;
    this.wobbleOffset += delta * 0.01;

    if (this.justFiredTimer > 0) {
      this.justFiredTimer -= delta;
    }

    const wobble = Math.sin(this.wobbleOffset) * 2;
    this.setScale(1 + Math.sin(this.wobbleOffset * 2) * 0.05);

    if (this.bubbleState.trappedEnemy) {
      this.setVelocity(0, -40 + Math.sin(this.wobbleOffset) * 10);
      this.body!.checkCollision.up = false;
      this.body!.checkCollision.down = false;
      this.body!.checkCollision.left = false;
      this.body!.checkCollision.right = false;
      this.bubbleState.trappedEnemy.setPosition(this.x, this.y);

      if (this.bubbleState.lifeTime > this.bubbleState.maxLifeTime) {
        this.releaseEnemy();
      }
      return;
    }

    if (this.bubbleState.trappingPlayer) {
      this.setVelocity(0, -30 + Math.sin(this.wobbleOffset) * 5);
      this.body!.checkCollision.up = false;
      this.body!.checkCollision.down = false;
      this.body!.checkCollision.left = false;
      this.body!.checkCollision.right = false;
      return;
    }

    if (this.body!.blocked.left || this.body!.blocked.right) {
      this.bubbleState.bounces++;
      this.bubbleState.vx *= -1;
      this.setVelocityX(this.bubbleState.vx);
      this.scene.events.emit('bubbleBounce', this.x, this.y);
    }

    if (this.body!.blocked.up || this.body!.blocked.down) {
      this.bubbleState.bounces++;
      this.bubbleState.vy *= -1;
      this.setVelocityY(this.bubbleState.vy);
      this.scene.events.emit('bubbleBounce', this.x, this.y);
    }

    if (this.bubbleState.bounces >= 4) {
      this.setVelocity(this.bubbleState.vx * 0.3, -60);
      this.bubbleState.vx *= 0.3;
    }

    if (this.bubbleState.lifeTime > this.bubbleState.maxLifeTime) {
      this.pop();
    }
  }

  public trapEnemy(enemy: Phaser.Physics.Arcade.Sprite) {
    this.bubbleState.trappedEnemy = enemy;
    this.bubbleState.lifeTime = 0;
    this.bubbleState.maxLifeTime = 4000;
    this.setSize(32, 32);
    this.setOffset(0, 0);
    this.setScale(1.4);
    this.scene.events.emit('enemyTrapped', enemy);
  }

  public trapPlayer() {
    this.bubbleState.trappingPlayer = true;
    this.bubbleState.lifeTime = 0;
    this.bubbleState.maxLifeTime = 2000;
    this.setSize(36, 36);
    this.setOffset(-2, -2);
    this.setScale(1.5);
  }

  public releaseEnemy() {
    if (this.bubbleState.trappedEnemy) {
      this.scene.events.emit('enemyReleased', this.bubbleState.trappedEnemy);
      this.bubbleState.trappedEnemy = null;
    }
    this.pop();
  }

  public pop(byPlayer: boolean = false): { hasShockwave: boolean; x: number; y: number } {
    if (this.bubbleState.trappedEnemy && byPlayer) {
      this.scene.events.emit('enemyDefeated', this.bubbleState.trappedEnemy, this.x, this.y);
    }
    const result = { hasShockwave: this.hasShockwave, x: this.x, y: this.y };
    this.scene.events.emit('bubblePop', this.x, this.y, this.hasShockwave);
    this.destroy();
    return result;
  }

  public hasTrappedEnemy(): boolean {
    return this.bubbleState.trappedEnemy !== null;
  }

  public getTrappedEnemy(): Phaser.Physics.Arcade.Sprite | null {
    return this.bubbleState.trappedEnemy;
  }

  public isTrappingPlayer(): boolean {
    return this.bubbleState.trappingPlayer;
  }

  public getBounces(): number {
    return this.bubbleState.bounces;
  }

  public canTrap(): boolean {
    return !this.bubbleState.trappedEnemy && !this.bubbleState.trappingPlayer && this.bubbleState.bounces < 4;
  }

  public hasJustFired(): boolean {
    return this.justFiredTimer > 0;
  }
}
