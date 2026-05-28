import { PlayerInput } from './types';

export class InputManager {
  private player1Input: PlayerInput;
  private player2Input: PlayerInput;
  private keys: Set<string>;
  private keyJustPressed: Set<string>;

  constructor() {
    this.player1Input = this.createEmptyInput();
    this.player2Input = this.createEmptyInput();
    this.keys = new Set();
    this.keyJustPressed = new Set();

    this.setupEventListeners();
  }

  private createEmptyInput(): PlayerInput {
    return {
      up: false,
      down: false,
      left: false,
      right: false,
      shoot: false,
      secondary: false,
      switchWeapon: false
    };
  }

  private setupEventListeners(): void {
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
  }

  private onKeyDown(e: KeyboardEvent): void {
    const key = e.key.toLowerCase();
    if (!this.keys.has(key)) {
      this.keyJustPressed.add(key);
    }
    this.keys.add(key);
    e.preventDefault();
  }

  private onKeyUp(e: KeyboardEvent): void {
    const key = e.key.toLowerCase();
    this.keys.delete(key);
    e.preventDefault();
  }

  public update(): void {
    this.player1Input = this.createEmptyInput();
    this.player2Input = this.createEmptyInput();

    if (this.keys.has('w')) this.player1Input.up = true;
    if (this.keys.has('s')) this.player1Input.down = true;
    if (this.keys.has('a')) this.player1Input.left = true;
    if (this.keys.has('d')) this.player1Input.right = true;
    if (this.keys.has('j')) this.player1Input.shoot = true;
    if (this.keys.has('k')) this.player1Input.secondary = true;
    if (this.keyJustPressed.has('l')) this.player1Input.switchWeapon = true;

    if (this.keys.has('arrowup')) this.player2Input.up = true;
    if (this.keys.has('arrowdown')) this.player2Input.down = true;
    if (this.keys.has('arrowleft')) this.player2Input.left = true;
    if (this.keys.has('arrowright')) this.player2Input.right = true;
    if (this.keys.has('1') || this.keys.has('numpad1')) this.player2Input.shoot = true;
    if (this.keys.has('2') || this.keys.has('numpad2')) this.player2Input.secondary = true;
    if (this.keyJustPressed.has('3') || this.keyJustPressed.has('numpad3')) this.player2Input.switchWeapon = true;
  }

  public clearJustPressed(): void {
    this.keyJustPressed.clear();
  }

  public getPlayer1Input(): PlayerInput {
    return { ...this.player1Input };
  }

  public getPlayer2Input(): PlayerInput {
    return { ...this.player2Input };
  }

  public isKeyPressed(key: string): boolean {
    return this.keys.has(key.toLowerCase());
  }

  public isKeyJustPressed(key: string): boolean {
    return this.keyJustPressed.has(key.toLowerCase());
  }

  public getPausePressed(): boolean {
    return this.keyJustPressed.has('escape') || this.keyJustPressed.has('p');
  }

  public getStartPressed(): boolean {
    return this.keyJustPressed.has('enter') || this.keyJustPressed.has(' ');
  }

  public getMenuUpPressed(): boolean {
    return this.keyJustPressed.has('w') || this.keyJustPressed.has('arrowup');
  }

  public getMenuDownPressed(): boolean {
    return this.keyJustPressed.has('s') || this.keyJustPressed.has('arrowdown');
  }
}
