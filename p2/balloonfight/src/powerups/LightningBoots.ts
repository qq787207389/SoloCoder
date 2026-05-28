import { PowerUp } from './PowerUp';
import { Player } from '@/game/Player';
import { PowerUpType, GameConfig } from '@/config/GameConfig';

export class LightningBoots extends PowerUp {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, PowerUpType.LIGHTNING_BOOTS, x, y, 0xffff00, '⚡');
  }

  applyEffect(player: Player): void {
    player.inflation.setRecoverRateMultiplier(2);
  }
}
