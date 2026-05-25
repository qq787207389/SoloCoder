
export class ObjectPool&lt;T extends { active: boolean }&gt; {
  private pool: T[] = [];
  private createFn: () =&gt; T;

  constructor(createFn: () =&gt; T, initialSize: number = 50) {
    this.createFn = createFn;
    for (let i = 0; i &lt; initialSize; i++) {
      const obj = createFn();
      obj.active = false;
      this.pool.push(obj);
    }
  }

  get(): T {
    let obj = this.pool.find(o =&gt; !o.active);
    if (!obj) {
      obj = this.createFn();
      obj.active = false;
      this.pool.push(obj);
    }
    obj.active = true;
    return obj;
  }

  release(obj: T): void {
    obj.active = false;
  }

  getAllActive(): T[] {
    return this.pool.filter(o =&gt; o.active);
  }

  getAll(): T[] {
    return this.pool;
  }
}
