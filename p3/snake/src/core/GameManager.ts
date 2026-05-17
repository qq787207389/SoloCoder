import { Snake } from '../entities/Snake';
import { Food } from '../entities/Food';
import { Obstacle } from '../entities/Obstacle';
import { GameMode, Theme, FoodType, AIStrategy } from '../types';
import { AISystem } from '../systems/AISystem';
import { ParticleSystem } from '../systems/ParticleSystem';
import { AudioSystem } from '../systems/AudioSystem';
import { InputSystem } from '../systems/InputSystem';
import { StorageSystem } from '../systems/StorageSystem';
import gameConfig from '../config/gameConfig.json';

export class GameManager {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gridWidth: number;
  private gridHeight: number;
  private cellSize: number;

  private snakes: Snake[] = [];
  private foods: Food[] = [];
  private obstacles: Obstacle[] = [];
  private aiSystems: AISystem[] = [];

  private particleSystem: ParticleSystem;
  private audioSystem: AudioSystem;
  private inputSystem: InputSystem;

  private mode: GameMode = 'classic';
  private theme: Theme = 'classic';
  private wrapWalls: boolean = true;
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private startTime: number = 0;
  private elapsedTime: number = 0;

  private animationFrameId: number | null = null;
  private lastTime: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');
    this.ctx = ctx;

    this.gridWidth = gameConfig.grid.width;
    this.gridHeight = gameConfig.grid.height;
    this.cellSize = gameConfig.grid.cellSize;

    this.particleSystem = new ParticleSystem();
    this.audioSystem = new AudioSystem();
    this.inputSystem = new InputSystem();

    this.canvas.width = this.gridWidth * this.cellSize;
    this.canvas.height = this.gridHeight * this.cellSize;
  }

  public init(mode: GameMode, theme: Theme, wrapWalls: boolean): void {
    this.mode = mode;
    this.theme = theme;
    this.wrapWalls = wrapWalls;

    this.snakes = [];
    this.foods = [];
    this.obstacles = [];
    this.aiSystems = [];

    this.createSnakes();
    this.createObstacles();
    this.spawnInitialFood();

    this.startTime = Date.now();
    this.elapsedTime = 0;
    this.isRunning = true;
    this.isPaused = false;

    this.audioSystem.ensureInitialized();
  }

  private createSnakes(): void {
    const themeConfig = gameConfig.themes[this.theme];
    const colors = [themeConfig.snakeHead, '#ef4444', '#8b5cf6', '#06b6d4'];
    const strategies: AIStrategy[] = ['aggressive', 'defensive', 'random'];

    if (this.mode === 'classic') {
      const snake = new Snake(
        Math.floor(this.gridWidth / 2),
        Math.floor(this.gridHeight / 2),
        colors[0],
        this.gridWidth,
        this.gridHeight,
        3,
        false
      );
      snake.setWrapWalls(this.wrapWalls);
      this.snakes.push(snake);
    } else if (this.mode === 'battle') {
      const snake1 = new Snake(
        Math.floor(this.gridWidth / 3),
        Math.floor(this.gridHeight / 2),
        colors[0],
        this.gridWidth,
        this.gridHeight,
        3,
        false
      );
      snake1.setWrapWalls(this.wrapWalls);
      this.snakes.push(snake1);

      const snake2 = new Snake(
        Math.floor(this.gridWidth * 2 / 3),
        Math.floor(this.gridHeight / 2),
        colors[1],
        this.gridWidth,
        this.gridHeight,
        3,
        false
      );
      snake2.setWrapWalls(this.wrapWalls);
      this.snakes.push(snake2);
    } else if (this.mode === 'ai') {
      const player = new Snake(
        Math.floor(this.gridWidth / 2),
        Math.floor(this.gridHeight / 2),
        colors[0],
        this.gridWidth,
        this.gridHeight,
        3,
        false
      );
      player.setWrapWalls(this.wrapWalls);
      this.snakes.push(player);

      const aiCount = gameConfig.gameModes.ai.aiCount || 2;
      for (let i = 0; i < aiCount; i++) {
        const ai = new Snake(
          Math.floor(this.gridWidth / 4 + (i * this.gridWidth / 4)),
          Math.floor(this.gridHeight / 3 + (i % 2) * this.gridHeight / 3),
          colors[i + 1],
          this.gridWidth,
          this.gridHeight,
          3,
          true
        );
        ai.setWrapWalls(this.wrapWalls);
        this.snakes.push(ai);

        const aiSystem = new AISystem(this.gridWidth, this.gridHeight, strategies[i % strategies.length]);
        this.aiSystems.push(aiSystem);
      }
    }
  }

  private createObstacles(): void {
    const obstacleCount = gameConfig.gameModes[this.mode].obstacleCount;
    const types: ('rock' | 'tree')[] = ['rock', 'tree'];

    for (let i = 0; i < obstacleCount; i++) {
      let x: number, y: number;
      let attempts = 0;
      do {
        x = Math.floor(Math.random() * this.gridWidth);
        y = Math.floor(Math.random() * this.gridHeight);
        attempts++;
      } while (this.isPositionOccupied(x, y) && attempts < 100);

      if (attempts < 100) {
        const obstacle = new Obstacle(x, y, types[Math.floor(Math.random() * types.length)]);
        this.obstacles.push(obstacle);
      }
    }
  }

  private spawnInitialFood(): void {
    const maxFoods = gameConfig.gameModes[this.mode].maxFoods;
    for (let i = 0; i < maxFoods; i++) {
      this.spawnFood();
    }
  }

  private spawnFood(): void {
    const maxFoods = gameConfig.gameModes[this.mode].maxFoods;
    if (this.foods.length >= maxFoods) return;

    let x: number, y: number;
    let attempts = 0;
    do {
      x = Math.floor(Math.random() * this.gridWidth);
      y = Math.floor(Math.random() * this.gridHeight);
      attempts++;
    } while (this.isPositionOccupied(x, y) && attempts < 100);

    if (attempts < 100) {
      const foodTypes: FoodType[] = ['normal', 'golden', 'poison', 'speed', 'phase'];
      const weights = [0.6, 0.1, 0.1, 0.1, 0.1];
      const random = Math.random();
      let cumulative = 0;
      let selectedType: FoodType = 'normal';

      for (let i = 0; i < foodTypes.length; i++) {
        cumulative += weights[i];
        if (random < cumulative) {
          selectedType = foodTypes[i];
          break;
        }
      }

      const food = new Food(x, y, selectedType);
      this.foods.push(food);
    }
  }

  private isPositionOccupied(x: number, y: number): boolean {
    for (const snake of this.snakes) {
      for (const segment of snake.getSegments()) {
        if (segment.x === x && segment.y === y) return true;
      }
    }

    for (const obstacle of this.obstacles) {
      const pos = obstacle.getPosition();
      if (pos.x === x && pos.y === y) return true;
    }

    for (const food of this.foods) {
      const pos = food.getPosition();
      if (pos.x === x && pos.y === y) return true;
    }

    return false;
  }

  public start(): void {
    this.lastTime = performance.now();
    this.gameLoop();
  }

  private gameLoop = (): void => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    if (this.isPaused) return;

    this.elapsedTime = Date.now() - this.startTime;

    this.handleInput();

    this.updateAI(deltaTime);

    for (const snake of this.snakes) {
      if (snake.getIsAlive()) {
        snake.update(deltaTime);
      }
    }

    for (const food of this.foods) {
      food.update(deltaTime);
    }
    this.foods = this.foods.filter((f) => f.isActive());

    this.checkCollisions();

    if (this.foods.length < gameConfig.gameModes[this.mode].maxFoods) {
      this.spawnFood();
    }

    this.particleSystem.update(deltaTime);

    this.checkGameOver();
  }

  private handleInput(): void {
    if (this.snakes.length > 0 && this.snakes[0].getIsAlive()) {
      const dir1 = this.inputSystem.getPlayer1Direction();
      if (dir1) {
        this.snakes[0].setDirection(dir1);
      }
    }

    if (this.snakes.length > 1 && !this.snakes[1].getIsAI() && this.snakes[1].getIsAlive()) {
      const dir2 = this.inputSystem.getPlayer2Direction();
      if (dir2) {
        this.snakes[1].setDirection(dir2);
      }
    }

    if (this.inputSystem.isKeyJustPressed('Escape')) {
      this.isPaused = !this.isPaused;
    }
  }

  private updateAI(deltaTime: number): void {
    let aiIndex = 0;
    for (const snake of this.snakes) {
      if (snake.getIsAI() && snake.getIsAlive()) {
        const otherSnakes = this.snakes.filter((s) => s !== snake);
        this.aiSystems[aiIndex].update(snake, this.foods, otherSnakes, this.obstacles, this.wrapWalls);
      }
      if (snake.getIsAI()) aiIndex++;
    }
  }

  private checkCollisions(): void {
    for (const snake of this.snakes) {
      if (!snake.getIsAlive()) continue;

      const head = snake.getHeadPosition();

      if (!this.wrapWalls && snake.getPowerUp() !== 'phase') {
        if (head.x < 0 || head.x >= this.gridWidth || head.y < 0 || head.y >= this.gridHeight) {
          this.killSnake(snake);
          continue;
        }
      }

      const segments = snake.getSegments();
      for (let i = 1; i < segments.length; i++) {
        if (segments[0].x === segments[i].x && segments[0].y === segments[i].y) {
          this.killSnake(snake);
          break;
        }
      }

      if (snake.getPowerUp() !== 'phase') {
        for (const other of this.snakes) {
          if (other === snake || !other.getIsAlive()) continue;
          const otherSegments = other.getSegments();
          for (const seg of otherSegments) {
            if (head.x === seg.x && head.y === seg.y) {
              this.killSnake(snake);
              break;
            }
          }
        }
      }

      if (snake.getPowerUp() !== 'phase') {
        for (const obs of this.obstacles) {
          const pos = obs.getPosition();
          if (head.x === pos.x && head.y === pos.y) {
            this.killSnake(snake);
            break;
          }
        }
      }

      for (let i = this.foods.length - 1; i >= 0; i--) {
        const food = this.foods[i];
        const foodPos = food.getPosition();
        if (head.x === foodPos.x && head.y === foodPos.y) {
          this.eatFood(snake, food);
          this.foods.splice(i, 1);
        }
      }
    }
  }

  private eatFood(snake: Snake, food: Food): void {
    const config = food.getConfig();
    snake.grow(config.growth);
    snake.addScore(config.score);

    const foodPos = food.getPosition();
    this.particleSystem.emit(
      foodPos.x * this.cellSize + this.cellSize / 2,
      foodPos.y * this.cellSize + this.cellSize / 2,
      10,
      config.color,
      3,
      4,
      500
    );

    if (food.getType() === 'speed') {
      snake.setPowerUp('speed', config.duration);
      this.audioSystem.playPowerUp();
    } else if (food.getType() === 'phase') {
      snake.setPowerUp('phase', config.duration);
      this.audioSystem.playPowerUp();
    } else if (food.getType() === 'poison') {
      snake.setPowerUp('slow', config.duration);
    } else {
      this.audioSystem.playEat();
    }
  }

  private killSnake(snake: Snake): void {
    snake.setIsAlive(false);
    this.audioSystem.playDeath();

    const head = snake.getHeadPosition();
    this.particleSystem.emit(
      head.x * this.cellSize + this.cellSize / 2,
      head.y * this.cellSize + this.cellSize / 2,
      30,
      snake.getColor(),
      5,
      6,
      1000
    );
  }

  private checkGameOver(): void {
    const aliveSnakes = this.snakes.filter((s) => s.getIsAlive());

    if (this.mode === 'classic' && aliveSnakes.length === 0) {
      this.gameOver();
    } else if (this.mode === 'battle' && aliveSnakes.length <= 1) {
      this.gameOver();
    } else if (this.mode === 'ai' && aliveSnakes.filter((s) => !s.getIsAI()).length === 0) {
      this.gameOver();
    }
  }

  private gameOver(): void {
    this.isRunning = false;

    const playerScores = this.snakes.filter((s) => !s.getIsAI()).map((s) => s.getScore());
    const playerName = StorageSystem.getPlayerName();

    for (const score of playerScores) {
      StorageSystem.addScore(this.mode, playerName, score);
    }

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private render(): void {
    const themeConfig = gameConfig.themes[this.theme];

    this.ctx.fillStyle = themeConfig.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.strokeStyle = themeConfig.grid;
    this.ctx.lineWidth = 0.5;
    for (let x = 0; x <= this.gridWidth; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * this.cellSize, 0);
      this.ctx.lineTo(x * this.cellSize, this.canvas.height);
      this.ctx.stroke();
    }
    for (let y = 0; y <= this.gridHeight; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * this.cellSize);
      this.ctx.lineTo(this.canvas.width, y * this.cellSize);
      this.ctx.stroke();
    }

    for (const obstacle of this.obstacles) {
      obstacle.render(this.ctx, this.cellSize);
    }

    for (const food of this.foods) {
      food.render(this.ctx, this.cellSize);
    }

    for (const snake of this.snakes) {
      if (snake.getIsAlive()) {
        snake.render(this.ctx, this.cellSize);
      }
    }

    this.particleSystem.render(this.ctx);
  }

  public getSnakeScores(): number[] {
    return this.snakes.filter((s) => !s.getIsAI()).map((s) => s.getScore());
  }

  public getElapsedTime(): number {
    return this.elapsedTime;
  }

  public getTheme(): Theme {
    return this.theme;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}