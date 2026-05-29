import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../types';

export class TitleScene extends Phaser.Scene {
  private blinkTimer: number = 0;
  private startText!: Phaser.GameObjects.Text;
  private dkSprite!: Phaser.GameObjects.Sprite;
  private barrels: Phaser.GameObjects.Sprite[] = [];
  private barrelTimer: number = 0;

  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    this.add.rectangle(240, 320, GAME_WIDTH, GAME_HEIGHT, 0x0d1b2a);

    for (let i = 0; i < 6; i++) {
      const y = 420 + i * 40;
      const dir = i % 2 === 0 ? 1 : -1;
      const beam = this.add.rectangle(240, y, 400, 6, 0x90a4ae);
      beam.setAngle(dir * 3);
    }

    this.dkSprite = this.add.sprite(100, 370, 'dk_chestbeat1');
    this.dkSprite.setOrigin(0.5, 1);
    this.dkSprite.setScale(2);
    let dkFrame = 0;
    this.time.addEvent({
      delay: 300,
      callback: () => {
        dkFrame = (dkFrame + 1) % 2;
        this.dkSprite.setTexture(dkFrame === 0 ? 'dk_chestbeat1' : 'dk_chestbeat2');
      },
      loop: true,
    });

    const titleBg = this.add.rectangle(240, 120, 300, 70, 0xe53935);
    const titleBg2 = this.add.rectangle(240, 120, 290, 60, 0xfdd835);
    const titleBg3 = this.add.rectangle(240, 120, 280, 50, 0xe53935);

    this.add.text(240, 120, '大金刚', {
      fontSize: '36px',
      fontFamily: 'serif',
      color: '#fdd835',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5, 0.5);

    this.add.text(240, 170, '金刚攀爬', {
      fontSize: '16px',
      fontFamily: 'serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5, 0.5);

    this.startText = this.add.text(240, 260, '按 ENTER 开始', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0.5, 0.5);

    this.add.text(240, 550, '方向键移动  ↑跳跃  爬梯子上下', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#90a4ae',
    }).setOrigin(0.5, 0.5);

    this.add.text(240, 570, '© 2026 像素工地工作室', {
      fontSize: '9px',
      fontFamily: 'monospace',
      color: '#546e7a',
    }).setOrigin(0.5, 0.5);

    this.input.keyboard!.on('keydown-ENTER', () => {
      this.scene.start('GameScene', { levelId: 'construction' });
    });

    this.input.keyboard!.on('keydown-SPACE', () => {
      this.scene.start('GameScene', { levelId: 'construction' });
    });

    this.barrelTimer = 0;
  }

  update(time: number, delta: number) {
    this.blinkTimer += delta;
    if (this.blinkTimer > 600) {
      this.blinkTimer = 0;
      this.startText.setVisible(!this.startText.visible);
    }

    this.barrelTimer += delta;
    if (this.barrelTimer > 2000) {
      this.barrelTimer = 0;
      const barrel = this.add.sprite(this.dkSprite.x, this.dkSprite.y - 60, 'barrel_0');
      barrel.setScale(1.5);
      this.barrels.push(barrel);
    }

    for (let i = this.barrels.length - 1; i >= 0; i--) {
      const b = this.barrels[i];
      b.x += 1.5;
      b.y += 0.5;
      b.angle += 5;
      if (b.x > 500 || b.y > 660) {
        b.destroy();
        this.barrels.splice(i, 1);
      }
    }
  }
}
