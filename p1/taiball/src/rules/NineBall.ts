import type { Ball, GameState, Table } from '../types/game';
import { RuleEngine, RuleResult } from './RuleEngine';
import { PHYSICS } from '../config/constants';

export class NineBall extends RuleEngine {
  constructor() {
    super('nine-ball');
  }

  setupBalls(balls: Ball[], table: Table): void {
    const { left, right, top, bottom } = table.playArea;
    const cy = (top + bottom) / 2;

    const cueBall = balls.find((b) => b.id === 0);
    if (cueBall) {
      cueBall.reset(left + (right - left) * 0.25, cy);
    }

    const triangleStartX = left + (right - left) * 0.75;
    const triangleStartY = cy;
    const r = PHYSICS.BALL_RADIUS * 2.02;

    const diamondPositions: Record<number, { row: number; col: number }> = {
      1: { row: 0, col: 0 },
      9: { row: 2, col: 1 },
      2: { row: 4, col: 2 },
    };

    const remaining = [3, 4, 5, 6, 7, 8].sort(() => Math.random() - 0.5);
    let remainingIdx = 0;

    const allPositions: Array<{ id: number; row: number; col: number }> = [];
    
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col <= row; col++) {
        const fixedId = Object.entries(diamondPositions).find(
          ([, p]) => p.row === row && p.col === col
        );
        
        if (fixedId) {
          allPositions.push({ id: parseInt(fixedId[0]), row, col });
        } else if (remainingIdx < remaining.length) {
          allPositions.push({ id: remaining[remainingIdx++], row, col });
        }
      }
    }

    for (const pos of allPositions) {
      const ball = balls.find((b) => b.id === pos.id);
      if (ball) {
        const x = triangleStartX + pos.row * r * 0.866;
        const y = triangleStartY + (pos.col - pos.row / 2) * r;
        ball.reset(x, y);
      }
    }

    for (let i = 10; i <= 15; i++) {
      const ball = balls.find((b) => b.id === i);
      if (ball) {
        ball.isPotted = true;
      }
    }
  }

  evaluate(
    balls: Ball[],
    state: GameState,
    _table: Table
  ): RuleResult {
    const result: RuleResult = {
      foul: null,
      continueTurn: false,
      gameOver: false,
      winner: null,
    };

    if (state.cueBallPotted) {
      result.foul = '母球落袋！';
      return result;
    }

    if (state.firstHitBallId === null) {
      result.foul = '未击中任何球！';
      return result;
    }

    const lowest = this.getLowestNumberedBall(balls);
    if (lowest && state.firstHitBallId !== lowest.id) {
      result.foul = `必须先击打${lowest.id}号球！`;
      return result;
    }

    const nineBall = balls.find((b) => b.id === 9);
    if (nineBall?.isPotted) {
      const allOthersPotted = balls
        .filter((b) => b.id !== 0 && b.id !== 9 && b.id <= 9)
        .every((b) => b.isPotted);
      
      if (allOthersPotted || state.firstHitBallId === 9) {
        result.gameOver = true;
        result.winner = state.currentPlayer;
        return result;
      }
    }

    if (state.pottedThisShot.length > 0) {
      const lowest = this.getLowestNumberedBall(balls);
      const hitLowest = state.firstHitBallId === lowest?.id;
      if (hitLowest) {
        result.continueTurn = true;
      }
    }

    return result;
  }

  getValidTargetBalls(balls: Ball[], _state: GameState): Ball[] {
    const lowest = this.getLowestNumberedBall(balls);
    return lowest ? [lowest] : [];
  }
}
