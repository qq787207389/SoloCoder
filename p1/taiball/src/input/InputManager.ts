import type { InputState } from '../types/game';

export class InputManager {
  private state: InputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    space: false,
    spacePressed: false,
    escape: false,
    enter: false,
  };

  private spaceWasDown: boolean = false;

  constructor() {
    this.setupListeners();
  }

  private setupListeners(): void {
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }

  private handleKeyDown(e: KeyboardEvent): void {
    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.state.left = true;
        e.preventDefault();
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.state.right = true;
        e.preventDefault();
        break;
      case 'ArrowUp':
      case 'KeyW':
        this.state.up = true;
        e.preventDefault();
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.state.down = true;
        e.preventDefault();
        break;
      case 'Space':
        if (!this.spaceWasDown) {
          this.state.spacePressed = true;
        }
        this.state.space = true;
        this.spaceWasDown = true;
        e.preventDefault();
        break;
      case 'Escape':
        this.state.escape = true;
        e.preventDefault();
        break;
      case 'Enter':
        this.state.enter = true;
        e.preventDefault();
        break;
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.state.left = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.state.right = false;
        break;
      case 'ArrowUp':
      case 'KeyW':
        this.state.up = false;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.state.down = false;
        break;
      case 'Space':
        this.state.space = false;
        this.spaceWasDown = false;
        break;
      case 'Escape':
        this.state.escape = false;
        break;
      case 'Enter':
        this.state.enter = false;
        break;
    }
  }

  getState(): Readonly<InputState> {
    return this.state;
  }

  consumeSpacePressed(): boolean {
    const pressed = this.state.spacePressed;
    this.state.spacePressed = false;
    return pressed;
  }

  consumeEscape(): boolean {
    const pressed = this.state.escape;
    this.state.escape = false;
    return pressed;
  }

  consumeEnter(): boolean {
    const pressed = this.state.enter;
    this.state.enter = false;
    return pressed;
  }
}
