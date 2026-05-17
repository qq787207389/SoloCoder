import { ECS } from './ECS';
import { Grid, AStar, PathSmoother } from './Pathfinding';
import { MovementSystem, PathFollowingSystem, ProjectileSystem, TowerAttackSystem, MonsterReachedEndSystem, DeadEntityCleanupSystem, ParticleSystem, BurrowSystem, BossSystem } from './Systems';
import { RenderSystem, EffectSystem } from './RenderSystem';
import { COMPONENT_TYPES, PositionComponent, VelocityComponent, RenderComponent, PathFollowingComponent, HealthComponent, MonsterComponent, TowerComponent, AttackComponent, ProjectileComponent, ParticleComponent, CarrotComponent, ShieldComponent, BurrowComponent, FlyingComponent, BossComponent, MonsterType, TowerType } from './Components';

export { MonsterType, TowerType };

export interface LevelConfig {
  name: string;
  width: number;
  height: number;
  cellSize: number;
  startPositions: { x: number; y: number }[];
  endPosition: { x: number; y: number };
  obstacles: { x: number; y: number; destructible: boolean; hiddenTrap?: string }[];
  waves: WaveConfig[];
  initialGold: number;
  initialCrystals: number;
  initialLives: number;
}

export interface WaveConfig {
  monsters: { type: MonsterType; count: number; delay: number; elite?: boolean }[];
  delayBeforeNext: number;
}

export class Game {
  public ecs: ECS;
  public grid: Grid;
  public pathfinder: AStar;
  public renderSystem: RenderSystem;
  public effectSystem: EffectSystem;
  public currentTime: number;
  public gold: number;
  public crystals: number;
  public lives: number;
  public maxLives: number;
  public currentWave: number;
  public waveInProgress: boolean;
  public isPaused: boolean;
  public isGameOver: boolean;
  public isVictory: boolean;
  public screenShakeIntensity: number;
  public screenShakeDuration: number;
  public screenShakeTime: number;
  public levelConfig: LevelConfig;
  private waveTimer: number;
  private monsterSpawnIndex: number;
  private currentWaveMonsterIndex: number;

  constructor(canvas: HTMLCanvasElement, levelConfig: LevelConfig) {
    this.levelConfig = levelConfig;
    this.ecs = new ECS();
    this.grid = new Grid(levelConfig.width, levelConfig.height, levelConfig.cellSize);
    this.pathfinder = new AStar(this.grid);
    this.renderSystem = new RenderSystem(this, canvas);
    this.effectSystem = new EffectSystem(this);
    
    this.currentTime = 0;
    this.gold = levelConfig.initialGold;
    this.crystals = levelConfig.initialCrystals;
    this.lives = levelConfig.initialLives;
    this.maxLives = levelConfig.initialLives;
    this.currentWave = 0;
    this.waveInProgress = false;
    this.isPaused = false;
    this.isGameOver = false;
    this.isVictory = false;
    this.screenShakeIntensity = 0;
    this.screenShakeDuration = 0;
    this.screenShakeTime = 0;
    this.waveTimer = 0;
    this.monsterSpawnIndex = 0;
    this.currentWaveMonsterIndex = 0;

    this.initializeGrid();
    this.setupSystems();
    this.spawnCarrot();
  }

  private initializeGrid(): void {
    for (const obstacle of this.levelConfig.obstacles) {
      this.grid.setWalkable(obstacle.x, obstacle.y, false);
    }
  }

  private setupSystems(): void {
    this.ecs.systemManager.addSystem(new MovementSystem());
    this.ecs.systemManager.addSystem(new PathFollowingSystem());
    this.ecs.systemManager.addSystem(new ProjectileSystem(this));
    this.ecs.systemManager.addSystem(new TowerAttackSystem(this));
    this.ecs.systemManager.addSystem(new MonsterReachedEndSystem(this));
    this.ecs.systemManager.addSystem(new DeadEntityCleanupSystem(this));
    this.ecs.systemManager.addSystem(new ParticleSystem(this));
    this.ecs.systemManager.addSystem(new BurrowSystem(this));
    this.ecs.systemManager.addSystem(new BossSystem(this));
  }

  private spawnCarrot(): void {
    const carrot = this.ecs.entityManager.createEntity();
    carrot.addComponent(new PositionComponent(
      this.levelConfig.endPosition.x * this.grid.cellSize + this.grid.cellSize / 2,
      this.levelConfig.endPosition.y * this.grid.cellSize + this.grid.cellSize / 2
    ));
    carrot.addComponent(new RenderComponent('#FF7F00', 25));
    carrot.addComponent(new CarrotComponent(this.maxLives));
  }

  startNextWave(): void {
    if (this.waveInProgress || this.currentWave >= this.levelConfig.waves.length) {
      return;
    }
    
    this.waveInProgress = true;
    this.monsterSpawnIndex = 0;
    this.currentWaveMonsterIndex = 0;
    this.waveTimer = 0;
  }

  spawnMonster(type: MonsterType, startIndex: number): void {
    const startPos = this.levelConfig.startPositions[startIndex % this.levelConfig.startPositions.length];
    const endPos = this.levelConfig.endPosition;
    
    const worldStartX = startPos.x * this.grid.cellSize + this.grid.cellSize / 2;
    const worldStartY = startPos.y * this.grid.cellSize + this.grid.cellSize / 2;
    const worldEndX = endPos.x * this.grid.cellSize + this.grid.cellSize / 2;
    const worldEndY = endPos.y * this.grid.cellSize + this.grid.cellSize / 2;

    const path = this.pathfinder.findPath(worldStartX, worldStartY, worldEndX, worldEndY);

    if (path.length === 0) {
      console.warn('Could not find path for monster!');
      return;
    }

    let health = 50;
    let speed = 80;
    let reward = 10;
    let crystalReward = 0;
    let color = '#FF0000';
    let radius = 12;

    const monster = this.ecs.entityManager.createEntity();
    monster.addComponent(new PositionComponent(worldStartX, worldStartY));
    monster.addComponent(new PathFollowingComponent(path));
    
    switch (type) {
      case MonsterType.NORMAL:
        health = 50;
        speed = 80;
        color = '#FF4444';
        break;
      case MonsterType.BURROW:
        health = 40;
        speed = 100;
        color = '#8B4513';
        monster.addComponent(new BurrowComponent());
        break;
      case MonsterType.FLYING:
        health = 35;
        speed = 120;
        color = '#9932CC';
        reward = 15;
        monster.addComponent(new FlyingComponent());
        break;
      case MonsterType.SHIELD:
        health = 80;
        speed = 60;
        color = '#4169E1';
        reward = 20;
        monster.addComponent(new ShieldComponent(40, 0.5));
        break;
      case MonsterType.BOSS:
        health = 500;
        speed = 50;
        color = '#FF00FF';
        radius = 30;
        reward = 100;
        crystalReward = 5;
        monster.addComponent(new BossComponent());
        break;
    }

    const velComponent = new VelocityComponent(speed);
    monster.addComponent(velComponent);
    monster.addComponent(new HealthComponent(health));
    monster.addComponent(new RenderComponent(color, radius));
    monster.addComponent(new MonsterComponent(type, reward, crystalReward, false));
  }

  spawnTower(gridX: number, gridY: number, type: TowerType): boolean {
    const worldPos = this.grid.gridToWorld(gridX, gridY);
    
    if (!this.grid.isWalkable(gridX, gridY)) {
      return false;
    }

    const cost = this.getTowerCost(type);
    if (this.gold < cost) {
      return false;
    }

    this.gold -= cost;
    this.grid.setWalkable(gridX, gridY, false);
    
    const tower = this.ecs.entityManager.createEntity();
    tower.addComponent(new PositionComponent(worldPos.x, worldPos.y));
    
    let range = 150;
    let damage = 10;
    let fireRate = 1;
    let color = '#00FF00';
    let canTargetFlying = false;

    switch (type) {
      case TowerType.ARROW:
        range = 150;
        damage = 15;
        fireRate = 1.5;
        color = '#228B22';
        break;
      case TowerType.CANNON:
        range = 120;
        damage = 40;
        fireRate = 0.5;
        color = '#2F4F4F';
        break;
      case TowerType.ICE:
        range = 130;
        damage = 8;
        fireRate = 2;
        color = '#00CED1';
        break;
      case TowerType.ANTI_AIR:
        range = 200;
        damage = 25;
        fireRate = 1.2;
        color = '#4B0082';
        canTargetFlying = true;
        break;
    }

    const towerComp = new TowerComponent(type, 1, 3);
    towerComp.range = range;
    towerComp.fireRate = fireRate;
    towerComp.cost = cost;
    towerComp.canTargetFlying = canTargetFlying;
    tower.addComponent(towerComp);
    
    const attackComp = new AttackComponent(damage, range, 1 / fireRate);
    tower.addComponent(attackComp);
    
    tower.addComponent(new RenderComponent(color, 18));

    return true;
  }

  getTowerCost(type: TowerType): number {
    switch (type) {
      case TowerType.ARROW: return 100;
      case TowerType.CANNON: return 200;
      case TowerType.ICE: return 150;
      case TowerType.ANTI_AIR: return 180;
      default: return 100;
    }
  }

  spawnProjectile(x: number, y: number, targetId: number, towerType: TowerType): void {
    const projectile = this.ecs.entityManager.createEntity();
    projectile.addComponent(new PositionComponent(x, y));
    projectile.addComponent(new VelocityComponent());
    
    let damage = 10;
    let color = '#FFFF00';
    
    switch (towerType) {
      case TowerType.ARROW:
        damage = 15;
        color = '#FFD700';
        break;
      case TowerType.CANNON:
        damage = 40;
        color = '#FF4500';
        break;
      case TowerType.ICE:
        damage = 8;
        color = '#00FFFF';
        break;
      case TowerType.ANTI_AIR:
        damage = 25;
        color = '#9400D3';
        break;
    }

    projectile.addComponent(new ProjectileComponent(targetId, damage, 400));
    projectile.addComponent(new RenderComponent(color, 5));
  }

  addGold(amount: number): void {
    this.gold += amount;
  }

  addCrystals(amount: number): void {
    this.crystals += amount;
  }

  damageCarrot(amount: number): void {
    this.lives = Math.max(0, this.lives - amount);
    this.triggerScreenShake(10, 0.2);
    
    if (this.lives <= 0) {
      this.isGameOver = true;
    }
  }

  triggerScreenShake(intensity: number, duration: number): void {
    this.screenShakeIntensity = intensity;
    this.screenShakeDuration = duration;
    this.screenShakeTime = 0;
  }

  update(deltaTime: number): void {
    if (this.isPaused || this.isGameOver || this.isVictory) {
      return;
    }

    this.currentTime += deltaTime;
    this.ecs.update(deltaTime);
    this.updateWaveSpawning(deltaTime);
    this.updateScreenShake(deltaTime);
    this.checkVictory();
  }

  private updateWaveSpawning(deltaTime: number): void {
    if (!this.waveInProgress) {
      return;
    }

    const wave = this.levelConfig.waves[this.currentWave];
    if (!wave) {
      this.waveInProgress = false;
      return;
    }

    this.waveTimer += deltaTime;

    let totalSpawned = 0;
    let currentMonsterType = null;

    for (let i = 0; i < wave.monsters.length; i++) {
      const monsterGroup = wave.monsters[i];
      if (totalSpawned + monsterGroup.count > this.monsterSpawnIndex) {
        currentMonsterType = monsterGroup;
        break;
      }
      totalSpawned += monsterGroup.count;
    }

    if (currentMonsterType) {
      if (this.waveTimer >= currentMonsterType.delay) {
        this.waveTimer = 0;
        this.spawnMonster(currentMonsterType.type, 0);
        this.monsterSpawnIndex++;
      }
    } else {
      const monsters = this.ecs.entityManager.getEntitiesWithComponents([
        COMPONENT_TYPES.MONSTER, COMPONENT_TYPES.HEALTH
      ]);

      const aliveMonsters = monsters.filter(m => {
        const health = m.getComponent<HealthComponent>(COMPONENT_TYPES.HEALTH);
        return health && !health.isDead;
      });

      if (aliveMonsters.length === 0) {
        this.waveInProgress = false;
        this.currentWave++;
      }
    }
  }

  private updateScreenShake(deltaTime: number): void {
    if (this.screenShakeTime < this.screenShakeDuration) {
      this.screenShakeTime += deltaTime;
    }
  }

  private checkVictory(): void {
    if (this.currentWave >= this.levelConfig.waves.length && !this.waveInProgress) {
      const monsters = this.ecs.entityManager.getEntitiesWithComponents([
        COMPONENT_TYPES.MONSTER, COMPONENT_TYPES.HEALTH
      ]);

      const aliveMonsters = monsters.filter(m => {
        const health = m.getComponent<HealthComponent>(COMPONENT_TYPES.HEALTH);
        return health && !health.isDead;
      });

      if (aliveMonsters.length === 0) {
        this.isVictory = true;
      }
    }
  }

  render(): void {
    this.renderSystem.render();
  }
}
