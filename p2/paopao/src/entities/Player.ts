import Phaser from 'phaser';
import { PowerUpType } from '../types/game';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private moveSpeed = 220;
  private jumpForce = -450;
  private isGrounded = false;
  private facingRight = true;
  private bubbleCooldown = 0;
  private baseBubbleCooldown = 400;
  private rapidBubbleCooldown = 150;
  private trapped = false;
  private trapTimer = 0;
  private powerUp: PowerUpType | null = null;
  private powerUpTimer = 0;
  private jumpBuffer = 0;
  private coyoteTime = 0;
  private bubbleKey: Phaser.Input.Keyboard.Key | null = null;
  private leftKey: Phaser.Input.Keyboard.Key | null = null;
  private rightKey: Phaser.Input.Keyboard.Key | null = null;
  private jumpKey: Phaser.Input.Keyboard.Key | null = null;
  private hasShockwave = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player_idle');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setBounce(0);
    this.setCollideWorldBounds(true);
    this.setSize(20, 26);
    this.setOffset(6, 4);

    this.createControls();
    this.play('player_idle');
  }

  private createControls() {
    this.leftKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT) || null;
    this.rightKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT) || null;
    this.jumpKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.UP) || null;
    this.bubbleKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE) || null;

    this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.X);
  }

  update(time: number, delta: number) {
    if (this.trapped) {
      this.trapTimer -= delta;
      this.setVelocityX(0);
      this.setVelocityY(-30);
      if (this.trapTimer <= 0) {
        this.trapped = false;
        this.play('player_idle');
      }
      return;
    }

    if (this.powerUpTimer > 0) {
      this.powerUpTimer -= delta;
      if (this.powerUpTimer <= 0) {
        this.powerUp = null;
        this.hasShockwave = false;
      }
    }

    if (this.bubbleCooldown > 0) {
      this.bubbleCooldown -= delta;
    }

    if (this.jumpBuffer > 0) {
      this.jumpBuffer -= delta;
    }

    if (this.coyoteTime > 0) {
      this.coyoteTime -= delta;
    }

    const wasGrounded = this.isGrounded;
    this.isGrounded = this.body?.blocked.down || this.body?.touching.down || false;

    if (wasGrounded && !this.isGrounded) {
      this.coyoteTime = 120;
    }

    this.handleMovement();
    this.handleJumping();
    this.handleBubble(time);
    this.updateAnimation();
  }

  private handleMovement() {
    const keys = this.scene.input.keyboard?.keys;
    if (!keys) return;

    const leftPressed = this.leftKey?.isDown || keys[Phaser.Input.Keyboard.KeyCodes.A]?.isDown;
    const rightPressed = this.rightKey?.isDown || keys[Phaser.Input.Keyboard.KeyCodes.D]?.isDown;

    if (leftPressed && !rightPressed) {
      this.setVelocityX(-this.moveSpeed);
      this.facingRight = false;
      this.setFlipX(true);
    } else if (rightPressed && !leftPressed) {
      this.setVelocityX(this.moveSpeed);
      this.facingRight = false;
      this.setFlipX(false);
    } else {
      this.setVelocityX(0);
    }
  }

  private handleJumping() {
    const keys = this.scene.input.keyboard?.keys;
    if (!keys) return;

    const jumpPressed = this.jumpKey?.isDown || keys[Phaser.Input.Keyboard.KeyCodes.W]?.isDown ||
      keys[Phaser.Input.Keyboard.KeyCodes.Z]?.isDown;

    if (Phaser.Input.Keyboard.JustDown(this.jumpKey!) ||
        Phaser.Input.Keyboard.JustDown(keys[Phaser.Input.Keyboard.KeyCodes.W]) ||
        Phaser.Input.Keyboard.JustDown(keys[Phaser.Input.Keyboard.KeyCodes.Z])) {
      this.jumpBuffer = 150;
    }

    if (this.jumpBuffer > 0 && (this.isGrounded || this.coyoteTime > 0)) {
      this.setVelocityY(this.jumpForce);
      this.jumpBuffer = 0;
      this.coyoteTime = 0;
      this.isGrounded = false;
      this.scene.events.emit('playerJump');
    }

    if (!jumpPressed && this.body!.velocity.y < -150) {
      this.setVelocityY(-150);
    }
  }

  private handleBubble(time: number) {
    const keys = this.scene.input.keyboard?.keys;
    if (!keys) return;

    const bubblePressed = this.bubbleKey?.isDown || keys[Phaser.Input.Keyboard.KeyCodes.X]?.isDown;

    if ((Phaser.Input.Keyboard.JustDown(this.bubbleKey!) ||
        Phaser.Input.Keyboard.JustDown(keys[Phaser.Input.Keyboard.KeyCodes.X])) &&
        this.bubbleCooldown <= 0) {
      this.shootBubble();
      const cooldown = this.powerUp === 'rapid' ? this.rapidBubbleCooldown : this.baseBubbleCooldown;
      this.bubbleCooldown = cooldown;
    }
  }

  private shootBubble() {
    const direction = this.flipX ? -1 : 1;
    const startX = this.x + direction * 28;
    const startY = this.y - 2;

    const angle = Phaser.Math.Between(-10, 10);
    const rad = Phaser.Math.DegToRad(angle);
    const speed = 350;
    const vx = Math.cos(rad) * speed * direction;
    const vy = Math.sin(rad) * speed;

    this.scene.events.emit('shootBubble', startX, startY, vx, vy, this.hasShockwave);
    this.play('player_bubble');
    this.scene.time.delayedCall(100, () => {
      if (!this.trapped && this.anims.currentAnim?.key !== 'player_jump') {
        this.play('player_idle');
      }
    });
  }

  private updateAnimation() {
    if (this.trapped) {
      this.play('player_trapped', true);
      return;
    }

    if (!this.isGrounded) {
      this.play('player_jump', true);
    } else if (Math.abs(this.body!.velocity.x) > 10) {
      this.play('player_walk', true);
    } else if (this.anims.currentAnim?.key !== 'player_bubble') {
      this.play('player_idle', true);
    }
  }

  public getTrapped(duration: number = 1500) {
    if (this.trapped) return;
    this.trapped = true;
    this.trapTimer = duration;
    this.play('player_trapped');
    this.setVelocityY(-100);
  }

  public bounce() {
    this.setVelocityY(-350);
    this.isGrounded = false;
    this.coyoteTime = 0;
  }

  public isTrapped() {
    return this.trapped;
  }

  public setPowerUp(type: PowerUpType, duration: number) {
    this.powerUp = type;
    this.powerUpTimer = duration;
    if (type === 'shockwave') {
      this.hasShockwave = true;
    }
  }

  public getPowerUp(): PowerUpType | null {
    return this.powerUp;
  }

  public getPowerUpTimer(): number {
    return this.powerUpTimer;
  }

  public hasShockwavePower(): boolean {
    return this.hasShockwave;
  }

  public reset() {
    this.trapped = false;
    this.trapTimer = 0;
    this.powerUp = null;
    this.powerUpTimer = 0;
    this.hasShockwave = false;
    this.bubbleCooldown = 0;
    this.setVelocity(0, 0);
    this.play('player_idle');
  }
}
