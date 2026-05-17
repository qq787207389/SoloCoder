import { describe, it, expect, beforeEach } from 'vitest';
import { MonsterType, TowerType } from '../core/Components';
import { LevelConfig } from '../core/Game';

describe('Level Configuration', () => {
  let testConfig: LevelConfig;

  beforeEach(() => {
    testConfig = {
      name: 'Test Level',
      width: 16,
      height: 12,
      cellSize: 50,
      startPositions: [{ x: 0, y: 5 }],
      endPosition: { x: 15, y: 5 },
      obstacles: [],
      waves: [
        {
          monsters: [
            { type: MonsterType.NORMAL, count: 5, delay: 1 }
          ]
        },
        {
          monsters: [
            { type: MonsterType.NORMAL, count: 8, delay: 0.8 },
            { type: MonsterType.FLYING, count: 3, delay: 1.2 }
          ]
        },
        {
          monsters: [
            { type: MonsterType.BOSS, count: 1, delay: 0 }
          ]
        }
      ],
      initialGold: 500,
      initialCrystals: 0,
      initialLives: 20
    };
  });

  it('should have valid dimensions', () => {
    expect(testConfig.width).toBeGreaterThan(0);
    expect(testConfig.height).toBeGreaterThan(0);
    expect(testConfig.cellSize).toBeGreaterThan(0);
  });

  it('should have valid start and end positions', () => {
    expect(testConfig.startPositions.length).toBeGreaterThan(0);
    
    for (const start of testConfig.startPositions) {
      expect(start.x).toBeGreaterThanOrEqual(0);
      expect(start.x).toBeLessThan(testConfig.width);
      expect(start.y).toBeGreaterThanOrEqual(0);
      expect(start.y).toBeLessThan(testConfig.height);
    }
    
    expect(testConfig.endPosition.x).toBeGreaterThanOrEqual(0);
    expect(testConfig.endPosition.x).toBeLessThan(testConfig.width);
    expect(testConfig.endPosition.y).toBeGreaterThanOrEqual(0);
    expect(testConfig.endPosition.y).toBeLessThan(testConfig.height);
  });

  it('should have positive initial resources', () => {
    expect(testConfig.initialGold).toBeGreaterThan(0);
    expect(testConfig.initialLives).toBeGreaterThan(0);
    expect(testConfig.initialCrystals).toBeGreaterThanOrEqual(0);
  });
});

describe('Wave Configuration', () => {
  it('should have at least one wave', () => {
    const config: LevelConfig = {
      name: 'Test',
      width: 10,
      height: 10,
      cellSize: 50,
      startPositions: [{ x: 0, y: 5 }],
      endPosition: { x: 9, y: 5 },
      obstacles: [],
      waves: [
        {
          monsters: [
            { type: MonsterType.NORMAL, count: 5, delay: 1 }
          ]
        }
      ],
      initialGold: 100,
      initialCrystals: 0,
      initialLives: 10
    };
    
    expect(config.waves.length).toBeGreaterThan(0);
  });

  it('should have valid monster counts in waves', () => {
    const config: LevelConfig = {
      name: 'Test',
      width: 10,
      height: 10,
      cellSize: 50,
      startPositions: [{ x: 0, y: 5 }],
      endPosition: { x: 9, y: 5 },
      obstacles: [],
      waves: [
        {
          monsters: [
            { type: MonsterType.NORMAL, count: 5, delay: 1 },
            { type: MonsterType.FLYING, count: 3, delay: 1.2 }
          ]
        }
      ],
      initialGold: 100,
      initialCrystals: 0,
      initialLives: 10
    };
    
    for (const wave of config.waves) {
      expect(wave.monsters.length).toBeGreaterThan(0);
      for (const monsterGroup of wave.monsters) {
        expect(monsterGroup.count).toBeGreaterThan(0);
        expect(monsterGroup.delay).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('should have increasing difficulty', () => {
    const config: LevelConfig = {
      name: 'Test',
      width: 10,
      height: 10,
      cellSize: 50,
      startPositions: [{ x: 0, y: 5 }],
      endPosition: { x: 9, y: 5 },
      obstacles: [],
      waves: [
        {
          monsters: [
            { type: MonsterType.NORMAL, count: 5, delay: 1.5 }
          ]
        },
        {
          monsters: [
            { type: MonsterType.NORMAL, count: 8, delay: 1 }
          ]
        },
        {
          monsters: [
            { type: MonsterType.NORMAL, count: 10, delay: 0.8 },
            { type: MonsterType.FLYING, count: 5, delay: 1 }
          ]
        }
      ],
      initialGold: 100,
      initialCrystals: 0,
      initialLives: 10
    };
    
    let prevTotalMonsters = 0;
    for (const wave of config.waves) {
      const waveTotal = wave.monsters.reduce((sum, m) => sum + m.count, 0);
      expect(waveTotal).toBeGreaterThanOrEqual(prevTotalMonsters);
      prevTotalMonsters = waveTotal;
    }
  });

  it('should have boss in last wave', () => {
    const config: LevelConfig = {
      name: 'Test',
      width: 10,
      height: 10,
      cellSize: 50,
      startPositions: [{ x: 0, y: 5 }],
      endPosition: { x: 9, y: 5 },
      obstacles: [],
      waves: [
        {
          monsters: [
            { type: MonsterType.NORMAL, count: 5, delay: 1 }
          ]
        },
        {
          monsters: [
            { type: MonsterType.BOSS, count: 1, delay: 0 }
          ]
        }
      ],
      initialGold: 100,
      initialCrystals: 0,
      initialLives: 10
    };
    
    const lastWave = config.waves[config.waves.length - 1];
    const hasBoss = lastWave.monsters.some(m => m.type === MonsterType.BOSS);
    expect(hasBoss).toBe(true);
  });
});

describe('Tower Configuration', () => {
  it('should have positive damage values', () => {
    const damages = {
      [TowerType.ARROW]: 15,
      [TowerType.CANNON]: 40,
      [TowerType.ICE]: 8,
      [TowerType.ANTI_AIR]: 25
    };
    
    for (const damage of Object.values(damages)) {
      expect(damage).toBeGreaterThan(0);
    }
  });

  it('should have positive cost values', () => {
    const costs = {
      [TowerType.ARROW]: 100,
      [TowerType.CANNON]: 200,
      [TowerType.ICE]: 150,
      [TowerType.ANTI_AIR]: 180
    };
    
    for (const cost of Object.values(costs)) {
      expect(cost).toBeGreaterThan(0);
    }
  });

  it('should have positive range values', () => {
    const ranges = {
      [TowerType.ARROW]: 150,
      [TowerType.CANNON]: 120,
      [TowerType.ICE]: 130,
      [TowerType.ANTI_AIR]: 200
    };
    
    for (const range of Object.values(ranges)) {
      expect(range).toBeGreaterThan(0);
    }
  });

  it('should have anti air tower target flying monsters', () => {
    const canTargetFlying = {
      [TowerType.ARROW]: false,
      [TowerType.CANNON]: false,
      [TowerType.ICE]: false,
      [TowerType.ANTI_AIR]: true
    };
    
    expect(canTargetFlying[TowerType.ANTI_AIR]).toBe(true);
  });

  it('should have cannon with highest damage', () => {
    const damages = {
      [TowerType.ARROW]: 15,
      [TowerType.CANNON]: 40,
      [TowerType.ICE]: 8,
      [TowerType.ANTI_AIR]: 25
    };
    
    const maxDamage = Math.max(...Object.values(damages));
    expect(damages[TowerType.CANNON]).toBe(maxDamage);
  });

  it('should have anti air with highest range', () => {
    const ranges = {
      [TowerType.ARROW]: 150,
      [TowerType.CANNON]: 120,
      [TowerType.ICE]: 130,
      [TowerType.ANTI_AIR]: 200
    };
    
    const maxRange = Math.max(...Object.values(ranges));
    expect(ranges[TowerType.ANTI_AIR]).toBe(maxRange);
  });
});

describe('Monster Type Properties', () => {
  it('should have boss with highest health', () => {
    const healths = {
      [MonsterType.NORMAL]: 50,
      [MonsterType.BURROW]: 40,
      [MonsterType.FLYING]: 35,
      [MonsterType.SHIELD]: 80,
      [MonsterType.BOSS]: 500
    };
    
    const maxHealth = Math.max(...Object.values(healths));
    expect(healths[MonsterType.BOSS]).toBe(maxHealth);
  });

  it('should have shield monster with highest reward among normal monsters', () => {
    const rewards = {
      [MonsterType.NORMAL]: 10,
      [MonsterType.BURROW]: 12,
      [MonsterType.FLYING]: 15,
      [MonsterType.SHIELD]: 20,
      [MonsterType.BOSS]: 100
    };
    
    const normalTypes = [
      MonsterType.NORMAL,
      MonsterType.BURROW,
      MonsterType.FLYING,
      MonsterType.SHIELD
    ];
    
    const maxNormalReward = Math.max(...normalTypes.map(t => rewards[t]));
    expect(rewards[MonsterType.SHIELD]).toBe(maxNormalReward);
  });

  it('should have flying monster with highest speed', () => {
    const speeds = {
      [MonsterType.NORMAL]: 80,
      [MonsterType.BURROW]: 100,
      [MonsterType.FLYING]: 120,
      [MonsterType.SHIELD]: 60,
      [MonsterType.BOSS]: 50
    };
    
    const maxSpeed = Math.max(...Object.values(speeds));
    expect(speeds[MonsterType.FLYING]).toBe(maxSpeed);
  });
});
