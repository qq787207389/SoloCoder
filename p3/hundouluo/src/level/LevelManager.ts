import { Game } from '../engine/Game';
import { PatrolEnemy, TurretEnemy, FlyingEnemy } from '../enemies/Enemy';
import { FirstBoss } from '../bosses/Boss';
import { Item, ItemType } from '../items/Item';

export interface LevelEvent {
  position: number;
  type: 'enemy' | 'boss' | 'item' | 'scroll_stop' | 'message';
  data: any;
  triggered: boolean;
}

export interface LevelConfig {
  name: string;
  length: number;
  events: LevelEvent[];
  backgroundMusic?: string;
}

export class LevelManager {
  private game: Game;
  private config: LevelConfig;
  private currentPosition: number;
  private bossSpawned: boolean;
  private scrollStopped: boolean;

  constructor(game: Game) {
    this.game = game;
    this.currentPosition = 0;
    this.bossSpawned = false;
    this.scrollStopped = false;
    this.config = this.createLevel1Config();
  }

  private createLevel1Config(): LevelConfig {
    return {
      name: 'Stage 1 - Jungle Base',
      length: 2000,
      events: [
        {
          position: 150,
          type: 'enemy',
          data: { enemyType: 'patrol', x: 500, y: 400 },
          triggered: false
        },
        {
          position: 250,
          type: 'enemy',
          data: { enemyType: 'patrol', x: 600, y: 400 },
          triggered: false
        },
        {
          position: 350,
          type: 'item',
          data: { itemType: ItemType.WEAPON_SHOTGUN, x: 700, y: 350 },
          triggered: false
        },
        {
          position: 450,
          type: 'enemy',
          data: { enemyType: 'turret', x: 800, y: 408 },
          triggered: false
        },
        {
          position: 550,
          type: 'enemy',
          data: { enemyType: 'patrol', x: 900, y: 400 },
          triggered: false
        },
        {
          position: 650,
          type: 'enemy',
          data: { enemyType: 'flying', x: 1000, y: 200 },
          triggered: false
        },
        {
          position: 750,
          type: 'item',
          data: { itemType: ItemType.BOMB, x: 1100, y: 300 },
          triggered: false
        },
        {
          position: 850,
          type: 'enemy',
          data: { enemyType: 'turret', x: 1200, y: 408 },
          triggered: false
        },
        {
          position: 900,
          type: 'enemy',
          data: { enemyType: 'turret', x: 1300, y: 300 },
          triggered: false
        },
        {
          position: 1000,
          type: 'enemy',
          data: { enemyType: 'flying', x: 1400, y: 180 },
          triggered: false
        },
        {
          position: 1100,
          type: 'enemy',
          data: { enemyType: 'flying', x: 1450, y: 220 },
          triggered: false
        },
        {
          position: 1200,
          type: 'item',
          data: { itemType: ItemType.WEAPON_MACHINEGUN, x: 1500, y: 280 },
          triggered: false
        },
        {
          position: 1300,
          type: 'enemy',
          data: { enemyType: 'patrol', x: 1600, y: 400 },
          triggered: false
        },
        {
          position: 1350,
          type: 'enemy',
          data: { enemyType: 'patrol', x: 1680, y: 400 },
          triggered: false
        },
        {
          position: 1450,
          type: 'item',
          data: { itemType: ItemType.SHIELD, x: 1750, y: 320 },
          triggered: false
        },
        {
          position: 1550,
          type: 'enemy',
          data: { enemyType: 'turret', x: 1850, y: 408 },
          triggered: false
        },
        {
          position: 1650,
          type: 'enemy',
          data: { enemyType: 'flying', x: 1950, y: 200 },
          triggered: false
        },
        {
          position: 1750,
          type: 'item',
          data: { itemType: ItemType.WEAPON_LASER, x: 2050, y: 300 },
          triggered: false
        },
        {
          position: 1850,
          type: 'scroll_stop',
          data: {},
          triggered: false
        },
        {
          position: 1900,
          type: 'boss',
          data: { bossType: 'first', x: 2200, y: 200 },
          triggered: false
        }
      ]
    };
  }

  public update(deltaTime: number): void {
    this.currentPosition = this.game.camera.x;
    this.checkEvents();
  }

  private checkEvents(): void {
    this.config.events.forEach(event => {
      if (!event.triggered && this.currentPosition >= event.position) {
        this.triggerEvent(event);
      }
    });
  }

  private triggerEvent(event: LevelEvent): void {
    event.triggered = true;

    switch (event.type) {
      case 'enemy':
        this.spawnEnemy(event.data);
        break;
      case 'boss':
        this.spawnBoss(event.data);
        break;
      case 'item':
        this.spawnItem(event.data);
        break;
      case 'scroll_stop':
        this.scrollStopped = true;
        break;
    }
  }

  private spawnEnemy(data: any): void {
    let enemy;
    
    switch (data.enemyType) {
      case 'patrol':
        enemy = new PatrolEnemy(this.game, data.x, data.y);
        break;
      case 'turret':
        enemy = new TurretEnemy(this.game, data.x, data.y);
        break;
      case 'flying':
        enemy = new FlyingEnemy(this.game, data.x, data.y);
        break;
    }

    if (enemy) {
      this.game.addEnemy(enemy);
    }
  }

  private spawnBoss(data: any): void {
    if (this.bossSpawned) return;
    this.bossSpawned = true;

    let boss;
    switch (data.bossType) {
      case 'first':
        boss = new FirstBoss(this.game, data.x, data.y);
        break;
    }

    if (boss) {
      this.game.addBoss(boss);
    }
  }

  private spawnItem(data: any): void {
    const item = new Item(this.game, data.x, data.y, data.itemType);
    this.game.addItem(item);
  }

  public isScrollStopped(): boolean {
    return this.scrollStopped;
  }

  public getProgress(): number {
    return Math.min(1, this.currentPosition / this.config.length);
  }

  public reset(): void {
    this.currentPosition = 0;
    this.bossSpawned = false;
    this.scrollStopped = false;
    this.config.events.forEach(event => event.triggered = false);
  }
}