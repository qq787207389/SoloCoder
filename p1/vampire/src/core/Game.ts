
import * as PIXI from 'pixi.js';
import { InputManager } from './Input';
import { ObjectPool } from './ObjectPool';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { ExpOrb } from '../entities/ExpOrb';
import { Chest, ChestType } from '../entities/Chest';
import { Boss } from '../entities/Boss';
import { EnemySpawner } from '../systems/EnemySpawner';
import { ParticleSystem } from '../systems/ParticleSystem';
import { HUD } from '../ui/HUD';
import { UpgradePanel } from '../ui/UpgradePanel';
import { getRandomUpgrades } from '../config/upgrades';
import { loadSaveData, saveSaveData, updateHighScore } from '../utils/storage';

export class Game {
  private app: PIXI.Application;
  private input: InputManager;
  private player: Player;
  private enemyPool: ObjectPool&lt;Enemy&gt;;
  private bulletPool: ObjectPool&lt;Bullet&gt;;
  private expOrbPool: ObjectPool&lt;ExpOrb&gt;;
  private chestPool: ObjectPool&lt;Chest&gt;;
  private boss: Boss;
  private spawner: EnemySpawner;
  private particles: ParticleSystem;
  private hud: HUD;
  private upgradePanel: UpgradePanel;
  
  private mapSize: number = 2000;
  private fireTimer: number = 0;
  private bossTimer: number = 0;
  private chestTimer: number = 0;
  private gameState: 'menu' | 'playing' | 'paused' | 'gameover' | 'upgrading' = 'menu';
  private saveData = loadSaveData();

  private gameContainer: PIXI.Container;
  private mapBackground: PIXI.Graphics;
  private menuScreen: HTMLDivElement;
  private gameOverScreen: HTMLDivElement;

  constructor(app: PIXI.Application) {
    this.app = app;
    this.input = new InputManager();
    
    this.gameContainer = new PIXI.Container();
    this.app.stage.addChild(this.gameContainer);
    
    this.createMap();
    
    this.player = new Player(0, 0);
    this.gameContainer.addChild(this.player.sprite);
    
    this.enemyPool = new ObjectPool(() =&gt; {
      const enemy = new Enemy();
      this.gameContainer.addChild(enemy.sprite);
      return enemy;
    }, 100);
    
    this.bulletPool = new ObjectPool(() =&gt; {
      const bullet = new Bullet();
      this.gameContainer.addChild(bullet.sprite);
      return bullet;
    }, 200);
    
    this.expOrbPool = new ObjectPool(() =&gt; {
      const orb = new ExpOrb();
      this.gameContainer.addChild(orb.sprite);
      return orb;
    }, 100);
    
    this.chestPool = new ObjectPool(() =&gt; {
      const chest = new Chest();
      this.gameContainer.addChild(chest.sprite);
      return chest;
    }, 10);
    
    this.boss = new Boss();
    this.gameContainer.addChild(this.boss.sprite);
    
    this.spawner = new EnemySpawner();
    this.particles = new ParticleSystem(this.gameContainer);
    this.hud = new HUD();
    this.upgradePanel = new UpgradePanel();
    
    this.createMenuScreen();
    this.createGameOverScreen();
    
    this.app.ticker.add(this.update.bind(this));
  }

  private createMap(): void {
    this.mapBackground = new PIXI.Graphics();
    this.mapBackground.beginFill(0x1a1a2e);
    this.mapBackground.drawRect(-this.mapSize/2, -this.mapSize/2, this.mapSize, this.mapSize);
    this.mapBackground.endFill();
    
    const gridSize = 100;
    this.mapBackground.lineStyle(1, 0x2a2a4e, 0.5);
    for (let x = -this.mapSize/2; x &lt;= this.mapSize/2; x += gridSize) {
      this.mapBackground.moveTo(x, -this.mapSize/2);
      this.mapBackground.lineTo(x, this.mapSize/2);
    }
    for (let y = -this.mapSize/2; y &lt;= this.mapSize/2; y += gridSize) {
      this.mapBackground.moveTo(-this.mapSize/2, y);
      this.mapBackground.lineTo(this.mapSize/2, y);
    }
    
    this.gameContainer.addChild(this.mapBackground);
  }

  private createMenuScreen(): void {
    this.menuScreen = document.createElement('div');
    this.menuScreen.style.position = 'absolute';
    this.menuScreen.style.top = '0';
    this.menuScreen.style.left = '0';
    this.menuScreen.style.width = '100%';
    this.menuScreen.style.height = '100%';
    this.menuScreen.style.backgroundColor = '#0a0a1e';
    this.menuScreen.style.display = 'flex';
    this.menuScreen.style.flexDirection = 'column';
    this.menuScreen.style.alignItems = 'center';
    this.menuScreen.style.justifyContent = 'center';
    this.menuScreen.style.fontFamily = 'Press Start 2P, Arial, sans-serif';
    this.menuScreen.style.zIndex = '200';

    const title = document.createElement('div');
    title.style.color = '#9d4edd';
    title.style.fontSize = '36px';
    title.style.marginBottom = '20px';
    title.textContent = 'VAMPIRE SURVIVOR';

    const subtitle = document.createElement('div');
    subtitle.style.color = '#888';
    subtitle.style.fontSize = '14px';
    subtitle.style.marginBottom = '40px';
    subtitle.textContent = 'A Roguelike Survival Game';

    const highScore = document.createElement('div');
    highScore.style.color = '#ffcc00';
    highScore.style.fontSize = '12px';
    highScore.style.marginBottom = '40px';
    highScore.textContent = `HIGH SCORE: ${Math.floor(this.saveData.highScore)}s`;

    const startBtn = document.createElement('button');
    startBtn.style.backgroundColor = '#9d4edd';
    startBtn.style.color = '#fff';
    startBtn.style.border = 'none';
    startBtn.style.padding = '15px 40px';
    startBtn.style.fontSize = '16px';
    startBtn.style.fontFamily = 'inherit';
    startBtn.style.cursor = 'pointer';
    startBtn.style.borderRadius = '5px';
    startBtn.textContent = 'START GAME';
    startBtn.onclick = () =&gt; this.startGame();

    const controls = document.createElement('div');
    controls.style.color = '#666';
    controls.style.fontSize = '10px';
    controls.style.marginTop = '40px';
    controls.style.textAlign = 'center';
    controls.style.lineHeight = '2';
    controls.innerHTML = 'WASD or ARROW KEYS to move&lt;br&gt;Auto-attack enemies';

    this.menuScreen.appendChild(title);
    this.menuScreen.appendChild(subtitle);
    this.menuScreen.appendChild(highScore);
    this.menuScreen.appendChild(startBtn);
    this.menuScreen.appendChild(controls);
    document.getElementById('game-container')?.appendChild(this.menuScreen);
  }

  private createGameOverScreen(): void {
    this.gameOverScreen = document.createElement('div');
    this.gameOverScreen.style.position = 'absolute';
    this.gameOverScreen.style.top = '0';
    this.gameOverScreen.style.left = '0';
    this.gameOverScreen.style.width = '100%';
    this.gameOverScreen.style.height = '100%';
    this.gameOverScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    this.gameOverScreen.style.display = 'none';
    this.gameOverScreen.style.flexDirection = 'column';
    this.gameOverScreen.style.alignItems = 'center';
    this.gameOverScreen.style.justifyContent = 'center';
    this.gameOverScreen.style.fontFamily = 'Press Start 2P, Arial, sans-serif';
    this.gameOverScreen.style.zIndex = '200';

    const title = document.createElement('div');
    title.style.color = '#ff4444';
    title.style.fontSize = '32px';
    title.style.marginBottom = '30px';
    title.textContent = 'GAME OVER';

    this.gameOverScreen.appendChild(title);
    document.getElementById('game-container')?.appendChild(this.gameOverScreen);
  }

  private startGame(): void {
    this.menuScreen.style.display = 'none';
    this.gameOverScreen.style.display = 'none';
    this.gameState = 'playing';
    this.resetGame();
  }

  private resetGame(): void {
    this.player = new Player(0, 0);
    this.gameContainer.addChild(this.player.sprite);
    
    this.enemyPool.getAll().forEach(e =&gt; e.deactivate());
    this.bulletPool.getAll().forEach(b =&gt; b.deactivate());
    this.expOrbPool.getAll().forEach(o =&gt; o.deactivate());
    this.chestPool.getAll().forEach(c =&gt; c.deactivate());
    this.boss.deactivate();
    this.particles.clear();
    
    this.spawner.reset();
    this.fireTimer = 0;
    this.bossTimer = 0;
    this.chestTimer = 30;
  }

  private update(deltaTime: number): void {
    const delta = deltaTime / 60;

    if (this.gameState === 'playing') {
      this.updateGame(delta);
    } else if (this.gameState === 'paused') {
      // Do nothing
    }
  }

  private updateGame(delta: number): void {
    this.player.update(delta, this.input, this.mapSize);
    
    this.gameContainer.pivot.set(this.player.x, this.player.y);
    this.gameContainer.position.set(this.app.screen.width / 2, this.app.screen.height / 2);

    this.fireTimer -= delta;
    if (this.fireTimer &lt;= 0) {
      this.fireTimer = this.player.fireRate;
      this.playerShoot();
    }

    const spawnResult = this.spawner.update(delta);
    if (spawnResult.shouldSpawn &amp;&amp; spawnResult.type) {
      this.spawnEnemy(spawnResult.type);
    }

    this.bossTimer += delta;
    if (this.bossTimer &gt;= 60 &amp;&amp; !this.boss.active) {
      this.spawnBoss();
      this.bossTimer = 0;
    }

    this.chestTimer -= delta;
    if (this.chestTimer &lt;= 0) {
      this.chestTimer = 30 + Math.random() * 30;
      this.spawnChest();
    }

    this.updateEnemies(delta);
    this.updateBullets(delta);
    this.updateExpOrbs(delta);
    this.updateChests(delta);
    this.updateBoss(delta);
    this.particles.update(delta);

    this.checkCollisions();

    if (this.player.health &lt;= 0) {
      this.gameOver();
    }

    this.hud.update(
      this.player.health,
      this.player.maxHealth,
      this.player.exp,
      this.player.expToLevel,
      this.player.level,
      this.player.kills,
      this.spawner.getGameTime()
    );

    if (this.boss.active) {
      this.hud.showBossHealth(this.boss.getHealthPercent());
    } else {
      this.hud.hideBossHealth();
    }
  }

  private playerShoot(): void {
    const enemies = this.enemyPool.getAllActive();
    let nearestEnemy: Enemy | null = null;
    let nearestDist = Infinity;

    for (const enemy of enemies) {
      const dist = Math.sqrt(
        Math.pow(enemy.x - this.player.x, 2) +
        Math.pow(enemy.y - this.player.y, 2)
      );
      if (dist &lt; nearestDist &amp;&amp; dist &lt; 500) {
        nearestDist = dist;
        nearestEnemy = enemy;
      }
    }

    if (this.boss.active) {
      const bossDist = Math.sqrt(
        Math.pow(this.boss.x - this.player.x, 2) +
        Math.pow(this.boss.y - this.player.y, 2)
      );
      if (bossDist &lt; nearestDist) {
        nearestDist = bossDist;
        nearestEnemy = null;
      }
    }

    if (!nearestEnemy &amp;&amp; !this.boss.active) return;

    const targetX = nearestEnemy ? nearestEnemy.x : this.boss.x;
    const targetY = nearestEnemy ? nearestEnemy.y : this.boss.y;

    const baseAngle = Math.atan2(targetY - this.player.y, targetX - this.player.x);

    for (let i = 0; i &lt; this.player.bulletCount; i++) {
      let angle = baseAngle;
      if (this.player.bulletCount &gt; 1) {
        const spread = this.player.spread;
        angle = baseAngle - spread/2 + (spread / (this.player.bulletCount - 1)) * i;
      }

      const bullet = this.bulletPool.get();
      bullet.init(
        this.player.x,
        this.player.y,
        Math.cos(angle) * this.player.bulletSpeed,
        Math.sin(angle) * this.player.bulletSpeed,
        this.player.bulletSize,
        this.player.damage,
        false
      );
    }
  }

  private spawnEnemy(type: any): void {
    const angle = Math.random() * Math.PI * 2;
    const dist = 500 + Math.random() * 200;
    const x = this.player.x + Math.cos(angle) * dist;
    const y = this.player.y + Math.sin(angle) * dist;

    const enemy = this.enemyPool.get();
    enemy.init(x, y, type);
  }

  private spawnBoss(): void {
    const angle = Math.random() * Math.PI * 2;
    const dist = 600;
    const x = this.player.x + Math.cos(angle) * dist;
    const y = this.player.y + Math.sin(angle) * dist;
    this.boss.init(x, y, this.player.level);
  }

  private spawnChest(): void {
    const angle = Math.random() * Math.PI * 2;
    const dist = 200 + Math.random() * 300;
    const x = this.player.x + Math.cos(angle) * dist;
    const y = this.player.y + Math.sin(angle) * dist;

    const types: ChestType[] = ['clear', 'invincible', 'exp'];
    const type = types[Math.floor(Math.random() * types.length)];

    const chest = this.chestPool.get();
    chest.init(x, y, type);
  }

  private updateEnemies(delta: number): void {
    for (const enemy of this.enemyPool.getAllActive()) {
      const result = enemy.update(delta, this.player.x, this.player.y);
      
      if (result.shouldShoot) {
        const angle = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x);
        const bullet = this.bulletPool.get();
        bullet.init(
          enemy.x,
          enemy.y,
          Math.cos(angle) * 200,
          Math.sin(angle) * 200,
          6,
          10,
          true
        );
      }
    }
  }

  private updateBullets(delta: number): void {
    for (const bullet of this.bulletPool.getAllActive()) {
      const shouldDeactivate = bullet.update(delta);
      if (shouldDeactivate) {
        bullet.deactivate();
      }
    }
  }

  private updateExpOrbs(delta: number): void {
    for (const orb of this.expOrbPool.getAllActive()) {
      const shouldCollect = orb.update(delta, this.player.x, this.player.y, this.player.magnetRange);
      if (shouldCollect) {
        if (this.player.addExp(orb.value)) {
          this.levelUp();
        }
        orb.deactivate();
      }
    }
  }

  private updateChests(delta: number): void {
    for (const chest of this.chestPool.getAllActive()) {
      const shouldCollect = chest.update(delta, this.player.x, this.player.y);
      if (shouldCollect) {
        this.activateChest(chest.type);
        chest.deactivate();
      }
    }
  }

  private updateBoss(delta: number): void {
    if (!this.boss.active) return;

    const result = this.boss.update(delta, this.player.x, this.player.y);
    
    if (result.shouldShoot) {
      this.bossShoot(result.pattern);
    }
  }

  private bossShoot(pattern: number): void {
    if (pattern === 0) {
      for (let i = 0; i &lt; 8; i++) {
        const angle = (Math.PI * 2 / 8) * i;
        const bullet = this.bulletPool.get();
        bullet.init(
          this.boss.x,
          this.boss.y,
          Math.cos(angle) * 180,
          Math.sin(angle) * 180,
          10,
          20,
          true
        );
      }
    } else if (pattern === 1) {
      const angle = Math.atan2(this.player.y - this.boss.y, this.player.x - this.boss.x);
      for (let i = -1; i &lt;= 1; i++) {
        const bullet = this.bulletPool.get();
        bullet.init(
          this.boss.x,
          this.boss.y,
          Math.cos(angle + i * 0.3) * 250,
          Math.sin(angle + i * 0.3) * 250,
          10,
          20,
          true
        );
      }
    } else {
      for (let i = 0; i &lt; 16; i++) {
        const angle = (Math.PI * 2 / 16) * i + Date.now() * 0.001;
        const bullet = this.bulletPool.get();
        bullet.init(
          this.boss.x,
          this.boss.y,
          Math.cos(angle) * 150,
          Math.sin(angle) * 150,
          8,
          15,
          true
        );
      }
    }
  }

  private checkCollisions(): void {
    for (const enemy of this.enemyPool.getAllActive()) {
      const dist = Math.sqrt(
        Math.pow(enemy.x - this.player.x, 2) +
        Math.pow(enemy.y - this.player.y, 2)
      );
      if (dist &lt; enemy.width/2 + 16) {
        this.player.takeDamage(enemy.type.damage);
        this.particles.spawn(this.player.x, this.player.y, 0xff4444, 5);
      }
    }

    if (this.boss.active) {
      const dist = Math.sqrt(
        Math.pow(this.boss.x - this.player.x, 2) +
        Math.pow(this.boss.y - this.player.y, 2)
      );
      if (dist &lt; 50 + 16) {
        this.player.takeDamage(30);
        this.particles.spawn(this.player.x, this.player.y, 0xff4444, 5);
      }
    }

    for (const bullet of this.bulletPool.getAllActive()) {
      if (bullet.isEnemy) continue;

      for (const enemy of this.enemyPool.getAllActive()) {
        const dist = Math.sqrt(
          Math.pow(enemy.x - bullet.x, 2) +
          Math.pow(enemy.y - bullet.y, 2)
        );
        if (dist &lt; enemy.width/2 + bullet.radius) {
          if (enemy.takeDamage(bullet.damage)) {
            this.player.kills++;
            this.particles.spawn(enemy.x, enemy.y, enemy.type.color, 10);
            const orb = this.expOrbPool.get();
            orb.init(enemy.x, enemy.y, enemy.type.exp);
            
            if (enemy.type.behavior === 'split') {
              for (let i = 0; i &lt; 2; i++) {
                const smallEnemy = this.enemyPool.get();
                const offsetAngle = Math.random() * Math.PI * 2;
                smallEnemy.init(
                  enemy.x + Math.cos(offsetAngle) * 30,
                  enemy.y + Math.sin(offsetAngle) * 30,
                  { ...enemy.type, size: 15, health: 15, exp: 3 }
                );
              }
            }
            
            enemy.deactivate();
          } else {
            this.particles.spawn(bullet.x, bullet.y, enemy.type.color, 3);
          }
          bullet.deactivate();
          break;
        }
      }

      if (this.boss.active &amp;&amp; bullet.active) {
        const dist = Math.sqrt(
          Math.pow(this.boss.x - bullet.x, 2) +
          Math.pow(this.boss.y - bullet.y, 2)
        );
        if (dist &lt; 50 + bullet.radius) {
          if (this.boss.takeDamage(bullet.damage)) {
            this.particles.spawn(this.boss.x, this.boss.y, 0xff0000, 30);
            for (let i = 0; i &lt; 10; i++) {
              const orb = this.expOrbPool.get();
              const angle = Math.random() * Math.PI * 2;
              orb.init(
                this.boss.x + Math.cos(angle) * 50,
                this.boss.y + Math.sin(angle) * 50,
                15
              );
            }
            this.boss.deactivate();
          } else {
            this.particles.spawn(bullet.x, bullet.y, 0xff0000, 3);
          }
          bullet.deactivate();
        }
      }
    }

    for (const bullet of this.bulletPool.getAllActive()) {
      if (!bullet.isEnemy) continue;

      const dist = Math.sqrt(
        Math.pow(this.player.x - bullet.x, 2) +
        Math.pow(this.player.y - bullet.y, 2)
      );
      if (dist &lt; 16 + bullet.radius) {
        this.player.takeDamage(bullet.damage);
        bullet.deactivate();
        this.particles.spawn(this.player.x, this.player.y, 0xff4444, 5);
      }
    }
  }

  private activateChest(type: ChestType): void {
    if (type === 'clear') {
      for (const enemy of this.enemyPool.getAllActive()) {
        this.particles.spawn(enemy.x, enemy.y, enemy.type.color, 10);
        const orb = this.expOrbPool.get();
        orb.init(enemy.x, enemy.y, enemy.type.exp);
        enemy.deactivate();
        this.player.kills++;
      }
      this.particles.spawn(this.player.x, this.player.y, 0xffffff, 20);
    } else if (type === 'invincible') {
      this.player.setInvincible(10);
      this.particles.spawn(this.player.x, this.player.y, 0x44ffff, 20);
    } else if (type === 'exp') {
      for (let i = 0; i &lt; 20; i++) {
        const orb = this.expOrbPool.get();
        const angle = Math.random() * Math.PI * 2;
        orb.init(
          this.player.x + Math.cos(angle) * 100,
          this.player.y + Math.sin(angle) * 100,
          5
        );
      }
      this.particles.spawn(this.player.x, this.player.y, 0xffff44, 20);
    }
  }

  private levelUp(): void {
    this.gameState = 'upgrading';
    const upgrades = getRandomUpgrades(3);
    this.upgradePanel.show(upgrades, (upgrade) =&gt; {
      upgrade.apply(this.player);
      this.upgradePanel.hide();
      this.gameState = 'playing';
    });
  }

  private gameOver(): void {
    this.gameState = 'gameover';
    const time = this.spawner.getGameTime();
    this.saveData = updateHighScore(time);
    
    this.gameOverScreen.innerHTML = `
      &lt;div style="color: #ff4444; font-size: 32px; margin-bottom: 30px;"&gt;GAME OVER&lt;/div&gt;
      &lt;div style="color: #fff; font-size: 16px; margin-bottom: 10px;"&gt;TIME: ${Math.floor(time)}s&lt;/div&gt;
      &lt;div style="color: #fff; font-size: 16px; margin-bottom: 10px;"&gt;LEVEL: ${this.player.level}&lt;/div&gt;
      &lt;div style="color: #fff; font-size: 16px; margin-bottom: 10px;"&gt;KILLS: ${this.player.kills}&lt;/div&gt;
      &lt;div style="color: #ffcc00; font-size: 12px; margin-bottom: 40px;"&gt;HIGH SCORE: ${Math.floor(this.saveData.highScore)}s&lt;/div&gt;
      &lt;button id="restartBtn" style="background-color: #9d4edd; color: #fff; border: none; padding: 15px 40px; font-size: 16px; font-family: inherit; cursor: pointer; border-radius: 5px;"&gt;PLAY AGAIN&lt;/button&gt;
    `;
    this.gameOverScreen.style.display = 'flex';
    
    document.getElementById('restartBtn')?.addEventListener('click', () =&gt; {
      this.startGame();
    });
  }
}
