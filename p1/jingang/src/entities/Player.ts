import Phaser from 'phaser';
import { PlayerState, PLAYER_SPEED, PLAYER_JUMP_SPEED, PLAYER_CLIMB_SPEED, JUMP_PREP_DURATION, LANDING_DURATION, HAMMER_DURATION, GAME_WIDTH } from '../types';

export class Player extends Phaser.GameObjects.Container {
  public sprite: Phaser.GameObjects.Sprite;
  public declare body: Phaser.Physics.Arcade.Body;
  public state: PlayerState = 'IDLE';
  public facing: number = 1;
  public isHammerActive: boolean = false;
  public hammerTimer: number = 0;
  public isOnLadder: boolean = false;
  public currentLadder: Phaser.GameObjects.Rectangle | null = null;
  public isDead: boolean = false;
  public score: number = 0;
  private stateTimer: number = 0;
  private walkFrame: number = 0;
  private walkTimer: number = 0;
  private climbFrame: number = 0;
  private climbTimer: number = 0;
  private hammerFrame: number = 0;
  private hammerAnimTimer: number = 0;
  public invincibleTimer: number = 0;
  private blinkTimer: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    this.sprite = scene.add.sprite(0, 0, 'player_idle');
    this.sprite.setOrigin(0.5, 1);
    this.add(this.sprite);
    scene.add.existing(this);

    scene.physics.add.existing(this);
    this.body.setSize(12, 22);
    this.body.setOffset(-6, -22);
    this.body.setCollideWorldBounds(false);
    this.body.setGravityY(0);
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, delta: number, jumpPressed: boolean = false) {
    if (this.isDead) return;

    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= delta;
      this.blinkTimer += delta;
      if (this.blinkTimer > 80) {
        this.blinkTimer = 0;
        this.sprite.setVisible(!this.sprite.visible);
      }
      if (this.invincibleTimer <= 0) {
        this.sprite.setVisible(true);
      }
    }

    if (this.isHammerActive) {
      this.hammerTimer -= delta;
      if (this.hammerTimer <= 0) {
        this.isHammerActive = false;
        this.state = 'IDLE';
      }
    }

    if (this.state === 'JUMP_PREP') {
      this.stateTimer -= delta;
      if (this.stateTimer <= 0) {
        this.state = 'JUMPING';
        this.body.setVelocityY(PLAYER_JUMP_SPEED);
        this.sprite.setTexture('player_jump');
        this.isOnLadder = false;
        this.currentLadder = null;
        this.body.setAllowGravity(true);
      }
      return;
    }

    if (this.state === 'LANDING') {
      this.stateTimer -= delta;
      this.body.setVelocityX(0);
      if (this.stateTimer <= 0) {
        this.state = this.isHammerActive ? 'HAMMER' : 'IDLE';
      }
      return;
    }

    const onGround = this.body.blocked.down || this.body.touching.down;

    if (onGround && this.state !== 'JUMPING' && this.state !== 'CLIMBING') {
      if (jumpPressed) {
        this.state = 'JUMP_PREP';
        this.stateTimer = JUMP_PREP_DURATION;
        this.sprite.setTexture('player_crouch');
        this.body.setVelocityX(0);
        this.isOnLadder = false;
        this.currentLadder = null;
        return;
      }
    }

    if (this.isOnLadder && this.state !== 'CLIMBING' && this.state !== 'JUMPING') {
      if (cursors.up!.isDown || cursors.down!.isDown) {
        this.state = 'CLIMBING';
        this.body.setAllowGravity(false);
        this.body.setVelocityY(0);
        this.body.setVelocityX(0);
      }
    }

    if (this.state === 'CLIMBING') {
      this.body.setVelocityX(0);
      if (cursors.up!.isDown) {
        this.body.setVelocityY(-PLAYER_CLIMB_SPEED);
        this.animateClimb(delta);
      } else if (cursors.down!.isDown && !onGround) {
        this.body.setVelocityY(PLAYER_CLIMB_SPEED);
        this.animateClimb(delta);
      } else if (cursors.down!.isDown && onGround) {
        this.exitLadder();
        return;
      } else {
        this.body.setVelocityY(0);
      }

      if (cursors.left!.isDown || cursors.right!.isDown) {
        this.exitLadder();
        return;
      }

      if (onGround && !cursors.up!.isDown && !cursors.down!.isDown && !this.isOnLadder) {
        this.exitLadder();
        return;
      }

      if (onGround && cursors.left!.isDown) {
        this.facing = -1;
        this.sprite.setFlipX(true);
      } else if (onGround && cursors.right!.isDown) {
        this.facing = 1;
        this.sprite.setFlipX(false);
      }

      if (jumpPressed) {
        this.exitLadder();
        this.state = 'JUMP_PREP';
        this.stateTimer = JUMP_PREP_DURATION;
        this.sprite.setTexture('player_crouch');
        this.body.setVelocityX(0);
        return;
      }

      return;
    }

    if (!onGround && this.body.velocity.y > 0 && this.state !== 'JUMPING') {
      this.state = 'JUMPING';
    }

    if (this.isHammerActive) {
      this.state = 'HAMMER';
      this.animateHammer(delta);
      if (cursors.left!.isDown) {
        this.facing = -1;
        this.body.setVelocityX(-PLAYER_SPEED * 0.7);
        this.sprite.setFlipX(true);
      } else if (cursors.right!.isDown) {
        this.facing = 1;
        this.body.setVelocityX(PLAYER_SPEED * 0.7);
        this.sprite.setFlipX(false);
      } else {
        this.body.setVelocityX(0);
      }
      return;
    }

    if (cursors.left!.isDown) {
      this.facing = -1;
      this.body.setVelocityX(-PLAYER_SPEED);
      this.sprite.setFlipX(true);
      if (onGround && this.state !== 'WALKING') {
        this.state = 'WALKING';
      }
    } else if (cursors.right!.isDown) {
      this.facing = 1;
      this.body.setVelocityX(PLAYER_SPEED);
      this.sprite.setFlipX(false);
      if (onGround && this.state !== 'WALKING') {
        this.state = 'WALKING';
      }
    } else {
      this.body.setVelocityX(0);
      if (onGround && this.state === 'WALKING') {
        this.state = 'IDLE';
      }
    }

    if (this.state === 'WALKING') {
      this.animateWalk(delta);
    } else if (this.state === 'IDLE') {
      this.sprite.setTexture('player_idle');
    } else if (this.state === 'JUMPING') {
      this.sprite.setTexture('player_jump');
      if (onGround && this.body.velocity.y >= 0) {
        this.state = 'LANDING';
        this.stateTimer = LANDING_DURATION;
        this.sprite.setTexture('player_crouch');
      }
    }
  }

  private animateWalk(delta: number) {
    this.walkTimer += delta;
    if (this.walkTimer > 120) {
      this.walkTimer = 0;
      this.walkFrame = (this.walkFrame + 1) % 2;
      this.sprite.setTexture(this.walkFrame === 0 ? 'player_walk1' : 'player_walk2');
    }
  }

  private animateClimb(delta: number) {
    this.climbTimer += delta;
    if (this.climbTimer > 150) {
      this.climbTimer = 0;
      this.climbFrame = (this.climbFrame + 1) % 2;
      this.sprite.setTexture(this.climbFrame === 0 ? 'player_climb1' : 'player_climb2');
    }
  }

  private animateHammer(delta: number) {
    this.hammerAnimTimer += delta;
    if (this.hammerAnimTimer > 200) {
      this.hammerAnimTimer = 0;
      this.hammerFrame = (this.hammerFrame + 1) % 2;
      this.sprite.setTexture(this.hammerFrame === 0 ? 'player_hammer1' : 'player_hammer2');
    }
  }

  grabHammer() {
    this.isHammerActive = true;
    this.hammerTimer = HAMMER_DURATION;
    this.state = 'HAMMER';
  }

  takeDamage() {
    if (this.isDead || this.isHammerActive || this.invincibleTimer > 0) return;
    this.isDead = true;
    this.state = 'DEAD';
    this.body.setVelocityX(0);
    this.body.setVelocityY(-200);
    this.sprite.setTexture('player_jump');
  }

  respawn(x: number, y: number) {
    this.isDead = false;
    this.state = 'IDLE';
    this.isHammerActive = false;
    this.isOnLadder = false;
    this.body.setAllowGravity(true);
    this.body.setVelocity(0, 0);
    this.setPosition(x, y);
    this.sprite.setTexture('player_idle');
    this.sprite.setVisible(true);
    this.invincibleTimer = 2000;
    this.blinkTimer = 0;
  }

  exitLadder() {
    this.state = 'IDLE';
    this.isOnLadder = false;
    this.currentLadder = null;
    this.body.setAllowGravity(true);
  }

  getHammerBounds(): Phaser.Geom.Rectangle {
    if (!this.isHammerActive) return new Phaser.Geom.Rectangle(0, 0, 0, 0);
    const hw = 24;
    const hh = 20;
    return new Phaser.Geom.Rectangle(
      this.x - (this.facing > 0 ? 0 : hw),
      this.y - 30,
      hw,
      hh
    );
  }

  setOnLadder(onLadder: boolean, ladder: Phaser.GameObjects.Rectangle | null) {
    this.isOnLadder = onLadder;
    this.currentLadder = ladder;
  }
}
