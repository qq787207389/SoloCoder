export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  leanForward: boolean;
  leanBackward: boolean;
  select: boolean;
}

export class InputManager {
  private keys: Set<string> = new Set();
  private prevKeys: Set<string> = new Set();

  constructor() {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });
  }

  getState(): InputState {
    return {
      up: this.keys.has('ArrowUp') || this.keys.has('KeyW'),
      down: this.keys.has('ArrowDown') || this.keys.has('KeyS'),
      left: this.keys.has('ArrowLeft') || this.keys.has('KeyA'),
      right: this.keys.has('ArrowRight') || this.keys.has('KeyD'),
      leanForward: this.keys.has('KeyQ') || this.keys.has('KeyZ'),
      leanBackward: this.keys.has('KeyE') || this.keys.has('KeyX'),
      select: this.keys.has('Space') || this.keys.has('Enter'),
    };
  }

  justPressed(code: string): boolean {
    return this.keys.has(code) && !this.prevKeys.has(code);
  }

  postUpdate() {
    this.prevKeys = new Set(this.keys);
  }
}
