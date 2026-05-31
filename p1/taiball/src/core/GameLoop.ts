import type { GameState, TableShape, AIShot } from '../types/game';
import { Ball as BallClass } from '../game/Ball';
import { Table } from '../game/Table';
import { Cue } from '../game/Cue';
import { PhysicsEngine, PhysicsResult } from './PhysicsEngine';
import { RuleEngine } from '../rules/RuleEngine';
import { EightBall } from '../rules/EightBall';
import { NineBall } from '../rules/NineBall';
import { AISystem } from '../ai/AISystem';
import { AudioManager } from '../audio/AudioManager';
import { Menu } from '../ui/Menu';
import { HUD } from '../ui/HUD';
import { InputManager } from '../input/InputManager';
import { CANVAS_WIDTH, CANVAS_HEIGHT, AIM_SPEED, MAX_CHARGE, MIN_CHARGE, PHYSICS, COLORS } from '../config/constants';
import { normalizeAngle, randomRange } from '../utils/math';
import { checkBallOverlap } from './Collision';

export class GameLoop {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private input: InputManager;
  private audio: AudioManager;
  private menu: Menu;
  private hud: HUD;
  private physics: PhysicsEngine;
  private ai: AISystem;

  private balls: BallClass[] = [];
  private table: Table;
  private cue: Cue;
  private ruleEngine: RuleEngine | null = null;

  private state: GameState;
  private lastTime: number = 0;
  private isPaused: boolean = false;
  private aiShot: AIShot | null = null;
  private aiChargeTimer: number = 0;
  private scale: number = 1;
  private offsetX: number = 0;
  private offsetY: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.input = new InputManager();
    this.audio = new AudioManager();
    this.menu = new Menu();
    this.hud = new HUD();
    this.physics = new PhysicsEngine();
    this.ai = new AISystem();
    this.table = new Table();
    this.cue = new Cue();

    this.state = this.createInitialState();
    this.setupCanvas();
    this.setupEventListeners();
    this.createBalls();
  }

  private createInitialState(): GameState {
    return {
      scene: 'menu',
      mode: 'eight-ball',
      difficulty: 'medium',
      currentPlayer: 1,
      player1Score: 0,
      player2Score: 0,
      player1Type: null,
      player2Type: null,
      isAiming: true,
      isCharging: false,
      chargePower: 0,
      aimAngle: 0,
      isGameOver: false,
      winner: null,
      foul: null,
      foulTimer: 0,
      frame: 1,
      shakeAmount: 0,
      shakeTimer: 0,
      firstHitBallId: null,
      pottedThisShot: [],
      cueBallPotted: false,
    };
  }

  private setupCanvas(): void {
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    this.updateCanvasScale();
    window.addEventListener('resize', () => this.updateCanvasScale());
  }

  private updateCanvasScale(): void {
    const windowRatio = window.innerWidth / window.innerHeight;
    const gameRatio = CANVAS_WIDTH / CANVAS_HEIGHT;

    if (windowRatio > gameRatio) {
      this.scale = window.innerHeight / CANVAS_HEIGHT;
    } else {
      this.scale = window.innerWidth / CANVAS_WIDTH;
    }

    this.canvas.style.width = `${CANVAS_WIDTH * this.scale}px`;
    this.canvas.style.height = `${CANVAS_HEIGHT * this.scale}px`;
    this.offsetX = (window.innerWidth - CANVAS_WIDTH * this.scale) / 2;
    this.offsetY = (window.innerHeight - CANVAS_HEIGHT * this.scale) / 2;
    this.canvas.style.marginLeft = `${this.offsetX}px`;
    this.canvas.style.marginTop = `${this.offsetY}px`;
  }

  private setupEventListeners(): void {
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
  }

  private getCanvasCoords(e: MouseEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / this.scale,
      y: (e.clientY - rect.top) / this.scale,
    };
  }

  private handleClick(e: MouseEvent): void {
    const { x, y } = this.getCanvasCoords(e);

    if (this.state.scene === 'menu') {
      const result = this.menu.handleClick(x, y);
      if (result === 'start') {
        this.startGame();
      }
    } else if (this.state.scene === 'playing' && this.state.isGameOver) {
      const result = this.hud.handleGameOverClick(x, y);
      if (result === 'restart') {
        this.restartGame();
      } else if (result === 'menu') {
        this.returnToMenu();
      }
    }
  }

  private handleMouseMove(e: MouseEvent): void {
    const { x, y } = this.getCanvasCoords(e);
    if (this.state.scene === 'menu') {
      this.menu.handleMouseMove(x, y);
    }
  }

  private createBalls(): void {
    this.balls = [];
    for (let i = 0; i <= 15; i++) {
      this.balls.push(new BallClass(i, 0, 0));
    }
  }

  private startGame(): void {
    const mode = this.menu.getSelectedMode();
    const difficulty = this.menu.getSelectedDifficulty();

    this.state.mode = mode;
    this.state.difficulty = difficulty;
    this.state.scene = 'playing';
    this.state.currentPlayer = 1;
    this.state.player1Score = 0;
    this.state.player2Score = 0;
    this.state.frame = 1;
    this.state.isGameOver = false;
    this.state.winner = null;

    let tableShape: TableShape = 'rectangle';
    if (mode === 'irregular') {
      const shapes: TableShape[] = ['l-shape', 'annular', 'obstacle'];
      tableShape = shapes[Math.floor(Math.random() * shapes.length)];
    }
    this.table.setShape(tableShape);

    this.ai.setDifficulty(difficulty);

    if (mode === 'nine-ball') {
      this.ruleEngine = new NineBall();
    } else {
      this.ruleEngine = new EightBall();
    }

    this.setupFrame();
  }

  private setupFrame(): void {
    this.state.player1Type = null;
    this.state.player2Type = null;
    this.state.isAiming = true;
    this.state.isCharging = false;
    this.state.chargePower = 0;
    this.state.aimAngle = 0;
    this.state.foul = null;
    this.state.foulTimer = 0;
    this.state.isGameOver = false;
    this.state.winner = null;
    this.state.firstHitBallId = null;
    this.state.pottedThisShot = [];
    this.state.cueBallPotted = false;

    if (this.ruleEngine) {
      this.ruleEngine.setupBalls(this.balls, this.table);
    }

    this.physics.wakeAllBalls(this.balls);
    this.cue.reset();
    this.ai.reset();
    this.aiShot = null;

    const cueBall = this.balls.find((b) => b.id === 0);
    if (cueBall) {
      this.state.aimAngle = Math.atan2(
        this.table.y + this.table.height / 2 - cueBall.y,
        this.table.x + this.table.width / 2 - cueBall.x
      );
    }
  }

  private restartGame(): void {
    this.state.frame = 1;
    this.state.player1Score = 0;
    this.state.player2Score = 0;
    this.setupFrame();
  }

  private returnToMenu(): void {
    this.state.scene = 'menu';
    this.state.isGameOver = false;
    this.menu.reset();
  }

  start(): void {
    this.lastTime = performance.now();
    this.loop();
  }

  private loop(): void {
    const currentTime = performance.now();
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame(() => this.loop());
  }

  private update(deltaTime: number): void {
    if (this.isPaused) return;

    if (this.state.scene === 'menu') {
      return;
    }

    if (this.state.foulTimer > 0) {
      this.state.foulTimer -= deltaTime * 1000;
    }

    if (this.state.shakeTimer > 0) {
      this.state.shakeTimer -= deltaTime * 1000;
      this.state.shakeAmount *= 0.9;
    }

    if (this.state.isGameOver) {
      if (this.input.consumeEnter()) {
        this.restartGame();
      }
      if (this.input.consumeEscape()) {
        this.returnToMenu();
      }
      return;
    }

    if (this.input.consumeEscape()) {
      this.returnToMenu();
      return;
    }

    const isAITurn = this.state.currentPlayer === 2;

    if (isAITurn && this.state.isAiming) {
      if (!this.ai.getIsThinking() && !this.aiShot) {
        this.ai.startThinking();
      }

      const shot = this.ai.update(deltaTime, this.balls, this.state, this.table, this.ruleEngine!);
      if (shot && !this.aiShot) {
        this.aiShot = shot;
        this.state.aimAngle = shot.angle;
        this.aiChargeTimer = 0;
      }

      if (this.aiShot) {
        this.aiChargeTimer += deltaTime;
        this.state.isCharging = true;
        this.state.chargePower = Math.min(MAX_CHARGE, this.aiShot.power * (this.aiChargeTimer / 0.5));
        
        if (this.aiChargeTimer >= 0.5) {
          this.executeShot(this.aiShot.power);
          this.aiShot = null;
        }
      }
    } else if (this.state.isAiming) {
      this.handlePlayerInput(deltaTime);
    }

    if (!this.state.isAiming) {
      const result = this.physics.update(this.balls, this.table, deltaTime);
      this.handlePhysicsResult(result);

      if (this.physics.areAllBallsSleeping(this.balls)) {
        this.evaluateShot();
      }
    }

    this.cue.update(this.state.isCharging, this.state.chargePower, this.state.aimAngle);
  }

  private handlePlayerInput(deltaTime: number): void {
    const input = this.input.getState();

    if (input.left) {
      this.state.aimAngle = normalizeAngle(this.state.aimAngle - AIM_SPEED * deltaTime);
    }
    if (input.right) {
      this.state.aimAngle = normalizeAngle(this.state.aimAngle + AIM_SPEED * deltaTime);
    }

    if (input.space && !this.state.isCharging) {
      this.state.isCharging = true;
      this.state.chargePower = MIN_CHARGE;
    }

    if (this.state.isCharging) {
      if (input.space) {
        this.state.chargePower = Math.min(MAX_CHARGE, this.state.chargePower + 0.015);
      } else {
        const power = Math.max(MIN_CHARGE, this.state.chargePower);
        this.executeShot(power);
      }
    }
  }

  private executeShot(power: number): void {
    const cueBall = this.balls.find((b) => b.id === 0);
    if (!cueBall || cueBall.isPotted) return;

    this.cue.shoot(cueBall, power);
    this.audio.playHit(power);

    this.state.isAiming = false;
    this.state.isCharging = false;
    this.state.chargePower = 0;
    this.state.firstHitBallId = null;
    this.state.pottedThisShot = [];
    this.state.cueBallPotted = false;

    this.physics.wakeAllBalls(this.balls);

    this.state.shakeAmount = power * 8;
    this.state.shakeTimer = 150;
  }

  private handlePhysicsResult(result: PhysicsResult): void {
    for (const collision of result.ballCollisions) {
      if (this.state.firstHitBallId === null) {
        if (collision.b1 === 0) {
          this.state.firstHitBallId = collision.b2;
        } else if (collision.b2 === 0) {
          this.state.firstHitBallId = collision.b1;
        }
      }
      
      if (collision.speed > 2) {
        this.audio.playHit(Math.min(1, collision.speed / 10));
      }
    }

    for (const collision of result.wallCollisions) {
      if (collision.speed > 1) {
        this.audio.playWallHit(Math.min(1, collision.speed / 8));
      }
    }

    for (const obstacle of result.obstacleCollisions) {
      if (obstacle.speed > 1) {
        this.audio.playWallHit(Math.min(1, obstacle.speed / 8));
      }
    }

    for (const potted of result.pottedBalls) {
      const ball = this.balls.find((b) => b.id === potted.ballId);
      const pocket = this.table.pockets[potted.pocketIndex];
      if (ball && pocket) {
        ball.setPocketPosition(pocket.x, pocket.y);
        this.audio.playPocket();

        if (potted.ballId === 0) {
          this.state.cueBallPotted = true;
        } else {
          this.state.pottedThisShot.push(potted.ballId);
        }
      }
    }
  }

  private evaluateShot(): void {
    if (!this.ruleEngine) return;

    const result = this.ruleEngine.evaluate(this.balls, this.state, this.table);

    if (result.foul) {
      this.state.foul = result.foul;
      this.state.foulTimer = 2000;
      this.audio.playFoul();
      
      if (this.state.cueBallPotted) {
        this.respawnCueBall();
      }

      this.state.currentPlayer = this.state.currentPlayer === 1 ? 2 : 1;
    } else if (result.gameOver) {
      this.state.isGameOver = true;
      this.state.winner = result.winner;
      if (result.winner === 1) {
        this.state.player1Score++;
        this.audio.playVictory();
      } else {
        this.state.player2Score++;
      }
      return;
    } else if (result.continueTurn) {
      if (this.state.currentPlayer === 1) {
        this.state.player1Score += this.state.pottedThisShot.length;
      } else {
        this.state.player2Score += this.state.pottedThisShot.length;
      }
    } else {
      if (this.state.currentPlayer === 1) {
        this.state.player1Score += this.state.pottedThisShot.length;
      } else {
        this.state.player2Score += this.state.pottedThisShot.length;
      }
      this.state.currentPlayer = this.state.currentPlayer === 1 ? 2 : 1;
    }

    if (this.state.cueBallPotted && !result.foul) {
      this.respawnCueBall();
    }

    this.state.isAiming = true;
    this.cue.reset();
  }

  private respawnCueBall(): void {
    const cueBall = this.balls.find((b) => b.id === 0);
    if (!cueBall) return;

    const { left, top, bottom } = this.table.playArea;
    const spawnX = left + (this.table.playArea.right - left) * 0.25;
    let spawnY = (top + bottom) / 2;

    cueBall.isPotted = false;
    cueBall.isSleeping = false;
    cueBall.vx = 0;
    cueBall.vy = 0;
    cueBall.pottedAnimation = 0;

    let attempts = 0;
    while (checkBallOverlap(this.balls) && attempts < 50) {
      spawnY += randomRange(-20, 20);
      cueBall.x = spawnX;
      cueBall.y = Math.max(top + PHYSICS.BALL_RADIUS + 5, Math.min(bottom - PHYSICS.BALL_RADIUS - 5, spawnY));
      attempts++;
    }

    if (checkBallOverlap(this.balls)) {
      cueBall.x = spawnX;
      cueBall.y = (top + bottom) / 2;
    }
  }

  private render(): void {
    const ctx = this.ctx;

    ctx.fillStyle = COLORS.BACKGROUND;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (this.state.scene === 'menu') {
      this.menu.render(ctx);
      return;
    }

    ctx.save();
    if (this.state.shakeTimer > 0) {
      ctx.translate(
        (Math.random() - 0.5) * this.state.shakeAmount,
        (Math.random() - 0.5) * this.state.shakeAmount
      );
    }

    this.table.render(ctx);

    const ballsSorted = [...this.balls].sort((a, b) => {
      if (a.isPotted && !b.isPotted) return -1;
      if (!a.isPotted && b.isPotted) return 1;
      return a.y - b.y;
    });

    for (const ball of ballsSorted) {
      ball.render(ctx);
    }

    const cueBall = this.balls.find((b) => b.id === 0);
    if (cueBall && !cueBall.isPotted && this.state.isAiming && !this.state.isGameOver) {
      this.cue.renderAimLine(
        ctx,
        cueBall.x,
        cueBall.y,
        this.state.chargePower,
        this.table.width,
        this.table.height
      );
      this.cue.render(ctx, cueBall.x, cueBall.y);
    }

    ctx.restore();

    const ballsRemaining = this.getBallsRemaining();
    this.hud.render(
      ctx,
      this.state,
      ballsRemaining,
      this.state.currentPlayer === 2,
      this.ai.getIsThinking(),
      this.ai.getThinkProgress()
    );
  }

  private getBallsRemaining(): { player1: number; player2: number } {
    if (!this.ruleEngine) {
      return { player1: 0, player2: 0 };
    }

    const p1Type = this.state.player1Type;
    const p2Type = this.state.player2Type;

    if (!p1Type || !p2Type) {
      const remaining = this.balls.filter((b) => b.id !== 0 && b.id !== 8 && !b.isPotted).length;
      return { player1: remaining, player2: remaining };
    }

    const player1Balls = this.balls.filter((b) => {
      if (b.id === 0 || b.id === 8) return false;
      const type = b.isStriped ? 'stripe' : 'solid';
      return type === p1Type && !b.isPotted;
    }).length;

    const player2Balls = this.balls.filter((b) => {
      if (b.id === 0 || b.id === 8) return false;
      const type = b.isStriped ? 'stripe' : 'solid';
      return type === p2Type && !b.isPotted;
    }).length;

    return { player1: player1Balls, player2: player2Balls };
  }
}
