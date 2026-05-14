import { Entity, Vector2 } from '../engine/Entity';
import { Game } from '../engine/Game';
import { Weapon, WeaponType } from '../weapons/Weapon';

export class Player extends Entity {
  public speed: number;
  public jumpForce: number;
  public gravity: number;
  public grounded: boolean;
  public jumping: boolean;
  public crouching: boolean;
  public weapon: Weapon;
  public aimDirection: Vector2;
  public shootCooldown: number;
  public shootTimer: number;

  constructor(game: Game, x: number, y: number) {
    super(game, x, y, 24, 32);
    this.health = 1;
    this.maxHealth = 1;
    this.speed = 300;
    this.jumpForce = -500;
    this.gravity = 1200;
    this.grounded = false;
    this.jumping = false;
    this.crouching = false;
    this.weapon = new Weapon(game, WeaponType.RIFLE, 1);
    this.aimDirection = { x: 1, y: 0 };
    this.shootCooldown = 0.15;
    this.shootTimer = 0;
    
    // 强制设置初始位置在地面上方
    this.y = 400;
  }

  public update(deltaTime: number): void {
    super.update(deltaTime);

    this.handleInput(deltaTime);
    this.applyGravity(deltaTime);
    this.handleCollisions();

    this.shootTimer -= deltaTime;
    if (this.shootTimer <= 0) {
      this.shootTimer = 0;
    }

    this.weapon.update(deltaTime);
  }

  private handleInput(deltaTime: number): void {
    const input = this.game.input;

    const leftPressed = input.isKeyDown('ArrowLeft') || input.isKeyDown('KeyA');
    const rightPressed = input.isKeyDown('ArrowRight') || input.isKeyDown('KeyD');

    this.crouching = input.isKeyDown('ArrowDown') || input.isKeyDown('KeyS');

    if (this.crouching && this.grounded) {
      this.height = 16;
    } else {
      this.height = 32;
    }

    // 直接测试移动 - 不使用velocity
    if (leftPressed) {
      this.x -= 5;
      this.facingRight = false;
      console.log('Left pressed, x:', this.x);
    } else if (rightPressed) {
      this.x += 5;
      this.facingRight = true;
      console.log('Right pressed, x:', this.x);
    }
    
    this.velocity.x = 0;

    if ((input.isKeyPressed('Space') || input.isKeyPressed('KeyW') || input.isKeyPressed('ArrowUp')) && this.grounded && !this.crouching) {
      this.velocity.y = this.jumpForce;
      this.grounded = false;
      this.jumping = true;
    }

    const rawAim = input.getAimDirection();
    this.aimDirection = { ...rawAim };
    
    if (this.velocity.x < 0) {
      this.facingRight = false;
    } else if (this.velocity.x > 0) {
      this.facingRight = true;
    }
    
    if (!this.facingRight) {
      this.aimDirection.x = -Math.abs(this.aimDirection.x);
    } else {
      this.aimDirection.x = Math.abs(this.aimDirection.x);
    }

    if (input.isKeyDown('KeyJ') || input.isKeyDown('KeyZ')) {
      this.shoot();
    }

    if (input.isKeyPressed('KeyK') || input.isKeyPressed('KeyX')) {
      this.game.useBomb();
    }

    const currentLevel = this.weapon.level;
    if (input.isKeyPressed('Digit1')) {
      if (this.weapon.type !== WeaponType.RIFLE) {
        this.weapon = new Weapon(this.game, WeaponType.RIFLE, currentLevel);
      }
    } else if (input.isKeyPressed('Digit2')) {
      if (this.weapon.type !== WeaponType.SHOTGUN) {
        this.weapon = new Weapon(this.game, WeaponType.SHOTGUN, currentLevel);
      }
    } else if (input.isKeyPressed('Digit3')) {
      if (this.weapon.type !== WeaponType.MACHINEGUN) {
        this.weapon = new Weapon(this.game, WeaponType.MACHINEGUN, currentLevel);
      }
    } else if (input.isKeyPressed('Digit4')) {
      if (this.weapon.type !== WeaponType.LASER) {
        this.weapon = new Weapon(this.game, WeaponType.LASER, currentLevel);
      }
    }
  }

  private applyGravity(deltaTime: number): void {
    if (!this.grounded) {
      this.velocity.y += this.gravity * deltaTime;
    }
  }

  private handleCollisions(): void {
    const dt = this.game.deltaTime;

    // 水平移动已经在handleInput里直接处理了
    // 这里只处理垂直移动
    
    // 垂直移动 + 简单的地面碰撞
    const groundY = 480;  // 简单固定地面
    let newY = this.y + this.velocity.y * dt;
    
    if (newY + this.height >= groundY) {
      // 碰到地面
      this.y = groundY - this.height;
      this.velocity.y = 0;
      this.grounded = true;
      this.jumping = false;
    } else {
      this.y = newY;
      if (this.velocity.y > 0) {
        this.grounded = false;
      }
    }

    this.x = Math.max(0, this.x);
  }

  private shoot(): void {
    if (this.shootTimer > 0) return;
    
    const bulletX = this.x + this.width / 2 + this.aimDirection.x * 20;
    const bulletY = this.y + this.height / 2 + this.aimDirection.y * 10;
    
    this.weapon.shoot(bulletX, bulletY, this.aimDirection, false);
    this.shootTimer = this.weapon.fireRate;
  }

  public takeDamage(amount: number): void {
    if (this.invincible) return;
    super.takeDamage(amount);
    if (this.health <= 0) {
      this.game.playerDied();
    } else {
      this.setInvincible(2);
    }
  }

  public respawn(): void {
    this.x = Math.max(100, this.game.camera.x + 100);
    this.y = 300;
    this.health = this.maxHealth;
    this.velocity = { x: 0, y: 0 };
    this.active = true;
    this.setInvincible(3);
  }

  public render(ctx: CanvasRenderingContext2D, cameraX: number): void {
    const screenX = this.x - cameraX;
    
    this.drawInvincible(ctx, cameraX, () => {
      ctx.save();
      
      if (!this.facingRight) {
        ctx.translate(screenX + this.width, this.y);
        ctx.scale(-1, 1);
        ctx.translate(-screenX, -this.y);
      }

      ctx.fillStyle = '#ff6b35';
      const bodyHeight = this.crouching ? 16 : 24;
      ctx.fillRect(screenX + 4, this.y + 8, 16, bodyHeight);
      
      ctx.fillStyle = '#ffd4a3';
      ctx.beginPath();
      ctx.arc(screenX + 12, this.y + 6, 8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(screenX + 14, this.y + 5, 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#ffd4a3';
      const armAngle = Math.atan2(this.aimDirection.y, Math.abs(this.aimDirection.x));
      ctx.save();
      ctx.translate(screenX + 16, this.y + 14);
      ctx.rotate(armAngle);
      ctx.fillRect(0, -2, 12, 4);
      ctx.restore();
      
      ctx.fillStyle = '#4a4a4a';
      const gunLength = 16;
      ctx.save();
      ctx.translate(screenX + 16, this.y + 14);
      ctx.rotate(armAngle);
      ctx.fillRect(8, -3, gunLength, 6);
      ctx.restore();

      ctx.fillStyle = '#2563eb';
      if (!this.crouching) {
        ctx.fillRect(screenX + 6, this.y + 24, 5, 8);
        ctx.fillRect(screenX + 13, this.y + 24, 5, 8);
      }

      ctx.restore();
    });
  }
}