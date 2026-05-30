export class Input {
  private keys: Map<string, boolean> = new Map();
  private keysPressed: Map<string, boolean> = new Map();
  private keysReleased: Map<string, boolean> = new Map();

  constructor() {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const key = e.code;
    if (!this.keys.get(key)) {
      this.keysPressed.set(key, true);
    }
    this.keys.set(key, true);
    e.preventDefault();
  }

  private handleKeyUp(e: KeyboardEvent): void {
    const key = e.code;
    this.keys.set(key, false);
    this.keysReleased.set(key, true);
    e.preventDefault();
  }

  public update(): void {
    this.keysPressed.clear();
    this.keysReleased.clear();
  }

  public isKeyDown(key: string): boolean {
    return this.keys.get(key) ?? false;
  }

  public isKeyPressed(key: string): boolean {
    return this.keysPressed.get(key) ?? false;
  }

  public isKeyReleased(key: string): boolean {
    return this.keysReleased.get(key) ?? false;
  }

  public isLeft(): boolean {
    return this.isKeyDown('ArrowLeft') || this.isKeyDown('KeyA');
  }

  public isRight(): boolean {
    return this.isKeyDown('ArrowRight') || this.isKeyDown('KeyD');
  }

  public isUp(): boolean {
    return this.isKeyDown('ArrowUp') || this.isKeyDown('KeyW');
  }

  public isDown(): boolean {
    return this.isKeyDown('ArrowDown') || this.isKeyDown('KeyS');
  }

  public isShoot(): boolean {
    return this.isKeyPressed('KeyJ') || this.isKeyPressed('Space');
  }

  public isKick(): boolean {
    return this.isKeyPressed('KeyK');
  }

  public isInteract(): boolean {
    return this.isKeyPressed('KeyF') || this.isKeyPressed('Enter');
  }

  public isElevatorUp(): boolean {
    return this.isKeyPressed('KeyQ');
  }

  public isElevatorDown(): boolean {
    return this.isKeyPressed('KeyE');
  }

  public isPause(): boolean {
    return this.isKeyPressed('Escape') || this.isKeyPressed('KeyP');
  }

  public isRestart(): boolean {
    return this.isKeyPressed('KeyR');
  }

  public isStart(): boolean {
    return this.isKeyPressed('Enter') || this.isKeyPressed('Space');
  }
}
