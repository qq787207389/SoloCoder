import { Vector2 } from '../math/Vector2';
import { Rectangle } from '../math/Rectangle';

export abstract class GameObject {
  public id: string;
  public position: Vector2;
  public velocity: Vector2;
  public bounds: Rectangle;
  public active: boolean = true;
  public layer: number = 0;

  constructor(x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
    this.id = this.generateId();
    this.position = new Vector2(x, y);
    this.velocity = new Vector2();
    this.bounds = new Rectangle(x, y, width, height);
  }

  private generateId(): string {
    return 'obj_' + Math.random().toString(36).substr(2, 9);
  }

  abstract update(deltaTime: number): void;
  abstract render(ctx: CanvasRenderingContext2D): void;

  updateBounds(): void {
    this.bounds.x = this.position.x;
    this.bounds.y = this.position.y;
  }

  getCenter(): Vector2 {
    return this.bounds.center;
  }

  intersects(other: GameObject): boolean {
    return this.bounds.intersects(other.bounds);
  }

  destroy(): void {
    this.active = false;
  }
}
