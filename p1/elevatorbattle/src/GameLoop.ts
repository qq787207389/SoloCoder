export abstract class GameLoop {
  private lastTime: number = 0;
  private accumulator: number = 0;
  private fixedTimeStep: number = 1000 / 60;
  private animationFrameId: number | null = null;
  private isRunning: boolean = false;
  private isPaused: boolean = false;

  protected abstract update(dt: number): void;
  protected abstract render(alpha: number): void;

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.loop();
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    this.isPaused = false;
    this.lastTime = performance.now();
  }

  private loop(): void {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    let frameTime = currentTime - this.lastTime;

    if (frameTime > 250) {
      frameTime = 250;
    }

    this.lastTime = currentTime;

    if (!this.isPaused) {
      this.accumulator += frameTime;

      while (this.accumulator >= this.fixedTimeStep) {
        this.update(this.fixedTimeStep / 1000);
        this.accumulator -= this.fixedTimeStep;
      }
    }

    const alpha = this.accumulator / this.fixedTimeStep;
    this.render(alpha);

    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }

  public setFixedTimeStep(fps: number): void {
    this.fixedTimeStep = 1000 / fps;
  }
}
