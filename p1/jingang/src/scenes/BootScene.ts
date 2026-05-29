import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../types';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    this.scale.setGameSize(GAME_WIDTH, GAME_HEIGHT);
    this.scene.start('PreloadScene');
  }
}
