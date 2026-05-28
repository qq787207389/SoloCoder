import Phaser from 'phaser';
import { GameConfig, GameMode, PowerUpType } from '@/config/GameConfig';
import { Player } from '@/game/Player';
import { PlayerController } from '@/game/PlayerController';
import { AIController } from '@/game/AIController';
import { CollisionManager, CollisionEvent } from '@/game/CollisionManager';
import { GameStatsData, createEmptyGameStats, Highlight, formatTime, PlayerStats } from '@/game/GameStats';
import { Cloud } from '@/environment/Cloud';
import { Pillar } from '@/environment/Pillar';
import { ColorBalloon } from '@/environment/ColorBalloon';
import { PowerUp } from '@/powerups/PowerUp';
import { LightningBoots } from '@/powerups/LightningBoots';
import { Shield } from '@/powerups/Shield';
import { OilBarrel } from '@/powerups/OilBarrel';
import { Clone } from '@/powerups/Clone';
import { DarkClouds } from '@/events/DarkClouds';
import { MigratoryBirds } from '@/events/MigratoryBirds';
import { Lightning } from '@/events/Lightning';
import { createTextPopup } from '@/utils/AnimationHelper';
import { initParticleTexture } from '@/utils/ParticleEffects';

export class GameScene extends Phaser.Scene {
  private gameMode: GameMode = GameMode.SINGLE_PLAYER;
  private gameTime: number = 0;
  private isGameOver: boolean = false;
  private gameOverTimer: number = 0;

  private player1: Player | null = null;
  private player2: Player | null = null;
  private player1Controller: PlayerController | null = null;
  private player2Controller: PlayerController | null = null;
  private aiController: AIController | null = null;

  private collisionManager: CollisionManager = new CollisionManager();
  private gameStats: GameStatsData = createEmptyGameStats();

  private clouds: Cloud[] = [];
  private pillars: Pillar[] = [];
  private colorBalloons: ColorBalloon[] = [];
  private powerUps: PowerUp[] = [];
  private clones: Player[] = [];

  private darkClouds: DarkClouds | null = null;
  private migratoryBirds: MigratoryBirds | null = null;
  private lightning: Lightning | null = null;
  private eventTimer: number = 0;
  private activeEvent: string | null = null;

  private hudGraphics: Phaser.GameObjects.Graphics | null = null;
  private player1Bar: Phaser.GameObjects.Graphics | null = null;
  private player2Bar: Phaser.GameObjects.Graphics | null = null;
  private timerText: Phaser.GameObjects.Text | null = null;
  private eventText: Phaser.GameObjects.Text | null = null;

  private background: Phaser.GameObjects.Graphics | null = null;

  constructor() {
    super('GameScene');
  }

  init(data: { gameMode: GameMode }): void {
    this.gameMode = data.gameMode || GameMode.SINGLE_PLAYER;
  }

  preload(): void {
    initParticleTexture(this);
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x87CEEB);
    this.drawBackground();

    this.gameTime = 0;
    this.isGameOver = false;
    this.gameOverTimer = 0;
    this.gameStats = createEmptyGameStats();
    this.eventTimer = GameConfig.EVENT_INTERVAL;
    this.activeEvent = null;

    this.createPlayers();
    this.createEnvironment();
    this.createHUD();
    this.createEvents();
    this.setupCollisionManager();

    this.cameras.main.fadeIn(500, 0, 0, 0);
  }

  drawBackground(): void {
    this.background = this.add.graphics();

    this.background.fillStyle(0x87CEEB);
    this.background.fillRect(0, 0, GameConfig.WIDTH, GameConfig.HEIGHT);

    this.background.fillStyle(0xb0e0e6, 0.5);
    this.background.fillRect(0, GameConfig.HEIGHT * 0.4, GameConfig.WIDTH, GameConfig.HEIGHT * 0.3);

    this.background.fillStyle(0xe0f6ff, 0.3);
    this.background.fillRect(0, GameConfig.HEIGHT * 0.7, GameConfig.WIDTH, GameConfig.HEIGHT * 0.3);

    this.background.fillStyle(0xffffff, 0.4);
    for (let i = 0; i < 8; i++) {
      const x = Phaser.Math.Between(0, GameConfig.WIDTH);
      const y = Phaser.Math.Between(30, GameConfig.HEIGHT / 3);
      const size = Phaser.Math.Between(40, 80);
      this.drawBackgroundCloud(x, y, size);
    }
  }

  drawBackgroundCloud(x: number, y: number, size: number): void {
    if (!this.background) return;

    const segments = 4;
    const segmentWidth = size / segments;

    for (let i = 0; i < segments; i++) {
      const px = x - size / 2 + i * segmentWidth + segmentWidth / 2;
      const py = y + Math.sin(i * 0.8) * 5;
      const radius = segmentWidth * 0.55;
      this.background.beginPath();
      this.background.arc(px, py, radius, 0, Math.PI * 2);
      this.background.fill();
    }
  }

  createPlayers(): void {
    this.player1 = new Player(
      this,
      1,
      GameConfig.WIDTH * 0.25,
      GameConfig.HEIGHT / 2,
      GameConfig.COLORS.PLAYER1_BLUE,
      GameConfig.COLORS.PLAYER1_BLUE
    );

    this.player2 = new Player(
      this,
      2,
      GameConfig.WIDTH * 0.75,
      GameConfig.HEIGHT / 2,
      GameConfig.COLORS.PLAYER2_RED,
      GameConfig.COLORS.PLAYER2_RED
    );

    this.player1Controller = new PlayerController(this, this.player1, 1);

    if (this.gameMode === GameMode.SINGLE_PLAYER) {
      this.aiController = new AIController(this.player2, this.player1);
    } else {
      this.player2Controller = new PlayerController(this, this.player2, 2);
    }

    if (this.gameMode === GameMode.TEAM_MODE) {
      this.player1.inflation.max = 150;
      this.player2.inflation.max = 150;
      this.player1.inflation.current = 150;
      this.player2.inflation.current = 150;
    }
  }

  createEnvironment(): void {
    this.clouds = [];
    this.pillars = [];
    this.colorBalloons = [];
    this.powerUps = [];
    this.clones = [];

    this.pillars.push(new Pillar(this, GameConfig.WIDTH / 2, 200, 50, 150, true));
    this.pillars.push(new Pillar(this, 150, GameConfig.HEIGHT - 150, 50, 200, false));
    this.pillars.push(new Pillar(this, GameConfig.WIDTH - 150, GameConfig.HEIGHT - 150, 50, 200, false));

    this.clouds.push(new Cloud(this, GameConfig.WIDTH * 0.2, 200, 100));
    this.clouds.push(new Cloud(this, GameConfig.WIDTH * 0.8, 200, 100));
    this.clouds.push(new Cloud(this, GameConfig.WIDTH * 0.5, 350, 120));
    this.clouds.push(new Cloud(this, GameConfig.WIDTH * 0.3, 500, 90));
    this.clouds.push(new Cloud(this, GameConfig.WIDTH * 0.7, 500, 90));

    this.spawnColorBalloons(5);
  }

  spawnColorBalloons(count: number): void {
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(100, GameConfig.WIDTH - 100);
      const y = Phaser.Math.Between(100, GameConfig.HEIGHT - 150);
      const hasPowerUp = Math.random() < 0.3;
      const balloon = new ColorBalloon(this, x, y, undefined, hasPowerUp);
      this.colorBalloons.push(balloon);
    }
  }

  spawnPowerUp(): void {
    if (this.powerUps.length >= 2) return;

    const x = Phaser.Math.Between(100, GameConfig.WIDTH - 100);
    const y = Phaser.Math.Between(100, GameConfig.HEIGHT - 150);

    const types = [
      () => new LightningBoots(this, x, y),
      () => new Shield(this, x, y),
      () => new OilBarrel(this, x, y),
      () => new Clone(this, x, y),
    ];

    const powerUp = types[Phaser.Math.Between(0, types.length - 1)]();
    this.powerUps.push(powerUp);
  }

  createHUD(): void {
    this.hudGraphics = this.add.graphics();
    this.hudGraphics.setDepth(500);

    this.player1Bar = this.add.graphics();
    this.player1Bar.setDepth(501);

    this.player2Bar = this.add.graphics();
    this.player2Bar.setDepth(501);

    this.timerText = this.add.text(
      GameConfig.WIDTH / 2,
      25,
      '0:00',
      {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: '"Press Start 2P", "Courier New", monospace',
        stroke: '#000000',
        strokeThickness: 4,
      }
    ).setOrigin(0.5).setDepth(502);

    this.eventText = this.add.text(
      GameConfig.WIDTH / 2,
      60,
      '',
      {
        fontSize: '16px',
        color: '#FFD700',
        fontFamily: '"Press Start 2P", "Courier New", monospace',
        stroke: '#000000',
        strokeThickness: 4,
      }
    ).setOrigin(0.5).setDepth(502);

    this.add.text(
      20, 20,
      'P1',
      {
        fontSize: '14px',
        color: '#4169E1',
        fontFamily: '"Press Start 2P", "Courier New", monospace',
        stroke: '#000000',
        strokeThickness: 3,
      }
    ).setDepth(502);

    this.add.text(
      GameConfig.WIDTH - 40, 20,
      'P2',
      {
        fontSize: '14px',
        color: '#DC143C',
        fontFamily: '"Press Start 2P", "Courier New", monospace',
        stroke: '#000000',
        strokeThickness: 3,
      }
    ).setDepth(502);

    this.updateHUD();
  }

  updateHUD(): void {
    if (!this.player1Bar || !this.player2Bar || !this.timerText || !this.hudGraphics) return;

    this.hudGraphics.clear();
    this.player1Bar.clear();
    this.player2Bar.clear();

    this.hudGraphics.fillStyle(0x000000, 0.5);
    this.hudGraphics.fillRect(50, 15, 200, 25);
    this.hudGraphics.fillRect(GameConfig.WIDTH - 250, 15, 200, 25);

    this.hudGraphics.lineStyle(2, 0xffffff, 0.8);
    this.hudGraphics.strokeRect(50, 15, 200, 25);
    this.hudGraphics.strokeRect(GameConfig.WIDTH - 250, 15, 200, 25);

    if (this.player1) {
      const p1Percent = this.player1.inflation.getPercentage();
      const p1Color = this.player1.inflation.isCoolingDown ? 0xff6666 : 0x4169E1;

      this.player1Bar.fillStyle(p1Color);
      this.player1Bar.fillRect(52, 17, 196 * p1Percent, 21);

      if (this.player1.activePowerUps.length > 0) {
        this.drawPowerUpIcons(260, 27, this.player1);
      }
    }

    if (this.player2) {
      const p2Percent = this.player2.inflation.getPercentage();
      const p2Color = this.player2.inflation.isCoolingDown ? 0xff6666 : 0xDC143C;

      this.player2Bar.fillStyle(p2Color);
      const barWidth = 196 * p2Percent;
      this.player2Bar.fillRect(GameConfig.WIDTH - 52 - barWidth, 17, barWidth, 21);

      if (this.player2.activePowerUps.length > 0) {
        this.drawPowerUpIcons(GameConfig.WIDTH - 270, 27, this.player2, true);
      }
    }

    this.timerText.setText(formatTime(this.gameTime));
  }

  drawPowerUpIcons(x: number, y: number, player: Player, reverse: boolean = false): void {
    if (!this.hudGraphics) return;

    const icons: { [key: string]: string } = {
      [PowerUpType.LIGHTNING_BOOTS]: '⚡',
      [PowerUpType.SHIELD]: '🛡',
      [PowerUpType.OIL_BARREL]: '🛢',
      [PowerUpType.CLONE]: '👥',
    };

    player.activePowerUps.forEach((powerUp, index) => {
      const offsetX = reverse ? -index * 25 : index * 25;
      const icon = this.add.text(
        x + offsetX,
        y,
        icons[powerUp.type] || '?',
        {
          fontSize: '16px',
          fontFamily: 'Arial',
        }
      ).setOrigin(reverse ? 1 : 0, 0.5).setDepth(502);

      this.time.delayedCall(100, () => icon.destroy());
    });
  }

  createEvents(): void {
    this.darkClouds = new DarkClouds(this);
    this.migratoryBirds = new MigratoryBirds(this);
    this.lightning = new Lightning(this);
  }

  setupCollisionManager(): void {
    this.collisionManager.reset();
    if (this.player1) this.collisionManager.addPlayer(this.player1);
    if (this.player2) this.collisionManager.addPlayer(this.player2);
  }

  update(time: number, delta: number): void {
    if (this.isGameOver) {
      this.gameOverTimer += delta;
      if (this.gameOverTimer > 2000) {
        this.goToGameOver();
      }
      return;
    }

    this.gameTime += delta;

    this.updateControllers(delta);
    this.updatePlayers(delta);
    this.updateClones(delta);
    this.updateEnvironment(delta, time);
    this.updatePowerUps(delta);
    this.updateCollisions(delta);
    this.updateEvents(delta);
    this.updateTeamMode();
    this.updateHUD();
    this.updateStats(delta);
    this.checkGameOver();
  }

  updateControllers(delta: number): void {
    if (this.player1Controller) {
      this.player1Controller.update();
    }

    if (this.aiController) {
      this.aiController.update(delta);
    } else if (this.player2Controller) {
      this.player2Controller.update();
    }
  }

  updatePlayers(delta: number): void {
    if (this.player1) this.player1.update(delta);
    if (this.player2) this.player2.update(delta);
  }

  updateClones(delta: number): void {
    for (let i = this.clones.length - 1; i >= 0; i--) {
      const clone = this.clones[i];
      const original = clone.id === 1 ? this.player1 : this.player2;

      if (original) {
        const offset = (i === 0 ? -1 : 1) * 60;
        clone.x = original.x + offset;
        clone.y = original.y;
        clone.velocityX = original.velocityX;
        clone.velocityY = original.velocityY;
        clone.isInflating = original.isInflating;
        clone.moveDirection = original.moveDirection;
      }

      clone.update(delta);

      if (clone.activePowerUps.length === 0 || !original?.hasPowerUp(PowerUpType.CLONE)) {
        clone.destroy();
        this.clones.splice(i, 1);
      }
    }
  }

  updateEnvironment(delta: number, time: number): void {
    const allPlayers = [...(this.player1 ? [this.player1] : []), ...(this.player2 ? [this.player2] : []), ...this.clones];

    for (let i = this.clouds.length - 1; i >= 0; i--) {
      this.clouds[i].update(delta, allPlayers);
      if (this.clouds[i].isExpired()) {
        this.clouds[i].destroy();
        this.clouds.splice(i, 1);
      }
    }

    if (this.clouds.length < 5 && Math.random() < 0.001) {
      const x = Phaser.Math.Between(100, GameConfig.WIDTH - 100);
      const y = Phaser.Math.Between(100, GameConfig.HEIGHT - 100);
      this.clouds.push(new Cloud(this, x, y, Phaser.Math.Between(80, 120)));
    }

    for (const pillar of this.pillars) {
      const hitPlayer = pillar.update(allPlayers);
      if (hitPlayer) {
        this.handlePlayerDeath(hitPlayer, null, '石柱尖刺');
      }
    }

    for (let i = this.colorBalloons.length - 1; i >= 0; i--) {
      const result = this.colorBalloons[i].update(delta, time, allPlayers);
      if (result.collected && result.player) {
        if (result.powerUp) {
          result.player.applyPowerUp(result.powerUp);
          this.addHighlight('powerup', `玩家${result.player.id} 获得道具！`);
          this.getPlayerStats(result.player.id).powerUpsCollected++;
        }
        this.colorBalloons.splice(i, 1);

        this.time.delayedCall(3000, () => {
          if (this.colorBalloons.length < 5) {
            this.spawnColorBalloons(1);
          }
        });
      }
    }
  }

  updatePowerUps(delta: number): void {
    const allPlayers = [...(this.player1 ? [this.player1] : []), ...(this.player2 ? [this.player2] : [])];

    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const result = this.powerUps[i].update(delta, allPlayers);
      if (result.collected && result.player) {
        this.handlePowerUpCollected(result.player, this.powerUps[i].type);
        this.powerUps.splice(i, 1);
      }
    }

    if (this.powerUps.length === 0 && Math.random() < 0.0005) {
      this.spawnPowerUp();
    }
  }

  handlePowerUpCollected(player: Player, type: PowerUpType): void {
    const powerUpNames: { [key: string]: string } = {
      [PowerUpType.LIGHTNING_BOOTS]: '闪电靴',
      [PowerUpType.SHIELD]: '护盾',
      [PowerUpType.OIL_BARREL]: '油桶',
      [PowerUpType.CLONE]: '分身术',
    };

    if (type === PowerUpType.CLONE) {
      this.createClone(player);
    }

    this.addHighlight('powerup', `玩家${player.id} 获得 ${powerUpNames[type]}！`);
    this.getPlayerStats(player.id).powerUpsCollected++;

    createTextPopup(this, player.x, player.y - 60, powerUpNames[type], '#FFD700', '14px');
  }

  createClone(original: Player): void {
    if (this.clones.filter(c => c.id === original.id).length >= 2) return;

    const clone = new Player(
      this,
      original.id,
      original.x,
      original.y,
      original.color,
      original.balloonColor,
      true
    );
    clone.container.setAlpha(0.6);
    clone.applyPowerUp(PowerUpType.CLONE);
    this.clones.push(clone);
    this.collisionManager.addPlayer(clone);
  }

  updateCollisions(delta: number): void {
    const events = this.collisionManager.update(delta);

    for (const event of events) {
      if (event.type === 'player_hit') {
        const attacker = event.player as Player;
        const victim = event.other as Player;

        if (victim.isClone) {
          victim.takeDamage(attacker);
          const idx = this.clones.indexOf(victim);
          if (idx > -1) this.clones.splice(idx, 1);
          continue;
        }

        if (victim.takeDamage(attacker)) {
          this.handlePlayerDeath(victim, attacker, `玩家${attacker.id}`);
        }
      }
    }

    this.checkFallKill();
  }

  getPlayerStats(playerId: number): PlayerStats {
    return playerId === 1 ? this.gameStats.player1Stats : this.gameStats.player2Stats;
  }

  handlePlayerDeath(victim: Player, attacker: Player | null, cause: string): void {
    const victimStats = this.getPlayerStats(victim.id);
    victimStats.deaths++;

    if (attacker) {
      const attackerStats = this.getPlayerStats(attacker.id);
      attackerStats.kills++;
      this.addHighlight('kill', `玩家${attacker.id} 戳破了 玩家${victim.id} 的气球！`);
      createTextPopup(this, attacker.x, attacker.y - 60, '+1 击杀', '#00FF00', '14px');
    } else {
      this.addHighlight('death', `玩家${victim.id} 被 ${cause} 淘汰！`);
    }

    this.gameStats.highlights.push({
      time: this.gameTime,
      type: 'death',
      description: `玩家${victim.id} 被 ${cause} 淘汰`,
    });

    this.time.delayedCall(500, () => {
      if (this.checkGameOver()) return;

      victim.reset(
        victim.id === 1 ? GameConfig.WIDTH * 0.25 : GameConfig.WIDTH * 0.75,
        GameConfig.HEIGHT / 2
      );
    });
  }

  checkFallKill(): void {
    const allPlayers = [this.player1, this.player2].filter(p => p) as Player[];

    for (const dead of allPlayers) {
      if (!dead.isDying) continue;

      for (const alive of allPlayers) {
        if (alive === dead || !alive.isAlive) continue;

        const dx = dead.x - alive.x;
        const dy = dead.y - alive.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 50 && dead.deathFallVelocity > 200) {
          if (alive.takeDamage(dead)) {
            this.handlePlayerDeath(alive, dead, `玩家${dead.id} 的坠落撞击`);

            const stats = this.getPlayerStats(dead.id);
            stats.fallKills++;
            this.addHighlight('fall_kill', `玩家${dead.id} 坠落时撞倒了 玩家${alive.id}！`);
          }
        }
      }
    }
  }

  updateEvents(delta: number): void {
    if (!this.darkClouds || !this.migratoryBirds || !this.lightning) return;

    const allPlayers = [...(this.player1 ? [this.player1] : []), ...(this.player2 ? [this.player2] : [])];

    if (!this.activeEvent) {
      this.eventTimer -= delta;
      if (this.eventTimer <= 0) {
        this.triggerRandomEvent();
      }
    }

    const events = [this.darkClouds, this.migratoryBirds, this.lightning];
    for (const event of events) {
      const hitPlayer = event.update(delta, allPlayers);
      if (hitPlayer) {
        const eventNames: { [key: string]: string } = {
          'DarkClouds': '乌云',
          'MigratoryBirds': '候鸟',
          'Lightning': '雷电',
        };
        const eventName = eventNames[event.constructor.name] || '事件';
        this.handlePlayerDeath(hitPlayer, null, eventName);
      }
    }

    if (this.activeEvent && !this.darkClouds.isActive && !this.migratoryBirds.isActive && !this.lightning.isActive) {
      this.activeEvent = null;
      this.eventTimer = GameConfig.EVENT_INTERVAL;
      if (this.eventText) this.eventText.setText('');
    }
  }

  triggerRandomEvent(): void {
    const events = [
      { name: 'darkClouds', text: '⚠ 乌云来袭！视野受阻！', action: () => this.darkClouds?.start() },
      { name: 'migratoryBirds', text: '⚠ 候鸟过境！小心避让！', action: () => this.migratoryBirds?.start() },
      { name: 'lightning', text: '⚠ 雷电天气！注意躲避！', action: () => this.lightning?.start() },
    ];

    const event = events[Phaser.Math.Between(0, events.length - 1)];
    this.activeEvent = event.name;
    event.action();

    if (this.eventText) {
      this.eventText.setText(event.text);
      this.tweens.add({
        targets: this.eventText,
        scale: { from: 1.5, to: 1 },
        duration: 300,
        ease: 'Back.easeOut',
      });
    }

    this.addHighlight('event', event.text);
  }

  updateTeamMode(): void {
    if (this.gameMode !== GameMode.TEAM_MODE || !this.player1 || !this.player2) return;

    const p1Inflation = this.player1.inflation;
    const p2Inflation = this.player2.inflation;

    if (this.player1.isAlive && !this.player2.isAlive && p1Inflation.current > 50) {
      const share = p1Inflation.current * GameConfig.TEAM_SHARE_RATIO;
      p1Inflation.current -= share;
      p2Inflation.current = Math.min(p2Inflation.max, share);
      p2Inflation.isCoolingDown = false;
      p2Inflation.cooldownTimer = 0;

      this.addHighlight('event', '玩家1 分享充气量救助队友！');
      createTextPopup(this, this.player1.x, this.player1.y - 60, '-50% 分享', '#4ECDC4', '12px');
    } else if (this.player2.isAlive && !this.player1.isAlive && p2Inflation.current > 50) {
      const share = p2Inflation.current * GameConfig.TEAM_SHARE_RATIO;
      p2Inflation.current -= share;
      p1Inflation.current = Math.min(p1Inflation.max, share);
      p1Inflation.isCoolingDown = false;
      p1Inflation.cooldownTimer = 0;

      this.addHighlight('event', '玩家2 分享充气量救助队友！');
      createTextPopup(this, this.player2.x, this.player2.y - 60, '-50% 分享', '#4ECDC4', '12px');
    }
  }

  updateStats(delta: number): void {
    if (this.player1?.isAlive) {
      this.gameStats.player1Stats.survivalTime += delta;
    }
    if (this.player2?.isAlive) {
      this.gameStats.player2Stats.survivalTime += delta;
    }
  }

  addHighlight(type: Highlight['type'], description: string): void {
    this.gameStats.highlights.push({
      time: this.gameTime,
      type,
      description,
    });

    if (this.gameStats.highlights.length > 20) {
      this.gameStats.highlights.shift();
    }
  }

  checkGameOver(): boolean {
    if (this.gameMode === GameMode.TEAM_MODE) {
      if (this.player1?.isAlive === false && this.player2?.isAlive === false) {
        this.triggerGameOver(null);
        return true;
      }
    } else {
      if (this.player1?.isAlive === false || this.player2?.isAlive === false) {
        const winner = this.player1?.isAlive ? 1 : 2;
        this.triggerGameOver(winner);
        return true;
      }
    }
    return false;
  }

  triggerGameOver(winner: number | null): void {
    this.isGameOver = true;
    this.gameOverTimer = 0;
    this.gameStats.winner = winner;
    this.gameStats.matchTime = this.gameTime;

    this.cameras.main.flash(500, 255, 255, 255);

    if (winner) {
      createTextPopup(
        this,
        GameConfig.WIDTH / 2,
        GameConfig.HEIGHT / 2,
        `玩家 ${winner} 获胜！`,
        winner === 1 ? '#4169E1' : '#DC143C',
        '32px'
      );
    } else {
      createTextPopup(
        this,
        GameConfig.WIDTH / 2,
        GameConfig.HEIGHT / 2,
        '同归于尽！',
        '#FFD700',
        '32px'
      );
    }
  }

  goToGameOver(): void {
    this.scene.start('GameOver', {
      gameStats: this.gameStats,
      gameMode: this.gameMode,
    });
  }
}
