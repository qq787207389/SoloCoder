import { Game } from './Game';
import { Entity } from './ECS';
import { COMPONENT_TYPES, PositionComponent, VelocityComponent, RenderComponent, ParticleComponent, TowerComponent, HealthComponent, FlyingComponent, BurrowComponent, ShieldComponent, BossComponent, MonsterComponent, CarrotComponent } from './Components';

export class RenderSystem {
  private game: Game;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private offsetX: number;
  private offsetY: number;

  constructor(game: Game, canvas: HTMLCanvasElement) {
    this.game = game;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.offsetX = 0;
    this.offsetY = 0;
  }

  render(): void {
    this.applyScreenShake();
    
    this.ctx.save();
    this.ctx.translate(this.offsetX, this.offsetY);
    
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawGrid();
    this.drawPathPreview();
    this.drawEntities();
    
    this.ctx.restore();
    
    this.drawUI();
  }

  private applyScreenShake(): void {
    if (this.game.screenShakeTime < this.game.screenShakeDuration) {
      const progress = this.game.screenShakeTime / this.game.screenShakeDuration;
      const intensity = this.game.screenShakeIntensity * (1 - progress);
      this.offsetX = (Math.random() - 0.5) * intensity * 2;
      this.offsetY = (Math.random() - 0.5) * intensity * 2;
    } else {
      this.offsetX = 0;
      this.offsetY = 0;
    }
  }

  private drawGrid(): void {
    const grid = this.game.grid;
    
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const worldX = x * grid.cellSize;
        const worldY = y * grid.cellSize;
        
        if (grid.isWalkable(x, y)) {
          this.ctx.fillStyle = '#2d3436';
        } else {
          this.ctx.fillStyle = '#636e72';
        }
        
        this.ctx.fillRect(worldX + 1, worldY + 1, grid.cellSize - 2, grid.cellSize - 2);
        
        this.ctx.strokeStyle = '#4a5568';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(worldX, worldY, grid.cellSize, grid.cellSize);
      }
    }

    for (const start of this.game.levelConfig.startPositions) {
      const worldX = start.x * grid.cellSize;
      const worldY = start.y * grid.cellSize;
      
      this.ctx.fillStyle = '#00b894';
      this.ctx.fillRect(worldX + 2, worldY + 2, grid.cellSize - 4, grid.cellSize - 4);
      
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 12px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('入口', worldX + grid.cellSize / 2, worldY + grid.cellSize / 2);
    }
  }

  private drawPathPreview(): void {
    const grid = this.game.grid;
    const startPos = this.game.levelConfig.startPositions[0];
    const endPos = this.game.levelConfig.endPosition;
    
    const worldStartX = startPos.x * grid.cellSize + grid.cellSize / 2;
    const worldStartY = startPos.y * grid.cellSize + grid.cellSize / 2;
    const worldEndX = endPos.x * grid.cellSize + grid.cellSize / 2;
    const worldEndY = endPos.y * grid.cellSize + grid.cellSize / 2;

    const path = this.game.pathfinder.findPath(worldStartX, worldStartY, worldEndX, worldEndY);
    
    if (path.length > 1) {
      this.ctx.strokeStyle = 'rgba(255, 236, 179, 0.5)';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(path[0].x, path[0].y);
      
      for (let i = 1; i < path.length; i++) {
        this.ctx.lineTo(path[i].x, path[i].y);
      }
      
      this.ctx.stroke();
    }
  }

  private drawEntities(): void {
    const entities = this.game.ecs.entityManager.getAllEntities();
    
    const particles: Entity[] = [];
    const others: Entity[] = [];
    
    for (const entity of entities) {
      if (entity.hasComponent(COMPONENT_TYPES.PARTICLE)) {
        particles.push(entity);
      } else {
        others.push(entity);
      }
    }

    for (const entity of others) {
      this.drawEntity(entity);
    }

    for (const entity of particles) {
      this.drawParticle(entity);
    }
  }

  private drawEntity(entity: Entity): void {
    const pos = entity.getComponent<PositionComponent>(COMPONENT_TYPES.POSITION);
    const render = entity.getComponent<RenderComponent>(COMPONENT_TYPES.RENDER);
    
    if (!pos || !render) return;

    const tower = entity.getComponent<TowerComponent>(COMPONENT_TYPES.TOWER);
    const monster = entity.getComponent<MonsterComponent>(COMPONENT_TYPES.MONSTER);
    const health = entity.getComponent<HealthComponent>(COMPONENT_TYPES.HEALTH);
    const flying = entity.getComponent<FlyingComponent>(COMPONENT_TYPES.FLYING);
    const burrow = entity.getComponent<BurrowComponent>(COMPONENT_TYPES.BURROW);
    const shield = entity.getComponent<ShieldComponent>(COMPONENT_TYPES.SHIELD);
    const boss = entity.getComponent<BossComponent>(COMPONENT_TYPES.BOSS);
    const carrot = entity.getComponent<CarrotComponent>(COMPONENT_TYPES.CARROT);

    if (tower) {
      this.drawTower(pos, render, tower);
    } else if (monster) {
      this.drawMonster(pos, render, monster, health, flying, burrow, shield, boss);
    } else if (carrot) {
      this.drawCarrot(pos, render);
    } else {
      this.ctx.fillStyle = render.color;
      this.ctx.beginPath();
      this.ctx.arc(pos.x, pos.y, render.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  private drawTower(pos: PositionComponent, render: RenderComponent, tower: TowerComponent): void {
    this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.2)';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, tower.range, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.fillStyle = render.color;
    this.ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, render.radius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, render.radius * 0.5, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#000000';
    this.ctx.font = 'bold 10px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(`Lv${tower.level}`, pos.x, pos.y);
  }

  private drawMonster(
    pos: PositionComponent, 
    render: RenderComponent, 
    monster: MonsterComponent, 
    health: HealthComponent | undefined,
    flying: FlyingComponent | undefined,
    burrow: BurrowComponent | undefined,
    shield: ShieldComponent | undefined,
    boss: BossComponent | undefined
  ): void {
    let drawY = pos.y;
    
    if (flying) {
      drawY -= flying.altitude + Math.sin(this.game.currentTime * 3 + flying.bobPhase) * 3;
      
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      this.ctx.beginPath();
      this.ctx.ellipse(pos.x, pos.y + render.radius, render.radius * 1.2, render.radius * 0.5, 0, 0, Math.PI * 2);
      this.ctx.fill();
    }

    if (burrow && burrow.isUnderground) {
      this.ctx.globalAlpha = 0.4;
      this.ctx.fillStyle = '#5D4037';
    } else {
      this.ctx.fillStyle = render.color;
    }

    this.ctx.beginPath();
    this.ctx.arc(pos.x, drawY, render.radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.globalAlpha = 1;

    if (shield && !shield.broken) {
      this.ctx.strokeStyle = '#00BFFF';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(pos.x, drawY, render.radius + 5, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    if (boss) {
      this.ctx.strokeStyle = '#FF00FF';
      this.ctx.lineWidth = 2;
      for (let i = 0; i < boss.phase; i++) {
        this.ctx.beginPath();
        this.ctx.arc(pos.x, drawY, render.radius + 8 + i * 5, 0, Math.PI * 2);
        this.ctx.stroke();
      }
    }

    if (health) {
      const healthPercent = health.current / health.max;
      const barWidth = render.radius * 2;
      const barHeight = 4;
      const barX = pos.x - barWidth / 2;
      const barY = drawY - render.radius - 10;

      this.ctx.fillStyle = '#e74c3c';
      this.ctx.fillRect(barX, barY, barWidth, barHeight);
      
      this.ctx.fillStyle = '#2ecc71';
      this.ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    }
  }

  private drawCarrot(pos: PositionComponent, render: RenderComponent): void {
    const gradient = this.ctx.createRadialGradient(
      pos.x, pos.y, 0,
      pos.x, pos.y, render.radius * 2
    );
    gradient.addColorStop(0, 'rgba(255, 127, 0, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 127, 0, 0)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, render.radius * 2, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = render.color;
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y - render.radius);
    this.ctx.lineTo(pos.x - render.radius * 0.6, pos.y + render.radius);
    this.ctx.lineTo(pos.x + render.radius * 0.6, pos.y + render.radius);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.fillStyle = '#228B22';
    this.ctx.beginPath();
    this.ctx.ellipse(pos.x - 5, pos.y - render.radius - 5, 4, 8, -0.3, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.beginPath();
    this.ctx.ellipse(pos.x + 5, pos.y - render.radius - 5, 4, 8, 0.3, 0, Math.PI * 2);
    this.ctx.fill();
  }

  private drawParticle(entity: Entity): void {
    const pos = entity.getComponent<PositionComponent>(COMPONENT_TYPES.POSITION);
    const particle = entity.getComponent<ParticleComponent>(COMPONENT_TYPES.PARTICLE);
    
    if (!pos || !particle) return;

    const lifePercent = particle.lifetime / particle.maxLifetime;
    const size = particle.startSize + (particle.endSize - particle.startSize) * (1 - lifePercent);
    
    this.ctx.globalAlpha = lifePercent;
    this.ctx.fillStyle = particle.startColor;
    this.ctx.beginPath();
    this.ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.globalAlpha = 1;
  }

  private drawUI(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, 50);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(`金币: ${this.game.gold}`, 20, 25);
    this.ctx.fillText(`水晶: ${this.game.crystals}`, 150, 25);
    
    this.ctx.fillStyle = '#ff6b6b';
    for (let i = 0; i < this.game.maxLives; i++) {
      if (i < this.game.lives) {
        this.ctx.fillStyle = '#ff6b6b';
      } else {
        this.ctx.fillStyle = '#636e72';
      }
      this.ctx.beginPath();
      this.ctx.arc(280 + i * 25, 25, 8, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.fillStyle = '#ffffff';
    this.ctx.textAlign = 'right';
    const waveText = this.game.waveInProgress 
      ? `波次 ${this.game.currentWave + 1}/${this.game.levelConfig.waves.length}` 
      : '点击开始下一波';
    this.ctx.fillText(waveText, this.canvas.width - 20, 25);

    if (this.game.isGameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = '#e74c3c';
      this.ctx.font = 'bold 48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('游戏结束', this.canvas.width / 2, this.canvas.height / 2 - 30);
      
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '24px Arial';
      this.ctx.fillText('刷新页面重新开始', this.canvas.width / 2, this.canvas.height / 2 + 30);
    }

    if (this.game.isVictory) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = '#f1c40f';
      this.ctx.font = 'bold 48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('胜利！', this.canvas.width / 2, this.canvas.height / 2 - 30);
      
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '24px Arial';
      this.ctx.fillText(`剩余生命: ${this.game.lives}`, this.canvas.width / 2, this.canvas.height / 2 + 30);
    }
  }
}

export class EffectSystem {
  private game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  spawnHitEffect(x: number, y: number): void {
    for (let i = 0; i < 5; i++) {
      const particle = this.game.ecs.entityManager.createEntity();
      particle.addComponent(new PositionComponent(x, y));
      particle.addComponent(new VelocityComponent());
      particle.addComponent(new ParticleComponent(0.5, '#FFD700', '#FF4500', 4, 1));
      
      const vel = particle.getComponent(COMPONENT_TYPES.VELOCITY)! as any;
      vel.vx = (Math.random() - 0.5) * 200;
      vel.vy = (Math.random() - 0.5) * 200 - 50;
    }
  }

  spawnDeathEffect(x: number, y: number): void {
    for (let i = 0; i < 15; i++) {
      const particle = this.game.ecs.entityManager.createEntity();
      particle.addComponent(new PositionComponent(x, y));
      particle.addComponent(new VelocityComponent());
      particle.addComponent(new ParticleComponent(0.8, '#FF0000', '#8B0000', 6, 2));
      
      const vel = particle.getComponent(COMPONENT_TYPES.VELOCITY)! as any;
      vel.vx = (Math.random() - 0.5) * 300;
      vel.vy = (Math.random() - 0.5) * 300;
    }
  }

  spawnMuzzleFlash(x: number, y: number): void {
    for (let i = 0; i < 3; i++) {
      const particle = this.game.ecs.entityManager.createEntity();
      particle.addComponent(new PositionComponent(x, y));
      particle.addComponent(new VelocityComponent());
      particle.addComponent(new ParticleComponent(0.2, '#FFFF00', '#FF8C00', 8, 2));
      
      const vel = particle.getComponent(COMPONENT_TYPES.VELOCITY)! as any;
      vel.vx = (Math.random() - 0.5) * 100;
      vel.vy = (Math.random() - 0.5) * 100;
    }
  }

  spawnBossPhaseEffect(x: number, y: number): void {
    for (let i = 0; i < 30; i++) {
      const particle = this.game.ecs.entityManager.createEntity();
      particle.addComponent(new PositionComponent(x, y));
      particle.addComponent(new VelocityComponent());
      particle.addComponent(new ParticleComponent(1.5, '#FF00FF', '#8B008B', 10, 3));
      
      const vel = particle.getComponent(COMPONENT_TYPES.VELOCITY)! as any;
      const angle = (i / 30) * Math.PI * 2;
      vel.vx = Math.cos(angle) * 200;
      vel.vy = Math.sin(angle) * 200;
    }
  }
}
