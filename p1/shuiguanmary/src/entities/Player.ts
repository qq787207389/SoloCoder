import Phaser from 'phaser';
import {
  PLAYER_ACCEL,
  PLAYER_DECEL,
  PLAYER_MAX_SPEED,
  PLAYER_AIR_CONTROL,
  PLAYER_JUMP_VELOCITY,
} from '../config/gameConfig';

export type PlayerState = 'idle' | 'run' | 'jump' | 'headbutt' | 'hurt';

export class Player extends Phaser.Physics.Arcade.Sprite {
  public state: PlayerState = 'idle';
  public isGrounded: boolean = false;
  public isHeadbutting: boolean = false;
  public isHurt: boolean = false;
  public invincibleTimer: number = 0;
  private animTimer: number = 0;
  private runFrame: number = 0;
  private facingRight: boolean = true;
  private wasGoingUp: boolean = false;
  private headbuttTimer: number = 0;
  private canJump: boolean = true;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player_idle');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setSize(18, 28);
    this.setOffset(3, 2);
    (this.body as Phaser.Physics.Arcade.Body).setMaxVelocity(PLAYER_MAX_SPEED, 900);
    (this.body as Phaser.Physics.Arcade.Body).setBounce(0, 0);
    this.setDepth(10);
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    const onFloor = body.blocked.down || body.touching.down;
    this.isGrounded = onFloor;

    if (this.isHeadbutting) {
      this.headbuttTimer -= delta;
      if (this.headbuttTimer <= 0) {
        this.isHeadbutting = false;
      }
    }

    if (this.isHurt) {
      this.invincibleTimer -= delta;
      this.setAlpha(Math.sin(this.invincibleTimer * 0.02) > 0 ? 1 : 0.3);
      if (this.invincibleTimer <= 0) {
        this.isHurt = false;
        this.setAlpha(1);
      }
      this.updateAnimation(delta, onFloor);
      return;
    }

    const accel = onFloor ? PLAYER_ACCEL : PLAYER_ACCEL * PLAYER_AIR_CONTROL;
    const decel = onFloor ? PLAYER_DECEL : PLAYER_DECEL * 0.3;

    const leftDown = cursors.left?.isDown ?? false;
    const rightDown = cursors.right?.isDown ?? false;

    if (leftDown) {
      body.setAccelerationX(-accel);
      this.facingRight = false;
      this.setFlipX(true);
    } else if (rightDown) {
      body.setAccelerationX(accel);
      this.facingRight = true;
      this.setFlipX(false);
    } else {
      if (Math.abs(body.velocity.x) > 10) {
        body.setAccelerationX(body.velocity.x > 0 ? -decel : decel);
      } else {
        body.setAccelerationX(0);
        body.setVelocityX(0);
      }
    }

    if (onFloor) {
      this.canJump = true;
    }

    const jumpDown = cursors.up?.isDown ?? false;
    const spaceKey = this.scene.input.keyboard!.addKey('SPACE');
    const spaceDown = spaceKey.isDown;
    const jumpJustPressed = jumpDown || Phaser.Input.Keyboard.JustDown(spaceKey);

    if (jumpJustPressed && onFloor && this.canJump) {
      body.setVelocityY(PLAYER_JUMP_VELOCITY);
      this.canJump = false;
    }

    this.updateAnimation(delta, onFloor);
  }

  private updateAnimation(delta: number, onFloor: boolean): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (this.isHeadbutting) {
      this.setTexture('player_headbutt');
      this.state = 'headbutt';
      return;
    }

    if (!onFloor) {
      this.setTexture('player_jump');
      this.state = 'jump';
      return;
    }

    if (Math.abs(body.velocity.x) > 15) {
      this.state = 'run';
      this.animTimer += delta;
      if (this.animTimer > 100) {
        this.animTimer = 0;
        this.runFrame = (this.runFrame + 1) % 2;
      }
      this.setTexture(this.runFrame === 0 ? 'player_run1' : 'player_run2');
    } else {
      this.state = 'idle';
      this.setTexture('player_idle');
      this.animTimer = 0;
      this.runFrame = 0;
    }
  }

  triggerHeadbutt(): void {
    this.isHeadbutting = true;
    this.headbuttTimer = 300;
  }

  hurt(): void {
    if (this.isHurt) return;
    this.isHurt = true;
    this.invincibleTimer = 2000;
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(-250);
    body.setVelocityX(this.facingRight ? -180 : 180);
  }

  getTopY(): number {
    return this.y;
  }
}
