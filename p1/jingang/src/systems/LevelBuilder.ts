import Phaser from 'phaser';
import { LevelConfig, LevelType } from '../types';
import { PixelFactory } from '../utils/PixelFactory';

export class LevelBuilder {
  private scene: Phaser.Scene;
  private config: LevelConfig;
  public beamPlatforms!: Phaser.Physics.Arcade.StaticGroup;
  public ladderZones: Phaser.GameObjects.Rectangle[] = [];
  public ladderVisuals: Phaser.GameObjects.Sprite[] = [];
  private pixelFactory: PixelFactory;

  constructor(scene: Phaser.Scene, config: LevelConfig) {
    this.scene = scene;
    this.config = config;
    this.pixelFactory = new PixelFactory(scene);
    this.pixelFactory.createBeamTexture();
    this.pixelFactory.createLadderTexture();
  }

  build(): { beamPlatforms: Phaser.Physics.Arcade.StaticGroup; ladderZones: Phaser.GameObjects.Rectangle[] } {
    this.createBackground();
    this.beamPlatforms = this.scene.physics.add.staticGroup();
    this.createBeams();
    this.createLadders();

    return {
      beamPlatforms: this.beamPlatforms,
      ladderZones: this.ladderZones,
    };
  }

  private createBackground() {
    const type = this.config.type;
    let bgColor = 0x1a1a2e;
    if (type === 'construction') bgColor = 0x0d1b2a;
    else if (type === 'warehouse') bgColor = 0x1b0d0d;
    else if (type === 'clocktower') bgColor = 0x0d0d1b;

    const bg = this.scene.add.rectangle(240, 320, 480, 640, bgColor);
    bg.setDepth(-10);

    if (type === 'construction') {
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * 480;
        const y = Math.random() * 640;
        const g = this.scene.add.rectangle(x, y, 2, 2, 0x334455, 0.3);
        g.setDepth(-9);
      }
    } else if (type === 'warehouse') {
      for (let i = 0; i < 8; i++) {
        const x = 30 + i * 60;
        const shelf = this.scene.add.rectangle(x, 320, 4, 640, 0x3e2723, 0.15);
        shelf.setDepth(-9);
      }
    } else if (type === 'clocktower') {
      for (let i = 0; i < 5; i++) {
        const y = 80 + i * 130;
        const arch = this.scene.add.rectangle(240, y, 200, 4, 0x37474f, 0.2);
        arch.setDepth(-9);
      }
    }
  }

  private createBeams() {
    const beams = this.config.beams;
    for (let i = 0; i < beams.length; i++) {
      const beam = beams[i];
      const tilesNeeded = Math.ceil(beam.width / 16);
      for (let t = 0; t < tilesNeeded; t++) {
        const tileX = beam.x + t * 16 + 8;
        const tileY = beam.y + 4;
        const slopeOffset = this.calculateSlopeOffset(beam, t, tilesNeeded);
        const sprite = this.scene.add.sprite(tileX, tileY + slopeOffset, 'beam');
        sprite.setOrigin(0.5, 0.5);
        this.beamPlatforms.add(sprite);
        if (sprite.body) {
          (sprite.body as Phaser.Physics.Arcade.StaticBody).setSize(16, 8);
          (sprite.body as Phaser.Physics.Arcade.StaticBody).setOffset(0, 0);
        }
      }

      const beamY = beam.y;
      const leftY = beam.direction === 'left' ? beamY : beamY;
      const rightY = beam.direction === 'left' ? beamY : beamY;

      const topY = Math.min(leftY, rightY);
      const solidPlatform = this.scene.add.rectangle(
        beam.x + beam.width / 2,
        topY + 4,
        beam.width,
        8,
        0x000000,
        0
      );
      this.scene.physics.add.existing(solidPlatform, true);
      (solidPlatform.body as Phaser.Physics.Arcade.StaticBody).setSize(beam.width, 6);
      (solidPlatform.body as Phaser.Physics.Arcade.StaticBody).setOffset(0, 2);
      this.beamPlatforms.add(solidPlatform);
    }
  }

  private calculateSlopeOffset(beam: { x: number; y: number; width: number; direction: string }, tileIndex: number, totalTiles: number): number {
    return 0;
  }

  private createLadders() {
    const bottomBeamY = this.config.beams[0].y;

    for (const ladder of this.config.ladders) {
      const ladderBottom = ladder.y + ladder.height;
      const extendsBelowBottom = ladderBottom > bottomBeamY + 4;
      const clampedBottom = extendsBelowBottom ? bottomBeamY + 4 : ladderBottom;
      const actualHeight = clampedBottom - ladder.y;

      const tilesNeeded = Math.ceil((actualHeight + 20) / 16);
      for (let t = 0; t < tilesNeeded; t++) {
        const tileY = ladder.y + t * 16 + 8;
        if (tileY > clampedBottom + 8) break;
        const sprite = this.scene.add.sprite(ladder.x + 4, tileY, 'ladder');
        sprite.setOrigin(0.5, 0.5);
        sprite.setDepth(-1);
        this.ladderVisuals.push(sprite);
      }

      const zoneHeight = actualHeight + 12;
      const zoneCenterY = ladder.y + zoneHeight / 2 - 6;
      const zone = this.scene.add.rectangle(ladder.x + 4, zoneCenterY, 12, zoneHeight, 0x000000, 0) as Phaser.GameObjects.Rectangle;
      this.scene.physics.add.existing(zone, true);
      (zone.body as Phaser.Physics.Arcade.StaticBody).setSize(12, zoneHeight);
      zone.setVisible(false);
      this.ladderZones.push(zone);
    }
  }

  getBeamByY(y: number): number {
    for (let i = 0; i < this.config.beams.length; i++) {
      if (Math.abs(y - this.config.beams[i].y) < 10) return i;
    }
    return -1;
  }

  getBeamDirection(beamIndex: number): string {
    if (beamIndex < 0 || beamIndex >= this.config.beams.length) return 'right';
    return this.config.beams[beamIndex].direction;
  }
}
