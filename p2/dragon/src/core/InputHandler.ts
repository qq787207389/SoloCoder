type KeyHandler = () => void;

interface KeyBindings {
  [key: string]: KeyHandler;
}

class InputHandler {
  private keyBindings: KeyBindings = {};
  private keysPressed: Set<string> = new Set();

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (!this.keysPressed.has(key)) {
        this.keysPressed.add(key);
        this.handleKeyPress(key);
      }
    });

    document.addEventListener('keyup', (e: KeyboardEvent) => {
      this.keysPressed.delete(e.key.toLowerCase());
    });
  }

  private handleKeyPress(key: string): void {
    const handler = this.keyBindings[key];
    if (handler) {
      handler();
    }
  }

  public bindKey(key: string, handler: KeyHandler): void {
    this.keyBindings[key.toLowerCase()] = handler;
  }

  public unbindKey(key: string): void {
    delete this.keyBindings[key.toLowerCase()];
  }

  public clearBindings(): void {
    this.keyBindings = {};
  }

  public isKeyPressed(key: string): boolean {
    return this.keysPressed.has(key.toLowerCase());
  }
}

export const inputHandler = new InputHandler();
