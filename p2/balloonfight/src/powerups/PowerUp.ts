import Phaser from 'phaser';
import { GameConfig, PowerUpType } from '@/config/GameConfig';
import { createFloatTween, createRotateTween, createBounceInTween, createFadeOutTween } from '@/utils/AnimationHelper';
import { circleCollision } from '@/utils/PhysicsHelper';
import { Player } from '@/game/Player';
import { createPowerUpCollectEffect, createSparkleEffect } from '@/utils/ParticleEffects';

export abstract class PowerUp {
  scene: Phaser.Scene;
  type: PowerUpType;
  x: number;
  y: number;
  baseY: number;
  color: number;
  icon: string;
  graphics: Phaser.GameObjects.Graphics;
  iconText: Phaser.GameObjects.Text;
  container: Phaser.GameObjects.Container;
  floatTween: Phaser.Tweens.Tween | null;
  rotateTween: Phaser.Tweens.Tween | null;
  isCollected: boolean;
  lifetime: number;
  maxLifetime: number;

  constructor(
    scene: Phaser.Scene,
    type: PowerUpType,
    x: number,
    y: number,
    color: number,
    icon: string
  ) {
    this.scene = scene;
    this.type = type;
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.color = color;
    this.icon = icon;
    this.isCollected = false;
    this.maxLifetime = 10000;
    this.lifetime = this.maxLifetime;

    this.graphics = scene.add.graphics();
    this.iconText = scene.add.text(0, 0, icon, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial',
    }).setOrigin(0.5);

    this.container = scene.add.container(x, y);
    this.container.add([this.graphics, this.iconText]);

    this.draw();

    createBounceInTween(scene, this.container);
    this.floatTween = createFloatTween(scene, this.container, 8, 2000);
    this.rotateTween = createRotateTween(scene, this.graphics, 3000);
  }

  draw(): void {
    this.graphics.clear();

    if (this.isCollected) return;

    const alpha = this.lifetime < 3000
      ? 0.5 + Math.sin(Date.now() / 100) * 0.3
      : 1;

    this.graphics.fillStyle(this.color, alpha);
    this.graphics.beginPath();
    this.graphics.arc(0, 0, 20, 0, Math.PI * 2);
    this.graphics.fill();

    this.graphics.lineStyle(3, 0xffffff, alpha * 0.8);
    this.graphics.beginPath();
    this.graphics.arc(0, 0, 22, 0, Math.PI * 2);
    this.graphics.stroke();

    this.graphics.fillStyle(0xffffff, alpha * 0.3);
    this.graphics.beginPath();
    this.graphics.arc(-6, -6, 6, 0, Math.PI * 2);
    this.graphics.fill();

    this.iconText.setAlpha(alpha);
  }

  update(delta: number, players: Player[]): {
    collected: boolean;
    player?: Player;
  } {
    if (this.isCollected) {
      return { collected: false };
    }

    this.lifetime -= delta;
    this.y = this.baseY + Math.sin(Date.now() / 500) * 5;
    this.container.setPosition(this.x, this.y);

    this.draw();

    if (this.lifetime <= 0) {
      this.destroy();
      return { collected: false };
    }

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
      this.x, this.y, 20,
      player.x, player.y - 30, player.getBalloonCollisionRadius()
    ) || circleCollision(
      this.x, this.y, 20,
      player.x, player.y, player.getBodyCollisionRadius()
    );
  }

  collect(player: Player): {
    collected: boolean;
    player: Player;
  } {
    this.isCollected = true;

    createPowerUpCollectEffect(this.scene, this.x, this.y, this.color);
    createSparkleEffect(this.scene, this.x, this.y);

    player.applyPowerUp(this.type);
    this.applyEffect(player);

    createFadeOutTween(this.scene, this.container, 200);

    return {
      collected: true,
      player: player,
    };
  }

  abstract applyEffect(player: Player): void;

  destroy(): void {
    if (this.floatTween) this.floatTween.stop();
    if (this.rotateTween) this.rotateTween.stop();
    this.container.destroy();
  }
}
