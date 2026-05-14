interface Poolable {
  active: boolean;
  reset(): void;
}

export class ObjectPool<T extends Poolable> {
  private pool: T[];
  private createFn: () => T;
  private maxSize: number;

  constructor(createFn: () => T, initialSize: number = 10, maxSize: number = 100) {
    this.createFn = createFn;
    this.maxSize = maxSize;
    this.pool = [];
    this.expand(initialSize);
  }

  private expand(count: number): void {
    for (let i = 0; i < count && this.pool.length < this.maxSize; i++) {
      const obj = this.createFn();
      obj.active = false;
      this.pool.push(obj);
    }
  }

  public acquire(): T {
    let obj = this.pool.find(o => !o.active);
    if (!obj) {
      if (this.pool.length < this.maxSize) {
        obj = this.createFn();
        obj.active = false;
        this.pool.push(obj);
      } else {
        obj = this.pool[0];
        obj.active = false;
      }
    }
    obj.active = true;
    obj.reset();
    return obj;
  }

  public release(obj: T): void {
    obj.active = false;
    obj.reset();
  }

  public getActive(): T[] {
    return this.pool.filter(o => o.active);
  }

  public getAll(): T[] {
    return this.pool;
  }

  public clear(): void {
    this.pool.forEach(obj => {
      obj.active = false;
      obj.reset();
    });
  }
}