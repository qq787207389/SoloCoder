import { Game } from './core/Game';
import { UIManager } from './ui/UIManager';
import { MapEditor } from './editor/MapEditor';
import { GameState, TileType } from './constants';

class GameApp {
  private gameCanvas: HTMLCanvasElement;
  private uiCanvas: HTMLCanvasElement;
  private game: Game | null;
  private uiManager: UIManager | null;
  private mapEditor: MapEditor | null;
  private lastTime: number;
  private isEditorMode: boolean;

  constructor() {
    this.gameCanvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    this.uiCanvas = document.getElementById('uiCanvas') as HTMLCanvasElement;
    this.game = null;
    this.uiManager = null;
    this.mapEditor = null;
    this.lastTime = 0;
    this.isEditorMode = false;
    this.init();
  }

  private init(): void {
    this.setupEventListeners();
    this.gameLoop(0);
  }

  private startGame(isTwoPlayer: boolean = false): void {
    this.isEditorMode = false;
    this.game = new Game(isTwoPlayer);
    this.uiManager = new UIManager(this.gameCanvas, this.uiCanvas, this.game);
    this.game.init();
    document.getElementById('editorControls')?.classList.remove('active');
  }

  private startEditor(): void {
    this.isEditorMode = true;
    this.mapEditor = new MapEditor(this.gameCanvas);
    this.mapEditor.activate();
    this.game = null;
    this.uiManager = null;
    document.getElementById('editorControls')?.classList.add('active');
    this.setupEditorControls();
  }

  private exitEditor(): void {
    this.isEditorMode = false;
    if (this.mapEditor) {
      this.mapEditor.deactivate();
    }
    this.mapEditor = null;
    document.getElementById('editorControls')?.classList.remove('active');
  }

  private playWithEditedMap(): void {
    if (this.mapEditor) {
      const mapData = this.mapEditor.exportMap();
      this.startGame(false);
      if (this.game) {
        this.game.map.import(mapData);
      }
    }
  }

  private setupEventListeners(): void {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }

  private setupEditorControls(): void {
    const tileBtns = document.querySelectorAll('.tileBtn');
    tileBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        tileBtns.forEach((b) => b.classList.remove('selected'));
        (e.target as HTMLElement).classList.add('selected');
        const tileType = parseInt((e.target as HTMLElement).dataset.tile || '1');
        this.mapEditor?.setCurrentTile(tileType);
      });
    });

    document.getElementById('undoBtn')?.addEventListener('click', () => {
      this.mapEditor?.undo();
    });

    document.getElementById('redoBtn')?.addEventListener('click', () => {
      this.mapEditor?.redo();
    });

    document.getElementById('clearBtn')?.addEventListener('click', () => {
      this.mapEditor?.clear();
    });

    document.getElementById('saveBtn')?.addEventListener('click', () => {
      const mapData = this.mapEditor?.exportMap();
      if (mapData) {
        const dataStr = JSON.stringify(mapData);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tank-map.json';
        a.click();
        URL.revokeObjectURL(url);
      }
    });

    document.getElementById('loadBtn')?.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const data = JSON.parse(event.target?.result as string);
              this.mapEditor?.importMap(data);
            } catch (err) {
              alert('地图文件格式错误');
            }
          };
          reader.readAsText(file);
        }
      };
      input.click();
    });

    document.getElementById('playBtn')?.addEventListener('click', () => {
      this.playWithEditedMap();
    });

    document.getElementById('exitBtn')?.addEventListener('click', () => {
      this.exitEditor();
    });
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (this.isEditorMode && this.mapEditor) {
      if (e.code === 'KeyZ') {
        this.mapEditor.undo();
      } else if (e.code === 'KeyY') {
        this.mapEditor.redo();
      }
      return;
    }

    if (this.game) {
      if (this.game.state === GameState.MENU) {
        if (e.code === 'Digit1') {
          this.startGame(false);
        } else if (e.code === 'Digit2') {
          this.startGame(true);
        } else if (e.code === 'KeyE') {
          this.startEditor();
        }
      } else if (this.game.state === GameState.GAMEOVER) {
        if (e.code === 'KeyR') {
          this.startGame(this.game.players.length > 1);
        } else if (e.code === 'KeyM') {
          this.game = null;
          this.uiManager = null;
        }
      } else {
        this.game.setKeyDown(e.code);
      }
    } else {
      if (e.code === 'Digit1') {
        this.startGame(false);
      } else if (e.code === 'Digit2') {
        this.startGame(true);
      } else if (e.code === 'KeyE') {
        this.startEditor();
      }
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    if (this.isEditorMode) return;
    this.game?.setKeyUp(e.code);
  }

  private gameLoop(currentTime: number): void {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    if (this.isEditorMode && this.mapEditor) {
      const ctx = this.gameCanvas.getContext('2d')!;
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
      
      const mapSize = this.mapEditor.getMap().width * this.mapEditor.getMap().tileSize;
      const offsetX = (this.gameCanvas.width - mapSize) / 2;
      const offsetY = (this.gameCanvas.height - mapSize) / 2;
      
      ctx.save();
      ctx.translate(offsetX, offsetY);
      this.mapEditor.render(ctx);
      ctx.restore();
      
      const uiCtx = this.uiCanvas.getContext('2d')!;
      uiCtx.clearRect(0, 0, this.uiCanvas.width, this.uiCanvas.height);
      uiCtx.fillStyle = '#16213e';
      uiCtx.fillRect(0, 0, this.uiCanvas.width, 60);
      uiCtx.fillStyle = '#ffd700';
      uiCtx.font = 'bold 20px Arial';
      uiCtx.textAlign = 'center';
      uiCtx.fillText('地图编辑器', this.uiCanvas.width / 2, 35);
      uiCtx.fillStyle = '#888';
      uiCtx.font = '14px Arial';
      uiCtx.fillText('左键放置 | 右键擦除 | Z撤销 | Y重做', this.uiCanvas.width / 2, 55);
    } else if (this.game && this.uiManager) {
      if (this.game.state === GameState.PLAYING) {
        this.game.update(deltaTime, currentTime);
      }
      this.uiManager.render();
    } else {
      this.renderMenu();
    }

    requestAnimationFrame((t) => this.gameLoop(t));
  }

  private renderMenu(): void {
    const ctx = this.gameCanvas.getContext('2d')!;
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
    
    const uiCtx = this.uiCanvas.getContext('2d')!;
    uiCtx.clearRect(0, 0, this.uiCanvas.width, this.uiCanvas.height);
    
    uiCtx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    uiCtx.fillRect(0, 0, this.uiCanvas.width, this.uiCanvas.height);
    
    uiCtx.fillStyle = '#ffd700';
    uiCtx.font = 'bold 48px Arial';
    uiCtx.textAlign = 'center';
    uiCtx.fillText('钢铁战神', this.uiCanvas.width / 2, this.uiCanvas.height / 3);
    
    uiCtx.fillStyle = '#00ffff';
    uiCtx.font = 'bold 28px Arial';
    uiCtx.fillText('单人模式 [1]', this.uiCanvas.width / 2, this.uiCanvas.height / 2);
    uiCtx.fillText('双人模式 [2]', this.uiCanvas.width / 2, this.uiCanvas.height / 2 + 50);
    uiCtx.fillText('地图编辑器 [E]', this.uiCanvas.width / 2, this.uiCanvas.height / 2 + 100);
    
    uiCtx.fillStyle = '#888';
    uiCtx.font = '16px Arial';
    uiCtx.fillText('按对应的键开始游戏', this.uiCanvas.width / 2, this.uiCanvas.height - 50);
  }
}

window.addEventListener('load', () => {
  new GameApp();
});
