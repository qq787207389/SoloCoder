export class InputManager {
  private currentKeys: Set<string> = new Set();
  private previousKeys: Set<string> = new Set();
  private pressedKeys: Set<string> = new Set();
  private releasedKeys: Set<string> = new Set();

  constructor() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    this.currentKeys.add(e.code);
    e.preventDefault();
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.currentKeys.delete(e.code);
    e.preventDefault();
  };

  update(): void {
    this.pressedKeys.clear();
    this.releasedKeys.clear();

    for (const key of this.currentKeys) {
      if (!this.previousKeys.has(key)) {
        this.pressedKeys.add(key);
      }
    }

    for (const key of this.previousKeys) {
      if (!this.currentKeys.has(key)) {
        this.releasedKeys.add(key);
      }
    }

    this.previousKeys = new Set(this.currentKeys);
  }

  isPressed(key: string): boolean {
    return this.pressedKeys.has(key);
  }

  isHeld(key: string): boolean {
    return this.currentKeys.has(key);
  }

  isReleased(key: string): boolean {
    return this.releasedKeys.has(key);
  }

  destroy(): void {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }
}
