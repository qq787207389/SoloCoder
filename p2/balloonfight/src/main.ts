import Phaser from 'phaser';
import { GameConfig } from '@/config/GameConfig';
import { MainMenu } from '@/scenes/MainMenu';
import { GameScene } from '@/scenes/GameScene';
import { GameOver } from '@/scenes/GameOver';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GameConfig.WIDTH,
  height: GameConfig.HEIGHT,
  parent: 'game-container',
  backgroundColor: '#87CEEB',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [MainMenu, GameScene, GameOver],
};

new Phaser.Game(config);
