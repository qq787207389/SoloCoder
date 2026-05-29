import Phaser from 'phaser';
import { DKState } from '../types';

export class DonkeyKong extends Phaser.GameObjects.Container {
  public sprite: Phaser.GameObjects.Sprite;
  public declare body: Phaser.Physics.Arcade.Body;
  public state: DKState = 'IDLE';
  public throwInterval: number = 2500;
  public fakeThrowChance: number = 0.15;
  public rageThreshold: number = 0.3;
  public barrelSpeed: number = 60;
  private throwTimer: number = 0;
  private animTimer: number = 0;
  private isRaging: boolean = false;
  private consecutiveThrows: number = 0;
  private bossMode: boolean = false;
  private shakeTimer: number = 0;
  private shakeAmplitude: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, config: { throwInterval: number; fakeThrowChance: number; rageThreshold: number; barrelSpeed: number }) {
    super(scene, x, y);
    this.throwInterval = config.throwInterval;
    this.fakeThrowChance = config.fakeThrowChance;
    this.rageThreshold = config.rageThreshold;
    this.barrelSpeed = config.barrelSpeed;
    this.throwTimer = config.throwInterval;

    this.sprite = scene.add.sprite(0, 0, 'dk_idle');
    this.sprite.setOrigin(0.5, 1);
    this.add(this.sprite);
    scene.add.existing(this);

    scene.physics.add.existing(this, true);
    this.body.setSize(40, 36);
    this.body.setOffset(-20, -36);
  }

  update(delta: number, playerProgress: number): { shouldThrow: boolean; isFake: boolean } {
    this.throwTimer -= delta;
    let shouldThrow = false;
    let isFake = false;

    if (this.throwTimer <= 0) {
      if (Math.random() < this.fakeThrowChance && !this.isRaging) {
        shouldThrow = true;
        isFake = true;
        this.state = 'FAKE_THROW';
        this.sprite.setTexture('dk_throw');
        this.animTimer = 500;
      } else {
        shouldThrow = true;
        isFake = false;
        this.state = 'THROWING';
        this.sprite.setTexture('dk_throw');
        this.animTimer = 300;
        this.consecutiveThrows++;

        if (this.consecutiveThrows >= 3 && !this.isRaging) {
          this.isRaging = true;
          this.state = 'RAGE';
          this.sprite.setTexture('dk_rage');
          this.animTimer = 1000;
        }
      }

      const progressFactor = Math.max(0.5, 1 - playerProgress * 0.3);
      this.throwTimer = this.throwInterval * progressFactor + Math.random() * 500;
    }

    if (this.animTimer > 0) {
      this.animTimer -= delta;
      if (this.animTimer <= 0) {
        if (this.isRaging) {
          this.state = 'CHEST_BEAT';
          this.animateChestBeat();
        } else {
          this.state = 'IDLE';
          this.sprite.setTexture('dk_idle');
        }
        if (this.isRaging) {
          this.consecutiveThrows = 0;
          this.isRaging = false;
        }
      }
    }

    if (this.bossMode) {
      this.shakeTimer -= delta;
      if (this.shakeTimer <= 0) {
        this.shakeTimer = 2000 + Math.random() * 1000;
        this.shakeAmplitude = 3;
      }
      if (this.shakeAmplitude > 0) {
        this.x += (Math.random() - 0.5) * this.shakeAmplitude;
        this.shakeAmplitude *= 0.95;
        if (this.shakeAmplitude < 0.1) this.shakeAmplitude = 0;
      }
    }

    return { shouldThrow, isFake };
  }

  private animateChestBeat() {
    if (!this.scene) return;
    let beatCount = 0;
    const beatInterval = this.scene.time.addEvent({
      delay: 200,
      callback: () => {
        beatCount++;
        this.sprite.setTexture(beatCount % 2 === 0 ? 'dk_chestbeat1' : 'dk_chestbeat2');
        if (beatCount >= 6) {
          beatInterval.remove();
          this.state = 'IDLE';
          this.sprite.setTexture('dk_idle');
        }
      },
      loop: true,
    });
  }

  setBossMode(enabled: boolean) {
    this.bossMode = enabled;
  }

  playVictoryAnimation() {
    this.state = 'CHEST_BEAT';
    this.animateChestBeat();
  }

  playDefeatAnimation() {
    this.sprite.setTexture('dk_rage');
    this.scene.tweens.add({
      targets: this,
      y: this.y + 500,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => {
        this.setVisible(false);
      },
    });
  }
}
