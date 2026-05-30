import Phaser from 'phaser';
import { GAME_WIDTH } from '../config/gameConfig';

export type EnemyType = 'turtle' | 'crab' | 'flybug';
export type EnemyState = 'walk' | 'flipped' | 'sliding' | 'dead';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  public enemyType: EnemyType;
  public state: EnemyState = 'walk';
  public flipTimer: number = 0;
  public flipTime: number;
  public moveSpeed: number;
  public direction: number = 1;
  public animTimer: number = 0;
  public animFrame: number = 0;
  public isFlybug: boolean;
  private flybugBaseY: number = 0;
  private flybugPhase: number = 0;
  private changeDirTimer: number = 0;
  private playerRef: Phaser.GameObjects.Sprite | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: EnemyType,
    flipTime: number,
    moveSpeed: number
  ) {
    const textureKey = type === 'turtle' ? 'turtle_walk1' : type === 'crab' ? 'crab_walk1' : 'flybug_fly1';
    super(scene, x, y, textureKey);
    this.enemyType = type;
    this.flipTime = flipTime;
    this.moveSpeed = moveSpeed;
    this.isFlybug = type === 'flybug';

    scene.add.existing(this);
    scene.physics.add.existing(this);

    if (this.isFlybug) {
      (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
      this.flybugBaseY = y;
    }

    this.setSize(
      type === 'turtle' ? 20 : type === 'crab' ? 22 : 16,
      type === 'turtle' ? 24 : type === 'crab' ? 20 : 18
    );
    this.setDepth(5);
    this.direction = Math.random() > 0.5 ? 1 : -1;
    this.setFlipX(this.direction < 0);
  }

  setPlayerRef(player: Phaser.GameObjects.Sprite): void {
    this.playerRef = player;
  }

  update(delta: number): void {
    if (this.state === 'dead') return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    if (this.state === 'sliding') {
      body.setVelocityX(this.direction * 350);
      body.setVelocityY(0);
      this.setTexture(this.enemyType === 'turtle' ? 'turtle_flipped' : this.enemyType === 'crab' ? 'crab_flipped' : 'flybug_flipped');
      return;
    }

    if (this.state === 'flipped') {
      this.flipTimer -= delta;
      this.setTexture(this.enemyType === 'turtle' ? 'turtle_flipped' : this.enemyType === 'crab' ? 'crab_flipped' : 'flybug_flipped');
      this.animTimer += delta;
      if (this.animTimer > 200) {
        this.animTimer = 0;
        this.setAlpha(this.alpha === 1 ? 0.5 : 1);
      }
      if (this.flipTimer <= 0) {
        this.state = 'walk';
        this.setAlpha(1);
        this.animTimer = 0;
      }
      if (!this.isFlybug) {
        body.setVelocityX(0);
      } else {
        body.setVelocity(0, 0);
      }
      return;
    }

    this.animTimer += delta;
    if (this.animTimer > 300) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 2;
    }

    if (this.isFlybug) {
      this.updateFlybug(delta, body);
    } else if (this.enemyType === 'crab') {
      this.updateCrab(delta, body);
    } else {
      this.updateTurtle(delta, body);
    }

    const walkTex1 = this.enemyType === 'turtle' ? 'turtle_walk1' : this.enemyType === 'crab' ? 'crab_walk1' : 'flybug_fly1';
    const walkTex2 = this.enemyType === 'turtle' ? 'turtle_walk2' : this.enemyType === 'crab' ? 'crab_walk2' : 'flybug_fly2';
    this.setTexture(this.animFrame === 0 ? walkTex1 : walkTex2);
    this.setFlipX(this.direction < 0);
  }

  private updateTurtle(delta: number, body: Phaser.Physics.Arcade.Body): void {
    body.setVelocityX(this.direction * this.moveSpeed);
    this.changeDirTimer -= delta;
    if (this.changeDirTimer <= 0) {
      this.changeDirTimer = 2000 + Math.random() * 3000;
      this.direction = -this.direction;
    }
    if (body.blocked.left || body.touching.left) this.direction = 1;
    if (body.blocked.right || body.touching.right) this.direction = -1;
    if (this.x <= 15) this.direction = 1;
    if (this.x >= GAME_WIDTH - 15) this.direction = -1;
  }

  private updateCrab(delta: number, body: Phaser.Physics.Arcade.Body): void {
    if (this.x <= 15) {
      this.direction = 1;
    } else if (this.x >= GAME_WIDTH - 15) {
      this.direction = -1;
    } else if (this.playerRef && this.playerRef.active) {
      const dx = this.playerRef.x - this.x;
      this.direction = dx > 0 ? 1 : -1;
    }
    body.setVelocityX(this.direction * this.moveSpeed);
    if (body.blocked.left || body.touching.left) this.direction = 1;
    if (body.blocked.right || body.touching.right) this.direction = -1;
  }

  private updateFlybug(delta: number, body: Phaser.Physics.Arcade.Body): void {
    this.flybugPhase += delta * 0.003;
    const yOffset = Math.sin(this.flybugPhase) * 30;
    body.setVelocityX(this.direction * this.moveSpeed);
    body.setVelocityY(0);
    this.y = this.flybugBaseY + yOffset;

    if (this.playerRef && this.playerRef.active) {
      const dx = this.playerRef.x - this.x;
      if (Math.abs(dx) > 20) {
        this.direction = dx > 0 ? 1 : -1;
      }
    }

    if (this.x < 20) this.direction = 1;
    if (this.x > GAME_WIDTH - 20) this.direction = -1;
  }

  flip(): void {
    this.state = 'flipped';
    this.flipTimer = this.flipTime;
    this.animTimer = 0;
    this.setAlpha(1);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (this.isFlybug) {
      this.flybugBaseY = this.y;
    }
  }

  kick(direction: number): void {
    this.state = 'sliding';
    this.direction = direction;
    this.setAlpha(1);
  }

  kill(): void {
    this.state = 'dead';
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, -200);
    body.setAllowGravity(true);
    this.setDepth(1);
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      y: this.y - 60,
      duration: 600,
      onComplete: () => {
        this.destroy();
      },
    });
  }

  setFlybugBaseY(y: number): void {
    this.flybugBaseY = y;
  }
}
