import { PowerUp } from './PowerUp';
import { Player } from '@/game/Player';
import { PowerUpType } from '@/config/GameConfig';

export class Clone extends PowerUp {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, PowerUpType.CLONE, x, y, 0x9370DB, '👥');
  }

  applyEffect(player: Player): void {
  }
}
