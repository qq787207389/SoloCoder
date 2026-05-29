import Phaser from 'phaser';
import { PixelFactory } from '../utils/PixelFactory';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  create() {
    const pf = new PixelFactory(this);
    pf.createAll();

    this.scene.start('TitleScene');
  }
}
