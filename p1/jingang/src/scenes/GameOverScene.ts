import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../types';

export class GameOverScene extends Phaser.Scene {
  private score: number = 0;
  private blinkTimer: number = 0;
  private restartText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { score: number }) {
    this.score = data.score;
  }

  create() {
    this.add.rectangle(240, 320, GAME_WIDTH, GAME_HEIGHT, 0x0a0a0a);

    this.add.text(240, 180, 'GAME OVER', {
      fontSize: '32px',
      fontFamily: 'monospace',
      color: '#e53935',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5, 0.5);

    this.add.text(240, 260, `最终得分: ${this.score}`, {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#fdd835',
    }).setOrigin(0.5, 0.5);

    const dk = this.add.sprite(240, 380, 'dk_chestbeat1');
    dk.setScale(2);
    let frame = 0;
    this.time.addEvent({
      delay: 300,
      callback: () => {
        frame = (frame + 1) % 2;
        dk.setTexture(frame === 0 ? 'dk_chestbeat1' : 'dk_chestbeat2');
      },
      loop: true,
    });

    this.restartText = this.add.text(240, 480, '按 ENTER 重新开始', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0.5, 0.5);

    this.input.keyboard!.on('keydown-ENTER', () => {
      this.scene.start('TitleScene');
    });
  }

  update(time: number, delta: number) {
    this.blinkTimer += delta;
    if (this.blinkTimer > 600) {
      this.blinkTimer = 0;
      this.restartText.setVisible(!this.restartText.visible);
    }
  }
}
