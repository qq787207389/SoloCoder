import Phaser from 'phaser';
import { GameConfig } from '@/config/GameConfig';

export interface ParticleConfig {
  x: number;
  y: number;
  count: number;
  color: number;
  speed?: number;
  lifespan?: number;
  size?: number;
}

export function createBalloonPopEffect(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number
): Phaser.GameObjects.Particles.ParticleEmitter {
  const particles = scene.add.particles(0, 0, 'particle', {
    x: x,
    y: y,
    speed: { min: 100, max: 300 },
    angle: { min: 0, max: 360 },
    scale: { start: 0.8, end: 0 },
    alpha: { start: 1, end: 0 },
    lifespan: 600,
    quantity: 20,
    tint: color,
    gravityY: 200,
    emitting: true,
  });

  particles.explode(20, x, y);
  return particles;
}

export function createSparkleEffect(
  scene: Phaser.Scene,
  x: number,
  y: number
): Phaser.GameObjects.Particles.ParticleEmitter {
  const particles = scene.add.particles(0, 0, 'particle', {
    x: x,
    y: y,
    speed: { min: 50, max: 150 },
    angle: { min: 0, max: 360 },
    scale: { start: 0.5, end: 0 },
    alpha: { start: 1, end: 0 },
    lifespan: 400,
    quantity: 10,
    tint: 0xffffff,
    emitting: true,
  });

  particles.explode(10, x, y);
  return particles;
}

export function createPowerUpCollectEffect(
  scene: Phaser.Scene,
  x: number,
  y: number,
  color: number
): Phaser.GameObjects.Particles.ParticleEmitter {
  const particles = scene.add.particles(0, 0, 'particle', {
    x: x,
    y: y,
    speed: { min: 80, max: 200 },
    angle: { min: -90 - 30, max: -90 + 30 },
    scale: { start: 0.6, end: 0 },
    alpha: { start: 1, end: 0 },
    lifespan: 500,
    quantity: 15,
    tint: color,
    emitting: true,
  });

  particles.explode(15, x, y);
  return particles;
}

export function createLightningEffect(
  scene: Phaser.Scene,
  x: number,
  startY: number,
  endY: number
): Phaser.GameObjects.Graphics {
  const graphics = scene.add.graphics();
  graphics.lineStyle(4, 0xffff00, 1);
  
  let currentY = startY;
  let currentX = x;
  
  graphics.beginPath();
  graphics.moveTo(currentX, currentY);
  
  while (currentY < endY) {
    currentX += Phaser.Math.Between(-30, 30);
    currentY += Phaser.Math.Between(20, 50);
    graphics.lineTo(currentX, Math.min(currentY, endY));
  }
  
  graphics.strokePath();
  
  scene.tweens.add({
    targets: graphics,
    alpha: 0,
    duration: 200,
    onComplete: () => graphics.destroy(),
  });
  
  return graphics;
}

export function createScreenShake(
  scene: Phaser.Scene,
  intensity: number = 10,
  duration: number = 300
): void {
  scene.cameras.main.shake(duration, intensity / 100);
}

export function createFlashEffect(
  scene: Phaser.Scene,
  color: number = 0xffffff,
  duration: number = 100
): void {
  const flash = scene.add.rectangle(
    GameConfig.WIDTH / 2,
    GameConfig.HEIGHT / 2,
    GameConfig.WIDTH,
    GameConfig.HEIGHT,
    color,
    0.6
  );
  
  scene.tweens.add({
    targets: flash,
    alpha: 0,
    duration: duration,
    onComplete: () => flash.destroy(),
  });
}

export function initParticleTexture(scene: Phaser.Scene): void {
  const graphics = scene.make.graphics(undefined, false);
  graphics.fillStyle(0xffffff);
  graphics.fillCircle(4, 4, 4);
  graphics.generateTexture('particle', 8, 8);
  graphics.destroy();
}
