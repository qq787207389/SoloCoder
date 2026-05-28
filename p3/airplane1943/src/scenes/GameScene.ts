import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, LEVEL_CONFIGS, PLAYER_CONFIG } from '../config/gameConfig';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Boss } from '../entities/Boss';
import { Bullet } from '../entities/Bullet';
import { Pickup } from '../entities/Pickup';
import { GameUI } from '../ui/GameUI';
import { WaveConfig, PickupType, EnemyType } from '../types/game';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemyPool!: Phaser.Physics.Arcade.Group;
  private playerBulletPool!: Phaser.Physics.Arcade.Group;
  private enemyBulletPool!: Phaser.Physics.Arcade.Group;
  private pickupPool!: Phaser.Physics.Arcade.Group;
  private boss!: Boss;
  private ui!: GameUI;
  private score: number = 0;
  private waveIndex: number = 0;
  private levelIndex: number = 0;
  private levelTime: number = 0;
  private isGameOver: boolean = false;
  private isBossActive: boolean = false;
  private background!: Phaser.GameObjects.TileSprite;
  private clouds!: Phaser.GameObjects.Group;
  private debris!: Phaser.GameObjects.Group;
  private islands!: Phaser.GameObjects.Group;

  constructor() {
    super('GameScene');
  }

  public create(): void {
    this.createBackground();
    this.createPools();
    this.createPlayer();
    this.createBoss();
    this.createUI();
    this.createCollisions();
    this.startLevel(0);
  }

  private createBackground(): void {
    const bgGraphics = this.make.graphics();
    bgGraphics.fillGradientStyle(0x87CEEB, 0x87CEEB, 0x1E90FF, 0x1E90FF, 1);
    bgGraphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    bgGraphics.generateTexture('background', GAME_WIDTH, GAME_HEIGHT);

    this.background = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'background');
    this.background.setOrigin(0, 0);
    this.background.setDepth(0);

    this.clouds = this.add.group();
    this.debris = this.add.group();
    this.islands = this.add.group();

    this.time.addEvent({
      delay: 3000,
      callback: this.spawnCloud,
      callbackScope: this,
      loop: true
    });

    this.time.addEvent({
      delay: 8000,
      callback: this.spawnIsland,
      callbackScope: this,
      loop: true
    });
  }

  private spawnCloud(): void {
    const cloud = this.add.sprite(
      Phaser.Math.Between(0, GAME_WIDTH),
      -100,
      'cloud'
    );
    cloud.setAlpha(Phaser.Math.FloatBetween(0.3, 0.7));
    cloud.setScale(Phaser.Math.FloatBetween(0.8, 1.5));
    cloud.setDepth(5);
    this.clouds.add(cloud);
  }

  private spawnIsland(): void {
    if (Math.random() > 0.5) return;
    const island = this.add.sprite(
      Phaser.Math.Between(50, GAME_WIDTH - 50),
      -80,
      'island'
    );
    island.setScale(Phaser.Math.FloatBetween(0.6, 1.2));
    island.setDepth(2);
    this.islands.add(island);
  }

  private createPools(): void {
    this.playerBulletPool = this.physics.add.group({
      classType: Bullet,
      maxSize: 100,
      runChildUpdate: true,
      createCallback: (obj) => {
        const bullet = obj as Bullet;
        if (bullet.body) {
          bullet.body.setSize(4, 8);
        }
      }
    });

    this.enemyBulletPool = this.physics.add.group({
      classType: Bullet,
      maxSize: 150,
      runChildUpdate: true,
      createCallback: (obj) => {
        const bullet = obj as Bullet;
        if (bullet.body) {
          bullet.body.setSize(6, 6);
        }
      }
    });

    this.enemyPool = this.physics.add.group({
      maxSize: 50,
      runChildUpdate: true
    });

    this.pickupPool = this.physics.add.group({
      classType: Pickup,
      maxSize: 30,
      runChildUpdate: true
    });
  }

  private createPlayer(): void {
    this.player = new Player(
      this,
      GAME_WIDTH / 2,
      GAME_HEIGHT - 100,
      this.playerBulletPool
    );
    this.player.on('playerDeath', this.onPlayerDeath, this);
    this.player.on('playerHit', this.onPlayerHit, this);
    this.player.on('weaponUpgraded', this.onWeaponUpgraded, this);
  }

  private createBoss(): void {
    this.boss = new Boss(this, GAME_WIDTH / 2, -200, this.enemyBulletPool);
    this.boss.on('bossDeath', this.onBossDeath, this);
  }

  private createUI(): void {
    this.ui = new GameUI(this);
  }

  private createCollisions(): void {
    this.physics.add.overlap(
      this.playerBulletPool,
      this.enemyPool,
      this.onPlayerBulletHitEnemy,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.playerBulletPool,
      this.boss,
      this.onPlayerBulletHitBoss,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.enemyBulletPool,
      this.player,
      this.onEnemyBulletHitPlayer,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.enemyPool,
      this.player,
      this.onEnemyHitPlayer,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.pickupPool,
      this.player,
      this.onPickupCollect,
      undefined,
      this
    );
  }

  private startLevel(index: number): void {
    this.levelIndex = index;
    this.waveIndex = 0;
    this.levelTime = 0;
    this.isGameOver = false;
    this.isBossActive = false;

    const level = LEVEL_CONFIGS[index];
    this.ui.updateLevelName(level.name);
    this.ui.hideBossHealth();

    this.applyLevelTheme(level.timeOfDay);
  }

  private applyLevelTheme(timeOfDay: 'morning' | 'night' | 'storm'): void {
    switch (timeOfDay) {
      case 'morning':
        this.background.setTint(0xFFFFFF);
        break;
      case 'night':
        this.background.setTint(0x333366);
        break;
      case 'storm':
        this.background.setTint(0x666666);
        break;
    }
  }

  public update(time: number, delta: number): void {
    this.background.tilePositionY += 2;

    this.clouds.getChildren().forEach((cloud: any) => {
      cloud.y += 0.5;
      if (cloud.y > GAME_HEIGHT + 100) {
        cloud.destroy();
      }
    });

    this.islands.getChildren().forEach((island: any) => {
      island.y += 1;
      if (island.y > GAME_HEIGHT + 100) {
        island.destroy();
      }
    });

    this.player.update(time, delta);
    this.ui.updateFuel(this.player.fuel, this.player.maxFuel);
    this.ui.updateWeaponLevel(this.player.weaponLevel, this.player.currentWeapon);
    this.ui.updateFormation(this.player.formation);
    this.ui.updateEnergyCapsules(this.player.energyCapsules);

    if (this.isBossActive && this.boss.active) {
      this.boss.update(time, delta);
      this.ui.updateBossHealth(this.boss.getHealthPercent());
    }

    this.levelTime += delta;
    this.spawnWaves();
  }

  private spawnWaves(): void {
    if (this.isBossActive) return;

    const level = LEVEL_CONFIGS[this.levelIndex];
    if (this.waveIndex >= level.waves.length) {
      this.spawnBoss(level.bossHealth);
      return;
    }

    const wave = level.waves[this.waveIndex];
    if (this.levelTime >= wave.time) {
      this.spawnWave(wave);
      this.waveIndex++;
    }
  }

  private spawnWave(wave: WaveConfig): void {
    for (let i = 0; i < wave.count; i++) {
      this.time.delayedCall(i * 200, () => {
        const position = this.getEnemyPosition(wave, i, wave.count);
        const pattern = wave.pattern === 'v' || wave.pattern === 'line' ? 'straight' : 
                        wave.pattern === 'circle' ? 'circle' : 'sine';

        let enemy = this.enemyPool.getFirstDead() as Enemy;
        if (!enemy) {
          if (this.enemyPool.getLength() >= 50) return;
          enemy = new Enemy(this, position.x, position.y, this.enemyBulletPool);
          enemy.on('enemyDeath', this.onEnemyDeath, this);
          this.enemyPool.add(enemy);
        }

        enemy.enableBody(true, position.x, position.y, true, true);
        enemy.spawn(wave.type, position.x, position.y, pattern);
      });
    }
  }

  private getEnemyPosition(wave: WaveConfig, index: number, total: number): { x: number; y: number } {
    const baseX = wave.position.x;
    const baseY = wave.position.y - index * 30;

    switch (wave.pattern) {
      case 'line':
        return { x: baseX - (total - 1) * 30 + index * 60, y: baseY };
      case 'v':
        const vOffset = Math.abs(index - (total - 1) / 2) * 40;
        return { x: baseX - (total - 1) * 30 + index * 60, y: baseY - vOffset };
      case 'circle':
        return { x: baseX, y: baseY };
      case 'random':
        return { x: Phaser.Math.Between(50, GAME_WIDTH - 50), y: baseY };
      default:
        return { x: baseX, y: baseY };
    }
  }

  private spawnBoss(health: number): void {
    this.isBossActive = true;
    this.boss.enableBody(true, this.boss.x, this.boss.y, true, true);
    this.boss.spawn(health);
    this.ui.showBossHealth();
  }

  private onPlayerBulletHitEnemy(bulletObj: any, enemyObj: any): void {
    const bullet = bulletObj as Bullet;
    const enemy = enemyObj as Enemy;

    if (!bullet.active || !enemy.active) return;

    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.disableBody(true, true);

    const score = enemy.takeDamage(bullet.damage);
    if (score > 0) {
      this.score += score;
      this.ui.updateScore(this.score);
      this.createExplosion(enemy.x, enemy.y);
    }
  }

  private onPlayerBulletHitBoss(bulletObj: any, bossObj: any): void {
    const bullet = bulletObj as Bullet;
    const boss = bossObj as Boss;

    if (!bullet.active || !boss.active) return;

    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.disableBody(true, true);

    const score = boss.takeDamage(bullet.damage);
    if (score > 0) {
      this.score += score;
      this.ui.updateScore(this.score);
    }
  }

  private onEnemyBulletHitPlayer(bulletObj: any, playerObj: any): void {
    if (this.isGameOver) return;

    const bullet = bulletObj as Bullet;
    if (!bullet.active) return;

    const player = playerObj as Player;
    if (!(player instanceof Player)) return;

    bullet.setActive(false);
    bullet.setVisible(false);
    bullet.disableBody(true, true);

    player.takeDamage(PLAYER_CONFIG.hitFuelLoss);
  }

  private onEnemyHitPlayer(enemyObj: any, playerObj: any): void {
    if (this.isGameOver) return;

    const enemy = enemyObj as Enemy;
    if (!enemy.active) return;

    const player = playerObj as Player;
    if (!(player instanceof Player)) return;

    player.takeDamage(PLAYER_CONFIG.hitFuelLoss * 2);
    enemy.takeDamage(enemy.health);
  }

  private onPickupCollect(pickupObj: any, playerObj: any): void {
    if (this.isGameOver) return;

    const pickup = pickupObj as Pickup;
    if (!pickup.active) return;

    const player = playerObj as Player;
    if (!(player instanceof Player)) return;

    pickup.collect();

    switch (pickup.pickupType) {
      case 'fuel':
        player.addFuel(pickup.value);
        break;
      case 'energy_red':
        player.addEnergyCapsule('red');
        break;
      case 'energy_blue':
        player.addEnergyCapsule('blue');
        break;
      case 'energy_green':
        player.addEnergyCapsule('green');
        break;
    }
  }

  private onEnemyDeath(enemy: Enemy): void {
    if (enemy.dropFuelChance()) {
      this.spawnPickup(enemy.x, enemy.y, 'fuel', 20);
    }
    if (enemy.dropEnergyChance()) {
      const colors: ('energy_red' | 'energy_blue' | 'energy_green')[] = ['energy_red', 'energy_blue', 'energy_green'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.spawnPickup(enemy.x + 15, enemy.y, color, 1);
    }
  }

  private spawnPickup(x: number, y: number, type: PickupType, value: number): void {
    const pickup = this.pickupPool.get(x, y) as Pickup;
    if (!pickup) return;

    pickup.spawn(x, y, type, value);
  }

  private onPlayerDeath(): void {
    this.isGameOver = true;
    this.physics.pause();

    this.player.setActive(false);
    this.player.setVisible(false);

    this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      '游戏结束\n按 R 重新开始',
      {
        fontFamily: 'Arial',
        fontSize: '32px',
        color: '#FF0000',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center'
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(1000);

    if (this.input.keyboard) {
      this.input.keyboard.removeAllListeners();
    }

    this.time.delayedCall(200, () => {
      if (this.input.keyboard) {
        this.input.keyboard.once('keydown-R', () => {
          this.scene.restart();
        });
      }
    });
  }

  private onPlayerHit(): void {
    this.createExplosion(this.player.x, this.player.y, 0.5);
  }

  private onWeaponUpgraded(): void {
    this.cameras.main.flash(200, 0, 255, 0, true);
  }

  private onBossDeath(): void {
    this.ui.hideBossHealth();
    this.createExplosion(this.boss.x, this.boss.y, 3);
    
    for (let i = 0; i < 5; i++) {
      this.spawnPickup(
        this.boss.x + Phaser.Math.Between(-80, 80),
        this.boss.y + Phaser.Math.Between(-50, 50),
        'fuel',
        15
      );
    }

    this.time.delayedCall(3000, () => {
      const nextLevel = this.levelIndex + 1;
      if (nextLevel < LEVEL_CONFIGS.length) {
        this.startLevel(nextLevel);
      } else {
        this.showVictory();
      }
    });
  }

  private showVictory(): void {
    this.physics.pause();
    this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      '胜利！\n最终得分: ' + this.score + '\n按 R 重新开始',
      {
        fontFamily: 'Arial',
        fontSize: '32px',
        color: '#FFFF00',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center'
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(1000);

    this.input.keyboard!.once('keydown-R', () => {
      this.scene.restart();
    });
  }

  private createExplosion(x: number, y: number, scale: number = 1): void {
    const explosion = this.add.sprite(x, y, 'explosion');
    explosion.setScale(scale);
    explosion.setDepth(50);

    this.tweens.add({
      targets: explosion,
      alpha: 0,
      scale: scale * 1.5,
      duration: 300,
      onComplete: () => {
        explosion.destroy();
      }
    });

    this.cameras.main.shake(100, 0.01 * scale);
  }
}
