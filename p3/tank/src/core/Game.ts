import { GameState, PowerupType, BulletType, AIType, Direction } from '../constants';
import { TileMap } from '../map/TileMap';
import { PlayerTank } from '../tank/PlayerTank';
import { EnemyTank } from '../tank/EnemyTank';
import { Bullet } from '../bullet/Bullet';
import { Powerup } from '../powerup/Powerup';
import { Explosion } from '../effects/Explosion';
import { SpatialGrid } from './SpatialGrid';
import { Rectangle } from '../math/Rectangle';
import gameConfig from '../config/gameConfig.json';

const TILE_SIZE = gameConfig.game.tileSize;
const MAP_SIZE = 13 * TILE_SIZE;

export class Game {
  public state: GameState;
  public map: TileMap;
  public players: PlayerTank[];
  public enemies: EnemyTank[];
  public bullets: Bullet[];
  public powerups: Powerup[];
  public explosions: Explosion[];
  public spatialGrid: SpatialGrid;
  
  private keys: Set<string>;
  private wave: number;
  private enemiesInWave: number;
  private enemiesSpawned: number;
  private spawnTimer: number;
  private powerupTimer: number;
  private freezeTimer: number;
  private baseHealth: number;
  private isTwoPlayer: boolean;
  private score: number;

  constructor(isTwoPlayer: boolean = false) {
    this.state = GameState.MENU;
    this.isTwoPlayer = isTwoPlayer;
    this.keys = new Set();
    this.map = new TileMap();
    this.players = [];
    this.enemies = [];
    this.bullets = [];
    this.powerups = [];
    this.explosions = [];
    this.spatialGrid = new SpatialGrid(TILE_SIZE * 2, new Rectangle(0, 0, MAP_SIZE, MAP_SIZE));
    this.wave = 1;
    this.enemiesInWave = gameConfig.waves.enemiesPerWave;
    this.enemiesSpawned = 0;
    this.spawnTimer = 0;
    this.powerupTimer = 0;
    this.freezeTimer = 0;
    this.baseHealth = gameConfig.base.maxHealth;
    this.score = 0;
  }

  init(): void {
    this.map.generateDefaultMap();
    this.spawnPlayers();
    this.resetWave();
    this.state = GameState.PLAYING;
  }

  private spawnPlayers(): void {
    const spawnPoints = this.map.getPlayerSpawnPoints();
    this.players = [];
    
    const p1 = new PlayerTank(spawnPoints[0].x, spawnPoints[0].y, 0);
    this.players.push(p1);
    
    if (this.isTwoPlayer) {
      const p2 = new PlayerTank(spawnPoints[1].x, spawnPoints[1].y, 1);
      this.players.push(p2);
    }
  }

  private resetWave(): void {
    this.enemiesSpawned = 0;
    this.enemiesInWave = gameConfig.waves.enemiesPerWave + Math.floor(this.wave / 2);
  }

  private spawnEnemy(): void {
    if (this.enemiesSpawned >= this.enemiesInWave) return;
    
    const spawnPoints = this.map.getSpawnPoints();
    const spawnPoint = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];
    
    let aiType = AIType.NORMAL;
    if (this.wave % 5 === 0 && this.enemiesSpawned === 0) {
      aiType = AIType.BOSS;
    } else if (this.wave > 3 && Math.random() < 0.3) {
      const types = [AIType.CHASER, AIType.DODGER, AIType.ELITE];
      aiType = types[Math.floor(Math.random() * types.length)];
    }
    
    const enemy = new EnemyTank(spawnPoint.x, spawnPoint.y, aiType);
    this.enemies.push(enemy);
    this.enemiesSpawned++;
  }

  private spawnPowerup(): void {
    const types = Object.values(PowerupType);
    const type = types[Math.floor(Math.random() * types.length)];
    
    const x = Math.random() * (MAP_SIZE - 60) + 30;
    const y = Math.random() * (MAP_SIZE - 60) + 30;
    
    const powerup = new Powerup(x, y, type);
    this.powerups.push(powerup);
  }

  public setKeyDown(code: string): void {
    this.keys.add(code);
    if (code === 'KeyP') this.togglePause();
  }

  public setKeyUp(code: string): void {
    this.keys.delete(code);
  }

  private togglePause(): void {
    if (this.state === GameState.PLAYING) {
      this.state = GameState.PAUSED;
    } else if (this.state === GameState.PAUSED) {
      this.state = GameState.PLAYING;
    }
  }

  update(deltaTime: number, currentTime: number): void {
    if (this.state !== GameState.PLAYING) return;

    this.spawnTimer -= deltaTime;
    if (this.spawnTimer <= 0 && this.enemies.length < 4) {
      this.spawnTimer = gameConfig.waves.spawnInterval;
      this.spawnEnemy();
    }

    this.powerupTimer -= deltaTime;
    if (this.powerupTimer <= 0) {
      this.powerupTimer = gameConfig.powerup.spawnInterval;
      this.spawnPowerup();
    }

    if (this.freezeTimer > 0) {
      this.freezeTimer -= deltaTime;
    }

    this.updatePlayers(deltaTime, currentTime);
    this.updateEnemies(deltaTime, currentTime);
    this.updateBullets(deltaTime);
    this.updatePowerups(deltaTime);
    this.updateExplosions(deltaTime);
    this.checkCollisions();
    this.checkWaveComplete();
    this.checkGameOver();
  }

  private updatePlayers(deltaTime: number, currentTime: number): void {
    for (const player of this.players) {
      if (!player.active) continue;
      
      const wantsToFire = player.handleInput(this.keys, deltaTime, this.map, currentTime);
      if (wantsToFire) {
        this.createBullet(player, BulletType.NORMAL);
      }
    }
  }

  private updateEnemies(deltaTime: number, currentTime: number): void {
    if (this.freezeTimer > 0) return;

    for (const enemy of this.enemies) {
      if (!enemy.active) continue;
      
      const wantsToFire = enemy.updateAI(deltaTime, this.map, currentTime, this.players);
      if (wantsToFire) {
        if (enemy.aiType === AIType.BOSS) {
          this.createBossBullets(enemy);
        } else {
          this.createBullet(enemy, BulletType.NORMAL);
        }
      }
    }
  }

  private createBullet(tank: any, type: BulletType): void {
    const x = tank.getCenter().x - 4;
    const y = tank.getCenter().y - 4;
    const bullet = new Bullet(x, y, tank.direction, tank, type);
    
    if (type === BulletType.TRACKING) {
      const nearestPlayer = this.players.find(p => p.active);
      if (nearestPlayer) {
        bullet.setTrackingTarget(nearestPlayer);
      }
    }
    
    this.bullets.push(bullet);
  }

  private createBossBullets(boss: EnemyTank): void {
    const types = [BulletType.SPREAD, BulletType.SPIN, BulletType.TRACKING];
    const type = types[Math.floor(Math.random() * types.length)];
    
    if (type === BulletType.SPREAD) {
      const directions = [Direction.UP, Direction.UP_RIGHT, Direction.RIGHT, Direction.DOWN_RIGHT, Direction.DOWN, Direction.DOWN_LEFT, Direction.LEFT, Direction.UP_LEFT];
      for (const dir of directions.slice(0, 4)) {
        const x = boss.getCenter().x - 4;
        const y = boss.getCenter().y - 4;
        const bullet = new Bullet(x, y, dir, boss, type);
        this.bullets.push(bullet);
      }
    } else {
      this.createBullet(boss, type);
    }
  }

  private updateBullets(deltaTime: number): void {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      const shouldRemove = bullet.update(deltaTime, this.map);
      if (shouldRemove) {
        this.bullets.splice(i, 1);
      }
    }
  }

  private updatePowerups(deltaTime: number): void {
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      this.powerups[i].update(deltaTime);
      if (!this.powerups[i].active) {
        this.powerups.splice(i, 1);
      }
    }
  }

  private updateExplosions(deltaTime: number): void {
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      this.explosions[i].update(deltaTime);
      if (!this.explosions[i].active) {
        this.explosions.splice(i, 1);
      }
    }
  }

  private checkCollisions(): void {
    this.checkBulletTankCollisions();
    this.checkPlayerPowerupCollisions();
    this.checkBaseCollision();
  }

  private checkBulletTankCollisions(): void {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      
      for (const player of this.players) {
        if (!player.active || bullet.isFromPlayer()) continue;
        if (bullet.bounds.intersects(player.bounds)) {
          const killed = player.takeDamage(bullet.damage);
          this.bullets.splice(i, 1);
          this.createExplosion(player.position.x, player.position.y);
          
          if (killed) {
            player.loseLife();
            if (player.hasLivesLeft()) {
              const spawnPoints = this.map.getPlayerSpawnPoints();
              player.respawn(spawnPoints[player.playerIndex].x, spawnPoints[player.playerIndex].y);
            }
          }
          break;
        }
      }

      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        if (!enemy.active || !bullet.isFromPlayer()) continue;
        if (bullet.bounds.intersects(enemy.bounds)) {
          const killed = enemy.takeDamage(bullet.damage);
          this.bullets.splice(i, 1);
          
          if (killed) {
            for (const player of this.players) {
              player.addScore(enemy.points);
              this.score += enemy.points;
            }
            this.createExplosion(enemy.position.x, enemy.position.y, 50);
            this.enemies.splice(j, 1);
          } else {
            this.createExplosion(bullet.position.x, bullet.position.y, 20);
          }
          break;
        }
      }
    }
  }

  private checkPlayerPowerupCollisions(): void {
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const powerup = this.powerups[i];
      
      for (const player of this.players) {
        if (!player.active) continue;
        if (powerup.bounds.intersects(player.bounds)) {
          this.applyPowerup(powerup.type, player);
          this.powerups.splice(i, 1);
          break;
        }
      }
    }
  }

  private applyPowerup(type: PowerupType, player: PlayerTank): void {
    switch (type) {
      case PowerupType.STAR:
        player.levelUp();
        break;
      case PowerupType.CLOCK:
        this.freezeTimer = gameConfig.powerup.freezeDuration;
        break;
      case PowerupType.BOMB:
        for (const enemy of this.enemies) {
          this.createExplosion(enemy.position.x, enemy.position.y, 50);
          player.addScore(enemy.points);
          this.score += enemy.points;
        }
        this.enemies = [];
        break;
      case PowerupType.SHOVEL:
        this.map.protectBase();
        break;
      case PowerupType.HELMET:
        player.setInvincible(gameConfig.powerup.invincibleDuration);
        break;
    }
  }

  private checkBaseCollision(): void {
    const baseBounds = this.map.getBaseBounds();
    
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      if (this.bullets[i].bounds.intersects(baseBounds)) {
        this.bullets.splice(i, 1);
        this.baseHealth--;
        this.createExplosion(baseBounds.x, baseBounds.y, 60);
        break;
      }
    }
  }

  private createExplosion(x: number, y: number, size: number = 40): void {
    this.explosions.push(new Explosion(x - size / 2, y - size / 2, size));
  }

  private checkWaveComplete(): void {
    if (this.enemies.length === 0 && this.enemiesSpawned >= this.enemiesInWave) {
      this.wave++;
      this.resetWave();
    }
  }

  private checkGameOver(): void {
    const allPlayersDead = this.players.every(p => !p.hasLivesLeft() && !p.active);
    if (allPlayersDead || this.baseHealth <= 0) {
      this.state = GameState.GAMEOVER;
    }
  }

  render(ctx: CanvasRenderingContext2D, offsetX: number = 0, offsetY: number = 0): void {
    ctx.save();
    ctx.translate(offsetX, offsetY);

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, MAP_SIZE, MAP_SIZE);

    this.map.render(ctx, 0, 0);

    for (const powerup of this.powerups) {
      powerup.render(ctx);
    }

    for (const player of this.players) {
      if (player.active) player.render(ctx);
    }

    for (const enemy of this.enemies) {
      if (enemy.active) enemy.render(ctx);
    }

    for (const bullet of this.bullets) {
      bullet.render(ctx);
    }

    for (const explosion of this.explosions) {
      explosion.render(ctx);
    }

    ctx.restore();
  }

  getWave(): number { return this.wave; }
  getBaseHealth(): number { return this.baseHealth; }
  getScore(): number { return this.score; }
  getEnemiesRemaining(): number { return this.enemiesInWave - this.enemiesSpawned + this.enemies.length; }
  getMapSize(): number { return MAP_SIZE; }
}
