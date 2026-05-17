import { Position } from '../types';

export abstract class GameObject {
  protected id: number;
  protected x: number;
  protected y: number;
  protected active: boolean = true;
  private static nextId: number = 0;

  constructor(x: number = 0, y: number = 0) {
    this.id = GameObject.nextId++;
    this.x = x;
    this.y = y;
  }

  public getId(): number {
    return this.id;
  }

  public getPosition(): Position {
    return { x: this.x, y: this.y };
  }

  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  public isActive(): boolean {
    return this.active;
  }

  public setActive(active: boolean): void {
    this.active = active;
  }

  public abstract update(deltaTime: number): void;
  public abstract render(ctx: CanvasRenderingContext2D, cellSize: number): void;

  public destroy(): void {
    this.active = false;
  }
}