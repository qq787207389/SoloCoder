export class GameLoop {
  private animationId: number | null = null;
  private lastTime: number = 0;
  private accumulator: number = 0;
  private fixedTimeStep: number = 1000 / 60;
  private updateCallback: (deltaTime: number) => void;
  private renderCallback: () => void;
  private isRunning: boolean = false;

  constructor(
    updateCallback: (deltaTime: number) => void,
    renderCallback: () => void
  ) {
    this.updateCallback = updateCallback;
    this.renderCallback = renderCallback;
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop();
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private loop(): void {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.accumulator += deltaTime;

    while (this.accumulator >= this.fixedTimeStep) {
      this.updateCallback(this.fixedTimeStep);
      this.accumulator -= this.fixedTimeStep;
    }

    this.renderCallback();

    this.animationId = requestAnimationFrame(() => this.loop());
  }

  public setFixedTimeStep(ms: number): void {
    this.fixedTimeStep = ms;
  }
}
