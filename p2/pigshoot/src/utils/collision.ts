export interface IEntity {
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
}

export function checkAABB(a: IEntity, b: IEntity): boolean {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

export function pointInRect(px: number, py: number, rect: IEntity): boolean {
  return px >= rect.x && px <= rect.x + rect.width &&
         py >= rect.y && py <= rect.y + rect.height;
}

export function circleRectCollision(
  cx: number, cy: number, radius: number,
  rect: IEntity
): boolean {
  const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.height));
  const distanceX = cx - closestX;
  const distanceY = cy - closestY;
  return (distanceX * distanceX + distanceY * distanceY) < (radius * radius);
}

export function circleCollision(
  x1: number, y1: number, r1: number,
  x2: number, y2: number, r2: number
): boolean {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return dx * dx + dy * dy < (r1 + r2) * (r1 + r2);
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return Math.sqrt(dx * dx + dy * dy);
}
