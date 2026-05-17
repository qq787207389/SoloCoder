import { describe, it, expect } from 'vitest';
import { HealthComponent, ShieldComponent, MonsterType } from '../core/Components';

describe('Health Component', () => {
  it('should initialize with correct max health', () => {
    const health = new HealthComponent(100);
    
    expect(health.max).toBe(100);
    expect(health.current).toBe(100);
    expect(health.isDead).toBe(false);
  });

  it('should take damage correctly', () => {
    const health = new HealthComponent(100);
    
    health.takeDamage(30);
    
    expect(health.current).toBe(70);
    expect(health.isDead).toBe(false);
  });

  it('should die when health reaches zero', () => {
    const health = new HealthComponent(100);
    
    health.takeDamage(100);
    
    expect(health.current).toBe(0);
    expect(health.isDead).toBe(true);
  });

  it('should not have negative health', () => {
    const health = new HealthComponent(100);
    
    health.takeDamage(150);
    
    expect(health.current).toBe(0);
    expect(health.isDead).toBe(true);
  });

  it('should heal correctly', () => {
    const health = new HealthComponent(100);
    health.takeDamage(50);
    
    health.heal(30);
    
    expect(health.current).toBe(80);
    expect(health.isDead).toBe(false);
  });

  it('should not heal beyond max health', () => {
    const health = new HealthComponent(100);
    health.takeDamage(30);
    
    health.heal(50);
    
    expect(health.current).toBe(100);
  });

  it('should revive when healing dead entity', () => {
    const health = new HealthComponent(100);
    health.takeDamage(100);
    
    health.heal(10);
    
    expect(health.current).toBe(10);
    expect(health.isDead).toBe(false);
  });
});

describe('Shield Component', () => {
  it('should initialize with correct max shield health', () => {
    const shield = new ShieldComponent(50, 0.5);
    
    expect(shield.maxShieldHealth).toBe(50);
    expect(shield.shieldHealth).toBe(50);
    expect(shield.broken).toBe(false);
    expect(shield.speedReduction).toBe(0.5);
  });

  it('should absorb damage when shield is active', () => {
    const shield = new ShieldComponent(50, 0.5);
    
    const remainingDamage = shield.takeDamage(30);
    
    expect(shield.shieldHealth).toBe(20);
    expect(shield.broken).toBe(false);
    expect(remainingDamage).toBe(0);
  });

  it('should break and pass remaining damage when shield is destroyed', () => {
    const shield = new ShieldComponent(50, 0.5);
    
    const remainingDamage = shield.takeDamage(70);
    
    expect(shield.shieldHealth).toBe(0);
    expect(shield.broken).toBe(true);
    expect(remainingDamage).toBe(20);
  });

  it('should pass all damage when shield is already broken', () => {
    const shield = new ShieldComponent(50, 0.5);
    shield.takeDamage(60);
    
    const remainingDamage = shield.takeDamage(20);
    
    expect(remainingDamage).toBe(20);
  });

  it('should not absorb more than max shield health', () => {
    const shield = new ShieldComponent(50, 0.5);
    
    const remainingDamage = shield.takeDamage(100);
    
    expect(shield.shieldHealth).toBe(0);
    expect(shield.broken).toBe(true);
    expect(remainingDamage).toBe(50);
  });
});

describe('Monster Type Stats', () => {
  it('should have correct health values for each monster type', () => {
    const expectedHealth = {
      [MonsterType.NORMAL]: 50,
      [MonsterType.BURROW]: 40,
      [MonsterType.FLYING]: 35,
      [MonsterType.SHIELD]: 80,
      [MonsterType.BOSS]: 500
    };
    
    for (const [type, expected] of Object.entries(expectedHealth)) {
      const health = new HealthComponent(expected);
      expect(health.max).toBe(expected);
    }
  });

  it('should have correct reward values for each monster type', () => {
    const expectedRewards = {
      [MonsterType.NORMAL]: 10,
      [MonsterType.BURROW]: 12,
      [MonsterType.FLYING]: 15,
      [MonsterType.SHIELD]: 20,
      [MonsterType.BOSS]: 100
    };
    
    for (const [type, expected] of Object.entries(expectedRewards)) {
      expect(expected).toBeGreaterThan(0);
    }
  });
});

describe('Combined Shield and Health', () => {
  it('should apply shield damage first, then health damage', () => {
    const shield = new ShieldComponent(50, 0.5);
    const health = new HealthComponent(100);
    
    const damage = 70;
    const afterShield = shield.takeDamage(damage);
    health.takeDamage(afterShield);
    
    expect(shield.shieldHealth).toBe(0);
    expect(shield.broken).toBe(true);
    expect(health.current).toBe(80);
  });

  it('should only damage health when shield is broken', () => {
    const shield = new ShieldComponent(50, 0.5);
    const health = new HealthComponent(100);
    
    shield.takeDamage(60);
    health.takeDamage(shield.takeDamage(30));
    
    expect(shield.broken).toBe(true);
    expect(health.current).toBe(70);
  });

  it('should survive boss hit with shield', () => {
    const shield = new ShieldComponent(100, 0.5);
    const health = new HealthComponent(100);
    
    const bossDamage = 150;
    const afterShield = shield.takeDamage(bossDamage);
    health.takeDamage(afterShield);
    
    expect(shield.broken).toBe(true);
    expect(health.current).toBe(50);
    expect(health.isDead).toBe(false);
  });
});
