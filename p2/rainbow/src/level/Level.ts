import { GAME_WIDTH, SEA_LEVEL_Y } from '../utils/Constants';
import { Platform, PlatformType } from './Platform';
import { LevelDef } from './LevelData';

export class Level {
  levelDef: LevelDef;
  platforms: Platform[];
  width: number = GAME_WIDTH;
  height: number;
  seaLevelY: number = SEA_LEVEL_Y;

  constructor(levelDef: LevelDef) {
    this.levelDef = levelDef;
    this.height = levelDef.height;
    this.platforms = [];

    for (const def of levelDef.platforms) {
      const platform = new Platform(def.x, def.y, def.w, def.h, def.type as PlatformType);
      
      if (def.type === 'moving_cloud' || def.type === 'bubble') {
        platform.moveRangeX = def.moveRangeX ?? 0;
        platform.moveRangeY = def.moveRangeY ?? 0;
        platform.moveSpeed = def.moveSpeed ?? 0;
      }

      this.platforms.push(platform);
    }
  }

  update(dt: number): void {
    for (const platform of this.platforms) {
      platform.update(dt);
    }
  }

  getPlatforms(): Platform[] {
    return this.platforms;
  }

  getSolidPlatforms(): Platform[] {
    return this.platforms.filter(p => p.solid);
  }

  getHeight(): number {
    return this.height;
  }

  isInBossArea(playerY: number): boolean {
    return playerY < this.levelDef.bossAreaY;
  }

  clear(): void {
    this.platforms = [];
  }
}
