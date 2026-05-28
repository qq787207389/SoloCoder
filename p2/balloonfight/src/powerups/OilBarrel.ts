import { PowerUp } from './PowerUp';
import { Player } from '@/game/Player';
import { PowerUpType } from '@/config/GameConfig';

export class OilBarrel extends PowerUp {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, PowerUpType.OIL_BARREL, x, y, 0x8B4513, '🛢');
  }

  applyEffect(player: Player): void {
  }
}
