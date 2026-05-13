import { PIECE_TYPES } from '../constants';
import { PieceType } from './Piece';

export class SevenBag {
  private bag: PieceType[];
  private nextBag: PieceType[];

  constructor() {
    this.bag = this.generateBag();
    this.nextBag = this.generateBag();
  }

  private generateBag(): PieceType[] {
    const bag = [...PIECE_TYPES];
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    return bag;
  }

  next(): PieceType {
    if (this.bag.length === 0) {
      this.bag = this.nextBag;
      this.nextBag = this.generateBag();
    }
    return this.bag.shift()!;
  }

  peek(count: number): PieceType[] {
    const result: PieceType[] = [];
    result.push(...this.bag);
    result.push(...this.nextBag);
    return result.slice(0, count);
  }

  reset(): void {
    this.bag = this.generateBag();
    this.nextBag = this.generateBag();
  }
}
