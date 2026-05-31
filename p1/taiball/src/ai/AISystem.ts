import type { Ball, GameState, Table, Difficulty, AIShot } from '../types/game';
import {
  AI_EASY_ERROR_ANGLE,
  AI_EASY_ERROR_POWER,
  AI_MEDIUM_ERROR_ANGLE,
  AI_MEDIUM_ERROR_POWER,
  AI_HARD_ERROR_ANGLE,
  AI_HARD_ERROR_POWER,
  AI_THINK_TIME,
} from '../config/constants';
import { distance, angleToPoint, normalizeAngle, randomRange } from '../utils/math';
import { RuleEngine } from '../rules/RuleEngine';

export class AISystem {
  private difficulty: Difficulty;
  private isThinking: boolean = false;
  private thinkTimer: number = 0;
  private currentShot: AIShot | null = null;

  constructor(difficulty: Difficulty = 'medium') {
    this.difficulty = difficulty;
  }

  setDifficulty(difficulty: Difficulty): void {
    this.difficulty = difficulty;
  }

  startThinking(): void {
    this.isThinking = true;
    this.thinkTimer = AI_THINK_TIME;
    this.currentShot = null;
  }

  update(
    deltaTime: number,
    balls: Ball[],
    state: GameState,
    table: Table,
    ruleEngine: RuleEngine
  ): AIShot | null {
    if (!this.isThinking) return null;

    this.thinkTimer -= deltaTime * 1000;

    if (this.thinkTimer <= 0 && !this.currentShot) {
      this.currentShot = this.calculateShot(balls, state, table, ruleEngine);
      this.isThinking = false;
    }

    return this.currentShot;
  }

  private calculateShot(
    balls: Ball[],
    state: GameState,
    table: Table,
    ruleEngine: RuleEngine
  ): AIShot {
    const cueBall = balls.find((b) => b.id === 0);
    if (!cueBall) {
      return { angle: 0, power: 0.5, targetBallId: -1 };
    }

    const targets = ruleEngine.getValidTargetBalls(balls, state);
    if (targets.length === 0) {
      return { angle: 0, power: 0.5, targetBallId: -1 };
    }

    let bestShot: AIShot | null = null;
    let bestScore = -Infinity;

    for (const target of targets) {
      const shots = this.generatePossibleShots(cueBall, target, table);
      
      for (const shot of shots) {
        const score = this.evaluateShot(shot, cueBall, target, table, state, ruleEngine);
        if (score > bestScore) {
          bestScore = score;
          bestShot = { ...shot, targetBallId: target.id };
        }
      }
    }

    if (!bestShot) {
      const nearestTarget = targets.reduce((nearest, b) => {
        const d1 = distance(cueBall.x, cueBall.y, nearest.x, nearest.y);
        const d2 = distance(cueBall.x, cueBall.y, b.x, b.y);
        return d2 < d1 ? b : nearest;
      });

      const angle = this.calculateAimAngle(cueBall, nearestTarget, table);
      bestShot = {
        angle,
        power: 0.6,
        targetBallId: nearestTarget.id,
      };
    }

    return this.applyError(bestShot);
  }

  private generatePossibleShots(
    cueBall: Ball,
    target: Ball,
    table: Table
  ): Array<{ angle: number; power: number }> {
    const shots: Array<{ angle: number; power: number }> = [];
    const baseAngle = this.calculateAimAngle(cueBall, target, table);

    for (let power = 0.3; power <= 1.0; power += 0.15) {
      shots.push({ angle: baseAngle, power });
    }

    if (this.difficulty === 'medium' || this.difficulty === 'hard') {
      const bankAngle = this.calculateBankShotAngle(cueBall, target, table);
      if (bankAngle !== null) {
        shots.push({ angle: bankAngle, power: 0.7 });
      }
    }

    return shots;
  }

  private calculateAimAngle(cueBall: Ball, target: Ball, table: Table): number {
    const pockets = table.pockets;
    let bestAngle = angleToPoint(cueBall.x, cueBall.y, target.x, target.y);
    let bestPocketDist = Infinity;

    for (const pocket of pockets) {
      const targetToPocket = angleToPoint(target.x, target.y, pocket.x, pocket.y);
      const aimOffset = Math.PI + targetToPocket;
      const aimX = target.x + Math.cos(aimOffset) * (target.radius + cueBall.radius);
      const aimY = target.y + Math.sin(aimOffset) * (target.radius + cueBall.radius);
      const angle = angleToPoint(cueBall.x, cueBall.y, aimX, aimY);
      
      const distToPocket = distance(target.x, target.y, pocket.x, pocket.y);
      if (distToPocket < bestPocketDist) {
        bestPocketDist = distToPocket;
        bestAngle = angle;
      }
    }

    return bestAngle;
  }

  private calculateBankShotAngle(
    cueBall: Ball,
    target: Ball,
    table: Table
  ): number | null {
    const { top, bottom } = table.playArea;
    const midY = (top + bottom) / 2;

    if (cueBall.y < midY && target.y < midY) {
      const reflectedY = top - (target.y - top);
      const angle = angleToPoint(cueBall.x, cueBall.y, target.x, reflectedY);
      return angle;
    } else if (cueBall.y > midY && target.y > midY) {
      const reflectedY = bottom + (bottom - target.y);
      const angle = angleToPoint(cueBall.x, cueBall.y, target.x, reflectedY);
      return angle;
    }

    return null;
  }

  private evaluateShot(
    shot: { angle: number; power: number },
    cueBall: Ball,
    target: Ball,
    table: Table,
    state: GameState,
    ruleEngine: RuleEngine
  ): number {
    let score = 0;

    const pockets = table.pockets;
    let minPocketDist = Infinity;
    for (const pocket of pockets) {
      const dist = distance(target.x, target.y, pocket.x, pocket.y);
      minPocketDist = Math.min(minPocketDist, dist);
    }
    score += Math.max(0, 500 - minPocketDist) * 0.1;

    const targetAngle = angleToPoint(cueBall.x, cueBall.y, target.x, target.y);
    const angleDiff = Math.abs(normalizeAngle(shot.angle - targetAngle));
    score -= angleDiff * 100;

    const dist = distance(cueBall.x, cueBall.y, target.x, target.y);
    score -= dist * 0.05;

    if (this.difficulty === 'hard') {
      const predictedPos = this.predictCueBallPosition(cueBall, shot, table);
      const nextTargets = ruleEngine.getValidTargetBalls(
        this.ballsAfterShot(target),
        state
      );
      if (nextTargets.length > 0) {
        const nextTarget = nextTargets[0];
        const nextDist = distance(predictedPos.x, predictedPos.y, nextTarget.x, nextTarget.y);
        score += Math.max(0, 300 - nextDist) * 0.05;
      }
    }

    score += randomRange(-10, 10);

    return score;
  }

  private predictCueBallPosition(
    cueBall: Ball,
    shot: { angle: number; power: number },
    table: Table
  ): { x: number; y: number } {
    const maxDist = shot.power * 300;
    let x = cueBall.x + Math.cos(shot.angle) * maxDist;
    let y = cueBall.y + Math.sin(shot.angle) * maxDist;

    const { left, right, top, bottom } = table.playArea;
    x = Math.max(left + cueBall.radius, Math.min(right - cueBall.radius, x));
    y = Math.max(top + cueBall.radius, Math.min(bottom - cueBall.radius, y));

    return { x, y };
  }

  private ballsAfterShot(pottedBall: Ball): Ball[] {
    const mockBalls: Ball[] = [];
    for (let i = 0; i <= 15; i++) {
      mockBalls.push({
        id: i,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        radius: 12,
        color: '',
        number: i,
        rotation: 0,
        isPotted: i === pottedBall.id,
        isStriped: i >= 9,
        type: i === 0 ? 'cue' : i === 8 ? 'eight' : i >= 9 ? 'stripe' : 'solid',
        isSleeping: false,
        squash: 0,
        pottedAnimation: 0,
        pocketX: 0,
        pocketY: 0,
        reset: () => {},
        setPocketPosition: () => {},
        render: () => {},
      });
    }
    return mockBalls;
  }

  private applyError(shot: AIShot): AIShot {
    let angleError = 0;
    let powerError = 0;

    switch (this.difficulty) {
      case 'easy':
        angleError = randomRange(-AI_EASY_ERROR_ANGLE, AI_EASY_ERROR_ANGLE);
        powerError = randomRange(-AI_EASY_ERROR_POWER, AI_EASY_ERROR_POWER);
        break;
      case 'medium':
        angleError = randomRange(-AI_MEDIUM_ERROR_ANGLE, AI_MEDIUM_ERROR_ANGLE);
        powerError = randomRange(-AI_MEDIUM_ERROR_POWER, AI_MEDIUM_ERROR_POWER);
        break;
      case 'hard':
        angleError = randomRange(-AI_HARD_ERROR_ANGLE, AI_HARD_ERROR_ANGLE);
        powerError = randomRange(-AI_HARD_ERROR_POWER, AI_HARD_ERROR_POWER);
        break;
    }

    return {
      ...shot,
      angle: normalizeAngle(shot.angle + angleError),
      power: Math.max(0.1, Math.min(1.0, shot.power + powerError)),
    };
  }

  reset(): void {
    this.isThinking = false;
    this.thinkTimer = 0;
    this.currentShot = null;
  }

  getIsThinking(): boolean {
    return this.isThinking;
  }

  getThinkProgress(): number {
    return 1 - this.thinkTimer / AI_THINK_TIME;
  }
}
