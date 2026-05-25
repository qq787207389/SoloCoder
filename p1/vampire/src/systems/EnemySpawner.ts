
import { EnemyType } from '../types';
import { ENEMY_TYPES } from '../config/enemyTypes';

export class EnemySpawner {
  private spawnTimer: number = 0;
  private spawnInterval: number = 1;
  private gameTime: number = 0;

  constructor() {
  }

  update(delta: number): { shouldSpawn: boolean, type: EnemyType | null } {
    this.gameTime += delta;
    this.spawnTimer -= delta;

    this.spawnInterval = Math.max(0.2, 1 - this.gameTime / 300);

    if (this.spawnTimer &lt;= 0) {
      this.spawnTimer = this.spawnInterval;
      const type = this.getRandomEnemyType();
      return { shouldSpawn: true, type };
    }

    return { shouldSpawn: false, type: null };
  }

  private getRandomEnemyType(): EnemyType {
    const types = Object.values(ENEMY_TYPES);
    const weights = [40, 25, 15, 10, 10];
    const totalWeight = weights.reduce((a, b) =&gt; a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i &lt; types.length; i++) {
      random -= weights[i];
      if (random &lt;= 0) {
        return types[i];
      }
    }
    return types[0];
  }

  reset(): void {
    this.spawnTimer = 0;
    this.gameTime = 0;
  }

  getGameTime(): number {
    return this.gameTime;
  }
}
