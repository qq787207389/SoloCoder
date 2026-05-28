import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config/gameConfig';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  public preload(): void {
    this.createPlaceholderGraphics();
  }

  private createPlaceholderGraphics(): void {
    const playerGraphics = this.make.graphics();
    playerGraphics.fillStyle(0xC0C0C0, 1);
    playerGraphics.fillTriangle(30, 5, 10, 55, 50, 55);
    playerGraphics.fillStyle(0x4169E1, 1);
    playerGraphics.fillRect(5, 35, 50, 8);
    playerGraphics.fillStyle(0xFF0000, 1);
    playerGraphics.fillCircle(30, 30, 5);
    playerGraphics.generateTexture('player', 60, 60);

    const wingmanGraphics = this.make.graphics();
    wingmanGraphics.fillStyle(0x808080, 1);
    wingmanGraphics.fillTriangle(15, 3, 5, 27, 25, 27);
    wingmanGraphics.fillStyle(0x4169E1, 1);
    wingmanGraphics.fillRect(3, 17, 24, 5);
    wingmanGraphics.generateTexture('wingman', 30, 30);

    const enemyGraphics = this.make.graphics();
    enemyGraphics.fillStyle(0x228B22, 1);
    enemyGraphics.fillTriangle(20, 35, 5, 5, 35, 5);
    enemyGraphics.fillStyle(0xFF0000, 1);
    enemyGraphics.fillCircle(20, 20, 4);
    enemyGraphics.generateTexture('enemy', 40, 40);

    const bossGraphics = this.make.graphics();
    bossGraphics.fillStyle(0x4A4A4A, 1);
    bossGraphics.fillRect(20, 10, 160, 100);
    bossGraphics.fillStyle(0x8B0000, 1);
    bossGraphics.fillRect(40, 30, 30, 20);
    bossGraphics.fillRect(130, 30, 30, 20);
    bossGraphics.fillStyle(0x2F2F2F, 1);
    bossGraphics.fillRect(80, 20, 40, 30);
    bossGraphics.generateTexture('boss', 200, 120);

    const bulletGraphics = this.make.graphics();
    bulletGraphics.fillStyle(0xFFA500, 1);
    bulletGraphics.fillRect(2, 2, 4, 12);
    bulletGraphics.generateTexture('bullet', 8, 16);

    const pickupGraphics = this.make.graphics();
    pickupGraphics.fillStyle(0x8B4513, 1);
    pickupGraphics.fillRect(2, 2, 20, 24);
    pickupGraphics.fillStyle(0x654321, 1);
    pickupGraphics.fillRect(4, 6, 16, 16);
    pickupGraphics.generateTexture('pickup', 24, 28);

    const explosionGraphics = this.make.graphics();
    for (let i = 0; i < 5; i++) {
      const alpha = 1 - i * 0.2;
      explosionGraphics.fillStyle(0xFF4500, alpha);
      explosionGraphics.fillCircle(30, 30, 30 - i * 5);
    }
    explosionGraphics.generateTexture('explosion', 60, 60);

    const cloudGraphics = this.make.graphics();
    cloudGraphics.fillStyle(0xFFFFFF, 0.6);
    cloudGraphics.fillCircle(100, 50, 40);
    cloudGraphics.fillCircle(60, 60, 30);
    cloudGraphics.fillCircle(140, 60, 30);
    cloudGraphics.generateTexture('cloud', 200, 100);

    const islandGraphics = this.make.graphics();
    islandGraphics.fillStyle(0x228B22, 1);
    islandGraphics.fillCircle(60, 50, 25);
    islandGraphics.fillStyle(0x8B4513, 1);
    islandGraphics.fillRect(55, 10, 10, 40);
    islandGraphics.fillStyle(0x228B22, 1);
    islandGraphics.fillTriangle(60, 0, 35, 25, 85, 25);
    islandGraphics.generateTexture('island', 120, 80);
  }

  public create(): void {
    this.scene.start('GameScene');
  }
}
