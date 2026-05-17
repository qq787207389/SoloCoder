import { GameObject } from './GameObject';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameObjects: GameObject[] = [];
  private lastTime: number = 0;
  private accumulator: number = 0;
  private fixedTimeStep: number = 1000 / 60;
  private animationFrameId: number | null = null;
  private isRunning: boolean = false;
  private onUpdateCallback: ((deltaTime: number) => void) | null = null;
  private onRenderCallback: (() => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');
    this.ctx = ctx;
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private gameLoop = (): void => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const frameTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.accumulator += frameTime;

    while (this.accumulator >= this.fixedTimeStep) {
      this.update(this.fixedTimeStep);
      this.accumulator -= this.fixedTimeStep;
    }

    this.render();
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    this.gameObjects = this.gameObjects.filter(obj => obj.isActive());
    for (const obj of this.gameObjects) {
      obj.update(deltaTime);
    }
    if (this.onUpdateCallback) {
      this.onUpdateCallback(deltaTime);
    }
  }

  private render(): void {
    if (this.onRenderCallback) {
      this.onRenderCallback();
    }
    for (const obj of this.gameObjects) {
      obj.render(this.ctx, 16);
    }
  }

  public addGameObject(obj: GameObject): void {
    this.gameObjects.push(obj);
  }

  public removeGameObject(obj: GameObject): void {
    const index = this.gameObjects.indexOf(obj);
    if (index !== -1) {
      this.gameObjects.splice(index, 1);
    }
  }

  public clearGameObjects(): void {
    this.gameObjects = [];
  }

  public getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  public setOnUpdate(callback: (deltaTime: number) => void): void {
    this.onUpdateCallback = callback;
  }

  public setOnRender(callback: () => void): void {
    this.onRenderCallback = callback;
  }

  public setFixedTimeStep(step: number): void {
    this.fixedTimeStep = step;
  }
}