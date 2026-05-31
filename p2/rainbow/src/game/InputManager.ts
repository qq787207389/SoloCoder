type KeyState = 'none' | 'pressed' | 'held' | 'released';

export class InputManager {
  private keyStates: Map<string, KeyState> = new Map();

  private static readonly ACTION_KEYS: Record<string, string[]> = {
    left: ['ArrowLeft', 'KeyA'],
    right: ['ArrowRight', 'KeyD'],
    up: ['ArrowUp', 'KeyW'],
    jump: ['Space'],
    attack: ['KeyJ', 'KeyZ'],
    special: ['KeyK', 'KeyX'],
    enter: ['Enter'],
    pause: ['KeyP', 'Escape'],
  };

  constructor() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    const state = this.keyStates.get(e.code);
    if (state !== 'held' && state !== 'pressed') {
      this.keyStates.set(e.code, 'pressed');
    }
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown') {
      e.preventDefault();
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keyStates.set(e.code, 'released');
  };

  isPressed(key: string): boolean {
    return this.keyStates.get(key) === 'pressed';
  }

  isHeld(key: string): boolean {
    const state = this.keyStates.get(key);
    return state === 'held' || state === 'pressed';
  }

  isReleased(key: string): boolean {
    return this.keyStates.get(key) === 'released';
  }

  update(): void {
    this.keyStates.forEach((state, key) => {
      if (state === 'pressed') {
        this.keyStates.set(key, 'held');
      } else if (state === 'released') {
        this.keyStates.set(key, 'none');
      }
    });
  }

  private checkAction(action: string, method: 'isPressed' | 'isHeld' | 'isReleased'): boolean {
    const keys = InputManager.ACTION_KEYS[action];
    if (!keys) return false;
    return keys.some((k) => this[method](k));
  }

  isLeft(): boolean {
    return this.checkAction('left', 'isHeld');
  }

  isRight(): boolean {
    return this.checkAction('right', 'isHeld');
  }

  isUp(): boolean {
    return this.checkAction('up', 'isHeld');
  }

  isJump(): boolean {
    return this.checkAction('jump', 'isPressed');
  }

  isAttack(): boolean {
    return this.checkAction('attack', 'isPressed');
  }

  isAttackHeld(): boolean {
    return this.checkAction('attack', 'isHeld');
  }

  isAttackReleased(): boolean {
    return this.checkAction('attack', 'isReleased');
  }

  isSpecial(): boolean {
    return this.checkAction('special', 'isPressed');
  }

  isEnter(): boolean {
    return this.checkAction('enter', 'isPressed');
  }

  isPause(): boolean {
    return this.checkAction('pause', 'isPressed');
  }

  destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }
}
