import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../main';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    this.generatePlayerSprites();
    this.generateEnemySprites();
    this.generateBubbleSprite();
    this.generatePlatformSprites();
    this.generatePowerUpSprites();
    this.generateBackgrounds();
    this.generateFireballSprite();
  }

  generatePlayerSprites() {
    const frames = ['idle', 'walk1', 'walk2', 'jump', 'bubble', 'trapped'];
    frames.forEach((frame, idx) => {
      const g = this.make.graphics();
      this.drawDragon(g, frame);
      g.generateTexture(`player_${frame}`, 32, 32);
      g.destroy();
    });

    this.anims.create({
      key: 'player_idle',
      frames: [{ key: 'player_idle' }],
      frameRate: 1
    });
    this.anims.create({
      key: 'player_walk',
      frames: [{ key: 'player_walk1' }, { key: 'player_walk2' }],
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'player_jump',
      frames: [{ key: 'player_jump' }],
      frameRate: 1
    });
    this.anims.create({
      key: 'player_bubble',
      frames: [{ key: 'player_bubble' }],
      frameRate: 1
    });
    this.anims.create({
      key: 'player_trapped',
      frames: [{ key: 'player_trapped' }],
      frameRate: 1
    });
  }

  drawDragon(g: Phaser.GameObjects.Graphics, frame: string) {
    g.clear();
    const cx = 16, cy = 16;

    g.fillStyle(0x4ade80);
    g.fillRoundedRect(cx - 10, cy - 8, 20, 18, 6);

    g.fillStyle(0x22c55e);
    g.fillRoundedRect(cx - 8, cy - 14, 16, 12, 5);

    g.fillStyle(0xffffff);
    g.fillCircle(cx - 4, cy - 11, 3);
    g.fillCircle(cx + 4, cy - 11, 3);

    g.fillStyle(0x1a1a2e);
    const eyeOffset = frame === 'trapped' ? 1 : 0;
    g.fillCircle(cx - 4 + eyeOffset, cy - 11, 1.5);
    g.fillCircle(cx + 4 + eyeOffset, cy - 11, 1.5);

    if (frame === 'bubble') {
      g.fillStyle(0xfca5a5);
      g.fillEllipse(cx, cy - 5, 5, 4);
    } else if (frame === 'trapped') {
      g.fillStyle(0x60a5fa);
      g.fillEllipse(cx, cy - 5, 4, 3);
    } else {
      g.fillStyle(0x166534);
      g.fillRect(cx - 2, cy - 6, 4, 2);
    }

    g.fillStyle(0x22c55e);
    g.fillTriangle(cx - 6, cy - 14, cx - 2, cy - 20, cx - 4, cy - 14);
    g.fillTriangle(cx + 6, cy - 14, cx + 2, cy - 20, cx + 4, cy - 14);

    g.fillStyle(0x4ade80);
    const tailWave = frame === 'walk1' ? 2 : frame === 'walk2' ? -2 : 0;
    g.fillRoundedRect(cx - 14, cy + tailWave, 6, 8, 3);

    const legOffset = frame === 'walk1' ? 2 : frame === 'walk2' ? -2 : 0;
    const jumpOffset = frame === 'jump' ? -2 : 0;
    g.fillStyle(0x16a34a);
    g.fillRoundedRect(cx - 7, cy + 8 + jumpOffset, 5, 6 + legOffset, 2);
    g.fillRoundedRect(cx + 2, cy + 8 + jumpOffset, 5, 6 - legOffset, 2);

    g.fillStyle(0x86efac);
    g.fillEllipse(cx - 6, cy - 2, 2, 1.5);
    g.fillEllipse(cx + 6, cy - 2, 2, 1.5);

    if (frame === 'trapped') {
      g.lineStyle(2, 0x93c5fd, 0.6);
      g.strokeRoundedRect(cx - 14, cy - 16, 28, 32, 14);
    }
  }

  generateEnemySprites() {
    this.generateBasicEnemy();
    this.generateFlyingEnemy();
    this.generateFireEnemy();
    this.generateBossEnemy();
  }

  generateBasicEnemy() {
    const g = this.make.graphics();
    for (let i = 0; i < 2; i++) {
      g.clear();
      const cx = 16, cy = 16;
      const wobble = i === 0 ? 0 : 2;

      g.fillStyle(0xef4444);
      g.fillRoundedRect(cx - 10, cy - 8 + wobble, 20, 18, 6);

      g.fillStyle(0xfca5a5);
      g.fillRoundedRect(cx - 8, cy - 6 + wobble, 16, 12, 5);

      g.fillStyle(0xffffff);
      g.fillCircle(cx - 4, cy - 2 + wobble, 3);
      g.fillCircle(cx + 4, cy - 2 + wobble, 3);

      g.fillStyle(0x1a1a2e);
      g.fillCircle(cx - 4, cy - 2 + wobble, 1.5);
      g.fillCircle(cx + 4, cy - 2 + wobble, 1.5);

      g.fillStyle(0x7f1d1d);
      g.fillTriangle(cx - 8, cy - 8 + wobble, cx - 4, cy - 14 + wobble, cx - 2, cy - 8 + wobble);
      g.fillTriangle(cx + 8, cy - 8 + wobble, cx + 4, cy - 14 + wobble, cx + 2, cy - 8 + wobble);

      g.fillStyle(0x991b1b);
      g.fillRoundedRect(cx - 7, cy + 8 + wobble, 5, 5, 2);
      g.fillRoundedRect(cx + 2, cy + 8 + wobble, 5, 5, 2);

      g.generateTexture(`enemy_basic_${i}`, 32, 32);
      g.clear();
    }
    g.destroy();

    this.anims.create({
      key: 'enemy_basic_walk',
      frames: [{ key: 'enemy_basic_0' }, { key: 'enemy_basic_1' }],
      frameRate: 5,
      repeat: -1
    });
  }

  generateFlyingEnemy() {
    const g = this.make.graphics();
    for (let i = 0; i < 2; i++) {
      g.clear();
      const cx = 16, cy = 16;
      const wingFlap = i === 0 ? 0 : 3;

      g.fillStyle(0xa855f7);
      g.fillCircle(cx, cy, 10);

      g.fillStyle(0xc084fc);
      g.fillCircle(cx - 2, cy - 2, 4);

      g.fillStyle(0xffffff);
      g.fillCircle(cx - 3, cy - 1, 3);
      g.fillCircle(cx + 3, cy - 1, 3);

      g.fillStyle(0x1a1a2e);
      g.fillCircle(cx - 3, cy - 1, 1.5);
      g.fillCircle(cx + 3, cy - 1, 1.5);

      g.fillStyle(0x7c3aed);
      g.fillEllipse(cx - 12, cy + wingFlap, 8, 5);
      g.fillEllipse(cx + 12, cy + wingFlap, 8, 5);

      g.fillStyle(0x581c87);
      g.fillTriangle(cx - 3, cy + 8, cx, cy + 14, cx + 3, cy + 8);

      g.generateTexture(`enemy_flying_${i}`, 32, 32);
      g.clear();
    }
    g.destroy();

    this.anims.create({
      key: 'enemy_flying_fly',
      frames: [{ key: 'enemy_flying_0' }, { key: 'enemy_flying_1' }],
      frameRate: 8,
      repeat: -1
    });
  }

  generateFireEnemy() {
    const g = this.make.graphics();
    for (let i = 0; i < 2; i++) {
      g.clear();
      const cx = 16, cy = 16;
      const flame = i === 0 ? 0 : 2;

      g.fillStyle(0xf97316);
      g.fillRoundedRect(cx - 10, cy - 6, 20, 18, 6);

      g.fillStyle(0xfb923c);
      g.fillRoundedRect(cx - 8, cy - 4, 16, 12, 5);

      g.fillStyle(0xfef08a);
      g.fillCircle(cx - 8, cy - 10 - flame, 4);
      g.fillCircle(cx, cy - 12 - flame, 5);
      g.fillCircle(cx + 8, cy - 10 - flame, 4);

      g.fillStyle(0x1a1a2e);
      g.fillCircle(cx - 4, cy - 1, 2);
      g.fillCircle(cx + 4, cy - 1, 2);

      g.fillStyle(0x7c2d12);
      g.fillRect(cx - 3, cy + 4, 6, 3);

      g.fillStyle(0xea580c);
      g.fillRoundedRect(cx - 7, cy + 10, 5, 5, 2);
      g.fillRoundedRect(cx + 2, cy + 10, 5, 5, 2);

      g.generateTexture(`enemy_fire_${i}`, 32, 32);
      g.clear();
    }
    g.destroy();

    this.anims.create({
      key: 'enemy_fire_walk',
      frames: [{ key: 'enemy_fire_0' }, { key: 'enemy_fire_1' }],
      frameRate: 4,
      repeat: -1
    });
  }

  generateBossEnemy() {
    const g = this.make.graphics();
    for (let i = 0; i < 2; i++) {
      g.clear();
      const cx = 32, cy = 32;
      const pulse = i === 0 ? 0 : 2;

      g.fillStyle(0xdc2626);
      g.fillRoundedRect(cx - 24, cy - 20, 48, 44, 12);

      g.fillStyle(0xf87171);
      g.fillRoundedRect(cx - 20, cy - 16, 40, 36, 10);

      g.fillStyle(0xffffff);
      g.fillCircle(cx - 10, cy - 6, 8);
      g.fillCircle(cx + 10, cy - 6, 8);

      g.fillStyle(0x1a1a2e);
      g.fillCircle(cx - 10, cy - 6, 4);
      g.fillCircle(cx + 10, cy - 6, 4);

      g.fillStyle(0x7f1d1d);
      g.fillRoundedRect(cx - 14, cy + 8, 28, 10, 4);

      g.fillStyle(0xfef08a);
      for (let j = 0; j < 5; j++) {
        g.fillTriangle(cx - 12 + j * 6, cy + 8, cx - 9 + j * 6, cy + 16, cx - 6 + j * 6, cy + 8);
      }

      g.fillStyle(0x991b1b);
      g.fillTriangle(cx - 20, cy - 20, cx - 12, cy - 32 - pulse, cx - 8, cy - 20);
      g.fillTriangle(cx + 20, cy - 20, cx + 12, cy - 32 - pulse, cx + 8, cy - 20);

      g.fillStyle(0xfbbf24);
      g.fillCircle(cx, cy - 24, 6 + pulse);

      g.generateTexture(`enemy_boss_${i}`, 64, 64);
      g.clear();
    }
    g.destroy();

    this.anims.create({
      key: 'enemy_boss_idle',
      frames: [{ key: 'enemy_boss_0' }, { key: 'enemy_boss_1' }],
      frameRate: 3,
      repeat: -1
    });
  }

  generateBubbleSprite() {
    const g = this.make.graphics();
    const cx = 16, cy = 16;

    g.fillStyle(0x93c5fd, 0.4);
    g.fillCircle(cx, cy, 14);

    g.fillStyle(0xbfdbfe, 0.6);
    g.fillCircle(cx, cy, 11);

    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(cx - 4, cy - 4, 4);

    g.fillStyle(0xffffff, 0.4);
    g.fillCircle(cx + 3, cy + 2, 2);

    g.generateTexture('bubble', 32, 32);
    g.destroy();
  }

  generateFireballSprite() {
    const g = this.make.graphics();
    for (let i = 0; i < 2; i++) {
      g.clear();
      const cx = 12, cy = 12;
      const flicker = i === 0 ? 0 : 1;

      g.fillStyle(0xf97316);
      g.fillCircle(cx, cy, 8 + flicker);

      g.fillStyle(0xfbbf24);
      g.fillCircle(cx, cy, 5);

      g.fillStyle(0xfef08a);
      g.fillCircle(cx - 1, cy - 1, 2);

      g.generateTexture(`fireball_${i}`, 24, 24);
      g.clear();
    }
    g.destroy();

    this.anims.create({
      key: 'fireball_fly',
      frames: [{ key: 'fireball_0' }, { key: 'fireball_1' }],
      frameRate: 10,
      repeat: -1
    });
  }

  generatePlatformSprites() {
    const themes = ['cave', 'ice', 'volcano'];
    themes.forEach(theme => {
      const g = this.make.graphics();
      g.clear();

      let mainColor = 0x6b7280;
      let darkColor = 0x4b5563;
      let lightColor = 0x9ca3af;

      if (theme === 'ice') {
        mainColor = 0x93c5fd;
        darkColor = 0x60a5fa;
        lightColor = 0xbfdbfe;
      } else if (theme === 'volcano') {
        mainColor = 0x78350f;
        darkColor = 0x451a03;
        lightColor = 0xa16207;
      }

      g.fillStyle(mainColor);
      g.fillRect(0, 0, 32, 32);

      g.fillStyle(darkColor);
      g.fillRect(0, 28, 32, 4);
      g.fillRect(0, 0, 32, 2);

      g.fillStyle(lightColor);
      g.fillRect(2, 4, 8, 4);
      g.fillRect(16, 8, 6, 3);
      g.fillRect(6, 16, 10, 3);
      g.fillRect(22, 18, 5, 4);

      if (theme === 'ice') {
        g.fillStyle(0xffffff, 0.5);
        g.fillRect(0, 0, 32, 6);
      } else if (theme === 'volcano') {
        g.fillStyle(0xf97316, 0.3);
        g.fillRect(4, 20, 4, 4);
        g.fillRect(20, 24, 3, 3);
      }

      g.generateTexture(`platform_${theme}`, 32, 32);
      g.destroy();
    });
  }

  generatePowerUpSprites() {
    const types = ['rapid', 'shockwave'];
    types.forEach(type => {
      const g = this.make.graphics();
      const cx = 16, cy = 16;

      if (type === 'rapid') {
        g.fillStyle(0xfbbf24);
        g.fillCircle(cx, cy, 12);
        g.fillStyle(0xf59e0b);
        g.fillCircle(cx, cy, 9);
        g.fillStyle(0xfef08a);
        g.fillCircle(cx - 3, cy - 3, 3);
        g.fillStyle(0xffffff);
        for (let i = 0; i < 3; i++) {
          g.fillTriangle(cx - 2 + i * 4, cy - 6, cx + i * 4, cy + 6, cx + 2 + i * 4, cy - 6);
        }
      } else {
        g.fillStyle(0xec4899);
        g.fillCircle(cx, cy, 12);
        g.fillStyle(0xdb2777);
        g.fillCircle(cx, cy, 9);
        g.fillStyle(0xf9a8d4);
        g.fillCircle(cx - 3, cy - 3, 3);
        g.fillStyle(0xffffff);
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          const px = cx + Math.cos(angle) * 7;
          const py = cy + Math.sin(angle) * 7;
          g.fillRect(px - 1, py - 1, 2, 2);
        }
      }

      g.generateTexture(`powerup_${type}`, 32, 32);
      g.destroy();
    });
  }

  generateBackgrounds() {
    const themes: Array<'cave' | 'ice' | 'volcano'> = ['cave', 'ice', 'volcano'];
    themes.forEach(theme => {
      const g = this.make.graphics();
      g.clear();

      let topColor = 0x1e1b4b;
      let bottomColor = 0x312e81;

      if (theme === 'ice') {
        topColor = 0x0c4a6e;
        bottomColor = 0x0369a1;
      } else if (theme === 'volcano') {
        topColor = 0x450a0a;
        bottomColor = 0x7f1d1d;
      }

      for (let y = 0; y < GAME_HEIGHT; y++) {
        const t = y / GAME_HEIGHT;
        const r = Math.floor(Phaser.Math.Linear((topColor >> 16) & 255, (bottomColor >> 16) & 255, t));
        const green = Math.floor(Phaser.Math.Linear((topColor >> 8) & 255, (bottomColor >> 8) & 255, t));
        const b = Math.floor(Phaser.Math.Linear(topColor & 255, bottomColor & 255, t));
        g.fillStyle((r << 16) | (green << 8) | b);
        g.fillRect(0, y, GAME_WIDTH, 1);
      }

      g.fillStyle(0xffffff, 0.3);
      for (let i = 0; i < 30; i++) {
        const x = Phaser.Math.Between(0, GAME_WIDTH);
        const y = Phaser.Math.Between(0, GAME_HEIGHT);
        const size = Phaser.Math.Between(1, 3);
        if (theme === 'ice') {
          g.fillRect(x, y, size, size);
        } else if (theme === 'volcano') {
          g.fillStyle(0xf97316, 0.4);
          g.fillCircle(x, y, size);
          g.fillStyle(0xffffff, 0.3);
        } else {
          g.fillCircle(x, y, size);
        }
      }

      if (theme === 'cave') {
        g.fillStyle(0x374151, 0.4);
        for (let i = 0; i < 5; i++) {
          const x = i * 140 + 20;
          g.fillRoundedRect(x, 50, 80, 120, 20);
        }
      } else if (theme === 'ice') {
        g.fillStyle(0xe0f2fe, 0.3);
        for (let i = 0; i < 8; i++) {
          const x = i * 85 + 10;
          g.fillTriangle(x, 0, x + 20, 80, x + 40, 0);
        }
      } else if (theme === 'volcano') {
        g.fillStyle(0x7c2d12, 0.5);
        for (let i = 0; i < 6; i++) {
          const x = i * 110 + 30;
          g.fillTriangle(x, GAME_HEIGHT, x + 30, GAME_HEIGHT - 100, x + 60, GAME_HEIGHT);
        }
        g.fillStyle(0xf97316, 0.2);
        for (let i = 0; i < 10; i++) {
          const x = Phaser.Math.Between(0, GAME_WIDTH);
          const y = Phaser.Math.Between(GAME_HEIGHT - 50, GAME_HEIGHT);
          g.fillCircle(x, y, Phaser.Math.Between(3, 8));
        }
      }

      g.generateTexture(`background_${theme}`, GAME_WIDTH, GAME_HEIGHT);
      g.destroy();
    });
  }

  create() {
    this.scene.start('GameScene');
    this.scene.launch('UIScene');
  }
}
