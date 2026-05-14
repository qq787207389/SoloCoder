import { Input } from './Input';
import { Camera } from './Camera';
import { TileMap } from './TileMap';
import { SpatialHash } from './SpatialHash';
import { ObjectPool } from './ObjectPool';
import { Player } from '../entities/Player';
import { Bullet } from '../weapons/Bullet';
import { Enemy } from '../enemies/Enemy';
import { Boss } from '../bosses/Boss';
import { Item } from '../items/Item';
import { UIManager } from '../ui/UIManager';
import { LevelManager } from '../level/LevelManager';

export class Game {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public input: Input;
  public camera: Camera;
  public tileMap: TileMap;
  public spatialHash: SpatialHash;
  public bulletPool: ObjectPool<Bullet>;
  public enemyBulletPool: ObjectPool<Bullet>;
  public uiManager: UIManager;
  public levelManager: LevelManager;
  
  public player: Player;
  public enemies: Enemy[];
  public bosses: Boss[];
  public items: Item[];
  
  public score: number;
  public lives: number;
  public bombs: number;
  public gameOver: boolean;
  public paused: boolean;
  public bossActive: boolean;
  
  public lastTime: number;
  public deltaTime: number;
  
  private animationId: number;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.canvas.width = 960;
    this.canvas.height = 540;
    
    this.input = new Input();
    this.camera = new Camera(this.canvas.width, this.canvas.height);
    this.tileMap = new TileMap(32, 200, 17);
    this.spatialHash = new SpatialHash(64);
    
    this.bulletPool = new ObjectPool<Bullet>(() => new Bullet(this), 50, 100);
    this.enemyBulletPool = new ObjectPool<Bullet>(() => new Bullet(this), 50, 100);
    
    this.player = new Player(this, 100, 300);
    this.enemies = [];
    this.bosses = [];
    this.items = [];
    
    this.score = 0;
    this.lives = 3;
    this.bombs = 3;
    this.gameOver = false;
    this.paused = false;
    this.bossActive = false;
    
    this.lastTime = 0;
    this.deltaTime = 0;
    this.animationId = 0;
    
    this.uiManager = new UIManager(this);
    this.levelManager = new LevelManager(this);
    
    this.setupTileMap();
  }
  
  private setupTileMap(): void {
    this.tileMap.setTileData(1, { id: 1, solid: true, color: '#4a4a4a' });
    this.tileMap.setTileData(2, { id: 2, solid: true, color: '#6b6b6b' });
    this.tileMap.setTileData(3, { id: 3, solid: false, color: '#2d5a2d' });
    
    for (let x = 0; x < 200; x++) {
      this.tileMap.setTile(x, 15, 1);
      this.tileMap.setTile(x, 16, 1);
    }
    
    for (let i = 0; i < 30; i++) {
      const platformX = 15 + i * 6;
      const platformY = 12 + (i % 3);
      for (let px = 0; px < 3; px++) {
        this.tileMap.setTile(platformX + px, platformY, 2);
      }
    }
    
    this.camera.setBounds(0, 200 * 32);
  }

  public start(): void {
    this.lastTime = performance.now();
    this.gameLoop();
  }

  private gameLoop(): void {
    const currentTime = performance.now();
    this.deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    if (!this.paused && !this.gameOver) {
      this.update();
    }
    this.render();

    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  private update(): void {
    // 1. 先更新玩家
    this.player.update(this.deltaTime);
    
    // 2. 相机跟随玩家 - 保持玩家在屏幕中间
    const targetCamX = this.player.x - this.canvas.width / 2 + 12;
    this.camera.x += (targetCamX - this.camera.x) * 0.1;
    
    // 3. 限制相机不要移出地图边界
    this.camera.x = Math.max(0, Math.min(this.camera.x, 200 * 32 - this.canvas.width));
    
    this.levelManager.update(this.deltaTime);
    
    this.spatialHash.clear();
    this.spatialHash.insert(this.player);
    
    this.bulletPool.getActive().forEach(bullet => {
      bullet.update(this.deltaTime);
      if (bullet.active) {
        this.spatialHash.insert(bullet);
      }
    });
    
    this.enemyBulletPool.getActive().forEach(bullet => {
      bullet.update(this.deltaTime);
      if (bullet.active) {
        this.spatialHash.insert(bullet);
      }
    });
    
    this.enemies = this.enemies.filter(enemy => enemy.active);
    this.enemies.forEach(enemy => {
      enemy.update(this.deltaTime);
      this.spatialHash.insert(enemy);
    });
    
    this.bosses = this.bosses.filter(boss => boss.active);
    this.bosses.forEach(boss => {
      boss.update(this.deltaTime);
      this.spatialHash.insert(boss);
    });
    
    this.items = this.items.filter(item => item.active);
    this.items.forEach(item => {
      item.update(this.deltaTime);
    });
    
    this.checkCollisions();
    
    this.input.update();
  }

  private checkCollisions(): void {
    const playerBounds = this.player.getBounds();
    
    this.bulletPool.getActive().forEach(bullet => {
      if (!bullet.isEnemyBullet) {
        this.enemies.forEach(enemy => {
          if (this.checkRectCollision(bullet.getBounds(), enemy.getBounds())) {
            enemy.takeDamage(bullet.damage);
            bullet.active = false;
            if (!enemy.active) {
              this.score += enemy.scoreValue;
            }
          }
        });
        
        this.bosses.forEach(boss => {
          if (this.checkRectCollision(bullet.getBounds(), boss.getBounds())) {
            boss.takeDamage(bullet.damage);
            bullet.active = false;
          }
        });
      }
    });
    
    this.enemyBulletPool.getActive().forEach(bullet => {
      if (bullet.isEnemyBullet && this.checkRectCollision(bullet.getBounds(), playerBounds)) {
        this.player.takeDamage(1);
        bullet.active = false;
      }
    });
    
    this.enemies.forEach(enemy => {
      if (this.checkRectCollision(enemy.getBounds(), playerBounds)) {
        this.player.takeDamage(1);
      }
    });
    
    this.items.forEach(item => {
      if (this.checkRectCollision(item.getBounds(), playerBounds)) {
        item.collect(this.player);
        item.active = false;
      }
    });
  }

  private checkRectCollision(a: any, b: any): boolean {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }

  private render(): void {
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.drawBackground();
    
    this.tileMap.render(this.ctx, this.camera.x, this.canvas.width, this.canvas.height);
    
    this.items.forEach(item => item.render(this.ctx, this.camera.x));
    
    this.enemies.forEach(enemy => enemy.render(this.ctx, this.camera.x));
    
    this.bosses.forEach(boss => boss.render(this.ctx, this.camera.x));
    
    this.bulletPool.getActive().forEach(bullet => bullet.render(this.ctx, this.camera.x));
    this.enemyBulletPool.getActive().forEach(bullet => bullet.render(this.ctx, this.camera.x));
    
    this.player.render(this.ctx, this.camera.x);
    
    this.uiManager.render(this.ctx);
  }

  private drawBackground(): void {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#0f0f23');
    gradient.addColorStop(0.5, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = '#1f2f4f';
    for (let i = 0; i < 10; i++) {
      const x = (i * 200 - this.camera.x * 0.3) % (this.canvas.width + 200) - 100;
      const height = 100 + Math.sin(i * 1.5) * 50;
      this.ctx.beginPath();
      this.ctx.moveTo(x, this.canvas.height - 100);
      this.ctx.lineTo(x + 100, this.canvas.height - 100 - height);
      this.ctx.lineTo(x + 200, this.canvas.height - 100);
      this.ctx.fill();
    }
  }

  public addEnemy(enemy: Enemy): void {
    this.enemies.push(enemy);
  }

  public addBoss(boss: Boss): void {
    this.bosses.push(boss);
    this.bossActive = true;
  }

  public addItem(item: Item): void {
    this.items.push(item);
  }

  public spawnExplosion(x: number, y: number): void {
    for (let i = 0; i < 8; i++) {
      const particle = {
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 200,
        vy: (Math.random() - 0.5) * 200,
        life: 0.5,
        size: 4 + Math.random() * 4
      };
    }
  }

  public useBomb(): void {
    if (this.bombs > 0) {
      this.bombs--;
      this.enemies.forEach(enemy => {
        enemy.takeDamage(enemy.health);
        this.score += enemy.scoreValue;
      });
      this.enemyBulletPool.clear();
    }
  }

  public playerDied(): void {
    this.lives--;
    if (this.lives <= 0) {
      this.gameOver = true;
    } else {
      this.player.respawn();
    }
  }
}