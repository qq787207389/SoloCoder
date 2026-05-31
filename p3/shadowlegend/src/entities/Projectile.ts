import { Rect, Direction, ShurikenType, SHURIKEN_SPEED } from '../utils/Constants';

export interface ProjectileData {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  active: boolean;
  friendly: boolean;
  type: 'shuriken' | 'enemy_shuriken' | 'fireball';
  shurikenType: ShurikenType;
  piercing: boolean;
  spread: boolean;
  life: number;
}

interface SpriteRenderer {
  drawSprite(ctx: CanvasRenderingContext2D, name: string, x: number, y: number, flip?: boolean, scale?: number): void;
}

export class ProjectileManager {
  projectiles: ProjectileData[] = [];

  spawnShuriken(x: number, y: number, direction: Direction, shurikenType: ShurikenType): void {
    const dir = direction === 'right' ? 1 : -1;
    if (shurikenType === 'spread') {
      const angles = [-15, 0, 15];
      for (const angle of angles) {
        const rad = (angle * Math.PI) / 180;
        this.projectiles.push({
          x,
          y: y - 2,
          vx: Math.cos(rad) * SHURIKEN_SPEED * dir,
          vy: Math.sin(rad) * SHURIKEN_SPEED,
          width: 6,
          height: 6,
          active: true,
          friendly: true,
          type: 'shuriken',
          shurikenType: 'spread',
          piercing: false,
          spread: true,
          life: 120,
        });
      }
    } else {
      this.projectiles.push({
        x,
        y: y - 2,
        vx: SHURIKEN_SPEED * dir,
        vy: 0,
        width: 6,
        height: 6,
        active: true,
        friendly: true,
        type: 'shuriken',
        shurikenType,
        piercing: shurikenType === 'piercing',
        spread: false,
        life: 120,
      });
    }
  }

  spawnEnemyProjectile(x: number, y: number, vx: number, vy: number, type: 'enemy_shuriken' | 'fireball'): void {
    this.projectiles.push({
      x,
      y,
      vx,
      vy,
      width: type === 'fireball' ? 8 : 6,
      height: type === 'fireball' ? 8 : 6,
      active: true,
      friendly: false,
      type,
      shurikenType: 'normal',
      piercing: false,
      spread: false,
      life: 180,
    });
  }

  update(tileMap: { getTileAt(worldX: number, worldY: number): number }): void {
    for (const p of this.projectiles) {
      if (!p.active) continue;

      p.x += p.vx;
      p.y += p.vy;
      p.life--;

      if (p.type === 'fireball') {
        p.vy += 0.05;
      }

      if (p.life <= 0) {
        p.active = false;
        continue;
      }

      const tile = tileMap.getTileAt(p.x + p.width / 2, p.y + p.height / 2);
      if (tile === 1) {
        if (!p.piercing) {
          p.active = false;
        }
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, camera: { x: number; y: number }, spriteRenderer: SpriteRenderer): void {
    for (const p of this.projectiles) {
      if (!p.active) continue;
      const sx = p.x - camera.x;
      const sy = p.y - camera.y;
      const flip = p.vx < 0;
      spriteRenderer.drawSprite(ctx, p.type, sx, sy, flip, 2);
    }
  }

  getRect(p: ProjectileData): Rect {
    return { x: p.x, y: p.y, width: p.width, height: p.height };
  }
}
