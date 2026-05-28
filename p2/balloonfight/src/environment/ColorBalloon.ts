import Phaser from 'phaser';
import { GameConfig, PowerUpType } from '@/config/GameConfig';
import { createFloatTween, createBounceInTween, createFadeOutTween } from '@/utils/AnimationHelper';
import { circleCollision } from '@/utils/PhysicsHelper';
import { Player } from '@/game/Player';
import { createBalloonPopEffect, createSparkleEffect, createPowerUpCollectEffect } from '@/utils/ParticleEffects';

export class ColorBalloon {
  scene: Phaser.Scene;
  x: number;
  y: number;
  baseY: number;
  color: number;
  radius: number;
  graphics: Phaser.GameObjects.Graphics;
  floatTween: Phaser.Tweens.Tween | null = null;
  sineOffset: number;
  sineSpeed: number;
  isCollected: boolean;
  containsPowerUp: boolean;
  powerUpType: PowerUpType | null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    color?: number,
    containsPowerUp: boolean = false
  ) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.color = color || GameConfig.BALLOON_COLORS[
      Phaser.Math.Between(0, GameConfig.BALLOON_COLORS.length - 1)
    ];
    this.radius = GameConfig.BALLOON_RADIUS * 0.8;
    this.sineOffset = Phaser.Math.FloatBetween(0, Math.PI * 2);
    this.sineSpeed = Phaser.Math.FloatBetween(1, 2);
    this.isCollected = false;
    this.containsPowerUp = containsPowerUp;
    this.powerUpType = containsPowerUp ? this.getRandomPowerUp() : null;

    this.graphics = scene.add.graphics();
    this.draw();

    createBounceInTween(scene, this.graphics);
  }

  getRandomPowerUp(): PowerUpType {
    const types = [
      PowerUpType.LIGHTNING_BOOTS,
      PowerUpType.SHIELD,
      PowerUpType.OIL_BARREL,
      PowerUpType.CLONE,
    ];
    return types[Phaser.Math.Between(0, types.length - 1)];
  }

  draw(): void {
    this.graphics.clear();

    if (this.isCollected) return;

    this.graphics.fillStyle(this.color);
    this.graphics.beginPath();
    this.graphics.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    this.graphics.fill();

    this.graphics.fillStyle(0xffffff, 0.6);
    this.graphics.beginPath();
    this.graphics.arc(
      this.x - this.radius * 0.3,
      this.y - this.radius * 0.3,
      this.radius * 0.25,
      0,
      Math.PI * 2
    );
    this.graphics.fill();

    this.graphics.lineStyle(2, 0x000000);
    this.graphics.lineBetween(
      this.x, this.y + this.radius,
      this.x, this.y + this.radius + 15
    );

    if (this.containsPowerUp) {
      this.graphics.lineStyle(3, 0xffffff, 0.8);
      this.graphics.beginPath();
      this.graphics.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
      this.graphics.stroke();
    }
  }

  update(delta: number, time: number, players: Player[]): {
    collected: boolean;
    player?: Player;
    powerUp?: PowerUpType;
  } {
    if (this.isCollected) {
      return { collected: false };
    }

    this.sineOffset += (delta / 1000) * this.sineSpeed;
    this.y = this.baseY + Math.sin(this.sineOffset) * 15;

    this.draw();

    for (const player of players) {
      if (!player.isAlive || player.isClone) continue;

      if (this.checkCollision(player)) {
        return this.collect(player);
      }
    }

    return { collected: false };
  }

  checkCollision(player: Player): boolean {
    return circleCollision(
      this.x, this.y, this.radius * 0.8,
      player.x, player.y - 30, player.getBalloonCollisionRadius()
    ) || circleCollision(
      this.x, this.y, this.radius * 0.8,
      player.x, player.y, player.getBodyCollisionRadius()
    );
  }

  collect(player: Player): {
    collected: boolean;
    player: Player;
    powerUp?: PowerUpType;
  } {
    this.isCollected = true;

    createBalloonPopEffect(this.scene, this.x, this.y, this.color);
    createSparkleEffect(this.scene, this.x, this.y);

    player.inflation.refill();

    if (this.containsPowerUp && this.powerUpType) {
      createPowerUpCollectEffect(this.scene, this.x, this.y, this.color);
      createFadeOutTween(this.scene, this.graphics, 100);
      return {
        collected: true,
        player: player,
        powerUp: this.powerUpType,
      };
    }

    createFadeOutTween(this.scene, this.graphics, 100);
    return {
      collected: true,
      player: player,
    };
  }

  getCollisionRadius(): number {
    return this.radius * 0.8;
  }

  destroy(): void {
    if (this.floatTween) this.floatTween.stop();
    this.graphics.destroy();
  }
}
