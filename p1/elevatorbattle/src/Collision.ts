import { Rect, Vector2 } from './types';

export class Collision {
  public static rectIntersect(a: Rect, b: Rect): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  public static pointInRect(point: Vector2, rect: Rect): boolean {
    return (
      point.x >= rect.x &&
      point.x <= rect.x + rect.width &&
      point.y >= rect.y &&
      point.y <= rect.y + rect.height
    );
  }

  public static circleRectIntersect(
    cx: number,
    cy: number,
    radius: number,
    rect: Rect
  ): boolean {
    const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.height));
    const dx = cx - closestX;
    const dy = cy - closestY;
    return dx * dx + dy * dy < radius * radius;
  }

  public static raycast(
    startX: number,
    startY: number,
    dirX: number,
    dirY: number,
    maxDist: number,
    checkCollision: (x: number, y: number) => boolean
  ): { hit: boolean; distance: number; x: number; y: number } {
    const step = 2;
    let dist = 0;
    while (dist < maxDist) {
      const x = startX + dirX * dist;
      const y = startY + dirY * dist;
      if (checkCollision(x, y)) {
        return { hit: true, distance: dist, x, y };
      }
      dist += step;
    }
    return {
      hit: false,
      distance: maxDist,
      x: startX + dirX * maxDist,
      y: startY + dirY * maxDist,
    };
  }

  public static getOverlap(
    rect1: Rect,
    rect2: Rect
  ): { overlapX: number; overlapY: number } {
    const xOverlap = Math.min(
      rect1.x + rect1.width - rect2.x,
      rect2.x + rect2.width - rect1.x
    );
    const yOverlap = Math.min(
      rect1.y + rect1.height - rect2.y,
      rect2.y + rect2.height - rect1.y
    );
    return { overlapX: xOverlap, overlapY: yOverlap };
  }

  public static resolveCollision(
    entity: Rect & { vx: number; vy: number },
    solids: Rect[]
  ): void {
    for (const solid of solids) {
      if (this.rectIntersect(entity, solid)) {
        const { overlapX, overlapY } = this.getOverlap(entity, solid);

        if (overlapX < overlapY) {
          if (entity.vx > 0) {
            entity.x = solid.x - entity.width;
          } else if (entity.vx < 0) {
            entity.x = solid.x + solid.width;
          }
          entity.vx = 0;
        } else {
          if (entity.vy > 0) {
            entity.y = solid.y - entity.height;
          } else if (entity.vy < 0) {
            entity.y = solid.y + solid.height;
          }
          entity.vy = 0;
        }
      }
    }
  }

  public static sweepTest(
    entity: Rect,
    vx: number,
    vy: number,
    solids: Rect[],
    dt: number
  ): { newX: number; newY: number; collidedX: boolean; collidedY: boolean } {
    let newX = entity.x + vx * dt;
    let newY = entity.y + vy * dt;
    let collidedX = false;
    let collidedY = false;

    const testX = { ...entity, x: newX };
    for (const solid of solids) {
      if (this.rectIntersect(testX, solid)) {
        collidedX = true;
        break;
      }
    }

    if (collidedX) {
      newX = entity.x;
    }

    const testY = { ...entity, x: newX, y: newY };
    for (const solid of solids) {
      if (this.rectIntersect(testY, solid)) {
        collidedY = true;
        break;
      }
    }

    if (collidedY) {
      newY = entity.y;
    }

    return { newX, newY, collidedX, collidedY };
  }
}
