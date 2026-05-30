import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(data: { score: number; wave: number }): void {
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000).setOrigin(0).setAlpha(0.85);

    this.add.text(GAME_WIDTH / 2, 180, '游戏结束', {
      fontSize: '56px',
      fontFamily: 'Arial',
      color: '#ff4444',
      stroke: '#880000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 280, `最终得分: ${data.score}`, {
      fontSize: '32px',
      fontFamily: 'Arial',
      color: '#ffcc00',
      stroke: '#664400',
      strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 340, `到达波次: ${data.wave}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#00cc00',
      stroke: '#004400',
      strokeThickness: 3,
    }).setOrigin(0.5);

    const restartText = this.add.text(GAME_WIDTH / 2, 440, '按 空格键 重新开始', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: restartText,
      alpha: 0.3,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    this.input.keyboard!.once('keydown-SPACE', () => {
      this.scene.start('GameScene');
    });
  }
}
