import { Rect } from './Constants';

export function aabb(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function rectOverlap(a: Rect, b: Rect): { x: number; y: number } {
  const overlapLeft = a.x + a.width - b.x;
  const overlapRight = b.x + b.width - a.x;
  const overlapTop = a.y + a.height - b.y;
  const overlapBottom = b.y + b.height - a.y;

  const px = overlapLeft < overlapRight ? -overlapLeft : overlapRight;
  const py = overlapTop < overlapBottom ? -overlapTop : overlapBottom;

  if (Math.abs(px) < Math.abs(py)) {
    return { x: px, y: 0 };
  }
  return { x: 0, y: py };
}

export function pointInRect(px: number, py: number, r: Rect): boolean {
  return px >= r.x && px <= r.x + r.width && py >= r.y && py <= r.y + r.height;
}
