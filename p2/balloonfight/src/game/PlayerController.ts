import Phaser from 'phaser';
import { Player } from './Player';
import { CONTROLS } from '@/config/GameConfig';

export class PlayerController {
  player: Player;
  scene: Phaser.Scene;
  playerNum: 1 | 2;
  leftKey: Phaser.Input.Keyboard.Key;
  rightKey: Phaser.Input.Keyboard.Key;
  inflateKey: Phaser.Input.Keyboard.Key;
  isActive: boolean;

  constructor(
    scene: Phaser.Scene,
    player: Player,
    playerNum: 1 | 2
  ) {
    this.scene = scene;
    this.player = player;
    this.playerNum = playerNum;
    this.isActive = true;

    const controls = playerNum === 1 ? CONTROLS.PLAYER1 : CONTROLS.PLAYER2;
    this.leftKey = scene.input.keyboard!.addKey(controls.LEFT);
    this.rightKey = scene.input.keyboard!.addKey(controls.RIGHT);
    this.inflateKey = scene.input.keyboard!.addKey(controls.INFLATE);
  }

  update(): void {
    if (!this.isActive || !this.player.isAlive) {
      this.player.stopMoving();
      this.player.stopInflating();
      return;
    }

    if (this.leftKey.isDown && !this.rightKey.isDown) {
      this.player.moveLeft();
    } else if (this.rightKey.isDown && !this.leftKey.isDown) {
      this.player.moveRight();
    } else {
      this.player.stopMoving();
    }

    if (this.inflateKey.isDown) {
      this.player.startInflating();
    } else {
      this.player.stopInflating();
    }
  }

  setActive(active: boolean): void {
    this.isActive = active;
    if (!active) {
      this.player.stopMoving();
      this.player.stopInflating();
    }
  }

  destroy(): void {
    this.leftKey.destroy();
    this.rightKey.destroy();
    this.inflateKey.destroy();
  }
}
