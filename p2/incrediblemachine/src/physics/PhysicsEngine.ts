import Matter from 'matter-js';

export class PhysicsEngine {
  private engine: Matter.Engine;
  private world: Matter.World;
  private runner: Matter.Runner;
  private isRunning: boolean = false;
  private fixedDelta: number = 1000 / 60;
  private accumulator: number = 0;
  private lastTime: number = 0;

  constructor() {
    this.engine = Matter.Engine.create({
      enableSleeping: false,
      gravity: {
        x: 0,
        y: 1,
        scale: 0.001
      }
    });
    
    this.world = this.engine.world;
    this.runner = Matter.Runner.create({
      delta: this.fixedDelta,
      isFixed: true
    });
    
    Matter.Runner.run(this.runner, this.engine);
  }

  getWorld(): Matter.World {
    return this.world;
  }

  getEngine(): Matter.Engine {
    return this.engine;
  }

  addBody(body: Matter.Body): void {
    Matter.Composite.add(this.world, body);
  }

  removeBody(body: Matter.Body): void {
    Matter.Composite.remove(this.world, body);
  }

  addConstraint(constraint: Matter.Constraint): void {
    Matter.Composite.add(this.world, constraint);
  }

  removeConstraint(constraint: Matter.Constraint): void {
    Matter.Composite.remove(this.world, constraint);
  }

  clear(): void {
    Matter.Composite.clear(this.world, false, true);
  }

  start(): void {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.resetEngineState();
  }

  stop(): void {
    this.isRunning = false;
  }

  private resetEngineState(): void {
    const allBodies = Matter.Composite.allBodies(this.world);
    allBodies.forEach(body => {
      Matter.Body.setVelocity(body, { x: 0, y: 0 });
      Matter.Body.setAngularVelocity(body, 0);
      if (body.isSleeping) {
        Matter.Sleeping.set(body, false);
      }
    });
  }

  update(currentTime: number): void {
    if (!this.isRunning) return;

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    this.accumulator += deltaTime;
    
    while (this.accumulator >= this.fixedDelta) {
      Matter.Engine.update(this.engine, this.fixedDelta);
      this.accumulator -= this.fixedDelta;
    }
  }

  getInterpolationAlpha(): number {
    return this.accumulator / this.fixedDelta;
  }

  setGravity(x: number, y: number): void {
    this.engine.gravity.x = x;
    this.engine.gravity.y = y;
  }

  destroy(): void {
    Matter.Runner.stop(this.runner);
    Matter.Engine.clear(this.engine);
  }
}
