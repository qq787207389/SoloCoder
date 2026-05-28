import Phaser from 'phaser';
import { GameConfig, GameMode } from '@/config/GameConfig';
import { initParticleTexture } from '@/utils/ParticleEffects';

export class MainMenu extends Phaser.Scene {
  private selectedMode: GameMode = GameMode.SINGLE_PLAYER;
  private menuItems: Phaser.GameObjects.Text[] = [];
  private decorBalloons: Phaser.GameObjects.Graphics[] = [];
  private titleText!: Phaser.GameObjects.Text;
  private subtitleText!: Phaser.GameObjects.Text;

  constructor() {
    super('MainMenu');
  }

  preload(): void {
    initParticleTexture(this);
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x87CEEB);
    this.drawBackground();
    this.createDecorBalloons();
    this.createTitle();
    this.createMenu();
    this.createControlsInfo();
    this.setupInput();
    this.createAnimations();
  }

  drawBackground(): void {
    const gradient = this.add.graphics();
    gradient.fillStyle(0x87CEEB);
    gradient.fillRect(0, 0, GameConfig.WIDTH, GameConfig.HEIGHT);

    gradient.fillStyle(0xb0e0e6, 0.5);
    gradient.fillRect(0, GameConfig.HEIGHT * 0.3, GameConfig.WIDTH, GameConfig.HEIGHT * 0.4);

    gradient.fillStyle(0xe0f6ff, 0.3);
    gradient.fillRect(0, GameConfig.HEIGHT * 0.7, GameConfig.WIDTH, GameConfig.HEIGHT * 0.3);

    for (let i = 0; i < 5; i++) {
      const cloudX = Phaser.Math.Between(0, GameConfig.WIDTH);
      const cloudY = Phaser.Math.Between(50, GameConfig.HEIGHT / 2);
      this.drawCloud(cloudX, cloudY, Phaser.Math.Between(60, 120));
    }
  }

  drawCloud(x: number, y: number, size: number): void {
    const cloud = this.add.graphics();
    cloud.fillStyle(0xffffff, 0.7);
    cloud.beginPath();

    const segments = 5;
    const segmentWidth = size / segments;

    for (let i = 0; i < segments; i++) {
      const px = x - size / 2 + i * segmentWidth + segmentWidth / 2;
      const py = y + Math.sin(i * 0.8) * 8;
      const radius = segmentWidth * 0.6;
      cloud.arc(px, py, radius, 0, Math.PI * 2);
    }
    cloud.fill();

    this.tweens.add({
      targets: cloud,
      x: `+=${GameConfig.WIDTH + size * 2}`,
      duration: 60000 + Phaser.Math.Between(0, 20000),
      ease: 'Linear',
      repeat: -1,
      delay: Phaser.Math.Between(0, 10000),
    });
  }

  createDecorBalloons(): void {
    for (let i = 0; i < 8; i++) {
      const g = this.add.graphics();
      const x = Phaser.Math.Between(50, GameConfig.WIDTH - 50);
      const y = Phaser.Math.Between(100, GameConfig.HEIGHT - 100);
      const color = GameConfig.BALLOON_COLORS[i % GameConfig.BALLOON_COLORS.length];
      const size = Phaser.Math.Between(15, 25);

      g.fillStyle(color);
      g.beginPath();
      g.arc(0, 0, size, 0, Math.PI * 2);
      g.fill();

      g.fillStyle(0xffffff, 0.5);
      g.beginPath();
      g.arc(-size * 0.3, -size * 0.3, size * 0.25, 0, Math.PI * 2);
      g.fill();

      g.setPosition(x, y);
      this.decorBalloons.push(g);

      this.tweens.add({
        targets: g,
        y: y - Phaser.Math.Between(20, 40),
        duration: Phaser.Math.Between(1500, 2500),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 1000),
      });

      this.tweens.add({
        targets: g,
        x: x + Phaser.Math.Between(-20, 20),
        duration: Phaser.Math.Between(2000, 3000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 500),
      });
    }
  }

  createTitle(): void {
    this.titleText = this.add.text(
      GameConfig.WIDTH / 2,
      120,
      '气球大战',
      {
        fontSize: '64px',
        color: '#FF6B6B',
        fontFamily: '"Press Start 2P", "Courier New", monospace',
        stroke: '#000000',
        strokeThickness: 8,
      }
    ).setOrigin(0.5);

    this.titleText.setShadow(4, 4, '#000000', 0, true, true);

    this.subtitleText = this.add.text(
      GameConfig.WIDTH / 2,
      180,
      'BALLOON FIGHT',
      {
        fontSize: '20px',
        color: '#4ECDC4',
        fontFamily: '"Press Start 2P", "Courier New", monospace',
        stroke: '#000000',
        strokeThickness: 4,
      }
    ).setOrigin(0.5);
  }

  createMenu(): void {
    const modes = [
      { mode: GameMode.SINGLE_PLAYER, text: '单人 vs AI', desc: '与电脑对战' },
      { mode: GameMode.TWO_PLAYER, text: '双人对战', desc: '本地双人对决' },
      { mode: GameMode.TEAM_MODE, text: '组队模式', desc: '共享充气量' },
    ];

    const startY = 280;
    const spacing = 100;

    modes.forEach((item, index) => {
      const container = this.add.container(GameConfig.WIDTH / 2, startY + index * spacing);

      const bg = this.add.rectangle(0, 0, 400, 80, 0x2c3e50, 0.8);
      bg.setStrokeStyle(4, 0x34495e);
      bg.setInteractive({ useHandCursor: true });

      const text = this.add.text(0, -10, item.text, {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: '"Press Start 2P", "Courier New", monospace',
      }).setOrigin(0.5);

      const desc = this.add.text(0, 15, item.desc, {
        fontSize: '12px',
        color: '#95a5a6',
        fontFamily: '"Press Start 2P", "Courier New", monospace',
      }).setOrigin(0.5);

      container.add([bg, text, desc]);

      bg.on('pointerover', () => {
        this.tweens.add({
          targets: bg,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 200,
        });
        this.selectedMode = item.mode;
        this.updateSelection();
      });

      bg.on('pointerout', () => {
        this.tweens.add({
          targets: bg,
          scaleX: 1,
          scaleY: 1,
          duration: 200,
        });
      });

      bg.on('pointerdown', () => {
        this.startGame(item.mode);
      });

      if (index === 0) {
        bg.setStrokeStyle(4, 0xf39c12);
      }

      this.menuItems.push(text);
    });
  }

  updateSelection(): void {
  }

  createControlsInfo(): void {
    const infoBg = this.add.rectangle(
      GameConfig.WIDTH / 2,
      GameConfig.HEIGHT - 80,
      700,
      100,
      0x000000,
      0.6
    ).setOrigin(0.5);

    this.add.text(
      GameConfig.WIDTH / 2,
      GameConfig.HEIGHT - 115,
      '操作说明',
      {
        fontSize: '14px',
        color: '#FFD700',
        fontFamily: '"Press Start 2P", "Courier New", monospace',
      }
    ).setOrigin(0.5);

    const p1Text = this.add.text(
      GameConfig.WIDTH / 2 - 250,
      GameConfig.HEIGHT - 70,
      '玩家1: A/D 移动  空格 充气',
      {
        fontSize: '12px',
        color: '#4169E1',
        fontFamily: '"Press Start 2P", "Courier New", monospace',
      }
    ).setOrigin(0.5);

    const p2Text = this.add.text(
      GameConfig.WIDTH / 2 + 250,
      GameConfig.HEIGHT - 70,
      '玩家2: ←/→ 移动  回车 充气',
      {
        fontSize: '12px',
        color: '#DC143C',
        fontFamily: '"Press Start 2P", "Courier New", monospace',
      }
    ).setOrigin(0.5);

    this.add.text(
      GameConfig.WIDTH / 2,
      GameConfig.HEIGHT - 40,
      '点击上方按钮或按 空格键 开始游戏',
      {
        fontSize: '11px',
        color: '#95a5a6',
        fontFamily: '"Press Start 2P", "Courier New", monospace',
      }
    ).setOrigin(0.5);
  }

  setupInput(): void {
    this.input.keyboard!.on('keydown-SPACE', () => {
      this.startGame(this.selectedMode);
    });

    this.input.keyboard!.on('keydown-ENTER', () => {
      this.startGame(this.selectedMode);
    });

    this.input.keyboard!.on('keydown-UP', () => {
      const modes = [GameMode.SINGLE_PLAYER, GameMode.TWO_PLAYER, GameMode.TEAM_MODE];
      const idx = modes.indexOf(this.selectedMode);
      this.selectedMode = modes[(idx - 1 + modes.length) % modes.length];
    });

    this.input.keyboard!.on('keydown-DOWN', () => {
      const modes = [GameMode.SINGLE_PLAYER, GameMode.TWO_PLAYER, GameMode.TEAM_MODE];
      const idx = modes.indexOf(this.selectedMode);
      this.selectedMode = modes[(idx + 1) % modes.length];
    });
  }

  createAnimations(): void {
    this.tweens.add({
      targets: this.titleText,
      scale: { from: 0.95, to: 1.05 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  startGame(mode: GameMode): void {
    this.cameras.main.fadeOut(500, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene', { gameMode: mode });
    });
  }
}
