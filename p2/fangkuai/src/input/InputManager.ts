export class InputManager {
  private keyStates: Set<string>;
  private keyDownListeners: Map<string, () => void>;
  private keyPressListeners: Map<string, () => void>;
  private touchStartX: number;
  private touchStartY: number;
  private touchStartTime: number;
  private swipeThreshold: number;
  private element: HTMLElement;

  constructor(element: HTMLElement) {
    this.element = element;
    this.keyStates = new Set();
    this.keyDownListeners = new Map();
    this.keyPressListeners = new Map();
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchStartTime = 0;
    this.swipeThreshold = 50;
    
    this.setupKeyboard();
    this.setupTouch();
  }

  private setupKeyboard(): void {
    window.addEventListener('keydown', (e) => {
      const wasPressed = this.keyStates.has(e.code);
      this.keyStates.add(e.code);
      
      if (!wasPressed) {
        const listener = this.keyPressListeners.get(e.code);
        if (listener) {
          listener();
          e.preventDefault();
        }
      }
      
      const downListener = this.keyDownListeners.get(e.code);
      if (downListener) {
        downListener();
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keyStates.delete(e.code);
    });
  }

  private setupTouch(): void {
    this.element.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
      this.touchStartTime = Date.now();
    }, { passive: false });

    this.element.addEventListener('touchend', (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - this.touchStartX;
      const deltaY = touch.clientY - this.touchStartY;
      const deltaTime = Date.now() - this.touchStartTime;
      
      if (deltaTime < 200 && Math.abs(deltaX) < 30 && Math.abs(deltaY) < 30) {
        this.emit('Tap');
        return;
      }
      
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      
      if (absX > absY) {
        if (absX > this.swipeThreshold) {
          if (deltaX > 0) {
            this.emit('SwipeRight');
          } else {
            this.emit('SwipeLeft');
          }
        }
      } else {
        if (absY > this.swipeThreshold) {
          if (deltaY > 0) {
            this.emit('SwipeDown');
          } else {
            this.emit('SwipeUp');
          }
        }
      }
    }, { passive: false });
  }

  onKeyPress(key: string, callback: () => void): void {
    this.keyPressListeners.set(key, callback);
  }

  onKeyDown(key: string, callback: () => void): void {
    this.keyDownListeners.set(key, callback);
  }

  private emit(event: string): void {
    const eventMap: Record<string, string> = {
      'SwipeLeft': 'ArrowLeft',
      'SwipeRight': 'ArrowRight',
      'SwipeDown': 'ArrowDown',
      'SwipeUp': 'ArrowUp',
      'Tap': 'Space'
    };
    
    const key = eventMap[event];
    if (key) {
      const listener = this.keyPressListeners.get(key);
      if (listener) {
        listener();
      }
    }
  }

  isKeyPressed(key: string): boolean {
    return this.keyStates.has(key);
  }

  destroy(): void {
    this.keyStates.clear();
    this.keyDownListeners.clear();
    this.keyPressListeners.clear();
  }
}
