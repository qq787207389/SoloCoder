import type { Ball, Table } from '../types/game';
import { PHYSICS } from '../config/constants';
import { resolveBallCollision, resolveWallCollision, checkPocket, checkObstacleCollision } from './Collision';
import { getBallSpeed } from '../utils/math';

export interface PhysicsResult {
  ballCollisions: Array<{ b1: number; b2: number; speed: number }>;
  wallCollisions: Array<{ ballId: number; speed: number }>;
  pottedBalls: Array<{ ballId: number; pocketIndex: number }>;
  obstacleCollisions: Array<{ ballId: number; speed: number }>;
}

export class PhysicsEngine {
  private fixedDt: number = 1 / 60;
  private accumulator: number = 0;

  update(
    balls: Ball[],
    table: Table,
    deltaTime: number
  ): PhysicsResult {
    const result: PhysicsResult = {
      ballCollisions: [],
      wallCollisions: [],
      pottedBalls: [],
      obstacleCollisions: [],
    };

    this.accumulator += deltaTime;
    
    while (this.accumulator >= this.fixedDt) {
      this.step(balls, table, result);
      this.accumulator -= this.fixedDt;
    }

    for (const ball of balls) {
      if (ball.isPotted) continue;
      ball.squash *= 0.9;
    }

    return result;
  }

  private step(balls: Ball[], table: Table, result: PhysicsResult): void {
    for (const ball of balls) {
      if (ball.isPotted || ball.isSleeping) continue;

      ball.x += ball.vx;
      ball.y += ball.vy;

      const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
      if (speed > 0) {
        ball.rotation += speed / ball.radius;
      }

      ball.vx *= PHYSICS.FRICTION;
      ball.vy *= PHYSICS.FRICTION;

      if (getBallSpeed(ball) < PHYSICS.MIN_VELOCITY) {
        ball.vx = 0;
        ball.vy = 0;
        ball.isSleeping = true;
      }
    }

    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        if (resolveBallCollision(balls[i], balls[j])) {
          const impactSpeed = getBallSpeed(balls[i]) + getBallSpeed(balls[j]);
          result.ballCollisions.push({
            b1: balls[i].id,
            b2: balls[j].id,
            speed: impactSpeed,
          });
        }
      }
    }

    for (const ball of balls) {
      if (resolveWallCollision(ball, table)) {
        result.wallCollisions.push({
          ballId: ball.id,
          speed: getBallSpeed(ball),
        });
      }
    }

    if (table.obstacles.length > 0) {
      for (const ball of balls) {
        if (checkObstacleCollision(ball, table.obstacles)) {
          result.obstacleCollisions.push({
            ballId: ball.id,
            speed: getBallSpeed(ball),
          });
        }
      }
    }

    for (let i = 0; i < balls.length; i++) {
      const ball = balls[i];
      if (ball.isPotted) continue;
      
      const pocket = checkPocket(ball, table.pockets);
      if (pocket) {
        ball.isPotted = true;
        ball.vx = 0;
        ball.vy = 0;
        ball.isSleeping = true;
        result.pottedBalls.push({
          ballId: ball.id,
          pocketIndex: table.pockets.indexOf(pocket),
        });
      }
    }
  }

  areAllBallsSleeping(balls: Ball[]): boolean {
    return balls.every((ball) => ball.isPotted || ball.isSleeping);
  }

  wakeAllBalls(balls: Ball[]): void {
    for (const ball of balls) {
      if (!ball.isPotted) {
        ball.isSleeping = false;
      }
    }
  }
}
