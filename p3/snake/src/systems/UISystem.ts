import { GameMode, Theme, LeaderboardEntry } from '../types';
import { StorageSystem } from './StorageSystem';
import gameConfig from '../config/gameConfig.json';

interface Button {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  onClick: () => void;
  hover: boolean;
  color: string;
  hoverColor: string;
}

export class UISystem {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private buttons: Button[] = [];
  private currentScreen: 'menu' | 'game' | 'gameOver' = 'menu';
  private selectedMode: GameMode = 'classic';
  private selectedTheme: Theme = 'classic';
  private wrapWalls: boolean = true;
  private onStartGame: ((mode: GameMode, theme: Theme, wrapWalls: boolean) => void) | null = null;
  private transitionAlpha: number = 0;
  private transitioning: boolean = false;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.setupEventListeners();
    this.createMenuButtons();
  }

  private setupEventListeners(): void {
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
  }

  private handleMouseMove(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const button of this.buttons) {
      button.hover =
        x >= button.x && x <= button.x + button.width &&
        y >= button.y && y <= button.y + button.height;
    }
  }

  private handleClick(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (const button of this.buttons) {
      if (x >= button.x && x <= button.x + button.width &&
          y >= button.y && y <= button.y + button.height) {
        button.onClick();
        break;
      }
    }
  }

  private createMenuButtons(): void {
    const centerX = this.canvas.width / 2;
    const startY = 200;
    const buttonWidth = 200;
    const buttonHeight = 50;
    const spacing = 70;

    this.buttons = [];

    this.buttons.push({
      x: centerX - buttonWidth / 2,
      y: startY,
      width: buttonWidth,
      height: buttonHeight,
      text: `模式: ${gameConfig.gameModes[this.selectedMode].name}`,
      onClick: () => this.cycleMode(),
      hover: false,
      color: '#4ade80',
      hoverColor: '#22c55e'
    });

    this.buttons.push({
      x: centerX - buttonWidth / 2,
      y: startY + spacing,
      width: buttonWidth,
      height: buttonHeight,
      text: `主题: ${gameConfig.themes[this.selectedTheme].name}`,
      onClick: () => this.cycleTheme(),
      hover: false,
      color: '#8b5cf6',
      hoverColor: '#7c3aed'
    });

    this.buttons.push({
      x: centerX - buttonWidth / 2,
      y: startY + spacing * 2,
      width: buttonWidth,
      height: buttonHeight,
      text: `墙壁: ${this.wrapWalls ? '穿越' : '死亡'}`,
      onClick: () => {
        this.wrapWalls = !this.wrapWalls;
        this.buttons[2].text = `墙壁: ${this.wrapWalls ? '穿越' : '死亡'}`;
      },
      hover: false,
      color: '#06b6d4',
      hoverColor: '#0891b2'
    });

    this.buttons.push({
      x: centerX - buttonWidth / 2,
      y: startY + spacing * 3.5,
      width: buttonWidth,
      height: buttonHeight,
      text: '开始游戏',
      onClick: () => this.startGame(),
      hover: false,
      color: '#f59e0b',
      hoverColor: '#d97706'
    });
  }

  private cycleMode(): void {
    const modes: GameMode[] = ['classic', 'battle', 'ai'];
    const index = modes.indexOf(this.selectedMode);
    this.selectedMode = modes[(index + 1) % modes.length];
    this.buttons[0].text = `模式: ${gameConfig.gameModes[this.selectedMode].name}`;
  }

  private cycleTheme(): void {
    const themes: Theme[] = ['classic', 'grass', 'cyberpunk'];
    const index = themes.indexOf(this.selectedTheme);
    this.selectedTheme = themes[(index + 1) % themes.length];
    this.buttons[1].text = `主题: ${gameConfig.themes[this.selectedTheme].name}`;
  }

  private startGame(): void {
    this.transitioning = true;
    this.transitionAlpha = 0;

    const fadeOut = () => {
      this.transitionAlpha += 0.05;
      if (this.transitionAlpha >= 1) {
        this.currentScreen = 'game';
        if (this.onStartGame) {
          this.onStartGame(this.selectedMode, this.selectedTheme, this.wrapWalls);
        }
        this.fadeIn();
      } else {
        requestAnimationFrame(fadeOut);
      }
    };

    fadeOut();
  }

  private fadeIn(): void {
    const fade = () => {
      this.transitionAlpha -= 0.05;
      if (this.transitionAlpha <= 0) {
        this.transitioning = false;
        this.transitionAlpha = 0;
      } else {
        requestAnimationFrame(fade);
      }
    };
    fade();
  }

  public showGameOver(): void {
    this.currentScreen = 'gameOver';
    this.createGameOverButtons();
  }

  private createGameOverButtons(): void {
    const centerX = this.canvas.width / 2;
    const startY = 300;
    const buttonWidth = 200;
    const buttonHeight = 50;

    this.buttons = [];

    this.buttons.push({
      x: centerX - buttonWidth / 2,
      y: startY,
      width: buttonWidth,
      height: buttonHeight,
      text: '再来一局',
      onClick: () => this.startGame(),
      hover: false,
      color: '#4ade80',
      hoverColor: '#22c55e'
    });

    this.buttons.push({
      x: centerX - buttonWidth / 2,
      y: startY + 70,
      width: buttonWidth,
      height: buttonHeight,
      text: '返回菜单',
      onClick: () => {
        this.currentScreen = 'menu';
        this.createMenuButtons();
      },
      hover: false,
      color: '#ef4444',
      hoverColor: '#dc2626'
    });
  }

  public render(): void {
    if (this.currentScreen === 'menu') {
      this.renderMenu();
    } else if (this.currentScreen === 'gameOver') {
      this.renderGameOver();
    }

    if (this.transitioning || this.transitionAlpha > 0) {
      this.ctx.fillStyle = `rgba(0, 0, 0, ${this.transitionAlpha})`;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  private renderMenu(): void {
    const theme = gameConfig.themes[this.selectedTheme];
    const centerX = this.canvas.width / 2;

    this.ctx.fillStyle = theme.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('贪吃蛇 · 进化战场', centerX, 100);

    this.ctx.font = '20px Arial';
    this.ctx.fillStyle = '#9ca3af';
    this.ctx.fillText('WASD / 方向键 控制', centerX, 150);

    this.renderLeaderboard(centerX, 550);

    for (const button of this.buttons) {
      this.renderButton(button);
    }
  }

  private renderLeaderboard(x: number, y: number): void {
    const scores = StorageSystem.getTopScores(this.selectedMode, 5);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('排行榜', x, y);

    this.ctx.font = '16px Arial';
    for (let i = 0; i < 5; i++) {
      const score = scores[i];
      const text = score
        ? `${i + 1}. ${score.name} - ${score.score}`
        : `${i + 1}. ---`;
      this.ctx.fillStyle = score ? '#d1d5db' : '#6b7280';
      this.ctx.fillText(text, x, y + 30 + i * 25);
    }
  }

  private renderGameOver(): void {
    const centerX = this.canvas.width / 2;

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#ef4444';
    this.ctx.font = 'bold 56px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('游戏结束', centerX, 200);

    for (const button of this.buttons) {
      this.renderButton(button);
    }
  }

  private renderButton(button: Button): void {
    const color = button.hover ? button.hoverColor : button.color;

    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.roundRect(button.x, button.y, button.width, button.height, 8);
    this.ctx.fill();

    if (button.hover) {
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = 15;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 20px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2);
  }

  public renderHUD(snakeScores: number[], theme: Theme, elapsedTime: number): void {
    const themeConfig = gameConfig.themes[theme];

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, 50);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 18px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'middle';

    if (snakeScores.length === 1) {
      this.ctx.fillText(`得分: ${snakeScores[0]}`, 20, 25);
    } else {
      this.ctx.fillText(`玩家1: ${snakeScores[0]}`, 20, 25);
      this.ctx.fillText(`玩家2: ${snakeScores[1]}`, 200, 25);
    }

    const minutes = Math.floor(elapsedTime / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);
    this.ctx.textAlign = 'right';
    this.ctx.fillText(
      `时间: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
      this.canvas.width - 20,
      25
    );
  }

  public setOnStartGame(callback: (mode: GameMode, theme: Theme, wrapWalls: boolean) => void): void {
    this.onStartGame = callback;
  }

  public getCurrentScreen(): string {
    return this.currentScreen;
  }

  public update(): void {
  }
}