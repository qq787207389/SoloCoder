import { RAINBOW_COLORS } from '../utils/Constants';
import { CollisionSystem, Rect } from '../game/CollisionSystem';

export enum ItemType {
  COIN = 'coin',
  GEM = 'gem',
  RARE_GEM = 'rare_gem',
  HEART = 'heart',
}

export interface Item extends Rect {
  type: ItemType;
  value: number;
  collected: boolean;
  bobOffset: number;
  bobTime: number;
  requiresRainbow: boolean;
}

export class ItemSystem {
  items: Item[];

  constructor() {
    this.items = [];
  }

  spawnItem(x: number, y: number, type: ItemType, requiresRainbow: boolean = false): void {
    let value: number;
    switch (type) {
      case ItemType.COIN:
        value = 100;
        break;
      case ItemType.GEM:
        value = 500;
        break;
      case ItemType.RARE_GEM:
        value = 2000;
        break;
      case ItemType.HEART:
        value = 0;
        break;
      default:
        value = 0;
    }

    this.items.push({
      x,
      y,
      w: 12,
      h: 12,
      type,
      value,
      collected: false,
      bobOffset: 0,
      bobTime: 0,
      requiresRainbow,
    });
  }

  update(dt: number): void {
    for (const item of this.items) {
      if (!item.collected) {
        item.bobTime += dt;
        item.bobOffset = Math.sin(item.bobTime * 3) * 2;
      }
    }
  }

  checkCollection(playerRect: {
    x: number;
    y: number;
    w: number;
    h: number;
  }): { collected: Item[]; totalScore: number; healAmount: number } {
    const collected: Item[] = [];
    let totalScore = 0;
    let healAmount = 0;

    for (const item of this.items) {
      if (!item.collected && CollisionSystem.aabb(playerRect, item)) {
        item.collected = true;
        collected.push(item);
        totalScore += item.value;
        if (item.type === ItemType.HEART) {
          healAmount += 1;
        }
      }
    }

    return { collected, totalScore, healAmount };
  }

  clearCollected(): void {
    this.items = this.items.filter((item) => !item.collected);
  }

  getItems(): Item[] {
    return this.items;
  }

  clear(): void {
    this.items = [];
  }
}
