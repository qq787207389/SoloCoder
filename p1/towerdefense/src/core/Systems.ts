import { System, Entity } from './ECS';
import { COMPONENT_TYPES, PositionComponent, VelocityComponent, RenderComponent, PathFollowingComponent, HealthComponent, ProjectileComponent, ParticleComponent, MonsterComponent, TowerComponent, AttackComponent, ShieldComponent, BurrowComponent, FlyingComponent, BossComponent, CarrotComponent, MonsterType, TowerType } from './Components';
import { Game } from './Game';

export class MovementSystem extends System {
  constructor() {
    super([COMPONENT_TYPES.POSITION, COMPONENT_TYPES.VELOCITY]);
  }

  update(entities: Entity[], deltaTime: number): void {
    for (const entity of entities) {
      const pos = entity.getComponent<PositionComponent>(COMPONENT_TYPES.POSITION);
      const vel = entity.getComponent<VelocityComponent>(COMPONENT_TYPES.VELOCITY);
      
      if (!pos || !vel) {
        continue;
      }
      
      pos.x += vel.vx * deltaTime;
      pos.y += vel.vy * deltaTime;
    }
  }
}

export class PathFollowingSystem extends System {
  constructor() {
    super([COMPONENT_TYPES.POSITION, COMPONENT_TYPES.VELOCITY, COMPONENT_TYPES.PATH_FOLLOWING]);
  }

  update(entities: Entity[], deltaTime: number): void {
    for (const entity of entities) {
      const pos = entity.getComponent<PositionComponent>(COMPONENT_TYPES.POSITION);
      const vel = entity.getComponent<VelocityComponent>(COMPONENT_TYPES.VELOCITY);
      const pathFollow = entity.getComponent<PathFollowingComponent>(COMPONENT_TYPES.PATH_FOLLOWING);

      if (!pos || !vel || !pathFollow) {
        continue;
      }

      if (pathFollow.reachedEnd || pathFollow.path.length === 0) {
        vel.vx = 0;
        vel.vy = 0;
        continue;
      }

      let speed = vel.speed;
      
      const burrow = entity.getComponent<BurrowComponent>(COMPONENT_TYPES.BURROW);
      if (burrow && burrow.isUnderground) {
        speed *= burrow.undergroundSpeedMultiplier;
      }

      const shield = entity.getComponent<ShieldComponent>(COMPONENT_TYPES.SHIELD);
      if (shield && !shield.broken) {
        speed *= shield.speedReduction;
      }

      const target = pathFollow.path[pathFollow.currentIndex];
      const dx = target.x - pos.x;
      const dy = target.y - pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const moveDistance = speed * deltaTime;

      if (dist <= moveDistance) {
        pos.x = target.x;
        pos.y = target.y;
        vel.vx = 0;
        vel.vy = 0;
        
        pathFollow.currentIndex++;
        if (pathFollow.currentIndex >= pathFollow.path.length) {
          pathFollow.reachedEnd = true;
        }
      } else {
        vel.vx = (dx / dist) * speed;
        vel.vy = (dy / dist) * speed;
      }
    }
  }
}

export class ProjectileSystem extends System {
  private game: Game;

  constructor(game: Game) {
    super([COMPONENT_TYPES.POSITION, COMPONENT_TYPES.VELOCITY, COMPONENT_TYPES.PROJECTILE]);
    this.game = game;
  }

  update(entities: Entity[], deltaTime: number): void {
    for (const entity of entities) {
      const pos = entity.getComponent<PositionComponent>(COMPONENT_TYPES.POSITION);
      const vel = entity.getComponent<VelocityComponent>(COMPONENT_TYPES.VELOCITY);
      const projectile = entity.getComponent<ProjectileComponent>(COMPONENT_TYPES.PROJECTILE);

      if (!pos || !vel || !projectile) {
        continue;
      }

      const target = this.game.ecs.entityManager.getEntity(projectile.targetId);
      
      if (!target) {
        this.game.ecs.entityManager.removeEntity(entity.id);
        continue;
      }

      const targetPos = target.getComponent<PositionComponent>(COMPONENT_TYPES.POSITION);
      const targetHealth = target.getComponent<HealthComponent>(COMPONENT_TYPES.HEALTH);

      if (!targetPos || !targetHealth || targetHealth.isDead) {
        this.game.ecs.entityManager.removeEntity(entity.id);
        continue;
      }

      const dx = targetPos.x - pos.x;
      const dy = targetPos.y - pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 10) {
        targetHealth.takeDamage(projectile.damage);
        
        for (let i = 0; i < 5; i++) {
          this.game.effectSystem.spawnHitEffect(targetPos.x, targetPos.y);
        }
        
        this.game.ecs.entityManager.removeEntity(entity.id);
      } else {
        vel.vx = (dx / dist) * projectile.speed;
        vel.vy = (dy / dist) * projectile.speed;
      }
    }
  }
}

export class TowerAttackSystem extends System {
  private game: Game;

  constructor(game: Game) {
    super([COMPONENT_TYPES.POSITION, COMPONENT_TYPES.TOWER, COMPONENT_TYPES.ATTACK]);
    this.game = game;
  }

  update(entities: Entity[], deltaTime: number): void {
    const currentTime = this.game.currentTime;
    const monsters = this.game.ecs.entityManager.getEntitiesWithComponents([
      COMPONENT_TYPES.POSITION, 
      COMPONENT_TYPES.HEALTH, 
      COMPONENT_TYPES.MONSTER
    ]);

    for (const entity of entities) {
      const pos = entity.getComponent<PositionComponent>(COMPONENT_TYPES.POSITION);
      const tower = entity.getComponent<TowerComponent>(COMPONENT_TYPES.TOWER);
      const attack = entity.getComponent<AttackComponent>(COMPONENT_TYPES.ATTACK);

      if (!pos || !tower || !attack) continue;
      if (currentTime - attack.lastAttackTime < attack.cooldown) continue;

      let target: Entity | null = null;
      let minDist = Infinity;

      for (const monster of monsters) {
        const monsterPos = monster.getComponent<PositionComponent>(COMPONENT_TYPES.POSITION);
        const monsterHealth = monster.getComponent<HealthComponent>(COMPONENT_TYPES.HEALTH);
        const monsterComp = monster.getComponent<MonsterComponent>(COMPONENT_TYPES.MONSTER);

        if (!monsterPos || !monsterHealth || !monsterComp) continue;
        if (monsterHealth.isDead) continue;

        const flying = monster.getComponent<FlyingComponent>(COMPONENT_TYPES.FLYING);
        if (flying && !tower.canTargetFlying) continue;

        const burrow = monster.getComponent<BurrowComponent>(COMPONENT_TYPES.BURROW);
        if (burrow && burrow.isUnderground) continue;

        const dx = monsterPos.x - pos.x;
        const dy = monsterPos.y - pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= tower.range && dist < minDist) {
          minDist = dist;
          target = monster;
        }
      }

      if (target) {
        attack.lastAttackTime = currentTime;
        const targetPos = target.getComponent<PositionComponent>(COMPONENT_TYPES.POSITION);
        if (targetPos) {
          this.game.spawnProjectile(pos.x, pos.y, target.id, tower.towerType);
          this.game.effectSystem.spawnMuzzleFlash(pos.x, pos.y);
        }
      }
    }
  }
}

export class MonsterReachedEndSystem extends System {
  private game: Game;

  constructor(game: Game) {
    super([COMPONENT_TYPES.PATH_FOLLOWING, COMPONENT_TYPES.MONSTER]);
    this.game = game;
  }

  update(entities: Entity[], deltaTime: number): void {
    for (const entity of entities) {
      const pathFollow = entity.getComponent<PathFollowingComponent>(COMPONENT_TYPES.PATH_FOLLOWING);
      
      if (!pathFollow) {
        continue;
      }

      if (pathFollow.reachedEnd) {
        const health = entity.getComponent<HealthComponent>(COMPONENT_TYPES.HEALTH);
        if (health && !health.isDead) {
          this.game.damageCarrot(1);
          health.isDead = true;
        }
      }
    }
  }
}

export class DeadEntityCleanupSystem extends System {
  private game: Game;

  constructor(game: Game) {
    super([COMPONENT_TYPES.HEALTH]);
    this.game = game;
  }

  update(entities: Entity[], deltaTime: number): void {
    for (const entity of entities) {
      const health = entity.getComponent<HealthComponent>(COMPONENT_TYPES.HEALTH);
      
      if (!health) continue;
      
      if (health.isDead) {
        const monster = entity.getComponent<MonsterComponent>(COMPONENT_TYPES.MONSTER);
        if (monster) {
          const pos = entity.getComponent<PositionComponent>(COMPONENT_TYPES.POSITION);
          if (pos) {
            this.game.effectSystem.spawnDeathEffect(pos.x, pos.y);
            this.game.addGold(monster.reward);
            this.game.addCrystals(monster.crystalReward);
          }
        }
        
        this.game.ecs.entityManager.removeEntity(entity.id);
      }
    }
  }
}

export class ParticleSystem extends System {
  private game: Game;

  constructor(game: Game) {
    super([COMPONENT_TYPES.POSITION, COMPONENT_TYPES.VELOCITY, COMPONENT_TYPES.PARTICLE]);
    this.game = game;
  }

  update(entities: Entity[], deltaTime: number): void {
    for (const entity of entities) {
      const particle = entity.getComponent<ParticleComponent>(COMPONENT_TYPES.PARTICLE);
      const pos = entity.getComponent<PositionComponent>(COMPONENT_TYPES.POSITION);
      const vel = entity.getComponent<VelocityComponent>(COMPONENT_TYPES.VELOCITY);

      if (!particle || !pos || !vel) {
        continue;
      }

      particle.lifetime -= deltaTime;
      pos.x += vel.vx * deltaTime;
      pos.y += vel.vy * deltaTime;
      vel.vy += 200 * deltaTime;

      if (particle.lifetime <= 0) {
        this.game.ecs.entityManager.removeEntity(entity.id);
      }
    }
  }
}

export class BurrowSystem extends System {
  private game: Game;

  constructor(game: Game) {
    super([COMPONENT_TYPES.BURROW]);
    this.game = game;
  }

  update(entities: Entity[], deltaTime: number): void {
    for (const entity of entities) {
      const burrow = entity.getComponent<BurrowComponent>(COMPONENT_TYPES.BURROW);
      
      if (!burrow) continue;
      
      if (burrow.isUnderground && Math.random() < 0.001) {
        burrow.isUnderground = false;
        burrow.emergeTime = this.game.currentTime;
      } else if (!burrow.isUnderground && Math.random() < 0.002) {
        burrow.isUnderground = true;
      }
    }
  }
}

export class BossSystem extends System {
  private game: Game;

  constructor(game: Game) {
    super([COMPONENT_TYPES.BOSS, COMPONENT_TYPES.HEALTH]);
    this.game = game;
  }

  update(entities: Entity[], deltaTime: number): void {
    for (const entity of entities) {
      const boss = entity.getComponent<BossComponent>(COMPONENT_TYPES.BOSS);
      const health = entity.getComponent<HealthComponent>(COMPONENT_TYPES.HEALTH);
      const pos = entity.getComponent<PositionComponent>(COMPONENT_TYPES.POSITION);

      if (!boss || !health || !pos) continue;

      const healthPercent = health.current / health.max;
      
      for (let i = boss.phase - 1; i < boss.phaseThresholds.length; i++) {
        if (healthPercent <= boss.phaseThresholds[i]) {
          boss.phase = i + 2;
          this.game.effectSystem.spawnBossPhaseEffect(pos.x, pos.y);
          break;
        }
      }

      if (this.game.currentTime - boss.lastSpecialAbilityTime > boss.specialAbilityCooldown) {
        boss.lastSpecialAbilityTime = this.game.currentTime;
        this.triggerBossAbility(entity, boss.phase);
      }
    }
  }

  private triggerBossAbility(boss: Entity, phase: number): void {
    const pos = boss.getComponent<PositionComponent>(COMPONENT_TYPES.POSITION);
    if (!pos) return;

    switch (phase) {
      case 1:
        this.game.triggerScreenShake(5, 0.2);
        break;
      case 2:
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            this.game.spawnMonster(MonsterType.NORMAL, 0);
          }, i * 500);
        }
        break;
      case 3:
        this.game.effectSystem.spawnBossPhaseEffect(pos.x, pos.y);
        this.game.triggerScreenShake(10, 0.3);
        break;
    }
  }
}
