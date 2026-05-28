import Phaser from 'phaser';
import { WeaponType, FormationType } from '../types/game';
import { WEAPON_CONFIGS, PLAYER_CONFIG, GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig';
import { Wingman } from './Wingman';
import { Bullet } from './Bullet';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private weaponKeys: Phaser.Input.Keyboard.Key[] = [];
  private lastFireTime: number = 0;
  public currentWeapon: WeaponType = 'machinegun';
  public weaponLevel: number = 1;
  private formationKey: Phaser.Input.Keyboard.Key;
  public formation: FormationType = 'spread';
  private lastFormationSwitch: number = 0;
  public fuel: number = PLAYER_CONFIG.maxFuel;
  public maxFuel: number = PLAYER_CONFIG.maxFuel;
  private isInvincible: boolean = false;
  private invincibleTimer: number = 0;
  public wingmen: Wingman[] = [];
  private bulletPool: Phaser.Physics.Arcade.Group;
  public energyCapsules: Record<string, number> = {
    red: 0,
    blue: 0,
    green: 0
  };
  private isShooting: boolean = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    bulletPool: Phaser.Physics.Arcade.Group
  ) {
    super(scene, x, y, 'player');
    this.bulletPool = bulletPool;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDisplaySize(50, 60);
    this.setCollideWorldBounds(true);
    this.setBodySize(30, 40);

    this.cursors = scene.input.keyboard!.createCursorKeys();
    
    this.weaponKeys = [
      scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.THREE)
    ];

    this.formationKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.createWingmen();
  }

  private createWingmen(): void {
    this.wingmen.push(new Wingman(this.scene, this, -1, this.bulletPool));
    this.wingmen.push(new Wingman(this.scene, this, 1, this.bulletPool));
  }

  public update(time: number, delta: number): void {
    this.handleMovement(delta);
    this.handleWeaponSwitch();
    this.handleFormationSwitch(time);
    this.handleShooting(time);
    this.updateFuel(delta);
    this.updateInvincibility(delta);
    this.updateWingmen();

    if (this.fuel <= 0) {
      this.emit('playerDeath');
    }
  }

  private handleMovement(delta: number): void {
    const speed = PLAYER_CONFIG.speed;
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown) vx -= speed;
    if (this.cursors.right.isDown) vx += speed;
    if (this.cursors.up.isDown) vy -= speed;
    if (this.cursors.down.isDown) vy += speed;

    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    this.setVelocity(vx, vy);
  }

  private handleWeaponSwitch(): void {
    if (Phaser.Input.Keyboard.JustDown(this.weaponKeys[0])) {
      this.currentWeapon = 'machinegun';
    } else if (Phaser.Input.Keyboard.JustDown(this.weaponKeys[1])) {
      this.currentWeapon = 'torpedo';
    } else if (Phaser.Input.Keyboard.JustDown(this.weaponKeys[2])) {
      this.currentWeapon = 'rocket';
    }
  }

  private handleFormationSwitch(time: number): void {
    if (this.formationKey.isDown && time - this.lastFormationSwitch > 300) {
      this.formation = this.formation === 'focus' ? 'spread' : 'focus';
      this.lastFormationSwitch = time;
    }
  }

  private handleShooting(time: number): void {
    const weaponConfig = WEAPON_CONFIGS[this.currentWeapon];
    const fireRate = weaponConfig.fireRate / (1 + (this.weaponLevel - 1) * 0.2);

    this.isShooting = this.cursors.space?.isDown || false;

    if (this.isShooting && time - this.lastFireTime > fireRate) {
      this.fire();
      this.lastFireTime = time;
    }
  }

  public fire(): void {
    const weaponConfig = WEAPON_CONFIGS[this.currentWeapon];
    const bulletCount = Math.min(
      weaponConfig.bulletCount + Math.floor((this.weaponLevel - 1) / 2),
      8
    );
    const spread = weaponConfig.spread;

    for (let i = 0; i < bulletCount; i++) {
      const bullet = this.bulletPool.get() as Bullet;
      if (!bullet) continue;

      let offsetX = 0;
      let angle = -90;

      if (bulletCount > 1) {
        const spreadRange = spread * (bulletCount - 1);
        offsetX = -spreadRange / 2 + i * spread;
        angle = -90 + (i - (bulletCount - 1) / 2) * 5;
      }

      const radians = Phaser.Math.DegToRad(angle);
      const vx = Math.cos(radians) * weaponConfig.speed;
      const vy = Math.sin(radians) * weaponConfig.speed;

      bullet.fire(
        this.x + offsetX,
        this.y - 20,
        vx,
        vy,
        weaponConfig.damage * (1 + (this.weaponLevel - 1) * 0.3),
        true,
        this.currentWeapon
      );
    }

    if (this.currentWeapon === 'rocket') {
      this.scene.cameras.main.shake(100, 0.01);
    }
  }

  private updateFuel(delta: number): void {
    this.fuel -= PLAYER_CONFIG.fuelDecayRate * (delta / 16);
    this.fuel = Phaser.Math.Clamp(this.fuel, 0, this.maxFuel);
  }

  private updateInvincibility(delta: number): void {
    if (this.isInvincible) {
      this.invincibleTimer -= delta;
      this.alpha = this.invincibleTimer % 100 < 50 ? 0.5 : 1;

      if (this.invincibleTimer <= 0) {
        this.isInvincible = false;
        this.alpha = 1;
      }
    }
  }

  private updateWingmen(): void {
    this.wingmen.forEach((wingman) => wingman.update(this.formation, this.weaponLevel));
  }

  public takeDamage(amount: number): void {
    if (this.isInvincible) return;

    this.fuel -= amount;
    this.isInvincible = true;
    this.invincibleTimer = PLAYER_CONFIG.invincibleTime;

    this.scene.cameras.main.shake(200, 0.02);
    this.emit('playerHit');
  }

  public addFuel(amount: number): void {
    this.fuel = Phaser.Math.Clamp(this.fuel + amount, 0, this.maxFuel);
  }

  public addEnergyCapsule(color: string): void {
    this.energyCapsules[color]++;
    
    if (this.energyCapsules[color] >= 5) {
      this.energyCapsules[color] = 0;
      this.weaponLevel = Math.min(this.weaponLevel + 1, 5);
      this.emit('weaponUpgraded');
    }
  }

  public destroy(): void {
    this.wingmen.forEach((wingman) => wingman.destroy());
    super.destroy();
  }
}
