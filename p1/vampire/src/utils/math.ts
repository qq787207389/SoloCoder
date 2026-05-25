
import { Vector2, Rect } from '../types';

export function distance(a: Vector2, b: Vector2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function normalize(v: Vector2): Vector2 {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

export function randomRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x &lt; b.x + b.width &amp;&amp;
         a.x + a.width &gt; b.x &amp;&amp;
         a.y &lt; b.y + b.height &amp;&amp;
         a.y + a.height &gt; b.y;
}

export function circleRectOverlap(cx: number, cy: number, radius: number, rect: Rect): boolean {
  const closestX = clamp(cx, rect.x, rect.x + rect.width);
  const closestY = clamp(cy, rect.y, rect.y + rect.height);
  const dx = cx - closestX;
  const dy = cy - closestY;
  return (dx * dx + dy * dy) &lt; (radius * radius);
}

export function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
