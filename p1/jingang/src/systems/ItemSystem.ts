import Phaser from 'phaser';
import { HammerItem } from '../entities/Hammer';
import { Fire } from '../entities/Fire';
import { LevelConfig } from '../types';

export class ItemSystem {
  private scene: Phaser.Scene;
  private hammers: HammerItem[] = [];
  private fires: Fire[] = [];
  private config: LevelConfig;
  private fireTimers: Phaser.Time.TimerEvent[] = [];

  constructor(scene: Phaser.Scene, config: LevelConfig) {
    this.scene = scene;
    this.config = config;
  }

  createItems(): { hammers: HammerItem[]; fires: Fire[] } {
    for (const h of this.config.hammers) {
      const hammer = new HammerItem(this.scene, h.x, h.y);
      this.hammers.push(hammer);
    }

    this.scheduleFires();

    return { hammers: this.hammers, fires: this.fires };
  }

  private scheduleFires() {
    for (const ft of this.config.fireTriggers) {
      const beam = this.config.beams[ft.beamIndex];
      if (!beam) continue;
      const timer = this.scene.time.delayedCall(ft.delay, () => {
        if (!this.scene.scene.isActive()) return;
        const fire = new Fire(this.scene, ft.x, beam.y - 2, ft.speed, beam.x, beam.x + beam.width);
        this.fires.push(fire);
      }, [], this);
      this.fireTimers.push(timer);
    }
  }

  update(delta: number) {
    for (const h of this.hammers) {
      h.update(delta);
    }
    for (const f of this.fires) {
      f.update(delta);
    }
  }

  getHammers(): HammerItem[] {
    return this.hammers;
  }

  getFires(): Fire[] {
    return this.fires;
  }

  clearAll() {
    for (const h of this.hammers) h.destroy();
    for (const f of this.fires) f.destroy();
    for (const t of this.fireTimers) t.remove();
    this.hammers = [];
    this.fires = [];
    this.fireTimers = [];
  }
}
