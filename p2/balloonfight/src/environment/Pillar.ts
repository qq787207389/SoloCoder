import Phaser from 'phaser';
import { GameConfig } from '@/config/GameConfig';
import { Player } from '@/game/Player';
import { circleCollision, bounceOffVerticalBounds } from '@/utils/PhysicsHelper';

export class Pillar {
  scene: Phaser.Scene;
  x: number;
  y: number;
  width: number;
  height: number;
  graphics: Phaser.GameObjects.Graphics;
  hasSpikes: boolean;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number = 60,
    height: number = 200,
    hasSpikes: boolean = false
  ) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.hasSpikes = hasSpikes;

    this.graphics = scene.add.graphics();
    this.draw();
  }

  draw(): void {
    this.graphics.clear();

    this.graphics.fillStyle(0x708090);
    this.graphics.fillRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );

    this.graphics.fillStyle(0x5a6a7a, 0.5);
    this.graphics.fillRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width / 4,
      this.height
    );
    this.graphics.fillRect(
      this.x + this.width / 4,
      this.y - this.height / 2,
      this.width / 4,
      this.height
    );

    this.graphics.lineStyle(3, 0x3a4a5a);
    this.graphics.strokeRect(
      this.x - this.width / 2,
      this.y - this.height / 2,
      this.width,
      this.height
    );

    this.graphics.lineStyle(2, 0x4a5a6a);
    for (let i = 0; i < 4; i++) {
      const lineY = this.y - this.height / 2 + (i + 1) * (this.height / 5);
      this.graphics.lineBetween(
        this.x - this.width / 2 + 5, lineY,
        this.x + this.width / 2 - 5, lineY
      );
    }

    if (this.hasSpikes) {
      this.drawSpikes();
    }
  }

  drawSpikes(): void {
    const spikeCount = 6;
    const spikeHeight = 20;
    const spikeWidth = this.width / (spikeCount + 1);

    this.graphics.fillStyle(GameConfig.COLORS.SPIKE_BLACK);

    for (let side = 0; side < 2; side++) {
      const baseX = side === 0 ? this.x - this.width / 2 : this.x + this.width / 2;
      const dir = side === 0 ? -1 : 1;

      for (let i = 0; i < spikeCount; i++) {
        const spikeY = this.y - this.height / 2 + (i + 1) * (this.height / (spikeCount + 1));

        this.graphics.beginPath();
        this.graphics.moveTo(baseX, spikeY - spikeHeight / 2);
        this.graphics.lineTo(baseX + dir * spikeHeight, spikeY);
        this.graphics.lineTo(baseX, spikeY + spikeHeight / 2);
        this.graphics.closePath();
        this.graphics.fill();
      }
    }
  }

  update(players: Player[]): Player | null {
    for (const player of players) {
      if (!player.isAlive || player.isClone) continue;

      const collision = this.checkCollision(player);
      if (collision) {
        if (this.hasSpikes) {
          return player;
        } else {
          this.resolveCollision(player);
        }
      }
    }
    return null;
  }

  checkCollision(player: Player): boolean {
    const left = this.x - this.width / 2;
    const right = this.x + this.width / 2;
    const top = this.y - this.height / 2;
    const bottom = this.y + this.height / 2;

    const balloonHit = circleCollision(
      player.x, player.y - 30, player.getBalloonCollisionRadius(),
      this.x, this.y, Math.max(this.width, this.height) / 2
    );

    const bodyHit = circleCollision(
      player.x, player.y, player.getBodyCollisionRadius(),
      this.x, this.y, Math.max(this.width, this.height) / 2
    );

    if (!balloonHit && !bodyHit) return false;

    const closestX = Math.max(left, Math.min(player.x, right));
    const closestY = Math.max(top, Math.min(player.y, bottom));
    const distX = player.x - closestX;
    const distY = player.y - closestY;
    const distSq = distX * distX + distY * distY;

    return distSq < player.getBodyCollisionRadius() * player.getBodyCollisionRadius() ||
           distSq < player.getBalloonCollisionRadius() * player.getBalloonCollisionRadius();
  }

  resolveCollision(player: Player): void {
    const left = this.x - this.width / 2;
    const right = this.x + this.width / 2;

    const bounceResult = bounceOffVerticalBounds(
      player.x,
      player.velocityX,
      GameConfig.BALLOON_RADIUS,
      right
    );

    if (player.x < this.x) {
      player.x = left - GameConfig.BALLOON_RADIUS;
      player.velocityX = -Math.abs(player.velocityX) * 0.5;
    } else {
      player.x = right + GameConfig.BALLOON_RADIUS;
      player.velocityX = Math.abs(player.velocityX) * 0.5;
    }
  }

  destroy(): void {
    this.graphics.destroy();
  }
}
