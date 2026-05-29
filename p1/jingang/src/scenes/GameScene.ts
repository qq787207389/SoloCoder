import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, LevelConfig } from '../types';
import { Player } from '../entities/Player';
import { DonkeyKong } from '../entities/DonkeyKong';
import { BarrelSystem } from '../systems/BarrelSystem';
import { LevelBuilder } from '../systems/LevelBuilder';
import { PlatformSystem } from '../systems/PlatformSystem';
import { ItemSystem } from '../systems/ItemSystem';
import { InputManager } from '../systems/InputManager';
import { HammerItem } from '../entities/Hammer';
import { Minecart } from '../entities/Minecart';
import { Elevator } from '../entities/Elevator';

import constructionData from '../data/levels/construction.json';
import warehouseData from '../data/levels/warehouse.json';
import clocktowerData from '../data/levels/clocktower.json';

const LEVEL_DATA: Record<string, LevelConfig> = {
  construction: constructionData as LevelConfig,
  warehouse: warehouseData as LevelConfig,
  clocktower: clocktowerData as LevelConfig,
};

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private dk!: DonkeyKong;
  private levelConfig!: LevelConfig;
  private barrelSystem!: BarrelSystem;
  private levelBuilder!: LevelBuilder;
  private platformSystem!: PlatformSystem;
  private itemSystem!: ItemSystem;
  private inputManager!: InputManager;
  private score: number = 0;
  private lives: number = 3;
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private hammerBar!: Phaser.GameObjects.Rectangle;
  private hammerBarBg!: Phaser.GameObjects.Rectangle;
  private leverSprite!: Phaser.GameObjects.Sprite;
  private leverPulled: boolean = false;
  private isBossLevel: boolean = false;
  private isBossDefeated: boolean = false;
  private shakeTimer: number = 0;
  private isTransitioning: boolean = false;
  private deathY: number = 620;
  private jumpPressed: boolean = false;
  private prevUpKey: boolean = false;
  private beamCollider!: Phaser.Physics.Arcade.Collider;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { levelId: string; score?: number; lives?: number }) {
    this.score = data.score || 0;
    this.lives = data.lives || 3;
    this.levelConfig = LEVEL_DATA[data.levelId] || LEVEL_DATA['construction'];
    this.isBossLevel = data.levelId === 'clocktower';
    this.leverPulled = false;
    this.isBossDefeated = false;
    this.isTransitioning = false;
  }

  create() {
    this.inputManager = new InputManager(this);

    this.levelBuilder = new LevelBuilder(this, this.levelConfig);
    const { beamPlatforms, ladderZones } = this.levelBuilder.build();

    this.platformSystem = new PlatformSystem(this, this.levelConfig);
    const { minecarts, elevators } = this.platformSystem.createPlatforms();

    this.itemSystem = new ItemSystem(this, this.levelConfig);
    const { hammers, fires } = this.itemSystem.createItems();

    this.barrelSystem = new BarrelSystem(this, this.levelConfig, beamPlatforms);

    this.player = new Player(this, 240, this.levelConfig.beams[0].y - 4);
    this.beamCollider = this.physics.add.collider(this.player, beamPlatforms);
    for (const mc of minecarts) {
      this.physics.add.collider(this.player, mc);
    }
    for (const ev of elevators) {
      this.physics.add.collider(this.player, ev);
    }

    this.dk = new DonkeyKong(this, this.levelConfig.dkPosition.x, this.levelConfig.dkPosition.y, this.levelConfig.dkConfig);
    if (this.isBossLevel) {
      this.dk.setBossMode(true);
    }

    this.physics.add.overlap(this.player, ladderZones, (p, zone) => {
      this.player.setOnLadder(true, zone as Phaser.GameObjects.Rectangle);
    }, undefined, this);

    this.setupHammerCollisions(hammers);
    this.setupFireCollisions();
    this.setupLever();

    this.createHUD();
    this.setupWorldBounds();

    this.time.addEvent({
      delay: this.levelConfig.dkConfig.throwInterval,
      callback: this.dkThrowBarrel,
      callbackScope: this,
      loop: true,
    });
  }

  private setupHammerCollisions(hammers: HammerItem[]) {
    for (const h of hammers) {
      this.physics.add.overlap(this.player, h, () => {
        if (!h.isCollected) {
          h.collect();
          this.player.grabHammer();
          this.score += 100;
        }
      });
    }
  }

  private setupFireCollisions() {
  }

  private setupLever() {
    if (this.levelConfig.lever && this.isBossLevel) {
      this.leverSprite = this.add.sprite(this.levelConfig.lever.x, this.levelConfig.lever.y, 'lever_off');
      this.leverSprite.setOrigin(0.5, 1);
      this.physics.add.existing(this.leverSprite, true);
      this.physics.add.overlap(this.player, this.leverSprite, () => {
        if (!this.leverPulled) {
          this.pullLever();
        }
      });
    }
  }

  private pullLever() {
    this.leverPulled = true;
    this.leverSprite.setTexture('lever_on');
    this.isBossDefeated = true;
    this.dk.playDefeatAnimation();

    this.cameras.main.shake(2000, 0.03);

    this.time.delayedCall(500, () => {
      const beams = this.levelConfig.beams;
      for (let i = 0; i < beams.length; i++) {
        this.time.delayedCall(i * 200, () => {
          const beam = beams[i];
          const debris = this.add.rectangle(beam.x + beam.width / 2, beam.y + 4, beam.width, 8, 0x546e7a);
          this.tweens.add({
            targets: debris,
            y: debris.y + 30 + Math.random() * 20,
            x: debris.x + (Math.random() - 0.5) * 60,
            angle: (Math.random() - 0.5) * 90,
            alpha: 0,
            duration: 800,
            delay: i * 100,
            onComplete: () => debris.destroy(),
          });
        });
      }
    });

    this.time.delayedCall(2500, () => {
      this.scene.start('VictoryScene', { score: this.score });
    });
  }

  private dkThrowBarrel() {
    if (this.isTransitioning || this.isBossDefeated) return;

    const result = this.dk.update(16, this.getPlayerProgress());
    if (result.shouldThrow) {
      if (result.isFake) {
        this.time.delayedCall(300, () => {
          if (!this.isTransitioning && !this.isBossDefeated) {
            this.dk.state = 'IDLE';
            this.dk.sprite.setTexture('dk_idle');
          }
        });
      } else {
        const throwX = this.dk.x + 20;
        const throwY = this.dk.y - 30;
        this.barrelSystem.spawnBarrel(throwX, throwY);

        if (this.isBossLevel && Math.random() < 0.3) {
          this.time.delayedCall(400, () => {
            if (!this.isTransitioning && !this.isBossDefeated) {
              this.barrelSystem.spawnBarrel(throwX - 20, throwY);
            }
          });
        }
      }
    }
  }

  private smashBarrel(barrel: any) {
    const pos = this.barrelSystem.destroyBarrel(barrel);
    this.score += 300;
    this.cameras.main.shake(100, 0.01);
    this.spawnSmashParticles(pos.x, pos.y);
  }

  private spawnSmashParticles(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const speed = 80 + Math.random() * 60;
      const particle = this.add.sprite(x, y, i < 5 ? 'particle_wood' : 'particle_spark');
      particle.setScale(0.5 + Math.random() * 0.5);
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed - 20,
        alpha: 0,
        angle: Math.random() * 360,
        duration: 400 + Math.random() * 200,
        onComplete: () => particle.destroy(),
      });
    }
  }

  private playerDie() {
    this.player.takeDamage();
    this.lives--;
    this.updateHUD();

    if (this.lives <= 0) {
      this.time.delayedCall(1500, () => {
        this.scene.start('GameOverScene', { score: this.score });
      });
    } else {
      this.time.delayedCall(1500, () => {
        const spawnX = 240;
        const spawnY = this.levelConfig.beams[0].y - 4;
        this.player.respawn(spawnX, spawnY);
      });
    }
  }

  private getPlayerProgress(): number {
    const topBeam = this.levelConfig.beams[this.levelConfig.beams.length - 1];
    const bottomBeam = this.levelConfig.beams[0];
    const totalHeight = bottomBeam.y - topBeam.y;
    if (totalHeight === 0) return 0;
    return Math.max(0, Math.min(1, (bottomBeam.y - this.player.y) / totalHeight));
  }

  private createHUD() {
    const hudBg = this.add.rectangle(240, 12, GAME_WIDTH, 24, 0x000000, 0.6);
    hudBg.setDepth(50);
    hudBg.setScrollFactor(0);

    this.scoreText = this.add.text(8, 4, '分数: 0', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#fdd835',
    });
    this.scoreText.setDepth(51);
    this.scoreText.setScrollFactor(0);

    this.livesText = this.add.text(160, 4, '生命: 3', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#e53935',
    });
    this.livesText.setDepth(51);
    this.livesText.setScrollFactor(0);

    this.levelText = this.add.text(280, 4, `关卡: ${this.getLevelDisplayName()}`, {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#90a4ae',
    });
    this.levelText.setDepth(51);
    this.levelText.setScrollFactor(0);

    this.hammerBarBg = this.add.rectangle(420, 10, 50, 8, 0x333333);
    this.hammerBarBg.setDepth(51);
    this.hammerBarBg.setScrollFactor(0);
    this.hammerBarBg.setVisible(false);

    this.hammerBar = this.add.rectangle(396, 6, 48, 6, 0xff6d00);
    this.hammerBar.setDepth(52);
    this.hammerBar.setScrollFactor(0);
    this.hammerBar.setVisible(false);
    this.hammerBar.setOrigin(0, 0);
  }

  private updateHUD() {
    this.scoreText.setText(`分数: ${this.score}`);
    this.livesText.setText(`生命: ${this.lives}`);

    if (this.player.isHammerActive) {
      this.hammerBarBg.setVisible(true);
      this.hammerBar.setVisible(true);
      const pct = this.player.hammerTimer / 5000;
      this.hammerBar.setScale(pct, 1);
    } else {
      this.hammerBarBg.setVisible(false);
      this.hammerBar.setVisible(false);
    }
  }

  private getLevelDisplayName(): string {
    switch (this.levelConfig.type) {
      case 'construction': return '工地';
      case 'warehouse': return '仓库';
      case 'clocktower': return '钟楼';
      default: return this.levelConfig.id;
    }
  }

  private setupWorldBounds() {
    this.physics.world.setBounds(0, -100, GAME_WIDTH, GAME_HEIGHT + 300);
  }

  private checkLevelComplete() {
    if (this.isTransitioning) return;

    const topBeam = this.levelConfig.beams[this.levelConfig.beams.length - 1];
    if (this.player.y < topBeam.y + 20 && !this.isBossLevel) {
      this.levelComplete();
    }

    if (this.isBossLevel && this.isBossDefeated) {
      return;
    }
  }

  private levelComplete() {
    this.isTransitioning = true;
    this.score += 1000;

    const flash = this.add.rectangle(240, 320, GAME_WIDTH, GAME_HEIGHT, 0xffffff, 0);
    this.tweens.add({
      targets: flash,
      alpha: 0.8,
      duration: 200,
      yoyo: true,
      onComplete: () => {
        flash.destroy();
      },
    });

    if (this.levelConfig.nextLevel) {
      this.time.delayedCall(1000, () => {
        this.scene.start('CutsceneScene', {
          score: this.score,
          lives: this.lives,
          nextLevel: this.levelConfig.nextLevel!,
          levelType: this.levelConfig.type,
        });
      });
    } else {
      this.time.delayedCall(1000, () => {
        this.scene.start('VictoryScene', { score: this.score });
      });
    }
  }

  update(time: number, delta: number) {
    if (this.isTransitioning || this.isBossDefeated) {
      this.barrelSystem.update(delta);
      this.platformSystem.update(delta);
      this.itemSystem.update(delta);
      this.dk.update(delta, this.getPlayerProgress());
      return;
    }

    const cursors = this.inputManager.getCursorKeys();

    const currUpKey = cursors.up!.isDown;
    this.jumpPressed = currUpKey && !this.prevUpKey;
    this.prevUpKey = currUpKey;

    if (this.player.state === 'CLIMBING') {
      this.beamCollider.active = false;
    } else {
      this.beamCollider.active = true;
    }

    this.player.update(cursors, delta, this.jumpPressed);

    let onAnyLadder = false;
    for (const zone of this.levelBuilder.ladderZones) {
      if (this.physics.overlap(this.player, zone)) {
        onAnyLadder = true;
        this.player.setOnLadder(true, zone);
        break;
      }
    }

    if (!onAnyLadder && this.player.isOnLadder && this.player.state === 'CLIMBING') {
      this.player.exitLadder();
    } else if (!onAnyLadder && this.player.state !== 'CLIMBING') {
      this.player.setOnLadder(false, null);
    }

    if (this.player.state === 'CLIMBING') {
      for (const beam of this.levelConfig.beams) {
        if (Math.abs(this.player.y - beam.y) < 16 && cursors.up!.isDown) {
          this.player.y = beam.y - 4;
        }
      }
    }

    this.barrelSystem.update(delta);
    this.platformSystem.update(delta);
    this.itemSystem.update(delta);

    this.dk.update(delta, this.getPlayerProgress());

    this.checkBarrelPlayerCollision();
    this.checkFirePlayerCollision();
    this.checkHammerPickup();
    this.checkFallDeath();
    this.checkLevelComplete();
    this.updateHUD();

    this.barrelSystem.setDifficulty(1 + this.getPlayerProgress() * 0.5);
  }

  private checkBarrelPlayerCollision() {
    const barrels = this.barrelSystem.getBarrels();
    for (const barrel of barrels) {
      if (barrel.isDead) continue;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, barrel.x, barrel.y);
      if (dist < 14) {
        if (this.player.isHammerActive) {
          this.smashBarrel(barrel);
        } else if (this.player.invincibleTimer <= 0) {
          this.playerDie();
        }
      }
    }
  }

  private checkFirePlayerCollision() {
    const fires = this.itemSystem.getFires();
    for (const fire of fires) {
      if (!fire.isAlive) continue;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, fire.x, fire.y);
      if (dist < 14) {
        if (!this.player.isHammerActive && this.player.invincibleTimer <= 0) {
          this.playerDie();
        }
      }
    }
  }

  private checkFallDeath() {
    if (!this.player.isDead && this.player.y > this.deathY) {
      this.playerDie();
    }
  }

  private checkHammerPickup() {
    const hammers = this.itemSystem.getHammers();
    for (const hammer of hammers) {
      if (hammer.isCollected) continue;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, hammer.x, hammer.y);
      if (dist < 20) {
        hammer.collect();
        this.player.grabHammer();
        this.score += 100;
      }
    }
  }
}
