import Phaser from 'phaser';
import { Barrel } from '../entities/Barrel';
import { LevelConfig, BeamDirection } from '../types';

export class BarrelSystem {
  private scene: Phaser.Scene;
  private barrels: Barrel[] = [];
  private config: LevelConfig;
  private beamPlatforms: Phaser.Physics.Arcade.StaticGroup;
  private ladderZones: { x: number; y: number; height: number; isBarrelPath: boolean }[] = [];
  private difficulty: number = 1;

  constructor(scene: Phaser.Scene, config: LevelConfig, beamPlatforms: Phaser.Physics.Arcade.StaticGroup) {
    this.scene = scene;
    this.config = config;
    this.beamPlatforms = beamPlatforms;
    this.ladderZones = config.ladders.filter(l => l.isBarrelPath).map(l => ({
      x: l.x,
      y: l.y,
      height: l.height,
      isBarrelPath: l.isBarrelPath,
    }));
  }

  spawnBarrel(x: number, y: number): Barrel {
    const firstBeam = this.config.beams[0];
    const direction: BeamDirection = firstBeam.direction;
    const barrel = new Barrel(this.scene, x, y, this.config.dkConfig.barrelSpeed * this.difficulty, direction);
    this.barrels.push(barrel);
    this.scene.physics.add.collider(barrel, this.beamPlatforms);
    return barrel;
  }

  setDifficulty(d: number) {
    this.difficulty = Math.min(d, 2.5);
  }

  update(delta: number) {
    for (let i = this.barrels.length - 1; i >= 0; i--) {
      const barrel = this.barrels[i];
      if (barrel.isDead) {
        barrel.destroy();
        this.barrels.splice(i, 1);
        continue;
      }

      barrel.update(delta, this.beamPlatforms);

      if (!barrel.isClimbing) {
        for (const ladder of this.ladderZones) {
          const dist = Math.abs(barrel.x - ladder.x);
          if (dist < 10 && barrel.y > ladder.y && barrel.y < ladder.y + ladder.height + 16) {
            const climbChance = 0.3 * this.difficulty;
            if (Math.random() < climbChance) {
              barrel.startClimbing(ladder.y);
              break;
            }
          }
        }
      }
    }
  }

  getBarrels(): Barrel[] {
    return this.barrels;
  }

  destroyBarrel(barrel: Barrel): { x: number; y: number } {
    const pos = { x: barrel.x, y: barrel.y };
    barrel.kill();
    return pos;
  }

  clearAll() {
    for (const barrel of this.barrels) {
      barrel.destroy();
    }
    this.barrels = [];
  }
}
