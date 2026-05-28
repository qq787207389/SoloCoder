import { GameState, GameStats, Vector2 } from './types';
import { InputManager } from './InputManager';
import { Player } from './entities/Player';
import { Enemy } from './entities/Enemy';
import { Bullet } from './entities/Bullet';
import { Hostage } from './entities/Hostage';
import { Item } from './entities/Item';
import { ParticleSystem } from './entities/Particle';
import { CollisionSystem } from './systems/CollisionSystem';
import { Level, createDemoLevel } from './levels/Level';
import { HUD } from './ui/HUD';
import { clamp } from './utils';

export class Game {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  private gameState: GameState;
  private inputManager: InputManager;
  private collisionSystem: CollisionSystem;
  private particleSystem: ParticleSystem;
  private hud: HUD;
  private level: Level | null = null;

  private players: Player[] = [];
  private enemies: Enemy[] = [];
  private bullets: Bullet[] = [];
  private hostages: Hostage[] = [];
  private items: Item[] = [];

  private camera: Vector2 = { x: 0, y: 0 };
  private stats: GameStats;
  private selectedMenuOption: number = 0;
  private lastTime: number = 0;
  private animationId: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!;
    this.width = canvas.width;
    this.height = canvas.height;

    this.gameState = 'menu';
    this.inputManager = new InputManager();
    this.collisionSystem = new CollisionSystem();
    this.particleSystem = new ParticleSystem();
    this.hud = new HUD(canvas);

    this.stats = this.createEmptyStats();

    this.ctx.imageSmoothingEnabled = false;
  }

  private createEmptyStats(): GameStats {
    return {
      score: 0,
      hostagesRescued: 0,
      hostagesTotal: 0,
      buildingsDestroyed: 0,
      buildingsTotal: 0,
      enemiesKilled: 0,
      level: 1,
      lives: 3
    };
  }

  public start(): void {
    this.lastTime = performance.now();
    this.gameLoop();
  }

  private gameLoop(): void {
    const currentTime = performance.now();
    const deltaTime = Math.min(currentTime - this.lastTime, 50);
    this.lastTime = currentTime;

    this.inputManager.update();
    this.handleInput();
    this.inputManager.clearJustPressed();
    this.update(deltaTime, currentTime);
    this.render();

    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  private handleInput(): void {
    switch (this.gameState) {
      case 'menu':
        this.handleMenuInput();
        break;
      case 'controls':
        this.handleControlsInput();
        break;
      case 'playing':
      case 'paused':
        this.handleGameInput();
        break;
      case 'gameover':
      case 'victory':
        this.handleEndInput();
        break;
    }
  }

  private handleMenuInput(): void {
    if (this.inputManager.getMenuUpPressed()) {
      this.selectedMenuOption = (this.selectedMenuOption + 2) % 3;
    }
    if (this.inputManager.getMenuDownPressed()) {
      this.selectedMenuOption = (this.selectedMenuOption + 1) % 3;
    }

    if (this.inputManager.getStartPressed()) {
      if (this.selectedMenuOption === 0) {
        this.startGame(1);
      } else if (this.selectedMenuOption === 1) {
        this.startGame(2);
      } else if (this.selectedMenuOption === 2) {
        this.gameState = 'controls';
      }
    }
  }

  private handleControlsInput(): void {
    if (this.inputManager.getPausePressed()) {
      this.gameState = 'menu';
    }
  }

  private handleGameInput(): void {
    if (this.inputManager.getPausePressed()) {
      this.gameState = this.gameState === 'playing' ? 'paused' : 'playing';
    }

    if (this.gameState === 'paused' && this.inputManager.isKeyJustPressed('r')) {
      this.restartGame();
    }
  }

  private handleEndInput(): void {
    if (this.inputManager.getStartPressed()) {
      this.gameState = 'menu';
      this.cleanup();
    }
  }

  private startGame(playerCount: number): void {
    this.cleanup();
    this.stats = this.createEmptyStats();

    const levelData = createDemoLevel();
    this.level = new Level(levelData);
    this.stats.hostagesTotal = levelData.totalHostages;
    this.stats.buildingsTotal = levelData.totalBuildings;

    this.players = [];
    for (let i = 0; i < playerCount; i++) {
      const player = new Player(i, { x: 100 + i * 50, y: 600 });
      this.players.push(player);
    }

    levelData.enemies.forEach((spawn) => {
      const enemy = new Enemy(spawn.type, { x: spawn.x, y: spawn.y });
      this.enemies.push(enemy);
    });

    levelData.hostages.forEach((spawn) => {
      const hostage = new Hostage({ x: spawn.x, y: spawn.y });
      this.hostages.push(hostage);
    });

    levelData.items.forEach((spawn) => {
      const item = new Item(spawn.type, { x: spawn.x, y: spawn.y }, spawn.value, spawn.weaponType);
      this.items.push(item);
    });

    this.camera = { x: 0, y: 0 };
    this.gameState = 'playing';
  }

  private restartGame(): void {
    const playerCount = this.players.length;
    this.startGame(playerCount);
  }

  private cleanup(): void {
    this.players = [];
    this.enemies = [];
    this.bullets = [];
    this.hostages = [];
    this.items = [];
    this.particleSystem.clear();
    this.collisionSystem.clear();
  }

  private update(deltaTime: number, currentTime: number): void {
    if (this.gameState !== 'playing') return;
    if (!this.level) return;

    this.updatePlayers(currentTime);
    this.updateEnemies(currentTime);
    this.updateBullets(deltaTime);
    this.updateHostages(deltaTime);
    this.items.forEach((item) => item.update(deltaTime));
    this.particleSystem.update(deltaTime);

    this.checkCollisions();
    this.updateCamera();
    this.checkVictory();
    this.checkGameOver();
  }

  private updatePlayers(currentTime: number): void {
    const inputs = [
      this.inputManager.getPlayer1Input(),
      this.inputManager.getPlayer2Input()
    ];

    this.players.forEach((player, index) => {
      if (!player.active) return;

      const bullet = player.handleInput(inputs[index], currentTime);
      if (bullet) {
        this.bullets.push(bullet);
        this.particleSystem.createMuzzleFlash(
          player.getMuzzlePosition(),
          player.shootDirection
        );
      }

      player.update(16);

      if (this.level) {
        if (this.level.isSolidTile(player.position.x, player.position.y)) {
          player.position.x -= player.velocity.x * 16;
          player.position.y -= player.velocity.y * 16;
        }
      }

      player.position.x = clamp(player.position.x, 50, this.level!.getWidth() - 50);
      player.position.y = clamp(player.position.y, 50, this.level!.getHeight() - 50);
    });
  }

  private updateEnemies(currentTime: number): void {
    const playerPositions = this.players.filter(p => p.active).map(p => p.position);

    this.enemies.forEach((enemy) => {
      if (!enemy.active) return;

      enemy.update(16, playerPositions, currentTime);

      const bullet = enemy.tryFire(currentTime);
      if (bullet) {
        this.bullets.push(bullet);
      }
    });
  }

  private updateBullets(deltaTime: number): void {
    this.bullets.forEach((bullet) => {
      bullet.update(deltaTime);

      if (this.level && this.level.isSolidTile(bullet.position.x, bullet.position.y)) {
        bullet.active = false;
        if (bullet.shouldExplode()) {
          this.createExplosion(bullet.position, bullet.explosionRadius);
        }
      }
    });

    this.bullets = this.bullets.filter((b) => b.active);
  }

  private updateHostages(deltaTime: number): void {
    this.hostages.forEach((hostage) => {
      hostage.update(deltaTime, this.players);
    });
  }

  private checkCollisions(): void {
    this.collisionSystem.checkCollisions(
      this.players,
      this.enemies,
      this.bullets,
      this.hostages,
      this.items,
      (player, enemy) => {
        player.takeDamage(enemy.damage * 0.5);
        this.particleSystem.createDamageEffect(player.position);
      },
      (bullet, target) => {
        if (bullet.isPlayer) {
          if (target instanceof Enemy) {
            target.takeDamage(bullet.damage);
            if (!target.active) {
              this.stats.enemiesKilled++;
              this.stats.score += target.score;
              this.createExplosion(target.position, 30);
            }
          } else if (target instanceof Hostage && target.state === 'caged') {
            target.free();
            this.createExplosion(target.position, 20);
          }
        } else {
          if (target instanceof Player) {
            target.takeDamage(bullet.damage);
            this.particleSystem.createDamageEffect(target.position);
          }
        }

        if (bullet.shouldExplode()) {
          this.createExplosion(bullet.position, bullet.explosionRadius);
          this.collisionSystem.checkExplosionDamage(
            bullet.position,
            bullet.explosionRadius,
            bullet.damage * 0.5,
            this.enemies,
            this.hostages,
            (enemy, damage) => {
              enemy.takeDamage(damage);
              if (!enemy.active) {
                this.stats.enemiesKilled++;
                this.stats.score += enemy.score;
              }
            },
            (hostage, damage) => {
              if (hostage.state !== 'caged') {
                hostage.takeDamage(damage);
              }
            }
          );
        }

        bullet.active = false;
      },
      (player, item) => {
        this.pickupItem(player, item);
      },
      (_player, _hostage) => {
      }
    );
  }

  private pickupItem(player: Player, item: Item): void {
    switch (item.itemType) {
      case 'health':
        player.heal(item.value);
        break;
      case 'ammo':
        if (item.weaponType) {
          player.weaponSystem.addAmmo(item.weaponType, item.value);
        }
        break;
      case 'weapon':
        break;
    }
    item.active = false;
    this.stats.score += 50;
  }

  private createExplosion(position: Vector2, radius: number): void {
    this.particleSystem.createExplosion(position, radius);
  }

  private updateCamera(): void {
    if (!this.level) return;

    const activePlayers = this.players.filter(p => p.active);
    if (activePlayers.length === 0) return;

    const avgX = activePlayers.reduce((sum, p) => sum + p.position.x, 0) / activePlayers.length;
    const avgY = activePlayers.reduce((sum, p) => sum + p.position.y, 0) / activePlayers.length;

    const targetX = avgX - this.width / 2 + 100;
    const targetY = avgY - this.height / 2;

    this.camera.x += (targetX - this.camera.x) * 0.05;
    this.camera.y += (targetY - this.camera.y) * 0.05;

    const maxX = Math.max(0, this.level.getWidth() - this.width);
    const maxY = Math.max(0, this.level.getHeight() - this.height);
    this.camera.x = clamp(this.camera.x, 0, maxX);
    this.camera.y = clamp(this.camera.y, 0, maxY);
  }

  private checkVictory(): void {
    if (!this.level) return;

    const levelWidth = this.level.getWidth();
    const allReachedEnd = this.players.every(p =>
      !p.active || p.position.x >= levelWidth - 200
    );

    if (allReachedEnd && this.players.some(p => p.active)) {
      let totalRescued = 0;
      this.players.forEach((player) => {
        totalRescued += player.getHostageCount();
        this.stats.score += player.getHostageCount() * 1000;
      });
      this.stats.hostagesRescued = totalRescued;
      this.gameState = 'victory';
    }
  }

  private checkGameOver(): void {
    const allDead = this.players.every(p => !p.active);
    if (allDead && this.players.length > 0) {
      this.stats.lives = 0;
      this.gameState = 'gameover';
    }

    const activePlayers = this.players.filter(p => p.active);
    if (activePlayers.length > 0) {
      this.stats.lives = activePlayers[0].lives;
    }
  }

  private render(): void {
    const ctx = this.ctx;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, this.width, this.height);

    switch (this.gameState) {
      case 'menu':
        this.hud.renderMenu(ctx, this.width, this.height, this.selectedMenuOption);
        break;
      case 'controls':
        this.hud.renderControls(ctx, this.width, this.height);
        break;
      case 'playing':
      case 'paused':
        this.renderGame();
        break;
      case 'gameover':
        this.renderGame();
        this.hud.renderGameOver(ctx, this.width, this.height, this.stats);
        break;
      case 'victory':
        this.renderGame();
        this.hud.renderVictory(ctx, this.width, this.height, this.stats);
        break;
    }
  }

  private renderGame(): void {
    if (!this.level) return;

    this.level.render(this.ctx, this.camera.x, this.camera.y, this.width, this.height);

    const allEntities = [
      ...this.items,
      ...this.hostages,
      ...this.enemies,
      ...this.players,
      ...this.bullets
    ].filter(e => e.active).sort((a, b) => a.zIndex - b.zIndex);

    allEntities.forEach((entity) => {
      entity.render(this.ctx, this.camera.x, this.camera.y);
    });

    this.particleSystem.render(this.ctx, this.camera.x, this.camera.y);

    this.renderExtractionPoint();

    this.hud.render(this.players, this.stats, this.gameState === 'paused');
  }

  private renderExtractionPoint(): void {
    if (!this.level) return;

    const levelWidth = this.level.getWidth();
    const screenX = levelWidth - 150 - this.camera.x;
    const screenY = this.height / 2;

    if (screenX > -100 && screenX < this.width + 100) {
      const pulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;

      this.ctx.fillStyle = `rgba(0, 255, 0, ${pulse * 0.3})`;
      this.ctx.fillRect(screenX - 50, screenY - 100, 100, 200);

      this.ctx.strokeStyle = `rgba(0, 255, 0, ${pulse})`;
      this.ctx.lineWidth = 3;
      this.ctx.setLineDash([10, 5]);
      this.ctx.strokeRect(screenX - 50, screenY - 100, 100, 200);
      this.ctx.setLineDash([]);

      this.ctx.fillStyle = '#00ff00';
      this.ctx.font = 'bold 16px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('撤离点', screenX, screenY - 110);

      const helicopterY = screenY - 80 + Math.sin(Date.now() / 300) * 5;
      this.ctx.fillStyle = '#3a4a3a';
      this.ctx.fillRect(screenX - 25, helicopterY - 10, 50, 20);

      const rotorAngle = Date.now() / 30;
      this.ctx.save();
      this.ctx.translate(screenX, helicopterY - 10);
      this.ctx.rotate(rotorAngle);
      this.ctx.fillStyle = '#111';
      this.ctx.fillRect(-40, -2, 80, 4);
      this.ctx.restore();
    }
  }

  public stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}
