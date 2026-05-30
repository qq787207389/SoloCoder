import Phaser from 'phaser';

export class ParticleManager {
  private scene: Phaser.Scene;
  private waterDropParticles: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private sparkleParticles: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
  private shockwaveGraphics: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createParticleEmitters();
  }

  private createParticleEmitters() {
    const waterDropTexture = this.createWaterDropTexture();
    const sparkleTexture = this.createSparkleTexture();

    this.waterDropParticles = this.scene.add.particles(0, 0, waterDropTexture, {
      lifespan: 600,
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      gravityY: 300,
      quantity: 0,
      emitting: false
    });

    this.sparkleParticles = this.scene.add.particles(0, 0, sparkleTexture, {
      lifespan: 500,
      speed: { min: 30, max: 80 },
      angle: { min: -90 - 30, max: -90 + 30 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      quantity: 0,
      emitting: false
    });

    this.shockwaveGraphics = this.scene.add.graphics();
  }

  private createWaterDropTexture(): string {
    const g = this.scene.make.graphics();
    g.fillStyle(0x93c5fd);
    g.fillCircle(4, 4, 4);
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(2, 2, 1.5);
    g.generateTexture('water_drop', 8, 8);
    g.destroy();
    return 'water_drop';
  }

  private createSparkleTexture(): string {
    const g = this.scene.make.graphics();
    g.fillStyle(0xfef08a);
    g.fillTriangle(4, 0, 5, 4, 4, 8);
    g.fillTriangle(4, 8, 3, 4, 4, 0);
    g.fillTriangle(0, 4, 4, 3, 8, 4);
    g.fillTriangle(8, 4, 4, 5, 0, 4);
    g.generateTexture('sparkle', 8, 8);
    g.destroy();
    return 'sparkle';
  }

  public emitBubblePop(x: number, y: number, hasShockwave: boolean = false) {
    if (this.waterDropParticles) {
      this.waterDropParticles.emitParticleAt(x, y, hasShockwave ? 20 : 12);
    }

    if (hasShockwave && this.shockwaveGraphics) {
      this.createShockwave(x, y);
    }
  }

  private createShockwave(x: number, y: number) {
    if (!this.shockwaveGraphics) return;

    const g = this.shockwaveGraphics;
    let radius = 10;
    const maxRadius = 120;
    let alpha = 0.8;

    const expand = () => {
      g.clear();
      g.lineStyle(4, 0xf472b6, alpha);
      g.strokeCircle(x, y, radius);
      g.lineStyle(2, 0xf9a8d4, alpha * 0.7);
      g.strokeCircle(x, y, radius * 0.7);

      radius += 8;
      alpha -= 0.08;

      if (radius < maxRadius && alpha > 0) {
        this.scene.time.delayedCall(16, expand);
      } else {
        g.clear();
      }
    };

    expand();
  }

  public emitEnemyDefeat(x: number, y: number) {
    if (this.waterDropParticles) {
      this.waterDropParticles.emitParticleAt(x, y, 15);
    }
    if (this.sparkleParticles) {
      this.sparkleParticles.emitParticleAt(x, y, 8);
    }
  }

  public emitJump(x: number, y: number) {
    if (this.sparkleParticles) {
      this.sparkleParticles.emitParticleAt(x, y + 10, 3);
    }
  }

  public emitBounce(x: number, y: number) {
    if (this.sparkleParticles) {
      this.sparkleParticles.emitParticleAt(x, y, 6);
    }
  }

  public emitPowerUp(x: number, y: number, type: string) {
    const color = type === 'rapid' ? 0xfbbf24 : 0xec4899;

    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const dist = 30;
      const endX = x + Math.cos(angle) * dist;
      const endY = y + Math.sin(angle) * dist;

      const particle = this.scene.add.circle(x, y, 4, color);
      particle.setAlpha(1);

      this.scene.tweens.add({
        targets: particle,
        x: endX,
        y: endY,
        alpha: 0,
        scale: 0,
        duration: 400,
        ease: 'Cubic.out',
        onComplete: () => particle.destroy()
      });
    }
  }

  public emitFireballHit(x: number, y: number) {
    if (this.waterDropParticles) {
      this.waterDropParticles.emitParticleAt(x, y, 8);
    }
  }

  public emitBubbleBounce(x: number, y: number) {
    if (this.waterDropParticles) {
      this.waterDropParticles.emitParticleAt(x, y, 4);
    }
  }

  public emitDamage(x: number, y: number, type: string) {
    const color = type === 'boss' ? 0xdc2626 : 0xef4444;
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const dist = 25;
      const endX = x + Math.cos(angle) * dist;
      const endY = y + Math.sin(angle) * dist;

      const particle = this.scene.add.circle(x, y, 3, color);
      particle.setAlpha(1);

      this.scene.tweens.add({
        targets: particle,
        x: endX,
        y: endY,
        alpha: 0,
        scale: 0,
        duration: 300,
        ease: 'Cubic.out',
        onComplete: () => particle.destroy()
      });
    }
  }

  public destroy() {
    if (this.waterDropParticles) this.waterDropParticles.destroy();
    if (this.sparkleParticles) this.sparkleParticles.destroy();
    if (this.shockwaveGraphics) this.shockwaveGraphics.destroy();
  }
}
