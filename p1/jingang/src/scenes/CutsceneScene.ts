import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, LevelType } from '../types';

export class CutsceneScene extends Phaser.Scene {
  private score: number = 0;
  private lives: number = 3;
  private nextLevel: string = 'warehouse';
  private levelType: LevelType = 'construction';

  constructor() {
    super({ key: 'CutsceneScene' });
  }

  init(data: { score: number; lives: number; nextLevel: string; levelType: LevelType }) {
    this.score = data.score;
    this.lives = data.lives;
    this.nextLevel = data.nextLevel;
    this.levelType = data.levelType;
  }

  create() {
    this.add.rectangle(240, 320, GAME_WIDTH, GAME_HEIGHT, 0x0a0a1a);

    const scenes = this.getCutsceneData();
    let step = 0;

    const showStep = () => {
      if (step >= scenes.length) {
        this.scene.start('GameScene', {
          levelId: this.nextLevel,
          score: this.score,
          lives: this.lives,
        });
        return;
      }

      const s = scenes[step];
      this.tweens.add({
        targets: this.children,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          this.children.removeAll(true);

          const playerSprite = this.add.sprite(200, 380, 'player_idle');
          playerSprite.setScale(3);
          const dkSprite = this.add.sprite(320, 380, 'dk_idle');
          dkSprite.setScale(3);
          dkSprite.setFlipX(true);

          const text = this.add.text(240, 200, s.text, {
            fontSize: '12px',
            fontFamily: 'monospace',
            color: '#fdd835',
            align: 'center',
          });
          text.setOrigin(0.5, 0.5);

          if (s.action === 'dk_chase') {
            this.tweens.add({
              targets: playerSprite,
              x: 480,
              duration: 1500,
              ease: 'Linear',
            });
            this.tweens.add({
              targets: dkSprite,
              x: 320,
              duration: 1500,
              ease: 'Linear',
            });
          } else if (s.action === 'player_wave') {
            this.time.delayedCall(500, () => {
              playerSprite.setTexture('player_walk1');
            });
            this.time.delayedCall(800, () => {
              playerSprite.setTexture('player_jump');
            });
          }

          step++;
          this.time.delayedCall(s.duration, showStep);
        },
      });
    };

    showStep();

    this.input.keyboard!.on('keydown-ENTER', () => {
      this.scene.start('GameScene', {
        levelId: this.nextLevel,
        score: this.score,
        lives: this.lives,
      });
    });
  }

  private getCutsceneData(): { text: string; action: string; duration: number }[] {
    if (this.levelType === 'construction') {
      return [
        { text: '木匠逃离了工地！', action: 'dk_chase', duration: 2500 },
        { text: '但大金刚不打算放过他...', action: 'player_wave', duration: 2000 },
        { text: '前方是堆满圆木的仓库！', action: 'dk_chase', duration: 2000 },
      ];
    } else if (this.levelType === 'warehouse') {
      return [
        { text: '仓库也沦陷了！', action: 'dk_chase', duration: 2500 },
        { text: '唯一的出路是那座钟楼...', action: 'player_wave', duration: 2000 },
        { text: '大金刚已经在那里等候！', action: 'dk_chase', duration: 2000 },
      ];
    }
    return [
      { text: '继续前进！', action: 'dk_chase', duration: 2000 },
    ];
  }
}
