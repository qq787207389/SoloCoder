import { Weapon, WeaponType, Vector2 } from '../types';
import { Bullet } from '../entities/Bullet';
import { normalize, vectorFromAngle, randomRange } from '../utils';

export class WeaponSystem {
  private weapons: Weapon[];
  private currentWeaponIndex: number;
  private secondaryCooldown: number;
  private secondaryMaxCooldown: number;

  constructor() {
    this.weapons = this.createInitialWeapons();
    this.currentWeaponIndex = 0;
    this.secondaryCooldown = 0;
    this.secondaryMaxCooldown = 2000;
  }

  private createInitialWeapons(): Weapon[] {
    return [
      {
        type: 'machinegun',
        name: 'Machine Gun',
        damage: 10,
        fireRate: 100,
        lastFired: 0,
        ammo: 999,
        maxAmmo: 999,
        spread: 0.05,
        projectileSpeed: 0.8,
        color: '#ffff00'
      },
      {
        type: 'grenade',
        name: 'Grenade Launcher',
        damage: 50,
        fireRate: 500,
        lastFired: 0,
        ammo: 30,
        maxAmmo: 30,
        spread: 0,
        projectileSpeed: 0.4,
        color: '#ff8800'
      },
      {
        type: 'flame',
        name: 'Flamethrower',
        damage: 5,
        fireRate: 50,
        lastFired: 0,
        ammo: 100,
        maxAmmo: 100,
        spread: 0.3,
        projectileSpeed: 0.3,
        color: '#ff4400'
      },
      {
        type: 'missile',
        name: 'Missile Launcher',
        damage: 80,
        fireRate: 1000,
        lastFired: 0,
        ammo: 10,
        maxAmmo: 10,
        spread: 0,
        projectileSpeed: 0.5,
        color: '#00ffff'
      }
    ];
  }

  public getCurrentWeapon(): Weapon {
    return this.weapons[this.currentWeaponIndex];
  }

  public switchWeapon(): void {
    this.currentWeaponIndex = (this.currentWeaponIndex + 1) % this.weapons.length;
  }

  public getWeapons(): Weapon[] {
    return this.weapons;
  }

  public addAmmo(type: WeaponType, amount: number): void {
    const weapon = this.weapons.find((w) => w.type === type);
    if (weapon) {
      weapon.ammo = Math.min(weapon.maxAmmo, weapon.ammo + amount);
    }
  }

  public fire(
    position: Vector2,
    direction: Vector2,
    isPlayer: boolean,
    currentTime: number
  ): Bullet | null {
    const weapon = this.getCurrentWeapon();

    if (currentTime - weapon.lastFired < weapon.fireRate) {
      return null;
    }

    if (weapon.type !== 'machinegun' && weapon.ammo <= 0) {
      return null;
    }

    weapon.lastFired = currentTime;
    if (weapon.type !== 'machinegun') {
      weapon.ammo--;
    }

    const spreadAngle = randomRange(-weapon.spread, weapon.spread);
    const baseAngle = Math.atan2(direction.y, direction.x);
    const finalAngle = baseAngle + spreadAngle;
    const velocity = vectorFromAngle(finalAngle, weapon.projectileSpeed);

    const bulletSize = weapon.type === 'grenade' ? 8 : weapon.type === 'missile' ? 10 : weapon.type === 'flame' ? 6 : 4;
    const lifetime = weapon.type === 'flame' ? 300 : weapon.type === 'grenade' ? 2000 : 3000;

    return new Bullet(
      { ...position },
      velocity,
      weapon.type,
      isPlayer,
      weapon.damage,
      bulletSize,
      lifetime
    );
  }

  public fireSecondary(
    position: Vector2,
    direction: Vector2,
    isPlayer: boolean,
    _currentTime: number
  ): Bullet | null {
    if (this.secondaryCooldown > 0) {
      return null;
    }

    this.secondaryCooldown = this.secondaryMaxCooldown;

    const vel = normalize(direction);
    return new Bullet(
      { ...position },
      { x: vel.x * 0.3, y: vel.y * 0.3 },
      'grenade',
      isPlayer,
      100,
      12,
      3000
    );
  }

  public update(deltaTime: number): void {
    if (this.secondaryCooldown > 0) {
      this.secondaryCooldown -= deltaTime;
      if (this.secondaryCooldown < 0) this.secondaryCooldown = 0;
    }
  }

  public getSecondaryCooldownPercent(): number {
    return this.secondaryCooldown / this.secondaryMaxCooldown;
  }

  public reset(): void {
    this.weapons = this.createInitialWeapons();
    this.currentWeaponIndex = 0;
    this.secondaryCooldown = 0;
  }
}
