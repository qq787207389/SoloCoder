import { Piece } from './Piece';
import { Board } from './Board';

export type TSpinType = 'none' | 'mini' | 'full';

export class TSpinDetector {
  static detect(piece: Piece, board: Board, lastKickIndex: number, wasRotated: boolean): TSpinType {
    if (piece.type !== 'T' || !wasRotated) {
      return 'none';
    }

    const centerX = piece.x + 1;
    const centerY = piece.y + 1;

    const cornerPositions = [
      { x: centerX - 1, y: centerY - 1 },
      { x: centerX + 1, y: centerY - 1 },
      { x: centerX - 1, y: centerY + 1 },
      { x: centerX + 1, y: centerY + 1 }
    ];

    let filledCorners = 0;
    for (const pos of cornerPositions) {
      if (pos.x < 0 || pos.x >= board.width || pos.y >= board.height) {
        filledCorners++;
      } else if (pos.y >= 0 && board.grid[pos.y][pos.x].filled) {
        filledCorners++;
      }
    }

    if (filledCorners >= 3) {
      if (lastKickIndex === 4) {
        return 'full';
      }

      const frontCorners = this.getFrontCorners(piece, centerX, centerY);
      let filledFrontCorners = 0;
      for (const pos of frontCorners) {
        if (pos.x < 0 || pos.x >= board.width || pos.y >= board.height) {
          filledFrontCorners++;
        } else if (pos.y >= 0 && board.grid[pos.y][pos.x].filled) {
          filledFrontCorners++;
        }
      }

      if (filledFrontCorners >= 2) {
        return 'full';
      } else {
        return 'mini';
      }
    }

    return 'none';
  }

  private static getFrontCorners(piece: Piece, centerX: number, centerY: number): { x: number; y: number }[] {
    switch (piece.rotation) {
      case 0:
        return [
          { x: centerX - 1, y: centerY - 1 },
          { x: centerX + 1, y: centerY - 1 }
        ];
      case 1:
        return [
          { x: centerX + 1, y: centerY - 1 },
          { x: centerX + 1, y: centerY + 1 }
        ];
      case 2:
        return [
          { x: centerX - 1, y: centerY + 1 },
          { x: centerX + 1, y: centerY + 1 }
        ];
      case 3:
        return [
          { x: centerX - 1, y: centerY - 1 },
          { x: centerX - 1, y: centerY + 1 }
        ];
      default:
        return [];
    }
  }

  static getTSpinName(tSpinType: TSpinType, linesCleared: number): string | null {
    if (tSpinType === 'none') {
      return null;
    }

    if (tSpinType === 'full') {
      if (linesCleared === 0) return 'T_SPIN';
      if (linesCleared === 1) return 'T_SPIN_SINGLE';
      if (linesCleared === 2) return 'T_SPIN_DOUBLE';
      if (linesCleared === 3) return 'T_SPIN_TRIPLE';
    }

    if (tSpinType === 'mini') {
      if (linesCleared === 0) return 'T_SPIN_MINI';
      if (linesCleared === 1) return 'T_SPIN_MINI_SINGLE';
      if (linesCleared === 2) return 'T_SPIN_MINI_DOUBLE';
    }

    return null;
  }
}
