export class Input {
  private keys: Map<string, boolean>;
  private keysPressed: Map<string, boolean>;

  constructor() {
    this.keys = new Map();
    this.keysPressed = new Map();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('keydown', (e) => {
      console.log('Key down:', e.code);
      if (!this.keys.get(e.code)) {
        this.keysPressed.set(e.code, true);
      }
      this.keys.set(e.code, true);
    });

    window.addEventListener('keyup', (e) => {
      console.log('Key up:', e.code);
      this.keys.set(e.code, false);
    });
  }

  public update(): void {
    this.keysPressed.clear();
  }

  public isKeyDown(code: string): boolean {
    return this.keys.get(code) || false;
  }

  public isKeyPressed(code: string): boolean {
    return this.keysPressed.get(code) || false;
  }

  public getAimDirection(): { x: number; y: number } {
    let dx = 0, dy = 0;
    if (this.isKeyDown('ArrowUp') || this.isKeyDown('KeyW')) dy = -1;
    if (this.isKeyDown('ArrowDown') || this.isKeyDown('KeyS')) dy = 1;
    if (this.isKeyDown('ArrowLeft') || this.isKeyDown('KeyA')) dx = -1;
    if (this.isKeyDown('ArrowRight') || this.isKeyDown('KeyD')) dx = 1;
    
    if (dx === 0 && dy === 0) {
      dx = 1;
    }
    
    const length = Math.sqrt(dx * dx + dy * dy);
    return { x: dx / length, y: dy / length };
  }
}