export class Vector2 {
  public x: number;
  public y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  add(v: Vector2): Vector2 {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  sub(v: Vector2): Vector2 {
    return new Vector2(this.x - v.x, this.y - v.y);
  }

  mul(scalar: number): Vector2 {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  div(scalar: number): Vector2 {
    if (scalar === 0) {
      throw new Error("Division by zero");
    }
    return new Vector2(this.x / scalar, this.y / scalar);
  }

  mag(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize(): Vector2 {
    const m = this.mag();
    if (m === 0) return new Vector2(0, 0);
    return this.div(m);
  }

  dot(v: Vector2): number {
    return this.x * v.x + this.y * v.y;
  }

  distance(v: Vector2): number {
    return this.sub(v).mag();
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  set(x: number, y: number): Vector2 {
    this.x = x;
    this.y = y;
    return this;
  }

  copy(v: Vector2): Vector2 {
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  static fromAngle(angle: number, length: number = 1): Vector2 {
    return new Vector2(Math.cos(angle) * length, Math.sin(angle) * length);
  }

  static zero(): Vector2 {
    return new Vector2(0, 0);
  }
}
