import type { Fleet, Frigate, WeaponType } from '../types';

const FRIGATE_TEMPLATES: { name: string; hp: number; damage: number; accuracy: number; weaponType: WeaponType; price: number }[] = [
  { name: '侦察舰', hp: 50, damage: 15, accuracy: 0.85, weaponType: 'laser', price: 2000 },
  { name: '护卫舰', hp: 80, damage: 25, accuracy: 0.75, weaponType: 'missile', price: 3500 },
  { name: '驱逐舰', hp: 120, damage: 40, accuracy: 0.7, weaponType: 'railgun', price: 5000 }
];

export function createInitialFleet(startingPlanetId: string): Fleet {
  return {
    credits: 5000,
    mothership: {
      hp: 100,
      maxHp: 100,
      cargoCapacity: 100,
      cargo: [],
      shield: {
        id: 'shield',
        name: '护盾',
        level: 1,
        maxLevel: 5,
        upgradeCost: 1500
      },
      engine: {
        id: 'engine',
        name: '引擎',
        level: 1,
        maxLevel: 5,
        upgradeCost: 1200
      },
      weapon: {
        id: 'weapon',
        name: '武器',
        level: 1,
        maxLevel: 5,
        upgradeCost: 2000
      }
    },
    frigates: [],
    formation: 'balanced',
    currentPlanetId: startingPlanetId,
    travelProgress: 0
  };
}

export function getFrigateTemplate(index: number) {
  return FRIGATE_TEMPLATES[index];
}

export function createFrigate(templateIndex: number): Frigate {
  const template = FRIGATE_TEMPLATES[templateIndex];
  return {
    id: `frigate-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: template.name,
    hp: template.hp,
    maxHp: template.hp,
    damage: template.damage,
    accuracy: template.accuracy,
    weaponType: template.weaponType
  };
}

export function getFrigatePrice(templateIndex: number): number {
  return FRIGATE_TEMPLATES[templateIndex].price;
}

export function getUpgradeCost(component: { level: number; upgradeCost: number }): number {
  return Math.round(component.upgradeCost * Math.pow(1.5, component.level - 1));
}

export function getCargoCapacity(engineLevel: number): number {
  return 100 + (engineLevel - 1) * 50;
}

export function getTravelSpeed(engineLevel: number): number {
  return 1 + (engineLevel - 1) * 0.3;
}

export function getShieldStrength(shieldLevel: number): number {
  return 20 + (shieldLevel - 1) * 15;
}

export function getWeaponDamage(weaponLevel: number): number {
  return 30 + (weaponLevel - 1) * 20;
}
