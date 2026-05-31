import type { Ball, Table, Pocket } from '../types/game';
import { PHYSICS } from '../config/constants';
import { distance, pointToLineDistance } from '../utils/math';

export function checkBallCollision(b1: Ball, b2: Ball): boolean {
  if (b1.isPotted || b2.isPotted) return false;
  const dist = distance(b1.x, b1.y, b2.x, b2.y);
  return dist < b1.radius + b2.radius;
}

export function resolveBallCollision(b1: Ball, b2: Ball): boolean {
  if (b1.isPotted || b2.isPotted) return false;
  
  const dx = b2.x - b1.x;
  const dy = b2.y - b1.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const minDist = b1.radius + b2.radius;
  
  if (dist >= minDist) return false;
  
  const nx = dx / dist;
  const ny = dy / dist;
  const tx = -ny;
  const ty = nx;
  
  const v1n = b1.vx * nx + b1.vy * ny;
  const v2n = b2.vx * nx + b2.vy * ny;
  const v1t = b1.vx * tx + b1.vy * ty;
  const v2t = b2.vx * tx + b2.vy * ty;
  
  const v1nAfter = v2n * PHYSICS.RESTITUTION_BALL;
  const v2nAfter = v1n * PHYSICS.RESTITUTION_BALL;
  
  b1.vx = v1nAfter * nx + v1t * tx;
  b1.vy = v1nAfter * ny + v1t * ty;
  b2.vx = v2nAfter * nx + v2t * tx;
  b2.vy = v2nAfter * ny + v2t * ty;
  
  const overlap = (minDist - dist) / 2;
  b1.x -= overlap * nx;
  b1.y -= overlap * ny;
  b2.x += overlap * nx;
  b2.y += overlap * ny;
  
  b1.isSleeping = false;
  b2.isSleeping = false;
  
  const impactSpeed = Math.abs(v1n - v2n);
  if (impactSpeed > 0.5) {
    b1.squash = Math.min(1, impactSpeed / 15);
    b2.squash = Math.min(1, impactSpeed / 15);
  }
  
  return true;
}

export function resolveWallCollision(ball: Ball, table: Table): boolean {
  if (ball.isPotted) return false;
  
  const { left, right, top, bottom } = table.playArea;
  let collided = false;
  
  if (table.walls.length === 0) {
    if (ball.x - ball.radius < left) {
      ball.x = left + ball.radius;
      ball.vx = -ball.vx * PHYSICS.RESTITUTION_WALL;
      collided = true;
    } else if (ball.x + ball.radius > right) {
      ball.x = right - ball.radius;
      ball.vx = -ball.vx * PHYSICS.RESTITUTION_WALL;
      collided = true;
    }
    
    if (ball.y - ball.radius < top) {
      ball.y = top + ball.radius;
      ball.vy = -ball.vy * PHYSICS.RESTITUTION_WALL;
      collided = true;
    } else if (ball.y + ball.radius > bottom) {
      ball.y = bottom - ball.radius;
      ball.vy = -ball.vy * PHYSICS.RESTITUTION_WALL;
      collided = true;
    }
  } else {
    for (const wall of table.walls) {
      const d = pointToLineDistance(ball.x, ball.y, wall.x1, wall.y1, wall.x2, wall.y2);
      if (d < ball.radius) {
        const dx = wall.x2 - wall.x1;
        const dy = wall.y2 - wall.y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        let nx = -dy / len;
        let ny = dx / len;
        
        const midX = (wall.x1 + wall.x2) / 2;
        const midY = (wall.y1 + wall.y2) / 2;
        const toCenterX = ball.x - midX;
        const toCenterY = ball.y - midY;
        if (toCenterX * nx + toCenterY * ny < 0) {
          nx = -nx;
          ny = -ny;
        }
        
        const overlap = ball.radius - d;
        ball.x += nx * overlap;
        ball.y += ny * overlap;
        
        const dot = ball.vx * nx + ball.vy * ny;
        if (dot < 0) {
          ball.vx -= 2 * dot * nx * PHYSICS.RESTITUTION_WALL;
          ball.vy -= 2 * dot * ny * PHYSICS.RESTITUTION_WALL;
          collided = true;
        }
      }
    }
  }
  
  if (collided) {
    ball.isSleeping = false;
  }
  
  return collided;
}

export function checkPocket(ball: Ball, pockets: Pocket[]): Pocket | null {
  if (ball.isPotted) return null;
  
  for (const pocket of pockets) {
    const dist = distance(ball.x, ball.y, pocket.x, pocket.y);
    if (dist < pocket.radius * 0.85) {
      return pocket;
    }
  }
  return null;
}

export function checkObstacleCollision(ball: Ball, obstacles: { x: number; y: number; radius: number }[]): boolean {
  if (ball.isPotted) return false;
  
  let collided = false;
  for (const obs of obstacles) {
    const dx = ball.x - obs.x;
    const dy = ball.y - obs.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = ball.radius + obs.radius;
    
    if (dist < minDist) {
      const nx = dx / dist;
      const ny = dy / dist;
      
      const dot = ball.vx * nx + ball.vy * ny;
      if (dot < 0) {
        ball.vx -= 2 * dot * nx * PHYSICS.RESTITUTION_WALL;
        ball.vy -= 2 * dot * ny * PHYSICS.RESTITUTION_WALL;
      }
      
      const overlap = minDist - dist;
      ball.x += nx * overlap;
      ball.y += ny * overlap;
      
      ball.isSleeping = false;
      collided = true;
    }
  }
  
  return collided;
}

export function checkBallOverlap(balls: Ball[]): boolean {
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      if (balls[i].isPotted || balls[j].isPotted) continue;
      const dist = distance(balls[i].x, balls[i].y, balls[j].x, balls[j].y);
      if (dist < balls[i].radius + balls[j].radius) {
        return true;
      }
    }
  }
  return false;
}
