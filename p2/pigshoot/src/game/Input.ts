export interface InputState {
  up: boolean;
  down: boolean;
  shoot: boolean;
  pause: boolean;
  confirm: boolean;
}

export class InputManager {
  private state: InputState = {
    up: false,
    down: false,
    shoot: false,
    pause: false,
    confirm: false
  };

  private prevState: InputState = { ...this.state };
  private shootPressed: boolean = false;
  private lastMoveTime: number = 0;
  private rapidMoveCount: number = 0;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  private handleKeyDown(e: KeyboardEvent): void {
    switch (e.code) {
      case 'ArrowUp':
      case 'KeyW':
        if (!this.state.up) {
          this.trackRapidMove();
        }
        this.state.up = true;
        break;
      case 'ArrowDown':
      case 'KeyS':
        if (!this.state.down) {
          this.trackRapidMove();
        }
        this.state.down = true;
        break;
      case 'Space':
      case 'KeyJ':
      case 'KeyZ':
        if (!this.shootPressed) {
          this.state.shoot = true;
          this.shootPressed = true;
        }
        break;
      case 'Escape':
      case 'KeyP':
        this.state.pause = true;
        break;
      case 'Enter':
        this.state.confirm = true;
        break;
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    switch (e.code) {
      case 'ArrowUp':
      case 'KeyW':
        this.state.up = false;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.state.down = false;
        break;
      case 'Space':
      case 'KeyJ':
      case 'KeyZ':
        this.state.shoot = false;
        this.shootPressed = false;
        break;
      case 'Escape':
      case 'KeyP':
        this.state.pause = false;
        break;
      case 'Enter':
        this.state.confirm = false;
        break;
    }
  }

  private trackRapidMove(): void {
    const now = Date.now();
    if (now - this.lastMoveTime < 300) {
      this.rapidMoveCount++;
    } else {
      this.rapidMoveCount = 1;
    }
    this.lastMoveTime = now;
  }

  public getRapidMoveCount(): number {
    const count = this.rapidMoveCount;
    return count;
  }

  public resetRapidMoveCount(): void {
    this.rapidMoveCount = 0;
  }

  public getState(): Readonly<InputState> {
    return this.state;
  }

  public update(): void {
    this.prevState = { ...this.state };
  }

  public isShootPressed(): boolean {
    return this.state.shoot && !this.prevState.shoot;
  }

  public isPausePressed(): boolean {
    return this.state.pause && !this.prevState.pause;
  }

  public isConfirmPressed(): boolean {
    return this.state.confirm && !this.prevState.confirm;
  }

  public isUpPressed(): boolean {
    return this.state.up && !this.prevState.up;
  }

  public isDownPressed(): boolean {
    return this.state.down && !this.prevState.down;
  }

  public destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));
  }
}
