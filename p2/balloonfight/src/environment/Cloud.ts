import Phaser from 'phaser';
import { GameConfig } from '@/config/GameConfig';
import { createFloatTween, createFadeOutTween } from '@/utils/AnimationHelper';
import { circleCollision } from '@/utils/PhysicsHelper';
import { Player } from '@/game/Player';

export class Cloud {
  scene: Phaser.Scene;
  x: number;
  y: number;
  width: number;
  height: number;
  graphics: Phaser.GameObjects.Graphics;
  lifetime: number;
  maxLifetime: number;
  isOccupied: boolean;
  floatTween: Phaser.Tweens.Tween | null;
  isDisappearing: boolean;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number = 120
  ) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = 30;
    this.maxLifetime = GameConfig.CLOUD_LIFETIME;
    this.lifetime = this.maxLifetime;
    this.isOccupied = false;
    this.isDisappearing = false;

    this.graphics = scene.add.graphics();
    this.draw();

    this.floatTween = createFloatTween(scene, this.graphics, 5, 3000);
  }

  draw(): void {
    this.graphics.clear();

    const alpha = this.isDisappearing
      ? this.lifetime / this.maxLifetime
      : 1;

    this.graphics.fillStyle(GameConfig.COLORS.CLOUD_WHITE, alpha);
    this.graphics.beginPath();

    const segments = 5;
    const segmentWidth = this.width / segments;

    for (let i = 0; i <= segments; i++) {
      const px = this.x - this.width / 2 + i * segmentWidth;
      const py = this.y + Math.sin(i * 0.8) * 8;
      const radius = segmentWidth * 0.6;

      if (i === 0) {
        this.graphics.moveTo(px, py);
      } else {
        this.graphics.arc(px - segmentWidth / 2, py - 5, radius, 0, Math.PI * 2);
      }
    }

    this.graphics.fill();

    this.graphics.fillStyle(0xeeeeee, alpha * 0.5);
    this.graphics.fillRect(
      this.x - this.width / 2,
      this.y,
      this.width,
      8
    );
  }

  update(delta: number, players: Player[]): void {
    this.isOccupied = false;

    for (const player of players) {
      if (!player.isAlive || player.isClone) continue;

      if (this.checkCollision(player)) {
        this.isOccupied = true;

        if (player.velocityY > 0 && player.y < this.y - 10) {
          player.y = this.y - 25;
          player.velocityY = Math.min(0, player.velocityY * -0.3);
        }
      }
    }

    if (this.isOccupied) {
      this.lifetime -= delta;
      if (this.lifetime < this.maxLifetime * 0.3 && !this.isDisappearing) {
        this.isDisappearing = true;
      }
    } else if (!this.isDisappearing) {
      this.lifetime = Math.min(this.maxLifetime, this.lifetime + delta * 0.5);
    }

    if (this.isDisappearing) {
      this.lifetime -= delta * 0.5;
    }

    this.draw();
  }

  checkCollision(player: Player): boolean {
    return circleCollision(
      player.x, player.y, player.getBodyCollisionRadius(),
      this.x, this.y, this.width / 2
    );
  }

  isExpired(): boolean {
    return this.lifetime <= 0;
  }

  destroy(): void {
    if (this.floatTween) this.floatTween.stop();
    createFadeOutTween(this.scene, this.graphics, 300);
  }
}
