import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    this.createTextures();
  }

  create(): void {
    this.scene.start('TitleScene');
  }

  private createTextures(): void {
    this.createBrickTexture();
    this.createPipeTexture();
    this.createPipeTopTexture();
    this.createValveTexture();
    this.createPlayerTextures();
    this.createTurtleTextures();
    this.createCrabTextures();
    this.createFlybugTextures();
    this.createFireballTexture();
    this.createPlatformTexture();
    this.createParticleTexture();
  }

  private createBrickTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    const bw = 16;
    const bh = 16;
    const cols = 2;
    const rows = 2;
    g.fillStyle(0x8b4513);
    g.fillRect(0, 0, bw * cols, bh * rows);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const ox = c * bw + ((r % 2) * bw) / 2;
        const oy = r * bh;
        g.fillStyle(0xd2691e);
        g.fillRect(ox + 1, oy + 1, bw - 2, bh - 2);
        g.fillStyle(0xcd853f);
        g.fillRect(ox + 2, oy + 2, bw - 4, bh - 4);
        g.fillStyle(0xdeb887);
        g.fillRect(ox + 3, oy + 3, 3, 2);
      }
    }
    g.generateTexture('brick', bw * cols, bh * rows);
    g.destroy();
  }

  private createPipeTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    const w = 48;
    const h = 80;
    g.fillStyle(0x006400);
    g.fillRect(0, 0, w, h);
    g.fillStyle(0x00aa00);
    g.fillRect(2, 0, 10, h);
    g.fillStyle(0x00ff00);
    g.fillRect(4, 0, 4, h);
    g.fillStyle(0x008800);
    g.fillRect(w - 8, 0, 6, h);
    g.fillStyle(0x00cc00);
    g.fillRect(12, 0, w - 20, h);
    g.fillStyle(0x005500);
    g.fillRect(20, 0, 2, h);
    g.generateTexture('pipe', w, h);
    g.destroy();
  }

  private createPipeTopTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    const w = 60;
    const h = 24;
    g.fillStyle(0x006400);
    g.fillRect(0, 0, w, h);
    g.fillStyle(0x00aa00);
    g.fillRect(2, 2, 12, h - 4);
    g.fillStyle(0x00ff00);
    g.fillRect(4, 2, 6, h - 4);
    g.fillStyle(0x008800);
    g.fillRect(w - 10, 2, 8, h - 4);
    g.fillStyle(0x00cc00);
    g.fillRect(14, 2, w - 24, h - 4);
    g.fillStyle(0x00ff44);
    g.fillRect(6, 3, 4, h - 6);
    g.fillStyle(0x44ff44);
    g.fillRect(8, 4, 2, 2);
    g.generateTexture('pipe_top', w, h);
    g.destroy();
  }

  private createValveTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0x666666);
    g.fillRect(5, 10, 6, 6);
    g.fillStyle(0xcc0000);
    g.fillRect(0, 2, 16, 10);
    g.fillStyle(0xff2222);
    g.fillRect(2, 4, 12, 6);
    g.fillStyle(0xff6666);
    g.fillRect(4, 5, 4, 3);
    g.generateTexture('valve', 16, 16);
    g.destroy();
  }

  private createPlayerTextures(): void {
    const frames = ['player_idle', 'player_run1', 'player_run2', 'player_jump', 'player_headbutt'];
    for (const key of frames) {
      const isJump = key === 'player_jump' || key === 'player_headbutt';
      const runFrame = key === 'player_run1' ? 1 : key === 'player_run2' ? 2 : 0;
      this.createPlayerFrame(key, isJump, runFrame);
    }
  }

  private createPlayerFrame(key: string, isJump: boolean, runFrame: number): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    const w = 24;
    const h = 32;

    g.fillStyle(0xcc0000);
    g.fillRect(5, 0, 14, 3);
    g.fillRect(3, 2, 18, 3);
    g.fillStyle(0xff2222);
    g.fillRect(5, 1, 12, 2);

    g.fillStyle(0xffcc88);
    g.fillRect(5, 5, 14, 9);
    g.fillStyle(0x000000);
    g.fillRect(8, 7, 2, 2);
    g.fillRect(14, 7, 2, 2);
    g.fillStyle(0xffffff);
    g.fillRect(8, 7, 1, 1);
    g.fillRect(14, 7, 1, 1);
    g.fillStyle(0xff9966);
    g.fillRect(9, 10, 6, 2);
    g.fillStyle(0xffcc88);
    g.fillRect(10, 12, 4, 2);

    g.fillStyle(0x4488ff);
    g.fillRect(3, 14, 18, 8);
    g.fillStyle(0x66aaff);
    g.fillRect(5, 15, 14, 6);
    g.fillStyle(0xffdd00);
    g.fillRect(10, 16, 4, 4);
    g.fillStyle(0xffaa00);
    g.fillRect(11, 17, 2, 2);

    if (isJump && key === 'player_headbutt') {
      g.fillStyle(0x4488ff);
      g.fillRect(1, 22, 8, 4);
      g.fillRect(15, 22, 8, 4);
      g.fillStyle(0xffcc88);
      g.fillRect(1, 26, 6, 6);
      g.fillRect(17, 26, 6, 6);
      g.fillStyle(0x8b4513);
      g.fillRect(1, 30, 6, 2);
      g.fillRect(17, 30, 6, 2);
    } else if (isJump) {
      g.fillStyle(0x4488ff);
      g.fillRect(2, 22, 7, 4);
      g.fillRect(15, 22, 7, 4);
      g.fillStyle(0xffcc88);
      g.fillRect(2, 26, 5, 6);
      g.fillRect(17, 26, 5, 6);
      g.fillStyle(0x8b4513);
      g.fillRect(2, 30, 5, 2);
      g.fillRect(17, 30, 5, 2);
    } else if (runFrame === 1) {
      g.fillStyle(0x4488ff);
      g.fillRect(0, 22, 8, 4);
      g.fillRect(14, 22, 8, 4);
      g.fillStyle(0xffcc88);
      g.fillRect(0, 26, 6, 6);
      g.fillRect(16, 24, 6, 4);
      g.fillStyle(0x8b4513);
      g.fillRect(0, 30, 6, 2);
      g.fillRect(16, 28, 6, 2);
    } else if (runFrame === 2) {
      g.fillStyle(0x4488ff);
      g.fillRect(4, 22, 6, 4);
      g.fillRect(14, 22, 6, 4);
      g.fillStyle(0xffcc88);
      g.fillRect(5, 26, 4, 6);
      g.fillRect(14, 26, 4, 6);
      g.fillStyle(0x8b4513);
      g.fillRect(5, 30, 4, 2);
      g.fillRect(14, 30, 4, 2);
    } else {
      g.fillStyle(0x4488ff);
      g.fillRect(4, 22, 7, 4);
      g.fillRect(13, 22, 7, 4);
      g.fillStyle(0xffcc88);
      g.fillRect(4, 26, 6, 6);
      g.fillRect(14, 26, 6, 6);
      g.fillStyle(0x8b4513);
      g.fillRect(4, 30, 6, 2);
      g.fillRect(14, 30, 6, 2);
    }

    g.generateTexture(key, w, h);
    g.destroy();
  }

  private createTurtleTextures(): void {
    this.createTurtleFrame('turtle_walk1', false, 0);
    this.createTurtleFrame('turtle_walk2', false, 1);
    this.createTurtleFrame('turtle_flipped', true);
  }

  private createTurtleFrame(key: string, flipped: boolean, frame = 0): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    const w = 26;
    const h = flipped ? 20 : 30;

    if (!flipped) {
      g.fillStyle(0x006400);
      g.fillRect(4, 10, 18, 14);
      g.fillStyle(0x00aa00);
      g.fillRect(6, 12, 14, 10);
      g.fillStyle(0x00cc00);
      g.fillRect(8, 14, 10, 6);
      g.fillStyle(0x00ff44);
      g.fillRect(10, 16, 4, 2);

      g.fillStyle(0xffcc88);
      g.fillRect(4, 2, 8, 10);
      g.fillRect(14, 2, 8, 10);
      g.fillStyle(0x000000);
      g.fillRect(6, 4, 2, 2);
      g.fillRect(18, 4, 2, 2);
      g.fillStyle(0xffffff);
      g.fillRect(6, 4, 1, 1);
      g.fillRect(18, 4, 1, 1);
      g.fillStyle(0xff9966);
      g.fillRect(8, 8, 4, 2);

      g.fillStyle(0x008800);
      if (frame === 0) {
        g.fillRect(2, 22, 6, 8);
        g.fillRect(18, 22, 6, 8);
      } else {
        g.fillRect(0, 22, 6, 8);
        g.fillRect(20, 22, 6, 8);
      }
      g.fillStyle(0x006400);
      g.fillRect(4, 24, 4, 6);
      g.fillRect(20, 24, 4, 6);
    } else {
      g.fillStyle(0x006400);
      g.fillRect(4, 0, 18, 14);
      g.fillStyle(0x00aa00);
      g.fillRect(6, 2, 14, 10);
      g.fillStyle(0x00cc00);
      g.fillRect(8, 4, 10, 6);
      g.fillStyle(0xffcc88);
      g.fillRect(4, 14, 8, 6);
      g.fillRect(14, 14, 8, 6);
      g.fillStyle(0x000000);
      g.fillRect(7, 16, 2, 2);
      g.fillRect(17, 16, 2, 2);
      g.fillStyle(0xff0000);
      g.fillRect(7, 16, 1, 1);
      g.fillRect(17, 16, 1, 1);
    }

    g.generateTexture(key, w, h);
    g.destroy();
  }

  private createCrabTextures(): void {
    this.createCrabFrame('crab_walk1', false, 0);
    this.createCrabFrame('crab_walk2', false, 1);
    this.createCrabFrame('crab_flipped', true);
  }

  private createCrabFrame(key: string, flipped: boolean, frame = 0): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    const w = 28;
    const h = flipped ? 18 : 26;

    if (!flipped) {
      g.fillStyle(0x880000);
      g.fillRect(4, 6, 20, 12);
      g.fillStyle(0xcc0000);
      g.fillRect(6, 8, 16, 8);
      g.fillStyle(0xff4444);
      g.fillRect(8, 10, 12, 4);
      g.fillStyle(0xffffff);
      g.fillRect(7, 8, 5, 4);
      g.fillRect(16, 8, 5, 4);
      g.fillStyle(0x000000);
      g.fillRect(9, 9, 2, 2);
      g.fillRect(18, 9, 2, 2);

      g.fillStyle(0xcc0000);
      if (frame === 0) {
        g.fillRect(0, 4, 8, 4);
        g.fillRect(20, 4, 8, 4);
      } else {
        g.fillRect(0, 2, 8, 4);
        g.fillRect(20, 2, 8, 4);
      }
      g.fillStyle(0xff4444);
      g.fillRect(0, 4, 4, 2);
      g.fillRect(24, 4, 4, 2);

      g.fillStyle(0xcc0000);
      g.fillRect(2, 18, 8, 4);
      g.fillRect(18, 18, 8, 4);
      g.fillStyle(0xffcc88);
      g.fillRect(2, 22, 6, 4);
      g.fillRect(20, 22, 6, 4);
    } else {
      g.fillStyle(0x880000);
      g.fillRect(4, 0, 20, 12);
      g.fillStyle(0xcc0000);
      g.fillRect(6, 2, 16, 8);
      g.fillStyle(0xff4444);
      g.fillRect(8, 4, 12, 4);
      g.fillStyle(0xffcc88);
      g.fillRect(4, 12, 8, 6);
      g.fillRect(16, 12, 8, 6);
      g.fillStyle(0x000000);
      g.fillRect(8, 14, 2, 2);
      g.fillRect(18, 14, 2, 2);
      g.fillStyle(0xff0000);
      g.fillRect(8, 14, 1, 1);
      g.fillRect(18, 14, 1, 1);
    }

    g.generateTexture(key, w, h);
    g.destroy();
  }

  private createFlybugTextures(): void {
    this.createFlybugFrame('flybug_fly1', false, 0);
    this.createFlybugFrame('flybug_fly2', false, 1);
    this.createFlybugFrame('flybug_flipped', true);
  }

  private createFlybugFrame(key: string, flipped: boolean, frame = 0): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    const w = 24;
    const h = flipped ? 16 : 24;

    if (!flipped) {
      g.fillStyle(0x6622aa);
      g.fillRect(7, 8, 10, 10);
      g.fillStyle(0x8844cc);
      g.fillRect(9, 10, 6, 6);
      g.fillStyle(0xaa66ee);
      g.fillRect(10, 11, 4, 4);
      g.fillStyle(0xff0000);
      g.fillRect(9, 9, 2, 2);
      g.fillRect(13, 9, 2, 2);

      g.fillStyle(0xddddff);
      if (frame === 0) {
        g.fillRect(0, 2, 8, 8);
        g.fillRect(16, 2, 8, 8);
        g.fillStyle(0xeeeeff);
        g.fillRect(1, 3, 6, 6);
        g.fillRect(17, 3, 6, 6);
      } else {
        g.fillRect(0, 0, 8, 5);
        g.fillRect(16, 0, 8, 5);
        g.fillStyle(0xeeeeff);
        g.fillRect(1, 1, 6, 3);
        g.fillRect(17, 1, 6, 3);
      }

      g.fillStyle(0x6622aa);
      g.fillRect(7, 18, 4, 4);
      g.fillRect(13, 18, 4, 4);
      g.fillStyle(0x4422aa);
      g.fillRect(8, 20, 2, 4);
      g.fillRect(14, 20, 2, 4);
    } else {
      g.fillStyle(0x6622aa);
      g.fillRect(7, 0, 10, 10);
      g.fillStyle(0x8844cc);
      g.fillRect(9, 2, 6, 6);
      g.fillStyle(0xaa66ee);
      g.fillRect(10, 3, 4, 4);
      g.fillStyle(0xddddff);
      g.fillRect(2, 10, 7, 4);
      g.fillRect(15, 10, 7, 4);
      g.fillStyle(0x000000);
      g.fillRect(9, 12, 2, 2);
      g.fillRect(13, 12, 2, 2);
      g.fillStyle(0xff0000);
      g.fillRect(9, 12, 1, 1);
      g.fillRect(13, 12, 1, 1);
    }

    g.generateTexture(key, w, h);
    g.destroy();
  }

  private createFireballTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xff4400);
    g.fillRect(1, 1, 12, 12);
    g.fillStyle(0xff8800);
    g.fillRect(3, 3, 8, 8);
    g.fillStyle(0xffcc00);
    g.fillRect(5, 5, 4, 4);
    g.fillStyle(0xffff88);
    g.fillRect(6, 6, 2, 2);
    g.generateTexture('fireball', 14, 14);
    g.destroy();
  }

  private createPlatformTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    const w = 32;
    const h = 16;
    g.fillStyle(0x8b4513);
    g.fillRect(0, 0, w, h);
    g.fillStyle(0xd2691e);
    g.fillRect(1, 1, w - 2, h - 2);
    g.fillStyle(0xcd853f);
    g.fillRect(2, 2, w - 4, h - 4);
    g.fillStyle(0xdeb887);
    g.fillRect(3, 3, w - 6, 3);
    g.fillStyle(0x8b4513);
    g.fillRect(0, 0, 1, 1);
    g.fillRect(w - 1, 0, 1, 1);
    g.generateTexture('platform', w, h);
    g.destroy();
  }

  private createParticleTexture(): void {
    const g = this.make.graphics({ x: 0, y: 0 });
    g.fillStyle(0xffcc00);
    g.fillRect(0, 0, 4, 4);
    g.generateTexture('particle', 4, 4);
    g.destroy();
  }
}
