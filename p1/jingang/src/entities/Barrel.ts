import Phaser from 'phaser';
import { BARREL_BASE_SPEED, BeamDirection } from '../types';

export class Barrel extends Phaser.GameObjects.Container {
  public sprite: Phaser.GameObjects.Sprite;
  public declare body: Phaser.Physics.Arcade.Body;
  public isFalling: boolean = false;
  public isOnLadder: boolean = false;
  public isClimbing: boolean = false;
  public climbTarget: number = 0;
  public currentBeamIndex: number = -1;
  public beamDirection: BeamDirection = 'right';
  public speed: number = BARREL_BASE_SPEED;
  public isDead: boolean = false;
  private animFrame: number = 0;
  private animTimer: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, speed: number, direction: BeamDirection) {
    super(scene, x, y);
    this.speed = speed;
    this.beamDirection = direction;
    this.sprite = scene.add.sprite(0, 0, 'barrel_0');
    this.sprite.setOrigin(0.5, 0.5);
    this.add(this.sprite);
    scene.add.existing(this);

    scene.physics.add.existing(this);
    this.body.setSize(14, 14);
    this.body.setOffset(-7, -7);
    this.body.setCollideWorldBounds(true);

    if (this.beamDirection === 'right') {
      this.body.setVelocityX(this.speed);
    } else {
      this.body.setVelocityX(-this.speed);
    }
  }

  update(delta: number, beamPlatforms: Phaser.Physics.Arcade.StaticGroup) {
    if (this.isDead) return;

    this.animateRoll(delta);

    if (this.isClimbing) {
      this.body.setAllowGravity(false);
      this.body.setVelocityX(0);
      if (this.y < this.climbTarget) {
        this.isClimbing = false;
        this.isOnLadder = false;
        this.body.setAllowGravity(true);
        if (this.beamDirection === 'right') {
          this.body.setVelocityX(this.speed);
        } else {
          this.body.setVelocityX(-this.speed);
        }
      } else {
        this.body.setVelocityY(-this.speed * 0.6);
      }
      return;
    }

    if (this.body.blocked.left || this.body.touching.left) {
      this.beamDirection = 'right';
      this.body.setVelocityX(this.speed);
    }
    if (this.body.blocked.right || this.body.touching.right) {
      this.beamDirection = 'left';
      this.body.setVelocityX(-this.speed);
    }

    if (this.x < 10 || this.x > 470) {
      this.kill();
    }

    if (this.y > 650) {
      this.kill();
    }
  }

  startClimbing(targetY: number) {
    this.isClimbing = true;
    this.isOnLadder = true;
    this.climbTarget = targetY;
    this.body.setVelocityX(0);
  }

  private animateRoll(delta: number) {
    this.animTimer += delta;
    if (this.animTimer > 80) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 4;
      this.sprite.setTexture(`barrel_${this.animFrame}`);
    }
  }

  kill() {
    this.isDead = true;
    this.body.enable = false;
    this.setVisible(false);
    this.setActive(false);
  }

  destroy() {
    super.destroy();
  }
}
