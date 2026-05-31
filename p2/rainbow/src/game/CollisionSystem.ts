export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export class CollisionSystem {
  static aabb(a: Rect, b: Rect): boolean {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  static aabbSide(a: Rect, b: Rect): { hit: boolean; side: 'top' | 'bottom' | 'left' | 'right' | 'none' } {
    if (!CollisionSystem.aabb(a, b)) {
      return { hit: false, side: 'none' };
    }

    const overlapLeft = a.x + a.w - b.x;
    const overlapRight = b.x + b.w - a.x;
    const overlapTop = a.y + a.h - b.y;
    const overlapBottom = b.y + b.h - a.y;

    const minOverlapX = Math.min(overlapLeft, overlapRight);
    const minOverlapY = Math.min(overlapTop, overlapBottom);

    if (minOverlapX < minOverlapY) {
      return {
        hit: true,
        side: overlapLeft < overlapRight ? 'left' : 'right',
      };
    } else {
      return {
        hit: true,
        side: overlapTop < overlapBottom ? 'top' : 'bottom',
      };
    }
  }

  static pointInRect(px: number, py: number, rect: Rect): boolean {
    return (
      px >= rect.x &&
      px <= rect.x + rect.w &&
      py >= rect.y &&
      py <= rect.y + rect.h
    );
  }

  static lineIntersectsRect(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    rect: Rect
  ): boolean {
    const left = rect.x;
    const right = rect.x + rect.w;
    const top = rect.y;
    const bottom = rect.y + rect.h;

    if (CollisionSystem.pointInRect(x1, y1, rect) || CollisionSystem.pointInRect(x2, y2, rect)) {
      return true;
    }

    if (x1 === x2 && y1 === y2) return false;

    const dx = x2 - x1;
    const dy = y2 - y1;

    let tMin = 0;
    let tMax = 1;

    if (dx !== 0) {
      const t1 = (left - x1) / dx;
      const t2 = (right - x1) / dx;
      const tEnter = Math.min(t1, t2);
      const tExit = Math.max(t1, t2);
      tMin = Math.max(tMin, tEnter);
      tMax = Math.min(tMax, tExit);
      if (tMin > tMax) return false;
    } else {
      if (x1 < left || x1 > right) return false;
    }

    if (dy !== 0) {
      const t1 = (top - y1) / dy;
      const t2 = (bottom - y1) / dy;
      const tEnter = Math.min(t1, t2);
      const tExit = Math.max(t1, t2);
      tMin = Math.max(tMin, tEnter);
      tMax = Math.min(tMax, tExit);
      if (tMin > tMax) return false;
    } else {
      if (y1 < top || y1 > bottom) return false;
    }

    return tMin <= tMax;
  }

  static resolveOverlap(a: Rect, b: Rect): { dx: number; dy: number } {
    if (!CollisionSystem.aabb(a, b)) {
      return { dx: 0, dy: 0 };
    }

    const overlapLeft = a.x + a.w - b.x;
    const overlapRight = b.x + b.w - a.x;
    const overlapTop = a.y + a.h - b.y;
    const overlapBottom = b.y + b.h - a.y;

    const minOverlapX = Math.min(overlapLeft, overlapRight);
    const minOverlapY = Math.min(overlapTop, overlapBottom);

    if (minOverlapX < minOverlapY) {
      return {
        dx: overlapLeft < overlapRight ? -overlapLeft : overlapRight,
        dy: 0,
      };
    } else {
      return {
        dx: 0,
        dy: overlapTop < overlapBottom ? -overlapTop : overlapBottom,
      };
    }
  }
}
