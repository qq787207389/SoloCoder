import { Rect, Layer, ShurikenType } from '../utils/Constants';
import { aabb } from '../utils/Collision';

export interface ItemData {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'speed' | 'attack' | 'heal' | 'scroll';
  scrollType?: ShurikenType;
  layer: Layer;
  active: boolean;
  floatOffset: number;
}

interface SpriteRenderer {
  drawSprite(ctx: CanvasRenderingContext2D, name: string, x: number, y: number, flip?: boolean, scale?: number): void;
}

export class ItemManager {
  items: ItemData[] = [];
  private time = 0;

  spawnFromLevel(
    items: { type: string; x: number; y: number; layer: Layer }[],
    scrollItems: { type: ShurikenType; x: number; y: number; layer: Layer }[],
  ): void {
    for (const item of items) {
      let itemType: 'speed' | 'attack' | 'heal' = 'heal';
      if (item.type === 'green') itemType = 'heal';
      else if (item.type === 'red') itemType = 'attack';
      else if (item.type === 'white') itemType = 'speed';
      this.items.push({
        x: item.x,
        y: item.y,
        width: 10,
        height: 10,
        type: itemType,
        layer: item.layer,
        active: true,
        floatOffset: 0,
      });
    }
    for (const scroll of scrollItems) {
      this.items.push({
        x: scroll.x,
        y: scroll.y,
        width: 12,
        height: 12,
        type: 'scroll',
        scrollType: scroll.type,
        layer: scroll.layer,
        active: true,
        floatOffset: 0,
      });
    }
  }

  update(): void {
    this.time++;
    for (const item of this.items) {
      if (!item.active) continue;
      item.floatOffset = Math.sin(this.time * 0.05 + item.x * 0.1) * 3;
    }
  }

  checkPickup(playerRect: Rect, playerLayer: Layer): { type: string; scrollType?: ShurikenType }[] {
    const collected: { type: string; scrollType?: ShurikenType }[] = [];
    for (const item of this.items) {
      if (!item.active) continue;
      if (item.layer !== playerLayer) continue;
      const itemRect: Rect = { x: item.x, y: item.y + item.floatOffset, width: item.width, height: item.height };
      if (aabb(playerRect, itemRect)) {
        item.active = false;
        collected.push({ type: item.type, scrollType: item.scrollType });
      }
    }
    return collected;
  }

  render(ctx: CanvasRenderingContext2D, camera: { x: number; y: number }, spriteRenderer: SpriteRenderer): void {
    for (const item of this.items) {
      if (!item.active) continue;
      const sx = item.x - camera.x;
      const sy = item.y + item.floatOffset - camera.y;

      if (item.type === 'scroll') {
        ctx.fillStyle = 'rgba(218,165,32,0.4)';
        ctx.fillRect(sx - 2, sy - 2, item.width + 4, item.height + 4);
        ctx.strokeStyle = '#daa520';
        ctx.lineWidth = 1;
        ctx.strokeRect(sx - 1, sy - 1, item.width + 2, item.height + 2);
        spriteRenderer.drawSprite(ctx, 'scroll', sx, sy);
      } else {
        const spriteMap: Record<string, string> = {
          speed: 'orb_white',
          attack: 'orb_red',
          heal: 'orb_green',
        };
        const spriteName = spriteMap[item.type] || 'orb_white';
        const colors: Record<string, string> = {
          speed: '#00ccff',
          attack: '#ff4444',
          heal: '#44ff44',
        };
        const color = colors[item.type] || '#ffffff';
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(sx + item.width / 2, sy + item.height / 2, item.width * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        spriteRenderer.drawSprite(ctx, spriteName, sx, sy);
      }
    }
  }
}
