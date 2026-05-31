import type { Ball, GameState, Table, BallType } from '../types/game';
import { RuleEngine, RuleResult } from './RuleEngine';
import { PHYSICS } from '../config/constants';

export class EightBall extends RuleEngine {
  constructor() {
    super('eight-ball');
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

    const positions: Array<{ id: number; row: number; col: number }> = [];
    
    const ballIds = [1, 2, 3, 4, 5, 6, 7, 9, 10, 11, 12, 13, 14, 15];
    const shuffled = [...ballIds].sort(() => Math.random() - 0.5);
    
    let idx = 0;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col <= row; col++) {
        if (row === 2 && col === 1) {
          positions.push({ id: 8, row, col });
        } else {
          positions.push({ id: shuffled[idx++], row, col });
        }
      }
    }

    for (const pos of positions) {
      const ball = balls.find((b) => b.id === pos.id);
      if (ball) {
        const x = triangleStartX + pos.row * r * 0.866;
        const y = triangleStartY + (pos.col - pos.row / 2) * r;
        ball.reset(x, y);
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

    const cueBall = this.getCueBall(balls);
    if (!cueBall) return result;

    if (state.cueBallPotted) {
      result.foul = '母球落袋！';
      return result;
    }

    if (state.firstHitBallId === null) {
      result.foul = '未击中任何球！';
      return result;
    }

    const playerType = state.currentPlayer === 1 ? state.player1Type : state.player2Type;
    const eightBall = balls.find((b) => b.id === 8);

    if (playerType === null) {
      if (state.firstHitBallId === 8) {
        if (eightBall?.isPotted) {
          result.foul = '开球时不能将黑八入袋！';
          return result;
        }
      }

      if (state.pottedThisShot.length > 0) {
        const firstPotted = state.pottedThisShot[0];
        const pottedBall = balls.find((b) => b.id === firstPotted);
        if (pottedBall && pottedBall.id !== 8) {
          const newType: 'solid' | 'stripe' = pottedBall.isStriped ? 'stripe' : 'solid';
          if (state.currentPlayer === 1) {
            state.player1Type = newType;
            state.player2Type = newType === 'solid' ? 'stripe' : 'solid';
          } else {
            state.player2Type = newType;
            state.player1Type = newType === 'solid' ? 'stripe' : 'solid';
          }
        }
      }
    } else {
      const firstHitBall = balls.find((b) => b.id === state.firstHitBallId);
      if (firstHitBall) {
        const hasCleared = this.hasPlayerClearedBalls(balls, state, state.currentPlayer);
        
        if (!hasCleared) {
          if (firstHitBall.id === 8) {
            result.foul = '必须先打完己方花色的球！';
            return result;
          }
          
          const expectedType = state.currentPlayer === 1 ? state.player1Type : state.player2Type;
          const hitType: BallType = firstHitBall.type;
          
          if (expectedType === 'solid' && hitType !== 'solid') {
            result.foul = '必须先击打到单色球！';
            return result;
          }
          if (expectedType === 'stripe' && hitType !== 'stripe') {
            result.foul = '必须先击打到花色球！';
            return result;
          }
        }
      }
    }

    if (eightBall?.isPotted) {
      const hasCleared = this.hasPlayerClearedBalls(balls, state, state.currentPlayer);
      if (hasCleared) {
        result.gameOver = true;
        result.winner = state.currentPlayer;
        return result;
      } else {
        result.foul = '黑八入袋时未清完己方球！';
        result.gameOver = true;
        result.winner = state.currentPlayer === 1 ? 2 : 1;
        return result;
      }
    }

    if (state.pottedThisShot.length > 0) {
      const allPottedAreValid = state.pottedThisShot.every((id) => {
        const ball = balls.find((b) => b.id === id);
        if (!ball || ball.id === 0) return false;
        if (ball.id === 8) return this.hasPlayerClearedBalls(balls, state, state.currentPlayer);
        if (playerType === null) return true;
        const ballType: 'solid' | 'stripe' = ball.isStriped ? 'stripe' : 'solid';
        return ballType === playerType;
      });

      if (allPottedAreValid) {
        result.continueTurn = true;
      }
    }

    return result;
  }

  getValidTargetBalls(balls: Ball[], state: GameState): Ball[] {
    const playerType = state.currentPlayer === 1 ? state.player1Type : state.player2Type;
    const hasCleared = this.hasPlayerClearedBalls(balls, state, state.currentPlayer);

    if (hasCleared) {
      return balls.filter((b) => b.id === 8 && !b.isPotted);
    }

    if (playerType === null) {
      return balls.filter((b) => b.id !== 0 && b.id !== 8 && !b.isPotted);
    }

    return this.getPlayerBalls(balls, state, state.currentPlayer);
  }
}
