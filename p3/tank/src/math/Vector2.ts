export class Vector2 {
  constructor(
    public x: number = 0,
    public y: number = 0
  ) {}

  set(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  copy(v: Vector2): this {
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  add(v: Vector2): this {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  sub(v: Vector2): this {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  mul(s: number): this {
    this.x *= s;
    this.y *= s;
    return this;
  }

  div(s: number): this {
    if (s !== 0) {
      this.x /= s;
      this.y /= s;
    }
    return this;
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize(): this {
    const len = this.length();
    if (len > 0) {
      this.div(len);
    }
    return this;
  }

  distance(v: Vector2): number {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  dot(v: Vector2): number {
    return this.x * v.x + this.y * v.y;
  }

  angle(): number {
    return Math.atan2(this.y, this.x);
  }

  static add(a: Vector2, b: Vector2): Vector2 {
    return new Vector2(a.x + b.x, a.y + b.y);
  }

  static sub(a: Vector2, b: Vector2): Vector2 {
    return new Vector2(a.x - b.x, a.y - b.y);
  }

  static mul(v: Vector2, s: number): Vector2 {
    return new Vector2(v.x * s, v.y * s);
  }

  static distance(a: Vector2, b: Vector2): number {
    return a.distance(b);
  }
}
