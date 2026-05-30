import type { InputState } from './types';

export class InputManager {
  private state: InputState;
  private keyDown: Set<string>;
  private zKeyWasDown: boolean = false;

  constructor() {
    this.state = {
      left: false,
      right: false,
      up: false,
      down: false,
      dig: false,
      digPressed: false,
    };
    this.keyDown = new Set();
    this.setupListeners();
  }

  private setupListeners(): void {
    window.addEventListener('keydown', (e) => {
      const key = e.key.toLowerCase();
      this.keyDown.add(key);
      if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' '].includes(key)) {
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keyDown.delete(e.key.toLowerCase());
    });
  }

  update(): void {
    this.state.left = this.keyDown.has('arrowleft') || this.keyDown.has('a');
    this.state.right = this.keyDown.has('arrowright') || this.keyDown.has('d');
    this.state.up = this.keyDown.has('arrowup') || this.keyDown.has('w');
    this.state.down = this.keyDown.has('arrowdown') || this.keyDown.has('s');
    const zIsDown = this.keyDown.has('z');
    this.state.dig = zIsDown;
    if (zIsDown && !this.zKeyWasDown) {
      this.state.digPressed = true;
    }
    this.zKeyWasDown = zIsDown;
  }

  getState(): InputState {
    return { ...this.state };
  }

  consumeDig(): boolean {
    const pressed = this.state.digPressed;
    this.state.digPressed = false;
    return pressed;
  }

  isKeyPressed(key: string): boolean {
    return this.keyDown.has(key.toLowerCase());
  }

  wasJustPressed(key: string): boolean {
    const pressed = this.keyDown.has(key.toLowerCase());
    if (pressed) {
      this.keyDown.delete(key.toLowerCase());
      return true;
    }
    return false;
  }
}
