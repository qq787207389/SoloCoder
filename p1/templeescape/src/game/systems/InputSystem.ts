export enum InputAction {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  JUMP = 'JUMP',
  SLIDE = 'SLIDE',
}

interface InputListener {
  (action: InputAction): void;
}

export class InputSystem {
  private listeners: InputListener[] = [];
  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartTime = 0;
  private readonly SWIPE_THRESHOLD = 30;
  private readonly SWIPE_TIME_THRESHOLD = 500;

  constructor() {
    this.setupKeyboardInput();
    this.setupTouchInput();
  }

  private setupKeyboardInput(): void {
    window.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          this.emitAction(InputAction.LEFT);
          break;
        case 'ArrowRight':
        case 'KeyD':
          this.emitAction(InputAction.RIGHT);
          break;
        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
          this.emitAction(InputAction.JUMP);
          break;
        case 'ArrowDown':
        case 'KeyS':
          this.emitAction(InputAction.SLIDE);
          break;
      }
    });
  }

  private setupTouchInput(): void {
    window.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
      this.touchStartTime = Date.now();
    });

    window.addEventListener('touchend', (e) => {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - this.touchStartX;
      const deltaY = touch.clientY - this.touchStartY;
      const deltaTime = Date.now() - this.touchStartTime;

      if (deltaTime > this.SWIPE_TIME_THRESHOLD) return;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      if (Math.max(absX, absY) < this.SWIPE_THRESHOLD) return;

      if (absX > absY) {
        if (deltaX > 0) {
          this.emitAction(InputAction.RIGHT);
        } else {
          this.emitAction(InputAction.LEFT);
        }
      } else {
        if (deltaY < 0) {
          this.emitAction(InputAction.JUMP);
        } else {
          this.emitAction(InputAction.SLIDE);
        }
      }
    });
  }

  private emitAction(action: InputAction): void {
    this.listeners.forEach((listener) => listener(action));
  }

  public addListener(listener: InputListener): void {
    this.listeners.push(listener);
  }

  public removeListener(listener: InputListener): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  public dispose(): void {
    this.listeners = [];
  }
}
