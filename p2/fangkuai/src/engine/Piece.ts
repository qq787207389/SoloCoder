import { SHAPES, PIECE_TYPES, COLORS, BOARD_WIDTH, BOARD_HEIGHT } from '../constants';

export type PieceType = typeof PIECE_TYPES[number];

export class Piece {
  type: PieceType;
  shape: number[][];
  rotation: number;
  x: number;
  y: number;

  constructor(type: PieceType) {
    this.type = type;
    this.shape = SHAPES[type].map(row => [...row]);
    this.rotation = 0;
    this.x = Math.floor(BOARD_WIDTH / 2) - Math.floor(this.shape[0].length / 2);
    this.y = BOARD_HEIGHT - 22;
  }

  get color(): string {
    return COLORS[this.type];
  }

  clone(): Piece {
    const piece = new Piece(this.type);
    piece.rotation = this.rotation;
    piece.x = this.x;
    piece.y = this.y;
    piece.shape = this.shape.map(row => [...row]);
    return piece;
  }

  getWidth(): number {
    return this.shape[0].length;
  }

  getHeight(): number {
    return this.shape.length;
  }

  getBlocks(): { x: number; y: number }[] {
    const blocks: { x: number; y: number }[] = [];
    for (let y = 0; y < this.shape.length; y++) {
      for (let x = 0; x < this.shape[y].length; x++) {
        if (this.shape[y][x]) {
          blocks.push({ x: this.x + x, y: this.y + y });
        }
      }
    }
    return blocks;
  }
}
