import Phaser from 'phaser';
import { EnemyType, EnemyState } from '../types/game';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  protected enemyType: EnemyType;
  protected enemyState: EnemyState;
  protected moveSpeed = 80;
  protected fireCooldownMax = 3000;
  protected baseY: number = 0;
  protected floatOffset = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, type: EnemyType = 'basic') {
    super(scene, x, y, `enemy_${type}_0`);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.enemyType = type;
    this.enemyState = {
      type,
      trapped: false,
      trapTimer: 0,
      health: type === 'boss' ? 3 : 1,
      maxHealth: type === 'boss' ? 3 : 1,
      direction: Math.random() > 0.5 ? 1 : -1,
      fireCooldown: 0
    };

    this.setupEnemy();
    this.play(`enemy_${type}_${type === 'flying' ? 'fly' : 'walk'}`);
  }

  protected setupEnemy() {
    if (this.enemyType === 'boss') {
      this.setSize(52, 56);
      this.setOffset(6, 4);
      this.moveSpeed = 60;
    } else if (this.enemyType === 'flying') {
      this.setSize(24, 24);
      this.setOffset(4, 4);
      this.setGravity(0);
      this.baseY = this.y;
    } else {
      this.setSize(20, 24);
      this.setOffset(6, 4);
      this.setGravityY(400);
    }

    this.setCollideWorldBounds(true);
    this.setBounce(0);
  }

  update(time: number, delta: number, playerX: number, platforms: Phaser.Physics.Arcade.StaticGroup) {
    if (this.enemyState.trapped) {
      this.enemyState.trapTimer -= delta;
      this.setVelocity(0, 0);
      this.setAlpha(0.6);
      this.rotation += 0.05;
      if (this.body) {
        (this.body as Phaser.Physics.Arcade.Body).checkCollision.up = false;
        (this.body as Phaser.Physics.Arcade.Body).checkCollision.down = false;
        (this.body as Phaser.Physics.Arcade.Body).checkCollision.left = false;
        (this.body as Phaser.Physics.Arcade.Body).checkCollision.right = false;
      }
      return;
    }

    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).checkCollision.up = true;
      (this.body as Phaser.Physics.Arcade.Body).checkCollision.down = true;
      (this.body as Phaser.Physics.Arcade.Body).checkCollision.left = true;
      (this.body as Phaser.Physics.Arcade.Body).checkCollision.right = true;
    }

    this.setAlpha(1);
    this.rotation = 0;

    if (this.enemyState.fireCooldown > 0) {
      this.enemyState.fireCooldown -= delta;
    }

    switch (this.enemyType) {
      case 'basic':
        this.updateBasic(delta, platforms);
        break;
      case 'flying':
        this.updateFlying(delta, playerX);
        break;
      case 'fire':
        this.updateFire(delta, playerX, platforms);
        break;
      case 'boss':
        this.updateBoss(delta, playerX, platforms);
        break;
    }
  }

  protected updateBasic(delta: number, platforms: Phaser.Physics.Arcade.StaticGroup) {
    this.setVelocityX(this.moveSpeed * this.enemyState.direction);

    if (this.body!.blocked.left || this.body!.blocked.right) {
      this.enemyState.direction *= -1;
      this.setFlipX(this.enemyState.direction < 0);
    }

    const nextX = this.x + this.enemyState.direction * 20;
    const belowY = this.y + 20;

    let onPlatform = false;
    platforms.getChildren().forEach((plat: any) => {
      if (nextX > plat.x && nextX < plat.x + plat.width &&
          belowY > plat.y && belowY < plat.y + 20) {
        onPlatform = true;
      }
    });

    if (!onPlatform && this.body!.blocked.none && this.y < 430) {
      this.enemyState.direction *= -1;
      this.setFlipX(this.enemyState.direction < 0);
    }
  }

  protected updateFlying(delta: number, playerX: number) {
    this.floatOffset += delta * 0.003;

    const targetX = playerX;
    const dx = targetX - this.x;
    const moveDir = dx > 0 ? 1 : -1;

    this.setVelocityX(moveDir * this.moveSpeed * 0.8);
    this.setVelocityY(Math.sin(this.floatOffset) * 50);

    if (Math.abs(dx) < 50) {
      this.setVelocityX(0);
    }

    this.setFlipX(dx < 0);
  }

  protected updateFire(delta: number, playerX: number, platforms: Phaser.Physics.Arcade.StaticGroup) {
    this.updateBasic(delta, platforms);

    const dx = playerX - this.x;
    if (Math.abs(dx) < 250 && this.enemyState.fireCooldown <= 0) {
      this.shootFireball(dx > 0 ? 1 : -1);
      this.enemyState.fireCooldown = this.fireCooldownMax;
    }
  }

  protected updateBoss(delta: number, playerX: number, platforms: Phaser.Physics.Arcade.StaticGroup) {
    const dx = playerX - this.x;
    this.enemyState.direction = dx > 0 ? 1 : -1;
    this.setVelocityX(this.moveSpeed * this.enemyState.direction * 0.7);
    this.setFlipX(this.enemyState.direction < 0);

    if (this.enemyState.fireCooldown <= 0) {
      for (let i = -1; i <= 1; i++) {
        this.shootFireball(1, i * 0.3);
        this.shootFireball(-1, i * 0.3);
      }
      this.enemyState.fireCooldown = this.fireCooldownMax * 1.5;
    }

    if (this.body!.blocked.down && Math.random() < 0.005) {
      this.setVelocityY(-350);
    }
  }

  protected shootFireball(direction: number, angleOffset: number = 0) {
    const startX = this.x + direction * 20;
    const startY = this.y - 5;
    this.scene.events.emit('shootFireball', startX, startY, direction, angleOffset, this.enemyType === 'boss');
  }

  public getTrapped() {
    if (this.enemyState.trapped) return;
    this.enemyState.trapped = true;
    this.enemyState.trapTimer = 0;
    this.setVelocity(0, 0);
  }

  public release() {
    this.enemyState.trapped = false;
    this.enemyState.trapTimer = 0;
    this.setVelocity(0, 0);
    this.setAlpha(1);
    this.rotation = 0;
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.Body).checkCollision.up = true;
      (this.body as Phaser.Physics.Arcade.Body).checkCollision.down = true;
      (this.body as Phaser.Physics.Arcade.Body).checkCollision.left = true;
      (this.body as Phaser.Physics.Arcade.Body).checkCollision.right = true;
    }
  }

  public takeDamage(): boolean {
    this.enemyState.health--;
    this.scene.events.emit('enemyHurt', this.x, this.y, this.enemyType);

    if (this.enemyState.health <= 0) {
      return true;
    }

    this.setTint(0xff0000);
    this.scene.time.delayedCall(200, () => {
      this.clearTint();
    });

    return false;
  }

  public isTrapped(): boolean {
    return this.enemyState.trapped;
  }

  public getType(): EnemyType {
    return this.enemyType;
  }

  public getHealth(): number {
    return this.enemyState.health;
  }

  public getMaxHealth(): number {
    return this.enemyState.maxHealth;
  }

  public isWeakPointVulnerable(): boolean {
    return this.enemyType === 'boss' && !this.enemyState.trapped;
  }
}
