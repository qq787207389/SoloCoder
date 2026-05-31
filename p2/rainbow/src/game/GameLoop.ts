export class GameLoop {
  public running: boolean = false;
  public lastTime: number = 0;
  public accumulator: number = 0;
  public fixedTimeStep: number = 1 / 60;
  public updateCallback: (dt: number) => void;
  public renderCallback: (alpha: number) => void;

  constructor(updateCallback: (dt: number) => void, renderCallback: (alpha: number) => void) {
    this.updateCallback = updateCallback;
    this.renderCallback = renderCallback;
  }

  start(): void {
    this.running = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    requestAnimationFrame((timestamp) => this.loop(timestamp));
  }

  stop(): void {
    this.running = false;
  }

  loop(timestamp: number): void {
    if (!this.running) return;

    let deltaTime = (timestamp - this.lastTime) / 1000;
    deltaTime = Math.min(deltaTime, 0.25);
    this.lastTime = timestamp;

    this.accumulator += deltaTime;

    while (this.accumulator >= this.fixedTimeStep) {
      this.updateCallback(this.fixedTimeStep);
      this.accumulator -= this.fixedTimeStep;
    }

    const alpha = this.accumulator / this.fixedTimeStep;
    this.renderCallback(alpha);

    if (this.running) {
      requestAnimationFrame((t) => this.loop(t));
    }
  }
}
