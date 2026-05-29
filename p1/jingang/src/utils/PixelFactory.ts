import Phaser from 'phaser';

const PALETTE: Record<string, number> = {
  red: 0xe53935,
  blue: 0x1565c0,
  yellow: 0xfdd835,
  gray: 0x757575,
  orange: 0xff6d00,
  green: 0x00c853,
  brown: 0x795548,
  darkBrown: 0x4e342e,
  skin: 0xffcc80,
  darkSkin: 0xffa726,
  white: 0xffffff,
  black: 0x000000,
  steel: 0x90a4ae,
  darkSteel: 0x546e7a,
  fireRed: 0xff1744,
  fireYellow: 0xffea00,
  barrelBrown: 0x8d6e63,
  barrelDark: 0x5d4037,
  dkBrown: 0x6d4c41,
  dkDark: 0x3e2723,
  dkLight: 0xa1887f,
  helmetYellow: 0xffc107,
  shirtBlue: 0x1976d2,
  pantsBlue: 0x0d47a1,
};

export class PixelFactory {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  createTexture(key: string, width: number, height: number, drawFn: (g: Phaser.GameObjects.Graphics, w: number, h: number) => void) {
    if (this.scene.textures.exists(key)) return;
    const g = this.scene.add.graphics();
    drawFn(g, width, height);
    g.generateTexture(key, width, height);
    g.destroy();
  }

  createPlayerTextures() {
    this.createTexture('player_idle', 16, 24, (g) => {
      g.fillStyle(PALETTE.helmetYellow);
      g.fillRect(4, 0, 8, 6);
      g.fillStyle(PALETTE.skin);
      g.fillRect(4, 6, 8, 5);
      g.fillStyle(PALETTE.shirtBlue);
      g.fillRect(3, 11, 10, 6);
      g.fillStyle(PALETTE.pantsBlue);
      g.fillRect(3, 17, 4, 5);
      g.fillRect(9, 17, 4, 5);
      g.fillStyle(PALETTE.skin);
      g.fillRect(1, 12, 2, 4);
      g.fillRect(13, 12, 2, 4);
    });

    this.createTexture('player_walk1', 16, 24, (g) => {
      g.fillStyle(PALETTE.helmetYellow);
      g.fillRect(4, 0, 8, 6);
      g.fillStyle(PALETTE.skin);
      g.fillRect(4, 6, 8, 5);
      g.fillStyle(PALETTE.shirtBlue);
      g.fillRect(3, 11, 10, 6);
      g.fillStyle(PALETTE.pantsBlue);
      g.fillRect(2, 17, 5, 5);
      g.fillRect(10, 17, 4, 5);
      g.fillStyle(PALETTE.skin);
      g.fillRect(0, 13, 3, 4);
      g.fillRect(13, 12, 2, 4);
    });

    this.createTexture('player_walk2', 16, 24, (g) => {
      g.fillStyle(PALETTE.helmetYellow);
      g.fillRect(4, 0, 8, 6);
      g.fillStyle(PALETTE.skin);
      g.fillRect(4, 6, 8, 5);
      g.fillStyle(PALETTE.shirtBlue);
      g.fillRect(3, 11, 10, 6);
      g.fillStyle(PALETTE.pantsBlue);
      g.fillRect(3, 17, 4, 5);
      g.fillRect(9, 17, 5, 5);
      g.fillStyle(PALETTE.skin);
      g.fillRect(1, 12, 2, 4);
      g.fillRect(14, 13, 2, 4);
    });

    this.createTexture('player_jump', 16, 24, (g) => {
      g.fillStyle(PALETTE.helmetYellow);
      g.fillRect(4, 0, 8, 6);
      g.fillStyle(PALETTE.skin);
      g.fillRect(4, 6, 8, 5);
      g.fillStyle(PALETTE.shirtBlue);
      g.fillRect(3, 11, 10, 5);
      g.fillStyle(PALETTE.pantsBlue);
      g.fillRect(2, 16, 5, 4);
      g.fillRect(9, 16, 5, 4);
      g.fillStyle(PALETTE.skin);
      g.fillRect(0, 11, 3, 3);
      g.fillRect(13, 11, 3, 3);
    });

    this.createTexture('player_crouch', 16, 24, (g) => {
      g.fillStyle(PALETTE.helmetYellow);
      g.fillRect(4, 3, 8, 6);
      g.fillStyle(PALETTE.skin);
      g.fillRect(4, 9, 8, 4);
      g.fillStyle(PALETTE.shirtBlue);
      g.fillRect(2, 13, 12, 5);
      g.fillStyle(PALETTE.pantsBlue);
      g.fillRect(1, 18, 6, 4);
      g.fillRect(9, 18, 6, 4);
    });

    this.createTexture('player_climb1', 16, 24, (g) => {
      g.fillStyle(PALETTE.helmetYellow);
      g.fillRect(4, 0, 8, 6);
      g.fillStyle(PALETTE.skin);
      g.fillRect(4, 6, 8, 5);
      g.fillStyle(PALETTE.shirtBlue);
      g.fillRect(3, 11, 10, 6);
      g.fillStyle(PALETTE.pantsBlue);
      g.fillRect(4, 17, 8, 5);
      g.fillStyle(PALETTE.skin);
      g.fillRect(1, 10, 3, 4);
      g.fillRect(12, 10, 3, 4);
    });

    this.createTexture('player_climb2', 16, 24, (g) => {
      g.fillStyle(PALETTE.helmetYellow);
      g.fillRect(4, 0, 8, 6);
      g.fillStyle(PALETTE.skin);
      g.fillRect(4, 6, 8, 5);
      g.fillStyle(PALETTE.shirtBlue);
      g.fillRect(3, 11, 10, 6);
      g.fillStyle(PALETTE.pantsBlue);
      g.fillRect(4, 17, 8, 5);
      g.fillStyle(PALETTE.skin);
      g.fillRect(0, 12, 3, 4);
      g.fillRect(13, 12, 3, 4);
    });

    this.createTexture('player_hammer1', 20, 24, (g) => {
      g.fillStyle(PALETTE.helmetYellow);
      g.fillRect(4, 0, 8, 6);
      g.fillStyle(PALETTE.skin);
      g.fillRect(4, 6, 8, 5);
      g.fillStyle(PALETTE.shirtBlue);
      g.fillRect(3, 11, 10, 6);
      g.fillStyle(PALETTE.pantsBlue);
      g.fillRect(3, 17, 4, 5);
      g.fillRect(9, 17, 4, 5);
      g.fillStyle(PALETTE.brown);
      g.fillRect(0, 2, 4, 14);
      g.fillStyle(PALETTE.gray);
      g.fillRect(0, 0, 6, 4);
    });

    this.createTexture('player_hammer2', 20, 24, (g) => {
      g.fillStyle(PALETTE.helmetYellow);
      g.fillRect(4, 0, 8, 6);
      g.fillStyle(PALETTE.skin);
      g.fillRect(4, 6, 8, 5);
      g.fillStyle(PALETTE.shirtBlue);
      g.fillRect(3, 11, 10, 6);
      g.fillStyle(PALETTE.pantsBlue);
      g.fillRect(3, 17, 4, 5);
      g.fillRect(9, 17, 4, 5);
      g.fillStyle(PALETTE.brown);
      g.fillRect(14, 2, 4, 14);
      g.fillStyle(PALETTE.gray);
      g.fillRect(12, 0, 6, 4);
    });
  }

  createBarrelTextures() {
    for (let i = 0; i < 4; i++) {
      this.createTexture(`barrel_${i}`, 16, 16, (g) => {
        const offsets = [0, 2, 4, 2];
        const o = offsets[i];
        g.fillStyle(PALETTE.barrelBrown);
        g.fillRect(2 + o, 1, 12, 14);
        g.fillStyle(PALETTE.barrelDark);
        g.fillRect(4 + o, 0, 8, 2);
        g.fillRect(4 + o, 14, 8, 2);
        g.fillStyle(PALETTE.darkBrown);
        g.fillRect(5 + o, 5, 6, 2);
        g.fillRect(5 + o, 9, 6, 2);
        g.fillStyle(PALETTE.yellow);
        g.fillRect(6 + o, 6, 4, 1);
      });
    }
  }

  createDKTextures() {
    this.createTexture('dk_idle', 48, 40, (g) => {
      g.fillStyle(PALETTE.dkBrown);
      g.fillRect(10, 8, 28, 24);
      g.fillStyle(PALETTE.dkDark);
      g.fillRect(12, 2, 10, 8);
      g.fillRect(26, 2, 10, 8);
      g.fillStyle(PALETTE.dkLight);
      g.fillRect(16, 10, 16, 12);
      g.fillStyle(PALETTE.white);
      g.fillRect(18, 12, 4, 4);
      g.fillRect(26, 12, 4, 4);
      g.fillStyle(PALETTE.black);
      g.fillRect(20, 14, 2, 2);
      g.fillRect(28, 14, 2, 2);
      g.fillStyle(PALETTE.dkBrown);
      g.fillRect(6, 32, 10, 8);
      g.fillRect(32, 32, 10, 8);
      g.fillRect(8, 16, 4, 12);
      g.fillRect(36, 16, 4, 12);
    });

    this.createTexture('dk_throw', 48, 40, (g) => {
      g.fillStyle(PALETTE.dkBrown);
      g.fillRect(10, 8, 28, 24);
      g.fillStyle(PALETTE.dkDark);
      g.fillRect(12, 2, 10, 8);
      g.fillRect(26, 2, 10, 8);
      g.fillStyle(PALETTE.dkLight);
      g.fillRect(16, 10, 16, 12);
      g.fillStyle(PALETTE.white);
      g.fillRect(18, 12, 4, 4);
      g.fillRect(26, 12, 4, 4);
      g.fillStyle(PALETTE.black);
      g.fillRect(20, 14, 2, 2);
      g.fillRect(28, 14, 2, 2);
      g.fillStyle(PALETTE.dkBrown);
      g.fillRect(6, 32, 10, 8);
      g.fillRect(32, 32, 10, 8);
      g.fillStyle(PALETTE.dkDark);
      g.fillRect(36, 4, 8, 8);
      g.fillRect(40, 8, 6, 10);
    });

    this.createTexture('dk_chestbeat1', 48, 40, (g) => {
      g.fillStyle(PALETTE.dkBrown);
      g.fillRect(10, 8, 28, 24);
      g.fillStyle(PALETTE.dkDark);
      g.fillRect(8, 0, 14, 10);
      g.fillRect(26, 0, 14, 10);
      g.fillStyle(PALETTE.dkLight);
      g.fillRect(16, 10, 16, 12);
      g.fillStyle(PALETTE.white);
      g.fillRect(18, 12, 4, 4);
      g.fillRect(26, 12, 4, 4);
      g.fillStyle(PALETTE.black);
      g.fillRect(20, 14, 2, 2);
      g.fillRect(28, 14, 2, 2);
      g.fillStyle(PALETTE.dkBrown);
      g.fillRect(6, 32, 10, 8);
      g.fillRect(32, 32, 10, 8);
    });

    this.createTexture('dk_chestbeat2', 48, 40, (g) => {
      g.fillStyle(PALETTE.dkBrown);
      g.fillRect(10, 8, 28, 24);
      g.fillStyle(PALETTE.dkDark);
      g.fillRect(14, 4, 8, 10);
      g.fillRect(26, 4, 8, 10);
      g.fillStyle(PALETTE.dkLight);
      g.fillRect(16, 10, 16, 12);
      g.fillStyle(PALETTE.white);
      g.fillRect(18, 12, 4, 4);
      g.fillRect(26, 12, 4, 4);
      g.fillStyle(PALETTE.fireRed);
      g.fillRect(20, 14, 2, 2);
      g.fillRect(28, 14, 2, 2);
      g.fillStyle(PALETTE.dkBrown);
      g.fillRect(6, 32, 10, 8);
      g.fillRect(32, 32, 10, 8);
    });

    this.createTexture('dk_rage', 48, 40, (g) => {
      g.fillStyle(PALETTE.dkBrown);
      g.fillRect(8, 6, 32, 28);
      g.fillStyle(PALETTE.dkDark);
      g.fillRect(6, 0, 16, 10);
      g.fillRect(26, 0, 16, 10);
      g.fillStyle(PALETTE.dkLight);
      g.fillRect(14, 8, 20, 14);
      g.fillStyle(PALETTE.fireRed);
      g.fillRect(16, 10, 6, 4);
      g.fillRect(26, 10, 6, 4);
      g.fillStyle(PALETTE.fireYellow);
      g.fillRect(18, 12, 3, 2);
      g.fillRect(28, 12, 3, 2);
      g.fillStyle(PALETTE.dkBrown);
      g.fillRect(4, 34, 12, 6);
      g.fillRect(32, 34, 12, 6);
    });
  }

  createBeamTexture() {
    this.createTexture('beam', 16, 8, (g) => {
      g.fillStyle(PALETTE.steel);
      g.fillRect(0, 0, 16, 6);
      g.fillStyle(PALETTE.darkSteel);
      g.fillRect(0, 6, 16, 2);
      g.fillStyle(PALETTE.gray);
      g.fillRect(2, 1, 2, 4);
      g.fillRect(8, 1, 2, 4);
      g.fillRect(14, 1, 2, 4);
    });
  }

  createLadderTexture() {
    this.createTexture('ladder', 8, 16, (g) => {
      g.fillStyle(PALETTE.yellow);
      g.fillRect(0, 0, 2, 16);
      g.fillRect(6, 0, 2, 16);
      g.fillRect(0, 3, 8, 2);
      g.fillRect(0, 9, 8, 2);
    });
  }

  createHammerTexture() {
    this.createTexture('hammer_item', 16, 16, (g) => {
      g.fillStyle(PALETTE.brown);
      g.fillRect(6, 6, 4, 10);
      g.fillStyle(PALETTE.gray);
      g.fillRect(2, 0, 12, 6);
      g.fillStyle(PALETTE.darkSteel);
      g.fillRect(2, 4, 12, 2);
    });
  }

  createFireTextures() {
    for (let i = 0; i < 4; i++) {
      this.createTexture(`fire_${i}`, 16, 16, (g) => {
        const heights = [8, 10, 12, 10];
        const widths = [6, 8, 10, 8];
        const h = heights[i];
        const w = widths[i];
        const ox = (16 - w) / 2;
        const oy = 16 - h;
        g.fillStyle(PALETTE.fireRed);
        g.fillRect(ox, oy, w, h);
        g.fillStyle(PALETTE.fireYellow);
        g.fillRect(ox + 2, oy + 2, w - 4, h - 4);
        g.fillStyle(PALETTE.orange);
        g.fillRect(ox + w / 2 - 1, oy - 2, 2, 3);
      });
    }
  }

  createMinecartTexture() {
    this.createTexture('minecart', 24, 16, (g) => {
      g.fillStyle(PALETTE.gray);
      g.fillRect(2, 0, 20, 10);
      g.fillStyle(PALETTE.darkSteel);
      g.fillRect(0, 10, 24, 4);
      g.fillStyle(PALETTE.darkBrown);
      g.fillRect(4, 12, 4, 4);
      g.fillRect(16, 12, 4, 4);
    });
  }

  createElevatorTexture() {
    this.createTexture('elevator', 24, 8, (g) => {
      g.fillStyle(PALETTE.darkSteel);
      g.fillRect(0, 0, 24, 6);
      g.fillStyle(PALETTE.steel);
      g.fillRect(2, 6, 20, 2);
      g.fillStyle(PALETTE.gray);
      g.fillRect(10, 0, 4, 6);
    });
  }

  createLeverTexture() {
    this.createTexture('lever_off', 8, 16, (g) => {
      g.fillStyle(PALETTE.darkSteel);
      g.fillRect(2, 8, 4, 8);
      g.fillStyle(PALETTE.red);
      g.fillRect(0, 4, 8, 4);
    });
    this.createTexture('lever_on', 8, 16, (g) => {
      g.fillStyle(PALETTE.darkSteel);
      g.fillRect(2, 8, 4, 8);
      g.fillStyle(PALETTE.green);
      g.fillRect(0, 0, 8, 4);
    });
  }

  createCrateTexture() {
    this.createTexture('crate', 16, 16, (g) => {
      g.fillStyle(PALETTE.brown);
      g.fillRect(0, 0, 16, 16);
      g.fillStyle(PALETTE.darkBrown);
      g.fillRect(0, 7, 16, 2);
      g.fillRect(7, 0, 2, 16);
      g.fillStyle(PALETTE.barrelBrown);
      g.fillRect(1, 1, 5, 5);
      g.fillRect(10, 1, 5, 5);
      g.fillRect(1, 10, 5, 5);
      g.fillRect(10, 10, 5, 5);
    });
  }

  createGearTexture() {
    this.createTexture('gear', 32, 32, (g) => {
      g.fillStyle(PALETTE.steel);
      g.fillRect(8, 0, 16, 32);
      g.fillRect(0, 8, 32, 16);
      g.fillStyle(PALETTE.darkSteel);
      g.fillRect(12, 4, 8, 24);
      g.fillRect(4, 12, 24, 8);
      g.fillStyle(PALETTE.gray);
      g.fillRect(12, 12, 8, 8);
    });
  }

  createPendulumTexture() {
    this.createTexture('pendulum', 8, 24, (g) => {
      g.fillStyle(PALETTE.darkSteel);
      g.fillRect(3, 0, 2, 18);
      g.fillStyle(PALETTE.gray);
      g.fillRect(0, 16, 8, 8);
    });
  }

  createLogoTexture() {
    this.createTexture('logo', 320, 60, (g) => {
      g.fillStyle(PALETTE.red);
      g.fillRect(0, 10, 320, 40);
      g.fillStyle(PALETTE.yellow);
      g.fillRect(4, 14, 312, 32);
      g.fillStyle(PALETTE.red);
      g.fillRect(8, 18, 304, 24);
    });
  }

  createParticleTextures() {
    this.createTexture('particle_wood', 4, 4, (g) => {
      g.fillStyle(PALETTE.barrelBrown);
      g.fillRect(0, 0, 4, 4);
    });
    this.createTexture('particle_spark', 3, 3, (g) => {
      g.fillStyle(PALETTE.fireYellow);
      g.fillRect(0, 0, 3, 3);
    });
    this.createTexture('particle_dust', 6, 6, (g) => {
      g.fillStyle(PALETTE.gray);
      g.fillRect(0, 0, 6, 6);
      g.fillStyle(0x9e9e9e);
      g.fillRect(1, 1, 4, 4);
    });
  }

  createAll() {
    this.createPlayerTextures();
    this.createBarrelTextures();
    this.createDKTextures();
    this.createBeamTexture();
    this.createLadderTexture();
    this.createHammerTexture();
    this.createFireTextures();
    this.createMinecartTexture();
    this.createElevatorTexture();
    this.createLeverTexture();
    this.createCrateTexture();
    this.createGearTexture();
    this.createPendulumTexture();
    this.createLogoTexture();
    this.createParticleTextures();
  }
}
