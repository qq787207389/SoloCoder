import { KEY_BINDINGS } from '../utils/constants';

export class InputManager {
  private keys: Set<string> = new Set();
  private pressedKeys: Set<string> = new Set();
  private releasedKeys: Set<string> = new Set();

  constructor() {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (!this.keys.has(e.code)) {
      this.pressedKeys.add(e.code);
    }
    this.keys.add(e.code);
  }

  private handleKeyUp(e: KeyboardEvent): void {
    this.keys.delete(e.code);
    this.releasedKeys.add(e.code);
  }

  public isKeyPressed(action: string): boolean {
    const keyCodes = KEY_BINDINGS[action as keyof typeof KEY_BINDINGS];
    if (!keyCodes) return false;
    return keyCodes.some(code => this.pressedKeys.has(code));
  }

  public isKeyReleased(action: string): boolean {
    const keyCodes = KEY_BINDINGS[action as keyof typeof KEY_BINDINGS];
    if (!keyCodes) return false;
    return keyCodes.some(code => this.releasedKeys.has(code));
  }

  public isKeyHeld(action: string): boolean {
    const keyCodes = KEY_BINDINGS[action as keyof typeof KEY_BINDINGS];
    if (!keyCodes) return false;
    return keyCodes.some(code => this.keys.has(code));
  }

  public update(): void {
    this.pressedKeys.clear();
    this.releasedKeys.clear();
  }

  public clear(): void {
    this.keys.clear();
    this.pressedKeys.clear();
    this.releasedKeys.clear();
  }
}
