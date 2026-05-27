export class RandomGenerator {
  private seed: number;

  constructor(seed?: number) {
    this.seed = seed || Date.now();
  }

  next(): number {
    this.seed = (this.seed * 1103515245 + 12345) & 0x7fffffff;
    return this.seed / 0x7fffffff;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  pick<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)];
  }

  chance(probability: number): boolean {
    return this.next() < probability;
  }

  reset(seed?: number) {
    this.seed = seed || Date.now();
  }
}

export const globalRandom = new RandomGenerator();
