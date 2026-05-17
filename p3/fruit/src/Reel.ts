import { FRUITS, FRUIT_WEIGHTS, CELL_SIZE, CELL_PADDING } from './config';
import { FruitType } from './types';

export class Reel {
  private index: number;
  private symbols: FruitType[];
  private position: number = 0;
  private velocity: number = 0;
  private targetPosition: number = 0;
  private isSpinning: boolean = false;
  private isStopping: boolean = false;
  private symbolCount: number;

  constructor(index: number, symbolCount: number = 20) {
    this.index = index;
    this.symbolCount = symbolCount;
    this.symbols = this.generateSymbols(symbolCount);
  }

  private generateSymbols(count: number): FruitType[] {
    const symbols: FruitType[] = [];
    const fruitTypes = Object.keys(FRUIT_WEIGHTS) as FruitType[];
    const totalWeight = Object.values(FRUIT_WEIGHTS).reduce((a, b) => a + b, 0);

    for (let i = 0; i < count; i++) {
      let random = Math.random() * totalWeight;
      for (const fruit of fruitTypes) {
        random -= FRUIT_WEIGHTS[fruit];
        if (random <= 0) {
          symbols.push(fruit);
          break;
        }
      }
    }

    return symbols;
  }

  startSpin(): void {
    this.isSpinning = true;
    this.isStopping = false;
    this.velocity = 15 + Math.random() * 5;
  }

  prepareStop(): void {
    this.isStopping = true;
    const finalIndex = Math.floor(Math.random() * (this.symbols.length - 3));
    this.targetPosition = finalIndex * (CELL_SIZE + CELL_PADDING);
  }

  update(deltaTime: number): void {
    if (!this.isSpinning) return;

    const cellHeight = CELL_SIZE + CELL_PADDING;

    if (this.isStopping) {
      const diff = this.targetPosition - this.position;
      if (Math.abs(diff) < 0.5) {
        this.position = this.targetPosition;
        this.velocity = 0;
        this.isSpinning = false;
      } else {
        this.velocity = diff * 0.1;
      }
    } else {
      this.velocity *= 0.995;
    }

    this.position += this.velocity;
    this.position = this.position % (this.symbols.length * cellHeight);
    if (this.position < 0) {
      this.position += this.symbols.length * cellHeight;
    }
  }

  getVisibleSymbols(): FruitType[] {
    const cellHeight = CELL_SIZE + CELL_PADDING;
    const startIndex = Math.floor(this.position / cellHeight);
    const visible: FruitType[] = [];

    for (let i = 0; i < 3; i++) {
      const index = (startIndex + i) % this.symbols.length;
      visible.push(this.symbols[index]);
    }

    return visible;
  }

  getPosition(): number {
    return this.position;
  }

  getSymbols(): FruitType[] {
    return this.symbols;
  }

  isSpinningState(): boolean {
    return this.isSpinning;
  }

  isStoppingState(): boolean {
    return this.isStopping;
  }

  stop(): void {
    this.isSpinning = false;
    this.isStopping = false;
    this.velocity = 0;
  }

  reset(): void {
    this.symbols = this.generateSymbols(this.symbolCount);
    this.position = 0;
    this.velocity = 0;
    this.isSpinning = false;
    this.isStopping = false;
  }
}