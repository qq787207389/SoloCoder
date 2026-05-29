import Phaser from 'phaser';
import { Minecart } from '../entities/Minecart';
import { Elevator } from '../entities/Elevator';
import { LevelConfig } from '../types';

export class PlatformSystem {
  private scene: Phaser.Scene;
  private minecarts: Minecart[] = [];
  private elevators: Elevator[] = [];
  private config: LevelConfig;

  constructor(scene: Phaser.Scene, config: LevelConfig) {
    this.scene = scene;
    this.config = config;
  }

  createPlatforms(): { minecarts: Minecart[]; elevators: Elevator[] } {
    for (const mc of this.config.minecarts) {
      const beam = this.config.beams[mc.beamIndex];
      if (!beam) continue;
      const minecart = new Minecart(this.scene, mc.startX, beam.y - 2, mc.startX, mc.endX, mc.speed);
      this.minecarts.push(minecart);
    }

    for (const ev of this.config.elevators) {
      const elevator = new Elevator(this.scene, ev.x, ev.bottomY, ev.topY, ev.bottomY, ev.speed);
      this.elevators.push(elevator);
    }

    return { minecarts: this.minecarts, elevators: this.elevators };
  }

  update(delta: number) {
    for (const mc of this.minecarts) {
      mc.update(delta);
    }
    for (const ev of this.elevators) {
      ev.update(delta);
    }
  }

  getMinecarts(): Minecart[] {
    return this.minecarts;
  }

  getElevators(): Elevator[] {
    return this.elevators;
  }

  clearAll() {
    for (const mc of this.minecarts) mc.destroy();
    for (const ev of this.elevators) ev.destroy();
    this.minecarts = [];
    this.elevators = [];
  }
}
