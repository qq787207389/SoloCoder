import { Direction } from '../types';

export class InputSystem {
  private keyStates: Map<string, boolean> = new Map();
  private player1Direction: Direction | null = null;
  private player2Direction: Direction | null = null;
  private keysJustPressed: Set<string> = new Set();

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('keydown', (e) => {
      if (!this.keyStates.get(e.key)) {
        this.keysJustPressed.add(e.key);
      }
      this.keyStates.set(e.key, true);
      this.handleKeyPress(e.key);
    });

    window.addEventListener('keyup', (e) => {
      this.keyStates.set(e.key, false);
    });
  }

  private handleKeyPress(key: string): void {
    switch (key.toLowerCase()) {
      case 'w':
        this.player1Direction = 'up';
        break;
      case 's':
        this.player1Direction = 'down';
        break;
      case 'a':
        this.player1Direction = 'left';
        break;
      case 'd':
        this.player1Direction = 'right';
        break;
      case 'arrowup':
        this.player2Direction = 'up';
        break;
      case 'arrowdown':
        this.player2Direction = 'down';
        break;
      case 'arrowleft':
        this.player2Direction = 'left';
        break;
      case 'arrowright':
        this.player2Direction = 'right';
        break;
    }
  }

  public getPlayer1Direction(): Direction | null {
    const dir = this.player1Direction;
    this.player1Direction = null;
    return dir;
  }

  public getPlayer2Direction(): Direction | null {
    const dir = this.player2Direction;
    this.player2Direction = null;
    return dir;
  }

  public isKeyPressed(key: string): boolean {
    return this.keyStates.get(key.toLowerCase()) || false;
  }

  public isKeyJustPressed(key: string): boolean {
    const pressed = this.keysJustPressed.has(key.toLowerCase());
    this.keysJustPressed.delete(key.toLowerCase());
    return pressed;
  }

  public update(): void {
    this.keysJustPressed.clear();
  }

  public reset(): void {
    this.player1Direction = null;
    this.player2Direction = null;
    this.keysJustPressed.clear();
  }
}