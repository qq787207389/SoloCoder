import Phaser from 'phaser';
import { GameConfig, GameMode } from '@/config/GameConfig';
import { GameStatsData, formatTime } from '@/game/GameStats';

export class GameOver extends Phaser.Scene {
  private gameStats: GameStatsData | null = null;
  private gameMode: GameMode = GameMode.SINGLE_PLAYER;

  constructor() {
    super('GameOver');
  }

  init(data: { gameStats: GameStatsData; gameMode: GameMode }): void {
    this.gameStats = data.gameStats;
    this.gameMode = data.gameMode;
  }

  create(): void {
    this.cameras.main.setBackgroundColor(0x1a1a2e);
    this.drawBackground();
    this.createTitle();
    this.createStatsPanel();
    this.createHighlights();
    this.createButtons();
    this.setupInput();
    this.createAnimations();
  }

  drawBackground(): void {
    const gradient = this.add.graphics();
    gradient.fillStyle(0x1a1a2e);
    gradient.fillRect(0, 0, GameConfig.WIDTH, GameConfig.HEIGHT);

    gradient.fillStyle(0x16213e, 0.5);
    gradient.fillRect(0, GameConfig.HEIGHT * 0.3, GameConfig.WIDTH, GameConfig.HEIGHT * 0.4);

    gradient.fillStyle(0x0f3460, 0.3);
    gradient.fillRect(0, GameConfig.HEIGHT * 0.7, GameConfig.WIDTH, GameConfig.HEIGHT * 0.3);

    for (let i = 0; i < 15; i++) {
      const x = Phaser.Math.Between(0, GameConfig.WIDTH);
      const y = Phaser.Math.Between(0, GameConfig.HEIGHT);
      const size = Phaser.Math.Between(2, 6);

      const star = this.add.circle(x, y, size, 0xffffff, 0.3 + Math.random() * 0.5);

      this.tweens.add({
        targets: star,
        alpha: { from: 0.2, to: 0.8 },
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Phaser.Math.Between(0, 1000),
      });
    }
  }

  createTitle(): void {
    if (!this.gameStats) return;

    const winner = this.gameStats.winner;
    let titleText = '游戏结束';
    let titleColor = '#FFD700';

    if (winner) {
      titleText = `玩家 ${winner} 获胜！`;
      titleColor = winner === 1 ? '#4169E1' : '#DC143C';
    } else if (this.gameMode === GameMode.TEAM_MODE) {
      titleText = '同归于尽！';
      titleColor = '#FF6B6B';
    }

    const title = this.add.text(
      GameConfig.WIDTH / 2,
      80,
      titleText,
      {
        fontSize: '48px',
        color: titleColor,
        fontFamily: '"Press Start 2P", "Courier New", monospace',
        stroke: '#000000',
        strokeThickness: 8,
      }
    ).setOrigin(0.5);

    this.add.text(
      GameConfig.WIDTH / 2,
      130,
      'GAME OVER',
      {
        fontSize: '20px',
        color: '#95a5a6',
        fontFamily: '"Press Start 2P", "Courier New", monospace',
        stroke: '#000000',
        strokeThickness: 4,
      }
    ).setOrigin(0.5);

    this.add.text(
      GameConfig.WIDTH / 2,
      165,
      `比赛时长: ${formatTime(this.gameStats.matchTime)}`,
      {
        fontSize: '16px',
        color: '#ecf0f1',
        fontFamily: '"Press Start 2P", "Courier New", monospace',
        stroke: '#000000',
        strokeThickness: 3,
      }
    ).setOrigin(0.5);
  }

  createStatsPanel(): void {
    if (!this.gameStats) return;

    const panelY = 220;
    const panelWidth = 350;
    const spacing = 20;

    const createPlayerPanel = (x: number, playerNum: number, color: string, stats: any) => {
      const colorMap: { [key: string]: number } = {
        '#4169E1': 0x4169E1,
        '#DC143C': 0xDC143C,
        '#32CD32': 0x32CD32,
      };
      const numericColor = colorMap[color] || 0xffffff;

      const bg = this.add.rectangle(x, panelY, panelWidth, 220, 0x2c3e50, 0.9);
      bg.setStrokeStyle(4, numericColor);
      bg.setAlpha(0);

      this.tweens.add({
        targets: bg,
        alpha: 1,
        duration: 500,
        delay: 300 + playerNum * 200,
        ease: 'Back.easeOut',
      });

      const playerText = this.add.text(
        x,
        panelY - 90,
        `玩家 ${playerNum}`,
        {
          fontSize: '20px',
          color: color,
          fontFamily: '"Press Start 2P", "Courier New", monospace',
          stroke: '#000000',
          strokeThickness: 4,
        }
      ).setOrigin(0.5).setAlpha(0);

      this.tweens.add({
        targets: playerText,
        alpha: 1,
        duration: 300,
        delay: 400 + playerNum * 200,
      });

      const statsItems = [
        { label: '击杀数', value: stats.kills, icon: '💥' },
        { label: '死亡数', value: stats.deaths, icon: '💀' },
        { label: '存活时间', value: formatTime(stats.survivalTime), icon: '⏱' },
        { label: '道具获取', value: stats.powerUpsCollected, icon: '🎁' },
        { label: '坠落击杀', value: stats.fallKills, icon: '⬇' },
      ];

      statsItems.forEach((item, index) => {
        const itemY = panelY - 50 + index * spacing;

        this.add.text(
          x - panelWidth / 2 + 30,
          itemY,
          item.icon,
          {
            fontSize: '16px',
            fontFamily: 'Arial',
          }
        ).setOrigin(0, 0.5);

        this.add.text(
          x - panelWidth / 2 + 60,
          itemY,
          item.label,
          {
            fontSize: '12px',
            color: '#bdc3c7',
            fontFamily: '"Press Start 2P", "Courier New", monospace',
          }
        ).setOrigin(0, 0.5);

        const valueText = this.add.text(
          x + panelWidth / 2 - 30,
          itemY,
          item.value.toString(),
          {
            fontSize: '14px',
            color: '#ffffff',
            fontFamily: '"Press Start 2P", "Courier New", monospace',
          }
        ).setOrigin(1, 0.5);

        valueText.setAlpha(0);
        this.tweens.add({
          targets: valueText,
          alpha: 1,
          duration: 300,
          delay: 500 + playerNum * 200 + index * 100,
        });
      });
    };

    createPlayerPanel(GameConfig.WIDTH / 2 - 200, 1, '#4169E1', this.gameStats.player1Stats);
    createPlayerPanel(GameConfig.WIDTH / 2 + 200, 2, '#DC143C', this.gameStats.player2Stats);

    const vsText = this.add.text(
      GameConfig.WIDTH / 2,
      panelY,
      'VS',
      {
        fontSize: '32px',
        color: '#FFD700',
        fontFamily: '"Press Start 2P", "Courier New", monospace',
        stroke: '#000000',
        strokeThickness: 6,
      }
    ).setOrigin(0.5);

    vsText.setScale(0);
    this.tweens.add({
      targets: vsText,
      scale: 1,
      duration: 500,
      delay: 800,
      ease: 'Back.easeOut',
    });
  }

  createHighlights(): void {
    if (!this.gameStats || this.gameStats.highlights.length === 0) return;

    const panelY = 480;

    this.add.text(
      GameConfig.WIDTH / 2,
      panelY - 30,
      '精彩时刻',
      {
        fontSize: '18px',
        color: '#FFD700',
        fontFamily: '"Press Start 2P", "Courier New", monospace',
        stroke: '#000000',
        strokeThickness: 4,
      }
    ).setOrigin(0.5);

    const bg = this.add.rectangle(
      GameConfig.WIDTH / 2,
      panelY + 30,
      600,
      60,
      0x000000,
      0.6
    );
    bg.setStrokeStyle(2, 0x34495e);

    const highlights = this.gameStats.highlights.slice(-5);
    let currentIndex = 0;

    const highlightText = this.add.text(
      GameConfig.WIDTH / 2,
      panelY + 30,
      highlights[0]?.description || '',
      {
        fontSize: '12px',
        color: '#ecf0f1',
        fontFamily: '"Press Start 2P", "Courier New", monospace',
      }
    ).setOrigin(0.5);

    this.time.addEvent({
      delay: 2000,
      callback: () => {
        currentIndex = (currentIndex + 1) % highlights.length;

        this.tweens.add({
          targets: highlightText,
          alpha: 0,
          duration: 200,
          onComplete: () => {
            highlightText.setText(highlights[currentIndex]?.description || '');
            this.tweens.add({
              targets: highlightText,
              alpha: 1,
              duration: 200,
            });
          },
        });
      },
      loop: true,
    });
  }

  createButtons(): void {
    const buttonY = GameConfig.HEIGHT - 80;
    const buttonWidth = 250;
    const buttonHeight = 60;

    const createButton = (x: number, text: string, color: number, onClick: () => void) => {
      const bg = this.add.rectangle(x, buttonY, buttonWidth, buttonHeight, color, 0.9);
      bg.setStrokeStyle(4, 0xffffff);
      bg.setInteractive({ useHandCursor: true });
      bg.setAlpha(0);

      const buttonText = this.add.text(
        x,
        buttonY,
        text,
        {
          fontSize: '16px',
          color: '#ffffff',
          fontFamily: '"Press Start 2P", "Courier New", monospace',
        }
      ).setOrigin(0.5);
      buttonText.setAlpha(0);

      this.tweens.add({
        targets: [bg, buttonText],
        alpha: 1,
        duration: 500,
        delay: 1000,
        ease: 'Back.easeOut',
      });

      bg.on('pointerover', () => {
        this.tweens.add({
          targets: bg,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 200,
        });
      });

      bg.on('pointerout', () => {
        this.tweens.add({
          targets: bg,
          scaleX: 1,
          scaleY: 1,
          duration: 200,
        });
      });

      bg.on('pointerdown', onClick);
    };

    createButton(
      GameConfig.WIDTH / 2 - 150,
      '再来一局',
      0x27ae60,
      () => this.restartGame()
    );

    createButton(
      GameConfig.WIDTH / 2 + 150,
      '返回菜单',
      0x7f8c8d,
      () => this.goToMenu()
    );
  }

  setupInput(): void {
    this.input.keyboard!.on('keydown-SPACE', () => {
      this.restartGame();
    });

    this.input.keyboard!.on('keydown-ENTER', () => {
      this.restartGame();
    });

    this.input.keyboard!.on('keydown-ESC', () => {
      this.goToMenu();
    });
  }

  createAnimations(): void {
    const balloonColors = [0x4169E1, 0xDC143C, 0xFF69B4, 0xFFD700, 0x32CD32];

    for (let i = 0; i < 6; i++) {
      const x = Phaser.Math.Between(50, GameConfig.WIDTH - 50);
      const y = GameConfig.HEIGHT + 50;
      const color = balloonColors[i % balloonColors.length];
      const size = Phaser.Math.Between(15, 25);

      const balloon = this.add.graphics();
      balloon.fillStyle(color);
      balloon.beginPath();
      balloon.arc(0, 0, size, 0, Math.PI * 2);
      balloon.fill();

      balloon.fillStyle(0xffffff, 0.5);
      balloon.beginPath();
      balloon.arc(-size * 0.3, -size * 0.3, size * 0.25, 0, Math.PI * 2);
      balloon.fill();

      balloon.setPosition(x, y);

      this.tweens.add({
        targets: balloon,
        y: -100,
        duration: Phaser.Math.Between(3000, 5000),
        delay: Phaser.Math.Between(500, 2000),
        ease: 'Quad.easeOut',
      });

      this.tweens.add({
        targets: balloon,
        x: x + Phaser.Math.Between(-50, 50),
        duration: Phaser.Math.Between(2000, 4000),
        delay: Phaser.Math.Between(500, 2000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  restartGame(): void {
    this.cameras.main.fadeOut(500, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene', { gameMode: this.gameMode });
    });
  }

  goToMenu(): void {
    this.cameras.main.fadeOut(500, 0, 0, 0);

    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MainMenu');
    });
  }
}
