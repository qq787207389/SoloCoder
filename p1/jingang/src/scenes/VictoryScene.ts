import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../types';

export class VictoryScene extends Phaser.Scene {
  private score: number = 0;
  private blinkTimer: number = 0;
  private restartText!: Phaser.GameObjects.Text;
  private fireworks: { x: number; y: number; color: number }[] = [];

  constructor() {
    super({ key: 'VictoryScene' });
  }

  init(data: { score: number }) {
    this.score = data.score;
  }

  create() {
    this.add.rectangle(240, 320, GAME_WIDTH, GAME_HEIGHT, 0x0a0a2a);

    this.add.text(240, 140, '恭喜通关！', {
      fontSize: '28px',
      fontFamily: 'serif',
      color: '#fdd835',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 0.5);

    this.add.text(240, 200, '大金刚被击败了！', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#00c853',
    }).setOrigin(0.5, 0.5);

    this.add.text(240, 260, `最终得分: ${this.score}`, {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0.5, 0.5);

    const player = this.add.sprite(200, 420, 'player_jump');
    player.setScale(3);
    this.tweens.add({
      targets: player,
      y: 400,
      yoyo: true,
      duration: 600,
      ease: 'Sine.easeInOut',
      repeat: -1,
    });

    const dk = this.add.sprite(320, 430, 'dk_idle');
    dk.setScale(2);
    dk.setFlipX(true);
    dk.setAlpha(0.5);
    this.tweens.add({
      targets: dk,
      alpha: 0.2,
      yoyo: true,
      duration: 1000,
      repeat: -1,
    });

    this.add.text(240, 360, '工地终于安全了', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#90a4ae',
    }).setOrigin(0.5, 0.5);

    this.restartText = this.add.text(240, 540, '按 ENTER 返回标题', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0.5, 0.5);

    this.input.keyboard!.on('keydown-ENTER', () => {
      this.scene.start('TitleScene');
    });

    this.time.addEvent({
      delay: 400,
      callback: this.spawnFirework,
      callbackScope: this,
      loop: true,
    });
  }

  private spawnFirework() {
    const x = 50 + Math.random() * 380;
    const y = 50 + Math.random() * 150;
    const colors = [0xe53935, 0xfdd835, 0x1565c0, 0x00c853, 0xff6d00];
    const color = colors[Math.floor(Math.random() * colors.length)];

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const p = this.add.rectangle(x, y, 3, 3, color);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * (30 + Math.random() * 20),
        y: y + Math.sin(angle) * (30 + Math.random() * 20),
        alpha: 0,
        duration: 500 + Math.random() * 300,
        onComplete: () => p.destroy(),
      });
    }
  }

  update(time: number, delta: number) {
    this.blinkTimer += delta;
    if (this.blinkTimer > 600) {
      this.blinkTimer = 0;
      this.restartText.setVisible(!this.restartText.visible);
    }
  }
}
