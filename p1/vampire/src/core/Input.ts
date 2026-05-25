
export class InputManager {
  private keys: Map&lt;string, boolean&gt; = new Map();

  constructor() {
    window.addEventListener('keydown', (e) =&gt; this.onKeyDown(e));
    window.addEventListener('keyup', (e) =&gt; this.onKeyUp(e));
  }

  private onKeyDown(e: KeyboardEvent): void {
    this.keys.set(e.code, true);
  }

  private onKeyUp(e: KeyboardEvent): void {
    this.keys.set(e.code, false);
  }

  isKeyDown(code: string): boolean {
    return this.keys.get(code) || false;
  }

  getAxis(negative: string, positive: string): number {
    let axis = 0;
    if (this.isKeyDown(negative)) axis -= 1;
    if (this.isKeyDown(positive)) axis += 1;
    return axis;
  }

  getMovement(): { x: number; y: number } {
    return {
      x: this.getAxis('KeyA', 'KeyD') || this.getAxis('ArrowLeft', 'ArrowRight'),
      y: this.getAxis('KeyW', 'KeyS') || this.getAxis('ArrowUp', 'ArrowDown')
    };
  }
}
