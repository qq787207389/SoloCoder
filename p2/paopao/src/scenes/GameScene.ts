import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Bubble } from '../entities/Bubble';
import { Enemy } from '../entities/Enemy';
import { Fireball } from '../entities/Fireball';
import { PowerUp } from '../entities/PowerUp';
import { ParticleManager } from '../effects/ParticleManager';
import { LEVELS } from '../config/levels';
import { LevelConfig, PowerUpType, EnemyType } from '../types/game';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private bubbles!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private fireballs!: Phaser.Physics.Arcade.Group;
  private powerUps!: Phaser.Physics.Arcade.Group;
  private particleManager!: ParticleManager;
  private background!: Phaser.GameObjects.Image;

  private currentLevel = 0;
  private score = 0;
  private lives = 3;
  private levelConfig!: LevelConfig;
  private isPaused = false;
  private isLevelComplete = false;
  private isGameOver = false;
  private isVictory = false;
  private levelTransitionTimer = 0;
  private spawnX = 60;
  private spawnY = 400;
  private processedEnemiesThisFrame: Set<Enemy> = new Set();

  private eventHandlers: Map<string, Function> = new Map();

  constructor() {
    super('GameScene');
  }

  create() {
    this.particleManager = new ParticleManager(this);

    this.platforms = this.physics.add.staticGroup();
    this.bubbles = this.physics.add.group({ classType: Bubble });
    this.enemies = this.physics.add.group({ classType: Enemy });
    this.fireballs = this.physics.add.group({ classType: Fireball });
    this.powerUps = this.physics.add.group({ classType: PowerUp });

    this.background = this.add.image(0, 0, 'background_cave').setOrigin(0);

    this.player = new Player(this, this.spawnX, this.spawnY);

    this.loadLevel(this.currentLevel);
    this.setupEventListeners();
    this.setupCollisions();

    this.cameras.main.setBounds(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.cameras.main.setBackgroundColor('#1a1a2e');
  }

  private setupEventListeners() {
    this.eventHandlers.set('shootBubble', this.onShootBubble.bind(this));
    this.eventHandlers.set('shootFireball', this.onShootFireball.bind(this));
    this.eventHandlers.set('bubblePop', this.onBubblePop.bind(this));
    this.eventHandlers.set('bubbleBounce', this.onBubbleBounce.bind(this));
    this.eventHandlers.set('enemyTrapped', this.onEnemyTrapped.bind(this));
    this.eventHandlers.set('enemyReleased', this.onEnemyReleased.bind(this));
    this.eventHandlers.set('enemyDefeated', this.onEnemyDefeated.bind(this));
    this.eventHandlers.set('enemyHurt', this.onEnemyHurt.bind(this));
    this.eventHandlers.set('fireballHitWall', this.onFireballHitWall.bind(this));
    this.eventHandlers.set('powerUpCollected', this.onPowerUpCollected.bind(this));
    this.eventHandlers.set('playerJump', this.onPlayerJump.bind(this));

    this.eventHandlers.forEach((handler, event) => {
      this.events.on(event, handler);
    });
  }

  private setupCollisions() {
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.collider(this.bubbles, this.platforms);
    this.physics.add.collider(this.powerUps, this.platforms);

    this.physics.add.overlap(this.player, this.bubbles, this.onPlayerBubbleOverlap as any, undefined, this);
    this.physics.add.overlap(this.player, this.enemies, this.onPlayerEnemyOverlap as any, undefined, this);
    this.physics.add.overlap(this.player, this.fireballs, this.onPlayerFireballOverlap as any, undefined, this);
    this.physics.add.overlap(this.player, this.powerUps, this.onPlayerPowerUpOverlap as any, undefined, this);

    this.physics.add.overlap(this.bubbles, this.enemies, this.onBubbleEnemyOverlap as any, undefined, this);
  }

  private loadLevel(levelIndex: number) {
    if (levelIndex >= LEVELS.length) {
      this.showVictory();
      return;
    }

    this.currentLevel = levelIndex;
    this.levelConfig = LEVELS[levelIndex];
    this.isLevelComplete = false;

    this.background.setTexture(`background_${this.levelConfig.theme}`);

    this.platforms.clear(true);
    this.bubbles.clear(true);
    this.enemies.clear(true);
    this.fireballs.clear(true);
    this.powerUps.clear(true);

    this.levelConfig.platforms.forEach(plat => {
      const tilesWide = Math.ceil(plat.width / 32);
      for (let i = 0; i < tilesWide; i++) {
        const platform = this.platforms.create(
          plat.x + i * 32 + 16,
          plat.y + plat.height / 2,
          `platform_${this.levelConfig.theme}`
        ) as Phaser.Physics.Arcade.Sprite;
        platform.setDisplaySize(32, plat.height);
        platform.refreshBody();
      }
    });

    this.levelConfig.enemies.forEach(enemyConfig => {
      const enemy = new Enemy(this, enemyConfig.x, enemyConfig.y, enemyConfig.type);
      this.enemies.add(enemy);
    });

    this.player.setPosition(this.spawnX, this.spawnY);
    this.player.reset();
    this.player.setVelocity(0, 0);

    this.updateUI();
  }

  update(time: number, delta: number) {
    if (this.isPaused || this.isGameOver || this.isVictory) return;

    this.processedEnemiesThisFrame.clear();

    if (this.isLevelComplete) {
      this.levelTransitionTimer -= delta;
      if (this.levelTransitionTimer <= 0) {
        this.loadLevel(this.currentLevel + 1);
      }
      return;
    }

    this.player.update(time, delta);

    (this.bubbles.getChildren() as Bubble[]).forEach(bubble => {
      bubble.update(time, delta);
    });

    (this.enemies.getChildren() as Enemy[]).forEach(enemy => {
      enemy.update(time, delta, this.player.x, this.platforms);
    });

    (this.fireballs.getChildren() as Fireball[]).forEach(fireball => {
      fireball.update(time, delta);
    });

    (this.powerUps.getChildren() as PowerUp[]).forEach(powerUp => {
      powerUp.update(time, delta);
    });

    this.checkLevelComplete();
    this.checkPlayerFall();
    this.checkEnemiesInBounds();
    this.updateUI();
  }

  private checkLevelComplete() {
    const activeEnemies = (this.enemies.getChildren() as Enemy[]).filter(e => e.active);
    const bubbles = (this.bubbles.getChildren() as Bubble[]).filter(b => b.active);

    activeEnemies.forEach(enemy => {
      if (enemy.isTrapped()) {
        const hasBubble = bubbles.some(b => b.getTrappedEnemy() === enemy);
        if (!hasBubble) {
          enemy.release();
        }
      }
    });

    if (activeEnemies.length === 0 && !this.isLevelComplete) {
      this.isLevelComplete = true;
      this.levelTransitionTimer = 2000;
      this.score += 1000;

      this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, '关卡完成!', {
        fontFamily: 'Courier New',
        fontSize: '32px',
        color: '#4ade80',
        stroke: '#166534',
        strokeThickness: 4
      }).setOrigin(0.5).setDepth(100);
    }
  }

  private checkPlayerFall() {
    if (this.player.y > GAME_HEIGHT + 50) {
      this.loseLife();
    }
  }

  private checkEnemiesInBounds() {
    const bubbles = (this.bubbles.getChildren() as Bubble[]).filter(b => b.active);

    (this.enemies.getChildren() as Enemy[]).forEach(enemy => {
      if (enemy.active) {
        if (enemy.x < -30 || enemy.x > GAME_WIDTH + 30 || enemy.y > GAME_HEIGHT + 50) {
          if (enemy.isTrapped()) {
            const hasBubble = bubbles.some(b => b.getTrappedEnemy() === enemy);
            if (hasBubble) {
              enemy.setPosition(GAME_WIDTH / 2, 100);
            } else {
              enemy.release();
              const nearestSpawn = this.findNearestSpawnPoint(enemy.x);
              enemy.setPosition(nearestSpawn.x, nearestSpawn.y);
              enemy.setVelocity(0, 0);
            }
          } else {
            const nearestSpawn = this.findNearestSpawnPoint(enemy.x);
            enemy.setPosition(nearestSpawn.x, nearestSpawn.y);
            enemy.setVelocity(0, 0);
          }
        }
      }
    });
  }

  private findNearestSpawnPoint(currentX: number): { x: number; y: number } {
    const spawnPoints = [
      { x: 60, y: 400 },
      { x: GAME_WIDTH - 60, y: 400 },
      { x: GAME_WIDTH / 2, y: 200 }
    ];
    let nearest = spawnPoints[0];
    let minDist = Math.abs(currentX - spawnPoints[0].x);
    for (let i = 1; i < spawnPoints.length; i++) {
      const dist = Math.abs(currentX - spawnPoints[i].x);
      if (dist < minDist) {
        minDist = dist;
        nearest = spawnPoints[i];
      }
    }
    return nearest;
  }

  private onPlayerBubbleOverlap(playerObj: Phaser.GameObjects.GameObject, bubbleObj: Phaser.GameObjects.GameObject) {
    const player = playerObj as Player;
    const bubble = bubbleObj as Bubble;

    if (bubble.isTrappingPlayer()) return;

    if (bubble.hasTrappedEnemy()) {
      const trappedEnemy = bubble.getTrappedEnemy() as Enemy;
      if (trappedEnemy && this.processedEnemiesThisFrame.has(trappedEnemy)) {
        return;
      }
      if (trappedEnemy) {
        this.processedEnemiesThisFrame.add(trappedEnemy);
      }
      const result = bubble.pop(true);
      if (player.body!.velocity.y >= 0) {
        player.bounce();
      }
      this.particleManager.emitBounce(bubble.x, bubble.y);

      if (result.hasShockwave) {
        this.destroyNearbyEnemies(result.x, result.y, 100);
      }
      return;
    }

    if (bubble.hasJustFired()) return;

    if (bubble.getBounces() > 0 && bubble.canTrap() && !player.isTrapped()) {
      player.getTrapped(1500);
      bubble.trapPlayer();
      this.onBubblePop(bubble.x, bubble.y, false);

      this.time.delayedCall(1500, () => {
        if (bubble.active) {
          bubble.destroy();
        }
      });
      return;
    }
  }

  private onPlayerEnemyOverlap(playerObj: Phaser.GameObjects.GameObject, enemyObj: Phaser.GameObjects.GameObject) {
    const player = playerObj as Player;
    const enemy = enemyObj as Enemy;

    if (enemy.isTrapped()) {
      if (this.processedEnemiesThisFrame.has(enemy)) {
        return;
      }
      this.processedEnemiesThisFrame.add(enemy);

      const containingBubble = (this.bubbles.getChildren() as Bubble[]).find(
        b => b.hasTrappedEnemy() && b.getTrappedEnemy() === enemy
      );

      if (containingBubble) {
        const result = containingBubble.pop(true);
        if (player.body!.velocity.y >= 0) {
          player.bounce();
        }
        this.particleManager.emitBounce(containingBubble.x, containingBubble.y);

        if (result.hasShockwave) {
          this.destroyNearbyEnemies(result.x, result.y, 100);
        }
      } else {
        this.onEnemyDefeated(enemy, enemy.x, enemy.y);
        enemy.destroy();
        if (player.body!.velocity.y >= 0) {
          player.bounce();
        }
        this.particleManager.emitBounce(enemy.x, enemy.y);
      }
      return;
    }

    if (!player.isTrapped()) {
      this.loseLife();
    }
  }

  private onPlayerFireballOverlap(playerObj: Phaser.GameObjects.GameObject, fireballObj: Phaser.GameObjects.GameObject) {
    const player = playerObj as Player;
    const fireball = fireballObj as Fireball;

    if (!player.isTrapped()) {
      fireball.destroy();
      this.loseLife();
    }
  }

  private onPlayerPowerUpOverlap(playerObj: Phaser.GameObjects.GameObject, powerUpObj: Phaser.GameObjects.GameObject) {
    const player = playerObj as Player;
    const powerUp = powerUpObj as PowerUp;

    powerUp.collect();
    player.setPowerUp(powerUp.getType(), 10000);
    this.score += 500;
  }

  private onBubbleEnemyOverlap(bubbleObj: Phaser.GameObjects.GameObject, enemyObj: Phaser.GameObjects.GameObject) {
    const bubble = bubbleObj as Bubble;
    const enemy = enemyObj as Enemy;

    if (!bubble.canTrap() || enemy.isTrapped()) return;

    if (enemy.getType() === 'boss') {
      if (bubble.canTrap()) {
        enemy.getTrapped();
        bubble.trapEnemy(enemy);
        this.time.delayedCall(500, () => {
          if (enemy.active && enemy.isTrapped()) {
            enemy.release();
            if (bubble.active) {
              bubble.releaseEnemy();
            }
          }
        });
      }
    } else {
      enemy.getTrapped();
      bubble.trapEnemy(enemy);
    }
  }

  private onShootBubble(x: number, y: number, vx: number, vy: number, hasShockwave: boolean) {
    const bubble = new Bubble(this, x, y, vx, vy, hasShockwave);
    this.bubbles.add(bubble);
  }

  private onShootFireball(x: number, y: number, direction: number, angleOffset: number, isBoss: boolean) {
    const fireball = new Fireball(this, x, y, direction, angleOffset, isBoss);
    this.fireballs.add(fireball);
  }

  private onBubblePop(x: number, y: number, hasShockwave: boolean) {
    this.particleManager.emitBubblePop(x, y, hasShockwave);
  }

  private onBubbleBounce(x: number, y: number) {
    this.particleManager.emitBubbleBounce(x, y);
  }

  private onEnemyTrapped(enemy: any) {
    this.score += 100;
  }

  private onEnemyReleased(enemy: Enemy) {
    enemy.release();
  }

  private onEnemyDefeated(enemy: Enemy, x: number, y: number) {
    const isDead = enemy.takeDamage();
    if (isDead) {
      this.score += enemy.getType() === 'boss' ? 5000 : 500;
      this.particleManager.emitEnemyDefeat(x, y);
      enemy.destroy();

      if (Math.random() < 0.25) {
        const types: PowerUpType[] = ['rapid', 'shockwave'];
        const type = types[Math.floor(Math.random() * types.length)];
        const powerUp = new PowerUp(this, x, y, type);
        this.powerUps.add(powerUp);
      }
    }
  }

  private onEnemyHurt(x: number, y: number, type: EnemyType) {
    this.particleManager.emitDamage(x, y, type);
  }

  private onFireballHitWall(x: number, y: number) {
    this.particleManager.emitFireballHit(x, y);
  }

  private onPowerUpCollected(type: PowerUpType, x: number, y: number) {
    this.particleManager.emitPowerUp(x, y, type);
  }

  private onPlayerJump() {
    this.particleManager.emitJump(this.player.x, this.player.y);
  }

  private destroyNearbyEnemies(x: number, y: number, radius: number) {
    (this.enemies.getChildren() as Enemy[]).forEach(enemy => {
      const dist = Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y);
      if (dist < radius && !enemy.isTrapped()) {
        this.score += 300;
        this.particleManager.emitEnemyDefeat(enemy.x, enemy.y);
        enemy.destroy();
      }
    });

    (this.fireballs.getChildren() as Fireball[]).forEach(fireball => {
      const dist = Phaser.Math.Distance.Between(x, y, fireball.x, fireball.y);
      if (dist < radius) {
        fireball.destroy();
      }
    });
  }

  private loseLife() {
    this.lives--;
    this.player.setTint(0xff0000);
    this.cameras.main.shake(200, 0.02);

    this.time.delayedCall(500, () => {
      this.player.clearTint();
    });

    if (this.lives <= 0) {
      this.gameOver();
    } else {
      this.player.setPosition(this.spawnX, this.spawnY);
      this.player.reset();
      this.bubbles.clear(true);
      this.fireballs.clear(true);
    }
  }

  private gameOver() {
    this.isGameOver = true;
    this.player.setActive(false).setVisible(false);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, '游戏结束', {
      fontFamily: 'Courier New',
      fontSize: '40px',
      color: '#ef4444',
      stroke: '#7f1d1d',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(100);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, `最终得分: ${this.score}`, {
      fontFamily: 'Courier New',
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(100);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 60, '按 R 重新开始', {
      fontFamily: 'Courier New',
      fontSize: '18px',
      color: '#9ca3af'
    }).setOrigin(0.5).setDepth(100);

    this.input.keyboard?.once('keydown-R', () => {
      this.restartGame();
    });
  }

  private showVictory() {
    this.isVictory = true;

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60, '恭喜通关!', {
      fontFamily: 'Courier New',
      fontSize: '40px',
      color: '#fbbf24',
      stroke: '#92400e',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(100);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, `最终得分: ${this.score}`, {
      fontFamily: 'Courier New',
      fontSize: '28px',
      color: '#4ade80'
    }).setOrigin(0.5).setDepth(100);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50, '按 R 重新开始', {
      fontFamily: 'Courier New',
      fontSize: '18px',
      color: '#9ca3af'
    }).setOrigin(0.5).setDepth(100);

    this.input.keyboard?.once('keydown-R', () => {
      this.restartGame();
    });
  }

  private restartGame() {
    this.score = 0;
    this.lives = 3;
    this.currentLevel = 0;
    this.isGameOver = false;
    this.isVictory = false;
    this.isLevelComplete = false;

    this.children.removeAll();
    this.platforms.clear(true);
    this.bubbles.clear(true);
    this.enemies.clear(true);
    this.fireballs.clear(true);
    this.powerUps.clear(true);

    this.create();
  }

  private updateUI() {
    this.registry.set('score', this.score);
    this.registry.set('lives', this.lives);
    this.registry.set('level', this.currentLevel + 1);
    this.registry.set('totalLevels', LEVELS.length);
    this.registry.set('powerUp', this.player.getPowerUp());
    this.registry.set('powerUpTimer', this.player.getPowerUpTimer());
    this.registry.set('theme', this.levelConfig?.theme || 'cave');
    this.registry.set('isBossLevel', this.levelConfig?.isBoss || false);

    const boss = (this.enemies.getChildren() as Enemy[]).find(e => e.getType() === 'boss') as Enemy;
    if (boss) {
      this.registry.set('bossHealth', boss.getHealth());
      this.registry.set('bossMaxHealth', boss.getMaxHealth());
    } else {
      this.registry.set('bossHealth', 0);
      this.registry.set('bossMaxHealth', 0);
    }
  }

  destroy() {
    this.eventHandlers.forEach((handler, event) => {
      this.events.off(event, handler);
    });
    this.particleManager.destroy();
  }
}
