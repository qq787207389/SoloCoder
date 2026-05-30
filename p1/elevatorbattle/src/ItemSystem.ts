import { Item, ItemType, TILE_SIZE, Rect } from './types';
import { MapSystem } from './MapSystem';
import { Collision } from './Collision';
import { Player } from './Player';

export class ItemSystem {
  private items: Item[] = [];
  private nextId: number = 0;

  constructor() {}

  public initialize(mapSystem: MapSystem): void {
    this.items = [];

    const floors = mapSystem.getFloors();

    for (const floor of floors) {
      for (const spawn of floor.itemSpawns) {
        this.items.push({
          id: this.nextId++,
          type: spawn.type as ItemType,
          x: spawn.x * TILE_SIZE + TILE_SIZE / 2,
          y: spawn.y * TILE_SIZE + TILE_SIZE / 2,
          collected: false,
        });
      }
    }
  }

  public update(dt: number, player: Player, onPickup: (type: ItemType) => void): void {
    const playerRect = player.getRect();

    for (const item of this.items) {
      if (item.collected) continue;

      const itemRect: Rect = {
        x: item.x - TILE_SIZE * 0.3,
        y: item.y - TILE_SIZE * 0.3,
        width: TILE_SIZE * 0.6,
        height: TILE_SIZE * 0.6,
      };

      if (Collision.rectIntersect(playerRect, itemRect)) {
        item.collected = true;
        player.pickupItem(item.type);
        onPickup(item.type);
      }
    }
  }

  public getItems(): Item[] {
    return this.items.filter(i => !i.collected);
  }

  public getAllItems(): Item[] {
    return this.items;
  }

  public spawnItem(x: number, y: number, type: ItemType): void {
    this.items.push({
      id: this.nextId++,
      type,
      x: x * TILE_SIZE + TILE_SIZE / 2,
      y: y * TILE_SIZE + TILE_SIZE / 2,
      collected: false,
    });
  }
}
