import { PowerUp } from './PowerUp';
import { Player } from '@/game/Player';
import { PowerUpType, GameConfig } from '@/config/GameConfig';

export class Shield extends PowerUp {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, PowerUpType.SHIELD, x, y, GameConfig.COLORS.SHIELD_CYAN, '🛡');
  }

  applyEffect(player: Player): void {
  }
}
