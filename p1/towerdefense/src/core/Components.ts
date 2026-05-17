import { Component } from './ECS';

export const COMPONENT_TYPES = {
  POSITION: 'Position',
  VELOCITY: 'Velocity',
  HEALTH: 'Health',
  RENDER: 'Render',
  PATH_FOLLOWING: 'PathFollowing',
  MONSTER: 'Monster',
  TOWER: 'Tower',
  ATTACK: 'Attack',
  PROJECTILE: 'Projectile',
  PARTICLE: 'Particle',
  COLLIDER: 'Collider',
  OBSTACLE: 'Obstacle',
  CARROT: 'Carrot',
  SKILL: 'Skill',
  SHIELD: 'Shield',
  BURROW: 'Burrow',
  FLYING: 'Flying',
  BOSS: 'Boss',
  FUSION: 'Fusion',
  TRAP: 'Trap'
} as const;

export class PositionComponent implements Component {
  type = COMPONENT_TYPES.POSITION;
  x: number;
  y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }
}

export class VelocityComponent implements Component {
  type = COMPONENT_TYPES.VELOCITY;
  vx: number;
  vy: number;
  speed: number;

  constructor(speed: number = 100) {
    this.vx = 0;
    this.vy = 0;
    this.speed = speed;
  }
}

export class HealthComponent implements Component {
  type = COMPONENT_TYPES.HEALTH;
  current: number;
  max: number;
  isDead: boolean;

  constructor(max: number = 100) {
    this.max = max;
    this.current = max;
    this.isDead = false;
  }

  takeDamage(amount: number): void {
    this.current = Math.max(0, this.current - amount);
    if (this.current <= 0) {
      this.isDead = true;
    }
  }

  heal(amount: number): void {
    this.current = Math.min(this.max, this.current + amount);
    this.isDead = false;
  }
}

export class RenderComponent implements Component {
  type = COMPONENT_TYPES.RENDER;
  color: string;
  radius: number;
  visible: boolean;

  constructor(color: string = '#ffffff', radius: number = 10) {
    this.color = color;
    this.radius = radius;
    this.visible = true;
  }
}

export class PathFollowingComponent implements Component {
  type = COMPONENT_TYPES.PATH_FOLLOWING;
  path: { x: number; y: number }[];
  currentIndex: number;
  reachedEnd: boolean;

  constructor(path: { x: number; y: number }[] = []) {
    this.path = path;
    this.currentIndex = 0;
    this.reachedEnd = false;
  }
}

export enum MonsterType {
  NORMAL = 'normal',
  BURROW = 'burrow',
  FLYING = 'flying',
  SHIELD = 'shield',
  BOSS = 'boss'
}

export class MonsterComponent implements Component {
  type = COMPONENT_TYPES.MONSTER;
  monsterType: MonsterType;
  reward: number;
  crystalReward: number;
  isElite: boolean;

  constructor(monsterType: MonsterType = MonsterType.NORMAL, reward: number = 10, crystalReward: number = 0, isElite: boolean = false) {
    this.monsterType = monsterType;
    this.reward = reward;
    this.crystalReward = crystalReward;
    this.isElite = isElite;
  }
}

export enum TowerType {
  ARROW = 'arrow',
  CANNON = 'cannon',
  ICE = 'ice',
  LASER = 'laser',
  ANTI_AIR = 'anti_air',
  FUSED = 'fused'
}

export class TowerComponent implements Component {
  type = COMPONENT_TYPES.TOWER;
  towerType: TowerType;
  level: number;
  maxLevel: number;
  range: number;
  fireRate: number;
  lastFireTime: number;
  cost: number;
  canTargetFlying: boolean;

  constructor(towerType: TowerType = TowerType.ARROW, level: number = 1, maxLevel: number = 3) {
    this.towerType = towerType;
    this.level = level;
    this.maxLevel = maxLevel;
    this.range = 150;
    this.fireRate = 1;
    this.lastFireTime = 0;
    this.cost = 100;
    this.canTargetFlying = false;
  }
}

export class AttackComponent implements Component {
  type = COMPONENT_TYPES.ATTACK;
  damage: number;
  range: number;
  cooldown: number;
  lastAttackTime: number;
  targetId: number | null;
  effects: string[];

  constructor(damage: number = 10, range: number = 100, cooldown: number = 1) {
    this.damage = damage;
    this.range = range;
    this.cooldown = cooldown;
    this.lastAttackTime = 0;
    this.targetId = null;
    this.effects = [];
  }
}

export class ProjectileComponent implements Component {
  type = COMPONENT_TYPES.PROJECTILE;
  targetId: number;
  damage: number;
  speed: number;
  effects: string[];

  constructor(targetId: number, damage: number = 10, speed: number = 500) {
    this.targetId = targetId;
    this.damage = damage;
    this.speed = speed;
    this.effects = [];
  }
}

export class ParticleComponent implements Component {
  type = COMPONENT_TYPES.PARTICLE;
  lifetime: number;
  maxLifetime: number;
  startColor: string;
  endColor: string;
  startSize: number;
  endSize: number;
  velocityX: number;
  velocityY: number;

  constructor(lifetime: number = 1, startColor: string = '#ffffff', endColor: string = '#000000', startSize: number = 5, endSize: number = 1) {
    this.lifetime = lifetime;
    this.maxLifetime = lifetime;
    this.startColor = startColor;
    this.endColor = endColor;
    this.startSize = startSize;
    this.endSize = endSize;
    this.velocityX = 0;
    this.velocityY = 0;
  }
}

export class ColliderComponent implements Component {
  type = COMPONENT_TYPES.COLLIDER;
  radius: number;
  isTrigger: boolean;
  layer: string;

  constructor(radius: number = 10, isTrigger: boolean = false, layer: string = 'default') {
    this.radius = radius;
    this.isTrigger = isTrigger;
    this.layer = layer;
  }
}

export class ObstacleComponent implements Component {
  type = COMPONENT_TYPES.OBSTACLE;
  health: number;
  maxHealth: number;
  destructible: boolean;
  blocksPath: boolean;
  hiddenTrap: string | null;

  constructor(health: number = 100, destructible: boolean = true, blocksPath: boolean = true) {
    this.health = health;
    this.maxHealth = health;
    this.destructible = destructible;
    this.blocksPath = blocksPath;
    this.hiddenTrap = null;
  }
}

export class CarrotComponent implements Component {
  type = COMPONENT_TYPES.CARROT;
  health: number;
  maxHealth: number;
  invincible: boolean;

  constructor(maxHealth: number = 20) {
    this.maxHealth = maxHealth;
    this.health = maxHealth;
    this.invincible = false;
  }
}

export class ShieldComponent implements Component {
  type = COMPONENT_TYPES.SHIELD;
  shieldHealth: number;
  maxShieldHealth: number;
  broken: boolean;
  speedReduction: number;

  constructor(maxShieldHealth: number = 50, speedReduction: number = 0.5) {
    this.maxShieldHealth = maxShieldHealth;
    this.shieldHealth = maxShieldHealth;
    this.broken = false;
    this.speedReduction = speedReduction;
  }

  takeDamage(amount: number): number {
    if (this.broken) return amount;
    const absorbed = Math.min(this.shieldHealth, amount);
    this.shieldHealth -= absorbed;
    if (this.shieldHealth <= 0) {
      this.broken = true;
    }
    return amount - absorbed;
  }
}

export class BurrowComponent implements Component {
  type = COMPONENT_TYPES.BURROW;
  isUnderground: boolean;
  undergroundSpeedMultiplier: number;
  emergeTime: number;
  emergeDuration: number;

  constructor() {
    this.isUnderground = false;
    this.undergroundSpeedMultiplier = 0.5;
    this.emergeTime = 0;
    this.emergeDuration = 0.5;
  }
}

export class FlyingComponent implements Component {
  type = COMPONENT_TYPES.FLYING;
  altitude: number;
  bobAmplitude: number;
  bobFrequency: number;
  bobPhase: number;

  constructor() {
    this.altitude = 30;
    this.bobAmplitude = 5;
    this.bobFrequency = 2;
    this.bobPhase = Math.random() * Math.PI * 2;
  }
}

export class BossComponent implements Component {
  type = COMPONENT_TYPES.BOSS;
  phase: number;
  maxPhases: number;
  phaseThresholds: number[];
  specialAbilityCooldown: number;
  lastSpecialAbilityTime: number;
  currentAbility: string | null;

  constructor(maxPhases: number = 3) {
    this.phase = 1;
    this.maxPhases = maxPhases;
    this.phaseThresholds = [0.66, 0.33, 0];
    this.specialAbilityCooldown = 10;
    this.lastSpecialAbilityTime = 0;
    this.currentAbility = null;
  }
}

export class FusionComponent implements Component {
  type = COMPONENT_TYPES.FUSION;
  isFused: boolean;
  fusionTypes: TowerType[];
  soulStoneCost: number;

  constructor() {
    this.isFused = false;
    this.fusionTypes = [];
    this.soulStoneCost = 5;
  }
}

export class TrapComponent implements Component {
  type = COMPONENT_TYPES.TRAP;
  trapType: string;
  active: boolean;
  cooldown: number;
  lastTriggerTime: number;
  effect: string;
  cost: number;

  constructor(trapType: string = 'spike', cost: number = 50) {
    this.trapType = trapType;
    this.active = false;
    this.cooldown = 3;
    this.lastTriggerTime = 0;
    this.effect = 'damage';
    this.cost = cost;
  }
}
