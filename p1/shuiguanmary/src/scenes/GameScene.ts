import Phaser from 'phaser';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  LAYER_PLATFORMS,
  PLATFORM_Y,
  PIPE_POSITIONS,
  TURTLE_SPEED,
  TURTLE_FLIP_TIME,
  CRAB_SPEED,
  CRAB_FLIP_TIME,
  FLYBUG_SPEED,
  FLYBUG_FLIP_TIME,
  ENEMY_SCORE,
} from '../config/gameConfig';
import { Player } from '../entities/Player';
import { Enemy, EnemyType } from '../entities/Enemy';
import { Fireball } from '../entities/Fireball';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private enemies: Enemy[] = [];
  private fireballs: Fireball[] = [];
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private score: number = 0;
  private wave: number = 1;
  private lives: number = 3;
  private scoreText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private waveEnemiesTotal: number = 0;
  private waveEnemiesSpawned: number = 0;
  private spawnTimer: number = 0;
  private wavePause: boolean = false;
  private wavePauseTimer: number = 0;
  private fireballTimer: number = 0;
  private pipeSpriteObjects: Phaser.GameObjects.Sprite[] = [];
  private pipeTopSprites: Phaser.GameObjects.Sprite[] = [];
  private headbuttCooldown: number = 0;
  private isGameOver: boolean = false;
  private hitCount: number = 0;
  private maxHits: number = 3;
  private ambientParticles?: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.score = 0;
    this.wave = 1;
    this.lives = 3;
    this.hitCount = 0;
    this.enemies = [];
    this.fireballs = [];
    this.waveEnemiesTotal = 0;
    this.waveEnemiesSpawned = 0;
    this.spawnTimer = 0;
    this.wavePause = false;
    this.wavePauseTimer = 0;
    this.fireballTimer = 0;
    this.headbuttCooldown = 0;
    this.isGameOver = false;

    this.createBackground();
    this.createPlatforms();
    this.createPipes();
    this.createPlayer();
    this.createHUD();
    this.setupCollisions();

    this.cursors = this.input.keyboard!.createCursorKeys();

    this.startWave();
  }

  update(_time: number, delta: number): void {
    if (this.isGameOver) return;

    this.player.update(this.cursors, delta);

    this.wrapPlayer();

    this.headbuttCooldown = Math.max(0, this.headbuttCooldown - delta);

    this.checkHeadbuttBackup();

    this.checkFlybugHeadbutt();
    this.updateEnemies(delta);
    this.updateFireballs();
    this.checkKickCollisions();
    this.checkSlidingChainKills();
    this.checkPlayerEnemyCollision();
    this.checkPlayerFireballCollision();
    this.checkPlayerDeath();
    this.updateSpawning(delta);
    this.updateFireballSpawning(delta);
    this.checkWaveComplete();
  }

  private createBackground(): void {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0d0d1a).setOrigin(0).setDepth(0);

    const brickBg = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'brick').setOrigin(0).setAlpha(0.12).setDepth(0);

    for (let i = 0; i < 6; i++) {
      const vx = 80 + Math.random() * (GAME_WIDTH - 160);
      const vy = 100 + Math.random() * (GAME_HEIGHT - 200);
      const valve = this.add.sprite(vx, vy, 'valve').setOrigin(0.5).setDepth(1).setAlpha(0.3);
      this.tweens.add({
        targets: valve,
        angle: valve.angle + (Math.random() > 0.5 ? 360 : -360),
        duration: 8000 + Math.random() * 4000,
        repeat: -1,
      });
    }

    for (let i = 0; i < 3; i++) {
      const lx = Math.random() * GAME_WIDTH;
      const ly = Math.random() * GAME_HEIGHT;
      const light = this.add.circle(lx, ly, 100, 0x1a3a6a, 0.05).setDepth(0);
    }
  }

  private createPlatforms(): void {
    this.platforms = this.physics.add.staticGroup();

    for (const layer of LAYER_PLATFORMS) {
      for (const seg of layer.segments) {
        const numTiles = Math.ceil(seg.w / 32);
        for (let t = 0; t < numTiles; t++) {
          const px = seg.x + t * 32 + 16;
          const py = layer.y;
          const plat = this.platforms.create(px, py, 'platform') as Phaser.Physics.Arcade.Sprite;
          plat.setOrigin(0.5, 0);
          plat.setDepth(2);
          plat.refreshBody();
        }
      }
    }

    this.add.rectangle(0, GAME_HEIGHT, GAME_WIDTH, 4, 0x333333).setOrigin(0, 1).setDepth(3);
  }

  private createPipes(): void {
    this.pipeSpriteObjects = [];
    this.pipeTopSprites = [];
    for (const pp of PIPE_POSITIONS) {
      const pipeBody = this.add.sprite(pp.x, pp.y + 24, 'pipe').setOrigin(0.5, 0).setDepth(3);
      const pipeTop = this.add.sprite(pp.x, pp.y, 'pipe_top').setOrigin(0.5, 0).setDepth(4);
      this.pipeSpriteObjects.push(pipeBody);
      this.pipeTopSprites.push(pipeTop);

      this.tweens.add({
        targets: pipeTop,
        y: pp.y - 3,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private createPlayer(): void {
    this.player = new Player(this, GAME_WIDTH / 2, PLATFORM_Y.ground - 34);
  }

  private createHUD(): void {
    this.add.rectangle(GAME_WIDTH / 2, 14, GAME_WIDTH, 28, 0x000000).setOrigin(0.5).setDepth(100).setAlpha(0.7);
    this.scoreText = this.add.text(20, 6, 'SCORE: 0', {
      fontSize: '15px',
      fontFamily: 'Arial',
      color: '#ffcc00',
      fontStyle: 'bold',
    }).setDepth(101);
    this.waveText = this.add.text(GAME_WIDTH / 2, 6, 'WAVE: 1', {
      fontSize: '15px',
      fontFamily: 'Arial',
      color: '#00ff88',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0).setDepth(101);
    this.livesText = this.add.text(GAME_WIDTH - 20, 6, '♥♥♥', {
      fontSize: '15px',
      fontFamily: 'Arial',
      color: '#ff4444',
      fontStyle: 'bold',
    }).setOrigin(1, 0).setDepth(101);
  }

  private updateLivesDisplay(): void {
    const hearts = '♥'.repeat(Math.max(0, this.lives));
    this.livesText.setText(hearts);
    this.livesText.setColor(this.lives <= 1 ? '#ff0000' : '#ff4444');
  }

  private setupCollisions(): void {
    this.physics.add.collider(this.player, this.platforms, (_playerObj, platformObj) => {
      const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
      if (playerBody.touching.up) {
        console.log('[COLLIDER] touching.up=true isGrounded=' + this.player.isGrounded + ' cooldown=' + this.headbuttCooldown);
        if (this.headbuttCooldown <= 0) {
          const platform = platformObj as Phaser.Physics.Arcade.Sprite;
          console.log('[COLLIDER] HEADBUTT platformY=' + platform.y);
          this.onHeadbuttDetected(platform.y);
        }
      }
    });
  }

  private onHeadbuttDetected(platformY: number): void {
    this.player.triggerHeadbutt();
    this.headbuttCooldown = 400;

    let bumpedLayerY = -1;
    for (const layer of LAYER_PLATFORMS) {
      if (Math.abs(layer.y - platformY) < 10) {
        bumpedLayerY = layer.y;
        break;
      }
    }

    if (bumpedLayerY >= 0) {
      this.bumpPlatform(bumpedLayerY);
      this.flipEnemiesOnPlatform(bumpedLayerY, this.player.x);
      const playerRect = this.player.getBounds();
      this.spawnHeadbuttParticles(playerRect.centerX, playerRect.top);
    } else {
      console.log('[HEADBUTT] WARNING: No matching layer for platformY=' + platformY);
    }

    this.showDebugHeadbutt();
  }

  private checkHeadbuttBackup(): void {
    if (this.headbuttCooldown > 0) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (!body.blocked.up) return;
    if (this.player.isGrounded) return;

    console.log('[HEADBUTT-BACKUP] blocked.up=' + body.blocked.up + ' isGrounded=' + this.player.isGrounded);

    const playerRect = this.player.getBounds();
    const headY = playerRect.top;

    let closestLayerY = -1;
    let closestDist = Infinity;
    for (const layer of LAYER_PLATFORMS) {
      const dist = Math.abs(headY - layer.y);
      if (dist < closestDist && dist < 30) {
        closestDist = dist;
        closestLayerY = layer.y;
      }
    }

    if (closestLayerY >= 0) {
      this.player.triggerHeadbutt();
      this.headbuttCooldown = 400;
      this.bumpPlatform(closestLayerY);
      this.flipEnemiesOnPlatform(closestLayerY, this.player.x);
      this.spawnHeadbuttParticles(playerRect.centerX, playerRect.top);
      this.showDebugHeadbutt();
    }
  }

  private showDebugHeadbutt(): void {
    console.log('[HEADBUTT] Detected at player.y=' + this.player.y.toFixed(1));
    const dbg = this.add.text(
      GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50,
      'HEADBUTT!',
      { fontSize: '28px', fontFamily: 'Arial', color: '#ffff00', fontStyle: 'bold', stroke: '#ff0000', strokeThickness: 4 }
    ).setOrigin(0.5).setDepth(300);
    this.tweens.add({
      targets: dbg,
      alpha: 0,
      y: dbg.y - 50,
      duration: 1200,
      onComplete: () => dbg.destroy(),
    });
  }

  private checkFlybugHeadbutt(): void {
    if (this.player.isHurt || this.player.isGrounded) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (body.velocity.y >= 0) return;

    const playerRect = this.player.getBounds();
    const playerTopY = playerRect.top;
    const playerCenterX = playerRect.centerX;

    for (const enemy of this.enemies) {
      if (enemy.state !== 'walk' || !enemy.isFlybug || !enemy.active) continue;

      const enemyRect = enemy.getBounds();
      const enemyCenterX = enemyRect.centerX;
      const enemyBottom = enemyRect.bottom;

      const xDist = Math.abs(playerCenterX - enemyCenterX);
      const yDist = enemyBottom - playerTopY;

      if (xDist < 28 && yDist > -10 && yDist < 25) {
        enemy.flip();
        this.addScore(ENEMY_SCORE[enemy.enemyType] / 2);
        this.showScorePopup(enemy.x, enemy.y - 20, `+${ENEMY_SCORE[enemy.enemyType] / 2}`);

        body.setVelocityY(100);
        this.spawnHeadbuttParticles(playerCenterX, playerTopY);
      }
    }
  }

  private bumpPlatform(layerY: number): void {
    this.platforms.getChildren().forEach((child) => {
      const plat = child as Phaser.Physics.Arcade.Sprite;
      if (Math.abs(plat.y - layerY) < 5) {
        const origY = plat.y;
        this.tweens.add({
          targets: plat,
          y: origY - 6,
          duration: 50,
          yoyo: true,
          onComplete: () => {
            plat.y = origY;
          },
        });
      }
    });

    this.cameras.main.shake(100, 0.004);
  }

  private spawnHeadbuttParticles(x: number, y: number): void {
    for (let i = 0; i < 6; i++) {
      const px = x + (Math.random() - 0.5) * 30;
      const py = y - 2;
      const particle = this.add.rectangle(px, py, 4, 4, 0xffcc00).setDepth(200);
      this.tweens.add({
        targets: particle,
        x: px + (Math.random() - 0.5) * 60,
        y: py - 20 - Math.random() * 30,
        alpha: 0,
        scaleX: 0.3,
        scaleY: 0.3,
        duration: 400 + Math.random() * 200,
        onComplete: () => particle.destroy(),
      });
    }
  }

  private flipEnemiesOnPlatform(layerY: number, playerX: number): void {
    console.log('[FLIP] Checking enemies on layerY=' + layerY + ' playerX=' + playerX.toFixed(1) + ' total enemies=' + this.enemies.length);
    const HEADBUTT_X_RANGE = 45;
    for (const enemy of this.enemies) {
      if (enemy.state !== 'walk') continue;
      if (enemy.isFlybug) continue;
      const enemyRect = enemy.getBounds();
      const enemyBottom = enemyRect.bottom;
      const enemyCenterX = enemyRect.centerX;
      const yDiff = Math.abs(enemyBottom - layerY);
      const xDiff = Math.abs(enemyCenterX - playerX);
      console.log('[FLIP] enemy type=' + enemy.enemyType + ' x=' + enemy.x.toFixed(1) + ' xDiff=' + xDiff.toFixed(1) + ' y=' + enemy.y.toFixed(1) + ' yDiff=' + yDiff.toFixed(1));
      if (yDiff < 25 && xDiff < HEADBUTT_X_RANGE) {
        console.log('[FLIP] >>> FLIPPING enemy!');
        enemy.flip();
        this.addScore(ENEMY_SCORE[enemy.enemyType] / 2);
        this.showScorePopup(enemy.x, enemy.y - 20, `+${ENEMY_SCORE[enemy.enemyType] / 2}`);
      }
    }
  }

  private showScorePopup(x: number, y: number, text: string, color = '#ffcc00'): void {
    const popup = this.add.text(x, y, text, {
      fontSize: '13px',
      fontFamily: 'Arial',
      color,
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(200);
    this.tweens.add({
      targets: popup,
      alpha: 0,
      y: popup.y - 35,
      duration: 900,
      onComplete: () => popup.destroy(),
    });
  }

  private checkKickCollisions(): void {
    for (const enemy of this.enemies) {
      if (enemy.state !== 'flipped') continue;

      const dist = Phaser.Math.Distance.Between(
        this.player.x + this.player.displayWidth / 2,
        this.player.y + this.player.displayHeight / 2,
        enemy.x + enemy.displayWidth / 2,
        enemy.y + enemy.displayHeight / 2
      );

      if (dist < 34) {
        const kickDir = this.player.x < enemy.x ? 1 : -1;
        enemy.kick(kickDir);
        this.addScore(ENEMY_SCORE[enemy.enemyType] / 2);
        this.showScorePopup(enemy.x, enemy.y - 20, `+${ENEMY_SCORE[enemy.enemyType] / 2}`);

        for (let i = 0; i < 4; i++) {
          const spark = this.add.rectangle(
            enemy.x + kickDir * 10 + (Math.random() - 0.5) * 15,
            enemy.y + (Math.random() - 0.5) * 15,
            3, 3, 0xffffff
          ).setDepth(200);
          this.tweens.add({
            targets: spark,
            x: spark.x + kickDir * (20 + Math.random() * 30),
            y: spark.y - 10 - Math.random() * 20,
            alpha: 0,
            duration: 300 + Math.random() * 200,
            onComplete: () => spark.destroy(),
          });
        }
      }
    }
  }

  private checkSlidingChainKills(): void {
    const slidingEnemies = this.enemies.filter(e => e.state === 'sliding' && e.active);
    const otherEnemies = this.enemies.filter(e => (e.state === 'walk' || e.state === 'flipped') && e.active);

    for (const slider of slidingEnemies) {
      for (const other of otherEnemies) {
        if (slider === other || !other.active) continue;
        const dist = Phaser.Math.Distance.Between(slider.x, slider.y, other.x, other.y);
        if (dist < 30) {
          const pts = ENEMY_SCORE[other.enemyType] * 2;
          other.kill();
          this.addScore(pts);
          this.showScorePopup(other.x, other.y - 20, `+${pts} CHAIN!`, '#ff8800');
        }
      }
    }

    for (const slider of slidingEnemies) {
      if (!slider.active) continue;
      const body = slider.body as Phaser.Physics.Arcade.Body;
      if ((body.blocked.left || body.blocked.right || body.touching.left || body.touching.right) && body.blocked.down) {
        slider.kill();
        this.addScore(ENEMY_SCORE[slider.enemyType]);
      }
      if (slider.y > GAME_HEIGHT + 50 || slider.x < -60 || slider.x > GAME_WIDTH + 60) {
        slider.destroy();
      }
    }
  }

  private checkPlayerEnemyCollision(): void {
    if (this.player.isHurt) return;

    for (const enemy of this.enemies) {
      if (enemy.state === 'flipped' || enemy.state === 'dead' || !enemy.active) continue;

      if (enemy.state === 'sliding' || enemy.state === 'walk') {
        if (enemy.isFlybug && enemy.state === 'walk' && !this.player.isGrounded) {
          const body = this.player.body as Phaser.Physics.Arcade.Body;
          if (body.velocity.y < 0) continue;
        }

        const playerRect = this.player.getBounds();
        const enemyRect = enemy.getBounds();

        if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, enemyRect)) {
          this.playerHit();
          return;
        }
      }
    }
  }

  private checkPlayerFireballCollision(): void {
    if (this.player.isHurt) return;

    for (const fb of this.fireballs) {
      if (!fb.active) continue;
      const playerRect = this.player.getBounds();
      const fbRect = fb.getBounds();
      if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, fbRect)) {
        this.playerHit();
        return;
      }
    }
  }

  private playerHit(): void {
    this.player.hurt();
    this.hitCount++;
    this.cameras.main.shake(200, 0.008);
    this.cameras.main.flash(150, 255, 0, 0, true);

    if (this.hitCount >= this.maxHits) {
      this.lives--;
      this.hitCount = 0;
      this.updateLivesDisplay();

      if (this.lives <= 0) {
        this.gameOver();
      }
    }
  }

  private checkPlayerDeath(): void {
    if (this.player.y > GAME_HEIGHT + 50) {
      this.lives--;
      this.updateLivesDisplay();
      if (this.lives <= 0) {
        this.gameOver();
      } else {
        this.respawnPlayer();
      }
    }
  }

  private wrapPlayer(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const halfW = this.player.displayWidth / 2;
    if (this.player.x < -halfW) {
      this.player.x = GAME_WIDTH + halfW;
      body.reset(this.player.x, this.player.y);
    } else if (this.player.x > GAME_WIDTH + halfW) {
      this.player.x = -halfW;
      body.reset(this.player.x, this.player.y);
    }
  }

  private respawnPlayer(): void {
    this.player.setPosition(GAME_WIDTH / 2, PLATFORM_Y.ground - 40);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.setAcceleration(0, 0);
    this.player.isHurt = true;
    this.player.invincibleTimer = 3000;
    this.hitCount = 0;
  }

  private gameOver(): void {
    this.isGameOver = true;

    const deathOverlay = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0).setDepth(300);
    this.tweens.add({
      targets: deathOverlay,
      fillAlpha: 0.7,
      duration: 500,
    });

    this.time.delayedCall(1200, () => {
      this.scene.start('GameOverScene', { score: this.score, wave: this.wave });
    });
  }

  private updateEnemies(delta: number): void {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (!enemy.active) {
        this.enemies.splice(i, 1);
        continue;
      }
      enemy.update(delta);

      if (!enemy.isFlybug && enemy.state === 'walk') {
        if (enemy.x <= 15) {
          enemy.direction = 1;
          enemy.setFlipX(false);
          const ebody = enemy.body as Phaser.Physics.Arcade.Body;
          ebody.setVelocityX(enemy.moveSpeed);
        } else if (enemy.x >= GAME_WIDTH - 15) {
          enemy.direction = -1;
          enemy.setFlipX(true);
          const ebody = enemy.body as Phaser.Physics.Arcade.Body;
          ebody.setVelocityX(-enemy.moveSpeed);
        }
      }

      if (enemy.y > GAME_HEIGHT + 100) {
        enemy.destroy();
        this.enemies.splice(i, 1);
      }
    }
  }

  private updateFireballs(): void {
    for (let i = this.fireballs.length - 1; i >= 0; i--) {
      const fb = this.fireballs[i];
      if (!fb.active) {
        this.fireballs.splice(i, 1);
        continue;
      }
      fb.update();
    }
  }

  private updateSpawning(delta: number): void {
    if (this.wavePause) {
      this.wavePauseTimer -= delta;
      if (this.wavePauseTimer <= 0) {
        this.wavePause = false;
        this.wave++;
        this.waveText.setText(`WAVE: ${this.wave}`);
        this.startWave();
      }
      return;
    }

    if (this.waveEnemiesSpawned >= this.waveEnemiesTotal) return;

    this.spawnTimer -= delta;
    if (this.spawnTimer <= 0) {
      this.spawnEnemy();
      this.waveEnemiesSpawned++;
      const baseInterval = Math.max(1200, 3500 - this.wave * 250);
      this.spawnTimer = baseInterval + Math.random() * 800;
    }
  }

  private updateFireballSpawning(delta: number): void {
    if (this.wave < 3) return;

    this.fireballTimer -= delta;
    if (this.fireballTimer <= 0) {
      this.spawnFireball();
      const interval = Math.max(2500, 7000 - this.wave * 350);
      this.fireballTimer = interval + Math.random() * 2500;
    }
  }

  private startWave(): void {
    this.waveEnemiesTotal = this.calculateWaveEnemyCount();
    this.waveEnemiesSpawned = 0;
    this.spawnTimer = 800;
    this.fireballTimer = 4000 + Math.random() * 3000;
  }

  private calculateWaveEnemyCount(): number {
    return Math.min(3 + this.wave * 2, 20);
  }

  private spawnEnemy(): void {
    const activePipeIndex = this.wave <= 2 ? 0 : (Math.random() > 0.5 ? 0 : 1);
    const pipe = PIPE_POSITIONS[activePipeIndex];

    const type = this.pickEnemyType();
    const { speed, flipTime } = this.getEnemyStats(type);

    const spawnY = type === 'flybug'
      ? PLATFORM_Y.layer3 - 20 + Math.random() * 80
      : pipe.y + 100;

    const enemy = new Enemy(this, pipe.x, spawnY, type, flipTime, speed);
    enemy.setPlayerRef(this.player);

    this.physics.add.collider(enemy, this.platforms);

    this.enemies.push(enemy);

    const pipeTop = this.pipeTopSprites[activePipeIndex];
    if (pipeTop) {
      this.tweens.add({
        targets: pipeTop,
        y: pipeTop.y + 6,
        duration: 120,
        yoyo: true,
      });
    }
  }

  private pickEnemyType(): EnemyType {
    if (this.wave <= 2) return 'turtle';
    if (this.wave <= 4) return Math.random() > 0.4 ? 'turtle' : 'crab';
    const roll = Math.random();
    if (roll < 0.3) return 'turtle';
    if (roll < 0.65) return 'crab';
    return 'flybug';
  }

  private getEnemyStats(type: EnemyType): { speed: number; flipTime: number } {
    switch (type) {
      case 'turtle':
        return { speed: TURTLE_SPEED + this.wave * 3, flipTime: TURTLE_FLIP_TIME };
      case 'crab':
        return { speed: CRAB_SPEED + this.wave * 5, flipTime: CRAB_FLIP_TIME };
      case 'flybug':
        return { speed: FLYBUG_SPEED + this.wave * 4, flipTime: FLYBUG_FLIP_TIME };
    }
  }

  private spawnFireball(): void {
    const pipeIndex = Math.random() > 0.5 ? 0 : 1;
    const pipe = PIPE_POSITIONS[pipeIndex];
    const direction = Math.random() > 0.5 ? 1 : -1;

    const fb = new Fireball(this, pipe.x, pipe.y + 110, direction);
    this.physics.add.collider(fb, this.platforms);
    this.fireballs.push(fb);

    const pipeTop = this.pipeTopSprites[pipeIndex];
    if (pipeTop) {
      this.tweens.add({
        targets: pipeTop,
        y: pipeTop.y + 5,
        duration: 80,
        yoyo: true,
      });
    }
  }

  private checkWaveComplete(): void {
    if (this.wavePause) return;
    if (this.waveEnemiesSpawned < this.waveEnemiesTotal) return;

    const activeEnemies = this.enemies.filter(e => e.state !== 'dead' && e.active);
    if (activeEnemies.length === 0) {
      this.wavePause = true;
      this.wavePauseTimer = 2000;

      const pauseText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2, `WAVE ${this.wave} CLEAR!`, {
        fontSize: '36px',
        fontFamily: 'Arial',
        color: '#ffcc00',
        stroke: '#664400',
        strokeThickness: 5,
      }).setOrigin(0.5).setDepth(200);

      this.tweens.add({
        targets: pauseText,
        scaleX: 1.3,
        scaleY: 1.3,
        duration: 300,
        yoyo: true,
      });

      this.tweens.add({
        targets: pauseText,
        alpha: 0,
        y: pauseText.y - 50,
        duration: 1200,
        delay: 600,
        onComplete: () => pauseText.destroy(),
      });
    }
  }

  private addScore(points: number): void {
    this.score += Math.round(points);
    this.scoreText.setText(`SCORE: ${this.score}`);
  }
}
