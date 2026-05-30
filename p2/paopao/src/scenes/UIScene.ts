import Phaser from 'phaser';
import { PowerUpType, LevelTheme } from '../types/game';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';

export class UIScene extends Phaser.Scene {
  private scoreText!: Phaser.GameObjects.Text;
  private livesIcons: Phaser.GameObjects.Image[] = [];
  private levelText!: Phaser.GameObjects.Text;
  private powerUpIcon!: Phaser.GameObjects.Image;
  private powerUpTimerBar!: Phaser.GameObjects.Graphics;
  private bossHealthBar!: Phaser.GameObjects.Graphics;
  private bossHealthBg!: Phaser.GameObjects.Graphics;
  private themeNameText!: Phaser.GameObjects.Text;
  private controlsText!: Phaser.GameObjects.Text;

  private themeNames: Record<LevelTheme, string> = {
    cave: '神秘洞穴',
    ice: '冰霜洞窟',
    volcano: '熔岩火山'
  };

  constructor() {
    super('UIScene');
  }

  create() {
    this.add.text(16, 12, '分数', {
      fontFamily: 'Courier New',
      fontSize: '14px',
      color: '#9ca3af'
    });

    this.scoreText = this.add.text(16, 28, '0', {
      fontFamily: 'Courier New',
      fontSize: '24px',
      color: '#fbbf24',
      stroke: '#92400e',
      strokeThickness: 2
    });

    this.add.text(GAME_WIDTH - 150, 12, '生命', {
      fontFamily: 'Courier New',
      fontSize: '14px',
      color: '#9ca3af'
    });

    this.createLivesIcons();

    this.levelText = this.add.text(GAME_WIDTH / 2, 16, '关卡 1 / 6', {
      fontFamily: 'Courier New',
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#1a1a2e',
      strokeThickness: 3
    }).setOrigin(0.5, 0);

    this.themeNameText = this.add.text(GAME_WIDTH / 2, 40, '神秘洞穴', {
      fontFamily: 'Courier New',
      fontSize: '14px',
      color: '#a78bfa',
      stroke: '#1e1b4b',
      strokeThickness: 2
    }).setOrigin(0.5, 0);

    this.createPowerUpUI();
    this.createBossHealthBar();
    this.createControlsText();

    this.registry.events.on('changedata', this.onRegistryChanged, this);
  }

  private createLivesIcons() {
    this.livesIcons.forEach(icon => icon.destroy());
    this.livesIcons = [];

    for (let i = 0; i < 3; i++) {
      const x = GAME_WIDTH - 140 + i * 28;
      const y = 32;

      const g = this.make.graphics();
      g.fillStyle(0xef4444);
      g.fillCircle(x + 6, y + 4, 5);
      g.fillCircle(x + 14, y + 4, 5);
      g.fillTriangle(x, y + 6, x + 10, y + 18, x + 20, y + 6);
      g.fillStyle(0xfca5a5);
      g.fillCircle(x + 4, y + 2, 2);
      g.generateTexture(`heart_${i}`, 20, 20);
      g.destroy();

      const icon = this.add.image(x + 10, y + 10, `heart_${i}`);
      icon.setScale(1);
      this.livesIcons.push(icon);
    }
  }

  private createPowerUpUI() {
    this.add.text(16, 60, '道具', {
      fontFamily: 'Courier New',
      fontSize: '12px',
      color: '#9ca3af'
    });

    this.powerUpIcon = this.add.image(40, 85, 'powerup_rapid');
    this.powerUpIcon.setScale(0.8);
    this.powerUpIcon.setAlpha(0);

    this.powerUpTimerBar = this.add.graphics();
  }

  private createBossHealthBar() {
    this.bossHealthBg = this.add.graphics();
    this.bossHealthBar = this.add.graphics();

    this.bossHealthBg.fillStyle(0x1a1a2e, 0.8);
    this.bossHealthBg.fillRoundedRect(GAME_WIDTH / 2 - 150, GAME_HEIGHT - 40, 300, 24, 4);

    this.bossHealthBar.setVisible(false);
    this.bossHealthBg.setVisible(false);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 52, 'BOSS', {
      fontFamily: 'Courier New',
      fontSize: '14px',
      color: '#ef4444',
      stroke: '#7f1d1d',
      strokeThickness: 2
    }).setOrigin(0.5).setVisible(false).setName('bossLabel');
  }

  private createControlsText() {
    this.controlsText = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 15,
      '← → 移动  |  ↑ 跳跃  |  空格 吐泡泡', {
      fontFamily: 'Courier New',
      fontSize: '12px',
      color: '#6b7280'
    }).setOrigin(0.5);
  }

  private onRegistryChanged(parent: any, key: string, value: any) {
    switch (key) {
      case 'score':
        this.updateScore(value);
        break;
      case 'lives':
        this.updateLives(value);
        break;
      case 'level':
        this.updateLevel(value, this.registry.get('totalLevels'));
        break;
      case 'theme':
        this.updateTheme(value);
        break;
      case 'powerUp':
        this.updatePowerUp(value, this.registry.get('powerUpTimer'));
        break;
      case 'powerUpTimer':
        this.updatePowerUpTimer(value);
        break;
      case 'isBossLevel':
        this.showBossUI(value);
        break;
      case 'bossHealth':
        this.updateBossHealth(value, this.registry.get('bossMaxHealth'));
        break;
    }
  }

  private updateScore(score: number) {
    this.scoreText.setText(score.toString().padStart(6, '0'));

    this.tweens.add({
      targets: this.scoreText,
      scale: { from: 1.2, to: 1 },
      duration: 150,
      ease: 'Cubic.out'
    });
  }

  private updateLives(lives: number) {
    this.livesIcons.forEach((icon, i) => {
      const shouldShow = i < lives;
      this.tweens.add({
        targets: icon,
        alpha: shouldShow ? 1 : 0.2,
        scale: shouldShow ? 1 : 0.6,
        duration: 200,
        ease: 'Cubic.out'
      });
    });
  }

  private updateLevel(level: number, total: number) {
    this.levelText.setText(`关卡 ${level} / ${total}`);

    this.tweens.add({
      targets: this.levelText,
      scale: { from: 1.3, to: 1 },
      duration: 300,
      ease: 'Elastic.out'
    });
  }

  private updateTheme(theme: LevelTheme) {
    const themeName = this.themeNames[theme] || theme;
    this.themeNameText.setText(themeName);

    let color = '#a78bfa';
    if (theme === 'ice') color = '#60a5fa';
    if (theme === 'volcano') color = '#f97316';

    this.themeNameText.setColor(color);
  }

  private updatePowerUp(type: PowerUpType | null, timer: number) {
    if (type) {
      this.powerUpIcon.setTexture(`powerup_${type}`);
      this.powerUpIcon.setAlpha(1);
      this.updatePowerUpTimer(timer);
    } else {
      this.powerUpIcon.setAlpha(0);
      this.powerUpTimerBar.clear();
    }
  }

  private updatePowerUpTimer(timer: number) {
    if (timer <= 0 || this.registry.get('powerUp') === null) {
      this.powerUpTimerBar.clear();
      return;
    }

    const maxTime = 10000;
    const percent = Math.min(1, timer / maxTime);
    const barWidth = 40;
    const barHeight = 4;

    this.powerUpTimerBar.clear();

    this.powerUpTimerBar.fillStyle(0x374151);
    this.powerUpTimerBar.fillRoundedRect(16, 105, barWidth, barHeight, 2);

    const color = this.registry.get('powerUp') === 'rapid' ? 0xfbbf24 : 0xec4899;
    this.powerUpTimerBar.fillStyle(color);
    this.powerUpTimerBar.fillRoundedRect(16, 105, barWidth * percent, barHeight, 2);
  }

  private showBossUI(show: boolean) {
    this.bossHealthBg.setVisible(show);
    this.bossHealthBar.setVisible(show);

    const bossLabel = this.children.getByName('bossLabel') as Phaser.GameObjects.Text;
    if (bossLabel) {
      bossLabel.setVisible(show);
    }

    this.controlsText.setVisible(!show);
  }

  private updateBossHealth(health: number, maxHealth: number) {
    if (maxHealth <= 0) return;

    const percent = Math.max(0, health / maxHealth);
    const barWidth = 290;
    const barHeight = 14;

    this.bossHealthBar.clear();

    this.bossHealthBar.fillStyle(0x991b1b);
    this.bossHealthBar.fillRoundedRect(GAME_WIDTH / 2 - 145, GAME_HEIGHT - 35, barWidth, barHeight, 3);

    const gradientColor = percent > 0.5 ? 0x22c55e : percent > 0.25 ? 0xfbbf24 : 0xef4444;
    this.bossHealthBar.fillStyle(gradientColor);
    this.bossHealthBar.fillRoundedRect(GAME_WIDTH / 2 - 145, GAME_HEIGHT - 35, barWidth * percent, barHeight, 3);

    this.bossHealthBar.fillStyle(0xffffff, 0.3);
    this.bossHealthBar.fillRoundedRect(GAME_WIDTH / 2 - 145, GAME_HEIGHT - 35, barWidth * percent, 4, 3);
  }

  destroy() {
    this.registry.events.off('changedata', this.onRegistryChanged, this);
  }
}
