import { Entity } from '../core/Entity';
import { PhysicsEngine } from '../core/Physics';
import { InputManager } from '../core/Input';
import { Renderer } from '../core/Renderer';
import {
  PLAYER_SPEED,
  JUMP_FORCE,
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  INVINCIBLE_TIME,
  BASE_MAX_HEALTH,
  BASE_MAX_ENERGY,
  ENERGY_REGEN,
  OVERLOAD_MAX,
  OVERLOAD_PER_KILL,
  WEAPON_CONFIGS
} from '../utils/constants';
import { ElementType, PlayerState, Platform, ELEMENT_COLORS, Particle } from '../utils/types';

export class Player extends Entity {
  private input: InputManager;
  private shootCooldown: number = 0;
  private animFrame: number = 0;
  private animTimer: number = 0;

  constructor(x: number, y: number, input: InputManager) {
    super(x, y, PLAYER_WIDTH, PLAYER_HEIGHT, BASE_MAX_HEALTH);
    this.input = input;
    (this.state as PlayerState) = {
      ...this.state,
      energy: BASE_MAX_ENERGY,
      maxEnergy: BASE_MAX_ENERGY,
      gears: 0,
      overload: 0,
      currentWeapon: ElementType.NEUTRAL,
      unlockedWeapons: [ElementType.NEUTRAL],
      isJumping: false,
      isShooting: false,
      isGrounded: false,
      facingRight: true,
      chargeTime: 0,
      healthUpgrades: 0,
      energyUpgrades: 0,
      chargeUpgrades: 0
    };
  }

  public getPlayerState(): PlayerState {
    return this.state as PlayerState;
  }

  public update(_deltaTime: number, platforms: Platform[]): void {
    const state = this.state as PlayerState;
    
    this.handleInput();
    this.updateShootCooldown();
    
    state.energy = Math.min(state.maxEnergy, state.energy + ENERGY_REGEN);
    
    PhysicsEngine.applyGravity(state.velocity);
    
    const result = PhysicsEngine.resolveCollision(
      state.position,
      state.velocity,
      { width: state.width, height: state.height },
      platforms
    );
    
    state.position = result.newPosition;
    state.velocity = result.newVelocity;
    state.isGrounded = result.grounded;
    
    if (state.isGrounded) {
      state.isJumping = false;
    }

    if (PhysicsEngine.checkSpikeCollision(
      { x: state.position.x, y: state.position.y, width: state.width, height: state.height },
      platforms
    )) {
      this.takeDamage(20);
    }

    this.updateInvincibility();
    this.updateAnimation();
  }

  private handleInput(): void {
    const state = this.state as PlayerState;

    if (this.input.isKeyHeld('LEFT')) {
      state.velocity.x = -PLAYER_SPEED;
      state.facingRight = false;
    } else if (this.input.isKeyHeld('RIGHT')) {
      state.velocity.x = PLAYER_SPEED;
      state.facingRight = true;
    } else {
      state.velocity.x = 0;
    }

    if (this.input.isKeyPressed('JUMP') && state.isGrounded) {
      state.velocity.y = JUMP_FORCE;
      state.isJumping = true;
      state.isGrounded = false;
    }

    if (this.input.isKeyHeld('SHOOT')) {
      state.isShooting = true;
    } else {
      state.isShooting = false;
      state.chargeTime = 0;
    }

    this.handleWeaponSwitch();

    if (this.input.isKeyPressed('OVERLOAD') && state.overload >= OVERLOAD_MAX) {
      this.triggerOverload();
    }
  }

  private handleWeaponSwitch(): void {
    const state = this.state as PlayerState;
    const weapons = Object.values(ElementType).filter(e => e !== ElementType.NEUTRAL);
    
    for (let i = 0; i < 8; i++) {
      if (this.input.isKeyPressed(`WEAPON_${i + 1}`)) {
        const weapon = weapons[i];
        if (state.unlockedWeapons.includes(weapon)) {
          state.currentWeapon = weapon;
        }
      }
    }
  }

  private updateShootCooldown(): void {
    if (this.shootCooldown > 0) {
      this.shootCooldown--;
    }
  }

  public canShoot(): boolean {
    const state = this.state as PlayerState;
    const config = WEAPON_CONFIGS[state.currentWeapon];
    return this.shootCooldown <= 0 && state.energy >= config.energyCost;
  }

  public isShooting(): boolean {
    return (this.state as PlayerState).isShooting;
  }

  public shoot(): { element: ElementType; x: number; y: number; vx: number; vy: number; damage: number } | null {
    if (!this.canShoot()) return null;

    const state = this.state as PlayerState;
    const config = WEAPON_CONFIGS[state.currentWeapon];
    
    state.energy -= config.energyCost;
    this.shootCooldown = config.cooldown;

    return {
      element: state.currentWeapon,
      x: state.position.x + (state.facingRight ? state.width : -config.projectileSize.x),
      y: state.position.y + state.height / 2 - config.projectileSize.y / 2,
      vx: state.facingRight ? config.projectileSpeed : -config.projectileSpeed,
      vy: 0,
      damage: config.damage
    };
  }

  public takeDamage(damage: number): void {
    if (this.state.isInvincible) return;
    
    this.state.health -= damage;
    this.state.isInvincible = true;
    this.state.invincibleTimer = INVINCIBLE_TIME;
    
    if (this.state.health <= 0) {
      this.state.health = 0;
      this.state.isActive = false;
    }
  }

  public addGears(amount: number): void {
    (this.state as PlayerState).gears += amount;
  }

  public addOverload(amount: number = OVERLOAD_PER_KILL): void {
    const state = this.state as PlayerState;
    state.overload = Math.min(OVERLOAD_MAX, state.overload + amount);
  }

  private triggerOverload(): void {
    (this.state as PlayerState).overload = 0;
  }

  public unlockWeapon(element: ElementType): void {
    const state = this.state as PlayerState;
    if (!state.unlockedWeapons.includes(element)) {
      state.unlockedWeapons.push(element);
    }
  }

  public hasWeapon(element: ElementType): boolean {
    return (this.state as PlayerState).unlockedWeapons.includes(element);
  }

  public setCurrentWeapon(element: ElementType): void {
    if (this.hasWeapon(element)) {
      (this.state as PlayerState).currentWeapon = element;
    }
  }

  public upgradeHealth(): void {
    const state = this.state as PlayerState;
    state.healthUpgrades++;
    state.maxHealth += 20;
    state.health = state.maxHealth;
  }

  public upgradeEnergy(): void {
    const state = this.state as PlayerState;
    state.energyUpgrades++;
    state.maxEnergy += 20;
    state.energy = state.maxEnergy;
  }

  public reset(x: number, y: number): void {
    const state = this.state as PlayerState;
    state.position = { x, y };
    state.velocity = { x: 0, y: 0 };
    state.health = state.maxHealth;
    state.energy = state.maxEnergy;
    state.isActive = true;
    state.isInvincible = false;
    state.isJumping = false;
    state.isGrounded = false;
    state.currentWeapon = ElementType.NEUTRAL;
  }

  private updateAnimation(): void {
    this.animTimer++;
    if (this.animTimer >= 8) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 4;
    }
  }

  public render(renderer: Renderer): void {
    const state = this.state as PlayerState;
    
    if (state.isInvincible && Math.floor(state.invincibleTimer / 4) % 2 === 0) {
      return;
    }

    const color = ELEMENT_COLORS[state.currentWeapon];
    const bodyColors = ['#4488FF', '#2255CC', '#003399', color];
    
    const sprite = this.getPlayerSprite();
    renderer.drawSprite(
      state.position.x,
      state.position.y,
      state.width,
      state.height,
      sprite,
      bodyColors,
      !state.facingRight
    );
  }

  private getPlayerSprite(): number[][] {
    const state = this.state as PlayerState;
    
    if (!state.isGrounded) {
      return [
        [-1, -1, 0, 0, 0, 0, -1, -1],
        [-1, 0, 0, 1, 1, 0, 0, -1],
        [-1, 0, 3, 1, 1, 3, 0, -1],
        [-1, -1, 0, 0, 0, 0, -1, -1],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 0, 0, 1, 1, 0],
        [-1, 0, 0, 1, 1, 0, 0, -1],
        [-1, -1, 2, -1, -1, 2, -1, -1]
      ];
    }
    
    if (Math.abs(state.velocity.x) > 0) {
      const walkFrames = [
        [
          [-1, -1, 0, 0, 0, 0, -1, -1],
          [-1, 0, 0, 1, 1, 0, 0, -1],
          [-1, 0, 3, 1, 1, 3, 0, -1],
          [-1, -1, 0, 0, 0, 0, -1, -1],
          [0, 0, 0, 0, 0, 0, 0, 0],
          [-1, 0, 0, 1, 1, 0, 0, -1],
          [-1, 1, 1, -1, -1, 2, 2, -1],
          [2, 2, -1, -1, -1, -1, -1, -1]
        ],
        [
          [-1, -1, 0, 0, 0, 0, -1, -1],
          [-1, 0, 0, 1, 1, 0, 0, -1],
          [-1, 0, 3, 1, 1, 3, 0, -1],
          [-1, -1, 0, 0, 0, 0, -1, -1],
          [0, 0, 0, 0, 0, 0, 0, 0],
          [-1, 0, 0, 1, 1, 0, 0, -1],
          [-1, 2, 2, -1, -1, 2, 2, -1],
          [-1, -1, -1, -1, -1, -1, -1, -1]
        ],
        [
          [-1, -1, 0, 0, 0, 0, -1, -1],
          [-1, 0, 0, 1, 1, 0, 0, -1],
          [-1, 0, 3, 1, 1, 3, 0, -1],
          [-1, -1, 0, 0, 0, 0, -1, -1],
          [0, 0, 0, 0, 0, 0, 0, 0],
          [-1, 0, 0, 1, 1, 0, 0, -1],
          [-1, 2, 2, -1, -1, 1, 1, -1],
          [-1, -1, -1, -1, -1, -1, 2, 2]
        ]
      ];
      return walkFrames[this.animFrame % 3];
    }

    return [
      [-1, -1, 0, 0, 0, 0, -1, -1],
      [-1, 0, 0, 1, 1, 0, 0, -1],
      [-1, 0, 3, 1, 1, 3, 0, -1],
      [-1, -1, 0, 0, 0, 0, -1, -1],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [-1, 0, 0, 1, 1, 0, 0, -1],
      [-1, 2, 2, -1, -1, 2, 2, -1],
      [-1, -1, -1, -1, -1, -1, -1, -1]
    ];
  }

  public createOverloadParticles(): Particle[] {
    const particles: Particle[] = [];
    const state = this.state as PlayerState;
    
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: state.position.x + state.width / 2,
        y: state.position.y + state.height / 2,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() - 0.5) * 20,
        color: ELEMENT_COLORS[state.currentWeapon],
        size: Math.random() * 6 + 2,
        lifetime: 60,
        maxLifetime: 60
      });
    }
    
    return particles;
  }
}
