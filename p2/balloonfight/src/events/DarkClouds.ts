import Phaser from 'phaser';
import { GameConfig } from '@/config/GameConfig';
import { Player } from '@/game/Player';
import { createFlashEffect } from '@/utils/ParticleEffects';

export class DarkClouds {
  scene: Phaser.Scene;
  isActive: boolean;
  duration: number;
  timer: number;
  coverGraphics: Phaser.GameObjects.Graphics;
  cloudGraphics: Phaser.GameObjects.Graphics[];
  opacity: number;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.isActive = false;
    this.duration = GameConfig.DARK_CLOUDS_DURATION;
    this.timer = 0;
    this.opacity = 0;
    this.cloudGraphics = [];

    this.coverGraphics = scene.add.graphics();
    this.coverGraphics.setDepth(100);
  }

  start(): void {
    if (this.isActive) return;

    this.isActive = true;
    this.timer = this.duration;
    this.opacity = 0;

    this.createClouds();
    createFlashEffect(this.scene, GameConfig.COLORS.DARK_CLOUDS, 300);
  }

  createClouds(): void {
    this.cloudGraphics.forEach(g => g.destroy());
    this.cloudGraphics = [];

    for (let i = 0; i < 8; i++) {
      const g = this.scene.add.graphics();
      g.setDepth(99);
      this.cloudGraphics.push(g);
    }
  }

  update(delta: number, players: Player[]): Player | null {
    if (!this.isActive) return null;

    this.timer -= delta;

    if (this.timer > this.duration - 1000) {
      this.opacity = Math.min(0.85, this.opacity + delta / 1000);
    } else if (this.timer < 1000) {
      this.opacity = Math.max(0, this.opacity - delta / 1000);
    }

    this.draw(players);

    if (this.timer <= 0) {
      this.stop();
    }

    return null;
  }

  draw(players: Player[]): void {
    this.coverGraphics.clear();
    this.coverGraphics.fillStyle(0x0a0a1a, this.opacity * 0.7);
    this.coverGraphics.fillRect(0, 0, GameConfig.WIDTH, GameConfig.HEIGHT);

    const time = Date.now() / 1000;
    this.cloudGraphics.forEach((g, i) => {
      g.clear();
      const offsetX = Math.sin(time + i) * 30;
      const offsetY = Math.cos(time * 0.7 + i) * 20;

      g.fillStyle(0x1a1a2e, this.opacity * 0.9);
      g.beginPath();

      const baseX = (i % 4) * (GameConfig.WIDTH / 4) + offsetX;
      const baseY = Math.floor(i / 4) * (GameConfig.HEIGHT / 2) + offsetY + 50;

      for (let j = 0; j < 6; j++) {
        const px = baseX + j * 60;
        const py = baseY + Math.sin(j + i) * 15;
        g.arc(px, py, 50 + Math.sin(time + j) * 10, 0, Math.PI * 2);
      }
      g.fill();
    });

    players.forEach(player => {
      if (player.isAlive && !player.isClone && this.opacity > 0.3) {
        const flickerAlpha = Math.sin(Date.now() / 100 + player.id * 2) * 0.3 + 0.3;
        player.container.setAlpha(Math.min(1, flickerAlpha + 0.2));
      }
    });
  }

  stop(): void {
    this.isActive = false;
    this.opacity = 0;
    this.coverGraphics.clear();
    this.cloudGraphics.forEach(g => g.destroy());
    this.cloudGraphics = [];

    this.scene.children.each(child => {
      if (child instanceof Phaser.GameObjects.Container) {
        child.setAlpha(1);
      }
    });
  }

  destroy(): void {
    this.stop();
    this.coverGraphics.destroy();
  }
}
