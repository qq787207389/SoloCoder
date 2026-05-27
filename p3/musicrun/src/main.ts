import { Game } from './game/Game';
import { UIManager } from './ui/UIManager';
import { MusicGenerator } from './audio/MusicGenerator';
import { DEMO_LEVELS } from './data/levels';
import { LevelData, GameState } from './types';

class GameApp {
  private container: HTMLElement;
  private game: Game;
  private uiManager: UIManager;
  private musicGenerator: MusicGenerator;
  private levels: LevelData[] = [];
  private currentLevel: LevelData | null = null;
  
  constructor() {
    this.container = document.getElementById('game-container')!;
    
    this.game = new Game(this.container);
    this.uiManager = new UIManager(this.container);
    this.musicGenerator = new MusicGenerator();
    
    this.setupCallbacks();
  }
  
  private setupCallbacks(): void {
    this.uiManager.setCallbacks({
      onStartGame: () => this.handleStartGame(),
      onSelectLevel: (level) => this.handleSelectLevel(level),
      onResume: () => this.handleResume(),
      onRestart: () => this.handleRestart(),
      onBackToMenu: () => this.handleBackToMenu(),
    });
    
    this.game.onStateChange((state) => this.handleStateChange(state));
  }
  
  async init(): Promise<void> {
    await this.musicGenerator.init();
    this.levels = [...DEMO_LEVELS];
    this.uiManager.showMenu();
  }
  
  private async handleStartGame(): Promise<void> {
    const unlockedLevels = this.levels.filter(l => l.unlocked);
    if (unlockedLevels.length > 0) {
      await this.handleSelectLevel(unlockedLevels[0]);
    }
  }
  
  private async handleSelectLevel(level: LevelData): Promise<void> {
    this.currentLevel = level;
    
    try {
      if (!level.musicUrl || level.musicUrl === '') {
        const audioBuffer = this.musicGenerator.generateMusic(level.bpm, level.duration);
        const musicUrl = this.musicGenerator.createMusicUrl(audioBuffer);
        level.musicUrl = musicUrl;
      }
      
      await this.game.loadLevel(level);
      this.uiManager.showHUD();
      await this.game.startGame();
    } catch (error) {
      console.error('Failed to load level:', error);
    }
  }
  
  private handleResume(): void {
    const state = this.game.getState();
    if (state.status === 'paused') {
      this.game.resume();
      this.uiManager.hidePause();
    } else if (state.status === 'playing') {
      this.game.pause();
      this.uiManager.showPause();
    }
  }
  
  private handleRestart(): void {
    if (this.currentLevel) {
      this.handleSelectLevel(this.currentLevel);
    }
  }
  
  private handleBackToMenu(): void {
    this.uiManager.showMenu();
  }
  
  private handleStateChange(state: GameState): void {
    if (this.currentLevel) {
      this.uiManager.updateHUD(state, this.currentLevel.duration);
    }
    
    switch (state.status) {
      case 'paused':
        this.uiManager.showPause();
        break;
      case 'playing':
        this.uiManager.hidePause();
        break;
      case 'gameover':
        this.uiManager.showGameOver(state.score, state.perfectCount / Math.max(1, state.totalActions));
        break;
      case 'victory':
        this.uiManager.showVictory(state);
        this.unlockNextLevel();
        break;
    }
  }
  
  private unlockNextLevel(): void {
    if (!this.currentLevel) return;
    
    const currentIndex = this.levels.findIndex(l => l.id === this.currentLevel!.id);
    if (currentIndex >= 0 && currentIndex < this.levels.length - 1) {
      this.levels[currentIndex + 1].unlocked = true;
    }
  }
  
  dispose(): void {
    this.game.dispose();
    this.uiManager.dispose();
    this.musicGenerator.dispose();
  }
}

const app = new GameApp();
app.init().catch(console.error);
