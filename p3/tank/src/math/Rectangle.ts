import { Vector2 } from './Vector2';

export class Rectangle {
  public x: number;
  public y: number;
  public width: number;
  public height: number;

  constructor(x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  get left(): number { return this.x; }
  get right(): number { return this.x + this.width; }
  get top(): number { return this.y; }
  get bottom(): number { return this.y + this.height; }
  get centerX(): number { return this.x + this.width / 2; }
  get centerY(): number { return this.y + this.height / 2; }
  get center(): Vector2 { return new Vector2(this.centerX, this.centerY); }

  set(x: number, y: number, width: number, height: number): this {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    return this;
  }

  copy(r: Rectangle): this {
    this.x = r.x;
    this.y = r.y;
    this.width = r.width;
    this.height = r.height;
    return this;
  }

  clone(): Rectangle {
    return new Rectangle(this.x, this.y, this.width, this.height);
  }

  contains(x: number, y: number): boolean {
    return x >= this.left && x <= this.right && y >= this.top && y <= this.bottom;
  }

  containsPoint(v: Vector2): boolean {
    return this.contains(v.x, v.y);
  }

  intersects(r: Rectangle): boolean {
    return this.left < r.right && this.right > r.left && this.top < r.bottom && this.bottom > r.top;
  }

  intersection(r: Rectangle): Rectangle | null {
    if (!this.intersects(r)) return null;
    const x = Math.max(this.left, r.left);
    const y = Math.max(this.top, r.top);
    const width = Math.min(this.right, r.right) - x;
    const height = Math.min(this.bottom, r.bottom) - y;
    return new Rectangle(x, y, width, height);
  }

  merge(r: Rectangle): this {
    const x = Math.min(this.left, r.left);
    const y = Math.min(this.top, r.top);
    const width = Math.max(this.right, r.right) - x;
    const height = Math.max(this.bottom, r.bottom) - y;
    return this.set(x, y, width, height);
  }

  inflate(dx: number, dy: number): this {
    this.x -= dx;
    this.y -= dy;
    this.width += dx * 2;
    this.height += dy * 2;
    return this;
  }

  offset(dx: number, dy: number): this {
    this.x += dx;
    this.y += dy;
    return this;
  }

  offsetPoint(v: Vector2): this {
    return this.offset(v.x, v.y);
  }

  isEmpty(): boolean {
    return this.width <= 0 || this.height <= 0;
  }

  static fromPoints(points: Vector2[]): Rectangle {
    if (points.length === 0) return new Rectangle();
    let minX = points[0].x, maxX = points[0].x;
    let minY = points[0].y, maxY = points[0].y;
    for (let i = 1; i < points.length; i++) {
      minX = Math.min(minX, points[i].x);
      maxX = Math.max(maxX, points[i].x);
      minY = Math.min(minY, points[i].y);
      maxY = Math.max(maxY, points[i].y);
    }
    return new Rectangle(minX, minY, maxX - minX, maxY - minY);
  }
}
