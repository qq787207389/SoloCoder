import type { Ball, GameState, GameMode, Table } from '../types/game';

export interface RuleResult {
  foul: string | null;
  continueTurn: boolean;
  gameOver: boolean;
  winner: 1 | 2 | null;
}

export abstract class RuleEngine {
  protected mode: GameMode;

  constructor(mode: GameMode) {
    this.mode = mode;
  }

  abstract evaluate(
    balls: Ball[],
    state: GameState,
    table: Table
  ): RuleResult;

  abstract getValidTargetBalls(balls: Ball[], state: GameState): Ball[];

  abstract setupBalls(balls: Ball[], table: Table): void;

  getCueBall(balls: Ball[]): Ball | undefined {
    return balls.find((b) => b.id === 0);
  }

  getLowestNumberedBall(balls: Ball[]): Ball | undefined {
    const validBalls = balls.filter((b) => !b.isPotted && b.id !== 0);
    if (validBalls.length === 0) return undefined;
    return validBalls.reduce((min, b) => (b.id < min.id ? b : min));
  }

  getPlayerBalls(balls: Ball[], state: GameState, player: 1 | 2): Ball[] {
    const playerType = player === 1 ? state.player1Type : state.player2Type;
    if (!playerType) return [];
    
    return balls.filter((b) => {
      if (b.id === 0 || b.id === 8) return false;
      if (playerType === 'solid') return !b.isStriped && !b.isPotted;
      return b.isStriped && !b.isPotted;
    });
  }

  hasPlayerClearedBalls(balls: Ball[], state: GameState, player: 1 | 2): boolean {
    return this.getPlayerBalls(balls, state, player).length === 0;
  }

  isEightBallPotted(balls: Ball[]): boolean {
    const eight = balls.find((b) => b.id === 8);
    return eight?.isPotted ?? false;
  }
}
