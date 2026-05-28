import { GameConfig } from '@/config/GameConfig';

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

export function circleCollision(
  x1: number, y1: number, r1: number,
  x2: number, y2: number, r2: number
): boolean {
  const dist = distance(x1, y1, x2, y2);
  return dist < r1 + r2;
}

export function applyGravity(velocityY: number, delta: number): number {
  return velocityY + GameConfig.GRAVITY * (delta / 1000);
}

export function applyThrust(velocityY: number, thrust: number, delta: number): number {
  return velocityY + thrust * (delta / 1000);
}

export function applyAirResistance(velocity: number): number {
  return velocity * GameConfig.AIR_RESISTANCE;
}

export function applyHorizontalMovement(
  velocityX: number,
  direction: number,
  delta: number
): number {
  const targetVelocity = direction * GameConfig.MOVE_SPEED;
  const acceleration = GameConfig.MOVE_SPEED * 4 * (delta / 1000);
  
  if (velocityX < targetVelocity) {
    return Math.min(velocityX + acceleration, targetVelocity);
  } else if (velocityX > targetVelocity) {
    return Math.max(velocityX - acceleration, targetVelocity);
  }
  return velocityX;
}

export function constrainToBounds(
  x: number, y: number,
  radius: number,
  width: number, height: number
): { x: number; y: number } {
  return {
    x: clamp(x, radius, width - radius),
    y: clamp(y, radius, height - radius),
  };
}

export function wrapHorizontal(
  x: number,
  radius: number,
  width: number
): number {
  if (x < -radius) return width + radius;
  if (x > width + radius) return -radius;
  return x;
}

export function bounceOffVerticalBounds(
  x: number,
  velocityX: number,
  radius: number,
  width: number
): { x: number; velocityX: number } {
  let newX = x;
  let newVelX = velocityX;
  
  if (x < radius) {
    newX = radius;
    newVelX = Math.abs(velocityX) * 0.5;
  } else if (x > width - radius) {
    newX = width - radius;
    newVelX = -Math.abs(velocityX) * 0.5;
  }
  
  return { x: newX, velocityX: newVelX };
}
