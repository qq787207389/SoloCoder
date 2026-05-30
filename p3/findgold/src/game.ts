import { CANVAS_WIDTH, CANVAS_HEIGHT, MAP_COLS, MAP_ROWS } from './constants';
import type { GameState } from './types';
import { LEVELS } from './levels';
import { GameMap } from './map';
import { PlayerController } from './player';
import { EnemyController } from './enemy';
import { InputManager } from './input';
import { Renderer } from './renderer';

export class Game {
  private canvas: HTMLCanvasElement;
  private renderer: Renderer;
  private input: InputManager;
  private map!: GameMap;
  private player!: PlayerController;
  private enemies!: EnemyController;

  private state: GameState;
  private lastTime: number = 0;
  private animationId: number = 0;
  private hudElements: {
    level: HTMLElement;
    gold: HTMLElement;
    totalGold: HTMLElement;
    time: HTMLElement;
    score: HTMLElement;
    lives: HTMLElement;
  };
  private overlay: HTMLElement;
  private levelStartTime: number = 0;
  private totalTime: number = 0;
  private spacePressed: boolean = false;
  private pPressed: boolean = false;
  private rPressed: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    this.renderer = new Renderer(canvas);
    this.input = new InputManager();

    this.state = {
      level: 1,
      score: 0,
      lives: 3,
      goldCollected: 0,
      totalGold: 0,
      time: 0,
      state: 'menu',
      exitActive: false,
    };

    this.hudElements = {
      level: document.getElementById('level')!,
      gold: document.getElementById('gold')!,
      totalGold: document.getElementById('total-gold')!,
      time: document.getElementById('time')!,
      score: document.getElementById('score')!,
      lives: document.getElementById('lives')!,
    };
    this.overlay = document.getElementById('overlay')!;

    this.setupUI();
  }

  private setupUI(): void {
    const startBtn = document.getElementById('start-btn')!;
    startBtn.addEventListener('click', () => {
      this.startGame();
    });
  }

  startGame(): void {
    this.state = {
      level: 1,
      score: 0,
      lives: 3,
      goldCollected: 0,
      totalGold: 0,
      time: 0,
      state: 'playing',
      exitActive: false,
    };
    this.totalTime = 0;
    this.loadLevel(1);
    this.hideOverlay();
    this.startLoop();
  }

  private loadLevel(levelNum: number): void {
    const levelIndex = levelNum - 1;
    if (levelIndex >= LEVELS.length) {
      this.state.state = 'victory';
      return;
    }

    const levelData = LEVELS[levelIndex];
    this.map = new GameMap(levelData);
    this.player = new PlayerController(levelData.playerStart.x, levelData.playerStart.y);
    this.enemies = new EnemyController();

    for (const enemyData of levelData.enemies) {
      this.enemies.spawnEnemy(enemyData.col, enemyData.row, enemyData.aiType);
    }

    this.state.level = levelNum;
    this.state.goldCollected = 0;
    this.state.totalGold = this.map.getTotalGold();
    this.state.exitActive = false;
    this.levelStartTime = performance.now();
    this.updateHUD();
  }

  private startLoop(): void {
    this.lastTime = performance.now();
    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - this.lastTime) / 1000, 0.05);
      this.lastTime = currentTime;
      this.update(dt, currentTime);
      this.render(currentTime);
      if (this.state.state !== 'menu') {
        this.animationId = requestAnimationFrame(loop);
      }
    };
    this.animationId = requestAnimationFrame(loop);
  }

  private update(dt: number, currentTime: number): void {
    this.input.update();

    if (this.input.wasJustPressed('p') && !this.pPressed) {
      this.pPressed = true;
      if (this.state.state === 'playing') {
        this.state.state = 'paused';
      } else if (this.state.state === 'paused') {
        this.state.state = 'playing';
      }
    } else if (!this.input.isKeyPressed('p')) {
      this.pPressed = false;
    }

    if (this.input.wasJustPressed('r') && !this.rPressed) {
      this.rPressed = true;
      if (this.state.state === 'gameOver' || this.state.state === 'victory') {
        this.startGame();
        return;
      } else if (this.state.state === 'playing' || this.state.state === 'paused') {
        this.loadLevel(this.state.level);
        return;
      }
    } else if (!this.input.isKeyPressed('r')) {
      this.rPressed = false;
    }

    if (this.state.state === 'levelComplete') {
      if (this.input.wasJustPressed(' ') && !this.spacePressed) {
        this.spacePressed = true;
        this.state.state = 'playing';
        this.totalTime += this.state.time;
        this.loadLevel(this.state.level + 1);
      } else if (!this.input.isKeyPressed(' ')) {
        this.spacePressed = false;
      }
      return;
    }

    if (this.state.state !== 'playing') return;

    this.state.time = (currentTime - this.levelStartTime) / 1000;

    const inputState = this.input.getState();
    this.map.update(dt);

    if (this.input.consumeDig()) {
      this.player.dig(this.map);
    }

    const playerData = this.player.getPlayer();
    this.player.update(dt, inputState, this.map);

    this.enemies.update(dt, this.map, playerData);

    this.checkCollisions();
    this.checkGoldCollection();
    this.checkExit();
    this.updateHUD();

    if (this.player.getPlayer().alive === false) {
      this.handlePlayerDeath();
    }
  }

  private checkCollisions(): void {
    const p = this.player.getPlayer();
    const enemy = this.enemies.checkPlayerCollision(p.x, p.y, p.width, p.height);
    if (enemy) {
      this.player.kill();
    }
  }

  private checkGoldCollection(): void {
    const remaining = this.map.getRemainingGold();
    const collected = this.state.totalGold - remaining;
    if (collected > this.state.goldCollected) {
      const goldDiff = collected - this.state.goldCollected;
      this.state.score += goldDiff * 100;
      this.state.goldCollected = collected;
    }

    if (remaining === 0 && !this.state.exitActive) {
      this.state.exitActive = true;
      this.map.activateExit();
    }
  }

  private checkExit(): void {
    if (this.state.exitActive && this.player.checkExit(this.map)) {
      this.completeLevel();
    }
  }

  private completeLevel(): void {
    const timeBonus = Math.max(0, Math.floor((120 - this.state.time) * 10));
    this.state.score += 500 + timeBonus;
    this.state.state = 'levelComplete';
    this.updateHUD();
  }

  private handlePlayerDeath(): void {
    this.state.lives--;
    if (this.state.lives <= 0) {
      this.state.state = 'gameOver';
      this.updateHUD();
    } else {
      setTimeout(() => {
        if (this.state.state === 'playing') {
          this.map.reset();
          this.player.respawn();
          this.enemies.reset();
          const levelData = LEVELS[this.state.level - 1];
          for (const enemyData of levelData.enemies) {
            this.enemies.spawnEnemy(enemyData.col, enemyData.row, enemyData.aiType);
          }
          this.state.exitActive = false;
          this.state.goldCollected = 0;
          this.levelStartTime = performance.now();
        }
      }, 1000);
    }
  }

  private render(currentTime: number): void {
    this.renderer.clear();

    if (!this.map) return;

    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const tile = this.map.getTile(col, row);
        if (tile !== 0) {
          this.renderer.drawTile(col, row, tile);
        }
      }
    }

    for (const hole of this.map.getHoles()) {
      this.renderer.drawHole(hole);
    }

    for (const gold of this.map.getGolds()) {
      this.renderer.drawGold(gold, currentTime);
    }

    for (const enemy of this.enemies.getEnemies()) {
      this.renderer.drawEnemy(enemy, currentTime);
    }

    this.renderer.drawPlayer(this.player.getPlayer(), currentTime);

    const allParticles = [
      ...this.player.getParticles(),
      ...this.enemies.getParticles(),
    ];
    this.renderer.drawParticles(allParticles);

    if (this.state.state === 'paused') {
      this.renderer.drawPauseOverlay();
    } else if (this.state.state === 'levelComplete') {
      this.renderer.drawLevelComplete(this.state.level, this.state.score, this.state.time);
    } else if (this.state.state === 'gameOver') {
      this.renderer.drawGameOver(this.state.score);
    } else if (this.state.state === 'victory') {
      this.renderer.drawVictory(this.state.score, this.totalTime + this.state.time);
    }
  }

  private updateHUD(): void {
    this.hudElements.level.textContent = String(this.state.level);
    this.hudElements.gold.textContent = String(this.state.goldCollected);
    this.hudElements.totalGold.textContent = String(this.state.totalGold);
    this.hudElements.time.textContent = this.state.time.toFixed(1);
    this.hudElements.score.textContent = String(this.state.score);
    this.hudElements.lives.textContent = String(this.state.lives);
  }

  private hideOverlay(): void {
    this.overlay.classList.add('hidden');
  }

  showOverlay(): void {
    this.overlay.classList.remove('hidden');
  }

  stop(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}
