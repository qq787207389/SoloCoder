import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create(): void {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x1a1a2e).setOrigin(0);

    this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'brick').setOrigin(0).setAlpha(0.3);

    const title = this.add.text(GAME_WIDTH / 2, 160, '水管玛丽', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#ffcc00',
      stroke: '#8b4513',
      strokeThickness: 8,
      shadow: {
        offsetX: 4,
        offsetY: 4,
        color: '#000',
        blur: 8,
        fill: true,
      },
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      y: 150,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.add.text(GAME_WIDTH / 2, 280, 'PIPE MARY', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#00cc00',
      stroke: '#004400',
      strokeThickness: 3,
    }).setOrigin(0.5);

    const startText = this.add.text(GAME_WIDTH / 2, 380, '按 空格键 开始游戏', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: startText,
      alpha: 0.3,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    this.add.text(GAME_WIDTH / 2, 440, '← → 移动    ↑/空格 跳跃', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 470, '跳起用头撞击平台顶翻敌人', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 500, '走近翻倒的敌人自动踢飞', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    this.input.keyboard!.once('keydown-SPACE', () => {
      this.scene.start('GameScene');
    });
  }
}
