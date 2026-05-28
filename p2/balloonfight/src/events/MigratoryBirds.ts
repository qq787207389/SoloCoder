import Phaser from 'phaser';
import { GameConfig } from '@/config/GameConfig';
import { Player } from '@/game/Player';
import { circleCollision } from '@/utils/PhysicsHelper';
import { createFlashEffect, createBalloonPopEffect } from '@/utils/ParticleEffects';

interface Bird {
  x: number;
  y: number;
  velocityX: number;
  graphics: Phaser.GameObjects.Graphics;
  wingPhase: number;
}

export class MigratoryBirds {
  scene: Phaser.Scene;
  isActive: boolean;
  birds: Bird[];
  direction: 1 | -1;
  spawnTimer: number;
  spawnedCount: number;
  totalBirds: number;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.isActive = false;
    this.birds = [];
    this.direction = 1;
    this.spawnTimer = 0;
    this.spawnedCount = 0;
    this.totalBirds = GameConfig.BIRD_COUNT;
  }

  start(): void {
    if (this.isActive) return;

    this.isActive = true;
    this.birds = [];
    this.direction = Math.random() > 0.5 ? 1 : -1;
    this.spawnTimer = 0;
    this.spawnedCount = 0;

    createFlashEffect(this.scene, 0x87CEEB, 200);
  }

  update(delta: number, players: Player[]): Player | null {
    if (!this.isActive) return null;

    this.spawnTimer += delta;
    if (this.spawnedCount < this.totalBirds && this.spawnTimer >= 300) {
      this.spawnBird();
      this.spawnTimer = 0;
      this.spawnedCount++;
    }

    for (let i = this.birds.length - 1; i >= 0; i--) {
      const bird = this.birds[i];
      bird.x += bird.velocityX * (delta / 1000);
      bird.wingPhase += delta / 100;

      this.drawBird(bird);

      for (const player of players) {
        if (!player.isAlive || player.isClone) continue;

        if (this.checkBirdCollision(bird, player)) {
          createBalloonPopEffect(this.scene, player.x, player.y - 30, player.balloonColor);
          this.removeBird(i);
          return player;
        }
      }

      if (
        (this.direction === 1 && bird.x > GameConfig.WIDTH + 100) ||
        (this.direction === -1 && bird.x < -100)
      ) {
        this.removeBird(i);
      }
    }

    if (this.spawnedCount >= this.totalBirds && this.birds.length === 0) {
      this.stop();
    }

    return null;
  }

  spawnBird(): void {
    const startX = this.direction === 1 ? -50 : GameConfig.WIDTH + 50;
    const y = Phaser.Math.Between(100, GameConfig.HEIGHT - 150);

    const graphics = this.scene.add.graphics();
    graphics.setDepth(50);

    const bird: Bird = {
      x: startX,
      y: y,
      velocityX: GameConfig.BIRD_SPEED * this.direction,
      graphics: graphics,
      wingPhase: Math.random() * Math.PI * 2,
    };

    this.birds.push(bird);
  }

  drawBird(bird: Bird): void {
    bird.graphics.clear();

    const wingAngle = Math.sin(bird.wingPhase * 5) * 0.5;

    bird.graphics.fillStyle(0x2c3e50);
    bird.graphics.beginPath();
    bird.graphics.arc(bird.x, bird.y, 15, 0, Math.PI * 2);
    bird.graphics.fill();

    bird.graphics.fillStyle(0x1a252f);
    bird.graphics.beginPath();
    bird.graphics.moveTo(bird.x, bird.y);
    bird.graphics.lineTo(
      bird.x + Math.cos(-Math.PI / 2 + wingAngle) * 25,
      bird.y + Math.sin(-Math.PI / 2 + wingAngle) * 20
    );
    bird.graphics.lineTo(
      bird.x + Math.cos(-Math.PI / 2 + wingAngle + 0.3) * 10,
      bird.y + 5
    );
    bird.graphics.closePath();
    bird.graphics.fill();

    bird.graphics.fillStyle(0xe74c3c);
    bird.graphics.beginPath();
    bird.graphics.moveTo(bird.x + 15 * this.direction, bird.y);
    bird.graphics.lineTo(bird.x + 25 * this.direction, bird.y - 3);
    bird.graphics.lineTo(bird.x + 25 * this.direction, bird.y + 3);
    bird.graphics.closePath();
    bird.graphics.fill();

    bird.graphics.fillStyle(0xffffff);
    bird.graphics.fillCircle(bird.x + 8 * this.direction, bird.y - 3, 3);
    bird.graphics.fillStyle(0x000000);
    bird.graphics.fillCircle(bird.x + 9 * this.direction, bird.y - 3, 1.5);
  }

  checkBirdCollision(bird: Bird, player: Player): boolean {
    return circleCollision(
      bird.x, bird.y, 15,
      player.x, player.y - 30, player.getBalloonCollisionRadius()
    ) || circleCollision(
      bird.x, bird.y, 15,
      player.x, player.y, player.getBodyCollisionRadius()
    );
  }

  removeBird(index: number): void {
    const bird = this.birds[index];
    bird.graphics.destroy();
    this.birds.splice(index, 1);
  }

  stop(): void {
    this.isActive = false;
    this.birds.forEach(bird => bird.graphics.destroy());
    this.birds = [];
  }

  destroy(): void {
    this.stop();
  }
}
