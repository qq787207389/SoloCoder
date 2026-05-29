import Phaser from 'phaser';

export class InputManager {
  private scene: Phaser.Scene;
  public cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  public spaceKey!: Phaser.Input.Keyboard.Key;
  private touchLeft: boolean = false;
  private touchRight: boolean = false;
  private touchUp: boolean = false;
  private touchDown: boolean = false;
  private touchJump: boolean = false;
  private touchButtons: Phaser.GameObjects.Container[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.spaceKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.createTouchControls();
  }

  private createTouchControls() {
    if (!this.scene.input.pointer1) return;

    const w = 480;
    const h = 640;
    const btnSize = 44;
    const margin = 12;
    const bottomY = h - margin - btnSize / 2;

    const leftBtn = this.createTouchButton(margin + btnSize / 2, bottomY, btnSize, '◀', () => { this.touchLeft = true; }, () => { this.touchLeft = false; });
    const rightBtn = this.createTouchButton(margin + btnSize * 1.5 + 8, bottomY, btnSize, '▶', () => { this.touchRight = true; }, () => { this.touchRight = false; });
    const upBtn = this.createTouchButton(w - margin - btnSize / 2, bottomY - btnSize - 4, btnSize, '▲', () => { this.touchUp = true; }, () => { this.touchUp = false; });
    const downBtn = this.createTouchButton(w - margin - btnSize / 2, bottomY, btnSize, '▼', () => { this.touchDown = true; }, () => { this.touchDown = false; });
    const jumpBtn = this.createTouchButton(w - margin - btnSize * 1.5 - 4, bottomY, btnSize * 1.2, 'JUMP', () => { this.touchJump = true; }, () => { this.touchJump = false; });

    this.touchButtons = [leftBtn, rightBtn, upBtn, downBtn, jumpBtn];
  }

  private createTouchButton(
    x: number, y: number, size: number, label: string,
    onDown: () => void, onUp: () => void
  ): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);
    container.setDepth(100);
    container.setScrollFactor(0);
    container.setAlpha(0.4);

    const bg = this.scene.add.rectangle(0, 0, size, size, 0xffffff, 0.3);
    bg.setStrokeStyle(1, 0xffffff, 0.5);
    const text = this.scene.add.text(0, 0, label, {
      fontSize: label.length > 1 ? '10px' : '16px',
      color: '#ffffff',
      fontFamily: 'monospace',
    });
    text.setOrigin(0.5, 0.5);

    container.add([bg, text]);

    bg.setInteractive();
    bg.on('pointerdown', onDown);
    bg.on('pointerup', onUp);
    bg.on('pointerout', onUp);

    return container;
  }

  isLeftDown(): boolean {
    return this.cursors.left!.isDown || this.touchLeft;
  }

  isRightDown(): boolean {
    return this.cursors.right!.isDown || this.touchRight;
  }

  isUpDown(): boolean {
    return this.cursors.up!.isDown || this.touchUp;
  }

  isDownDown(): boolean {
    return this.cursors.down!.isDown || this.touchDown;
  }

  isJumpJustDown(): boolean {
    return Phaser.Input.Keyboard.JustDown(this.cursors.up!) || this.touchJump;
  }

  getCursorKeys(): Phaser.Types.Input.Keyboard.CursorKeys {
    const mockCursors = { ...this.cursors };
    const self = this;
    Object.defineProperty(mockCursors, 'left', { get: () => ({ isDown: self.cursors.left!.isDown || self.touchLeft, justDown: Phaser.Input.Keyboard.JustDown(self.cursors.left!) }) });
    Object.defineProperty(mockCursors, 'right', { get: () => ({ isDown: self.cursors.right!.isDown || self.touchRight, justDown: Phaser.Input.Keyboard.JustDown(self.cursors.right!) }) });
    Object.defineProperty(mockCursors, 'up', { get: () => ({ isDown: self.cursors.up!.isDown || self.touchUp, justDown: Phaser.Input.Keyboard.JustDown(self.cursors.up!) || self.touchJump }) });
    Object.defineProperty(mockCursors, 'down', { get: () => ({ isDown: self.cursors.down!.isDown || self.touchDown, justDown: Phaser.Input.Keyboard.JustDown(self.cursors.down!) }) });
    return mockCursors as Phaser.Types.Input.Keyboard.CursorKeys;
  }

  setTouchControlsVisible(visible: boolean) {
    for (const btn of this.touchButtons) {
      btn.setVisible(visible);
      btn.setAlpha(visible ? 0.4 : 0);
    }
  }
}
