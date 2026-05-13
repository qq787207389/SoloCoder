import { Piece } from './Piece';
import { Board } from './Board';
import { WALL_KICKS } from '../constants';

export class RotationSystem {
  static rotate(piece: Piece, direction: 1 | -1): number[][] {
    const shape = piece.shape;
    const size = shape.length;
    const newShape: number[][] = Array.from({ length: size }, () => Array(size).fill(0));

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (direction === 1) {
          newShape[x][size - 1 - y] = shape[y][x];
        } else {
          newShape[size - 1 - x][y] = shape[y][x];
        }
      }
    }

    return newShape;
  }

  static tryRotate(board: Board, piece: Piece, direction: 1 | -1): {
    success: boolean;
    offset: { x: number; y: number };
    kickIndex: number;
  } {
    const newShape = this.rotate(piece, direction);
    const testPiece = piece.clone();
    testPiece.shape = newShape;

    const kickTable = this.getKickTable(piece);
    const fromState = piece.rotation;
    const toState = (piece.rotation + direction + 4) % 4;

    const kicks = kickTable[fromState];

    for (let i = 0; i < kicks.length; i++) {
      const [kickX, kickY] = kicks[i];
      testPiece.x = piece.x + kickX;
      testPiece.y = piece.y - kickY;

      if (board.isValidPosition(testPiece)) {
        piece.shape = newShape;
        piece.x = testPiece.x;
        piece.y = testPiece.y;
        piece.rotation = toState;
        return { success: true, offset: { x: kickX, y: -kickY }, kickIndex: i };
      }
    }

    return { success: false, offset: { x: 0, y: 0 }, kickIndex: -1 };
  }

  private static getKickTable(piece: Piece): number[][][] {
    if (piece.type === 'I') {
      return WALL_KICKS.I;
    } else if (piece.type === 'O') {
      return WALL_KICKS.O;
    } else {
      return WALL_KICKS.JLSTZ;
    }
  }
}
