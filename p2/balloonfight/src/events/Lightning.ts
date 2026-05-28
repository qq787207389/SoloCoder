import Phaser from 'phaser';
import { GameConfig } from '@/config/GameConfig';
import { Player } from '@/game/Player';
import { circleCollision } from '@/utils/PhysicsHelper';
import { createLightningEffect, createFlashEffect, createScreenShake, createBalloonPopEffect } from '@/utils/ParticleEffects';

interface LightningStrike {
  x: number;
  warningTimer: number;
  isWarning: boolean;
  hasStruck: boolean;
  warningGraphics: Phaser.GameObjects.Graphics;
}

export class Lightning {
  scene: Phaser.Scene;
  isActive: boolean;
  strikes: LightningStrike[];
  strikeTimer: number;
  strikeInterval: number;
  totalStrikes: number;
  struckCount: number;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.isActive = false;
    this.strikes = [];
    this.strikeTimer = 0;
    this.strikeInterval = 2000;
    this.totalStrikes = 3;
    this.struckCount = 0;
  }

  start(): void {
    if (this.isActive) return;

    this.isActive = true;
    this.strikes = [];
    this.strikeTimer = 0;
    this.struckCount = 0;
    this.totalStrikes = Phaser.Math.Between(3, 5);

    createFlashEffect(this.scene, 0x4a4a6a, 200);
  }

  update(delta: number, players: Player[]): Player | null {
    if (!this.isActive) return null;

    this.strikeTimer += delta;
    if (this.struckCount < this.totalStrikes && this.strikeTimer >= this.strikeInterval) {
      this.createWarning();
      this.strikeTimer = 0;
    }

    for (let i = this.strikes.length - 1; i >= 0; i--) {
      const strike = this.strikes[i];

      if (strike.isWarning) {
        strike.warningTimer -= delta;
        this.drawWarning(strike);

        if (strike.warningTimer <= 0) {
          const hitPlayer = this.strike(strike, players);
          if (hitPlayer) return hitPlayer;
        }
      }

      if (strike.hasStruck && strike.warningTimer <= -500) {
        strike.warningGraphics.destroy();
        this.strikes.splice(i, 1);
      }
    }

    if (this.struckCount >= this.totalStrikes && this.strikes.length === 0) {
      this.stop();
    }

    return null;
  }

  createWarning(): void {
    const x = Phaser.Math.Between(80, GameConfig.WIDTH - 80);

    const graphics = this.scene.add.graphics();
    graphics.setDepth(200);

    const strike: LightningStrike = {
      x: x,
      warningTimer: GameConfig.LIGHTNING_WARNING_TIME,
      isWarning: true,
      hasStruck: false,
      warningGraphics: graphics,
    };

    this.strikes.push(strike);
  }

  drawWarning(strike: LightningStrike): void {
    strike.warningGraphics.clear();

    const alpha = Math.sin(Date.now() / 50) * 0.3 + 0.5;

    strike.warningGraphics.lineStyle(3, 0xffff00, alpha);
    strike.warningGraphics.beginPath();
    strike.warningGraphics.moveTo(strike.x, 0);
    strike.warningGraphics.lineTo(strike.x, GameConfig.HEIGHT);
    strike.warningGraphics.stroke();

    strike.warningGraphics.fillStyle(0xffff00, alpha * 0.3);
    strike.warningGraphics.fillRect(strike.x - 15, 0, 30, GameConfig.HEIGHT);

    strike.warningGraphics.fillStyle(0xffff00, alpha);
    strike.warningGraphics.beginPath();
    strike.warningGraphics.moveTo(strike.x - 10, 20);
    strike.warningGraphics.lineTo(strike.x, 5);
    strike.warningGraphics.lineTo(strike.x - 3, 20);
    strike.warningGraphics.lineTo(strike.x + 10, 5);
    strike.warningGraphics.lineTo(strike.x + 3, 20);
    strike.warningGraphics.closePath();
    strike.warningGraphics.fill();
  }

  strike(strike: LightningStrike, players: Player[]): Player | null {
    strike.isWarning = false;
    strike.hasStruck = true;
    strike.warningTimer = 0;
    this.struckCount++;

    createLightningEffect(this.scene, strike.x, 0, GameConfig.HEIGHT);
    createFlashEffect(this.scene, 0xffff00, 150);
    createScreenShake(this.scene, 20, 500);

    for (const player of players) {
      if (!player.isAlive || player.isClone) continue;

      if (circleCollision(
        strike.x, GameConfig.HEIGHT / 2, 40,
        player.x, player.y - 30, player.getBalloonCollisionRadius()
      ) || circleCollision(
        strike.x, GameConfig.HEIGHT / 2, 40,
        player.x, player.y, player.getBodyCollisionRadius()
      )) {
        createBalloonPopEffect(this.scene, player.x, player.y - 30, player.balloonColor);
        return player;
      }
    }

    return null;
  }

  stop(): void {
    this.isActive = false;
    this.strikes.forEach(s => s.warningGraphics.destroy());
    this.strikes = [];
  }

  destroy(): void {
    this.stop();
  }
}
