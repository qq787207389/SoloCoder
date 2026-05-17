import { GameObject } from '../core/GameObject';
import { Direction, SnakeSegment, PowerUpType } from '../types';

export class Snake extends GameObject {
  private segments: SnakeSegment[] = [];
  private direction: Direction = 'right';
  private nextDirection: Direction = 'right';
  private isAlive: boolean = true;
  private score: number = 0;
  private color: string;
  private speedMultiplier: number = 1;
  private powerUp: PowerUpType = null;
  private powerUpEndTime: number = 0;
  private foodsEaten: number = 0;
  private moveTimer: number = 0;
  private baseMoveInterval: number = 150;
  private isAI: boolean = false;
  private gridWidth: number;
  private gridHeight: number;
  private wrapWalls: boolean = false;

  constructor(
    startX: number,
    startY: number,
    color: string,
    gridWidth: number,
    gridHeight: number,
    initialLength: number = 3,
    isAI: boolean = false
  ) {
    super(startX, startY);
    this.color = color;
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.isAI = isAI;
    this.initializeSegments(startX, startY, initialLength);
  }

  private initializeSegments(startX: number, startY: number, length: number): void {
    for (let i = 0; i < length; i++) {
      this.segments.push({
        x: startX - i,
        y: startY,
        renderX: startX - i,
        renderY: startY
      });
    }
  }

  public update(deltaTime: number): void {
    if (!this.isAlive) return;

    this.updatePowerUpStatus();
    this.moveTimer += deltaTime * this.getCurrentSpeedMultiplier();

    const moveInterval = this.getMoveInterval();
    while (this.moveTimer >= moveInterval) {
      this.moveTimer -= moveInterval;
      this.move();
    }

    this.interpolatePositions(deltaTime, moveInterval);
  }

  private getCurrentSpeedMultiplier(): number {
    if (this.powerUp === 'speed') return 1.5;
    if (this.powerUp === 'slow') return 0.5;
    return this.speedMultiplier;
  }

  private getMoveInterval(): number {
    const baseInterval = this.baseMoveInterval;
    const speedBonus = Math.floor(this.foodsEaten / 5) * 0.05;
    return baseInterval / (1 + speedBonus);
  }

  private move(): void {
    this.direction = this.nextDirection;
    const head = { ...this.segments[0] };

    switch (this.direction) {
      case 'up': head.y--; break;
      case 'down': head.y++; break;
      case 'left': head.x--; break;
      case 'right': head.x++; break;
    }

    if (this.wrapWalls && this.powerUp !== 'phase') {
      head.x = (head.x + this.gridWidth) % this.gridWidth;
      head.y = (head.y + this.gridHeight) % this.gridHeight;
    }

    head.renderX = head.x;
    head.renderY = head.y;
    this.segments.unshift(head);
    this.segments.pop();
  }

  private interpolatePositions(deltaTime: number, moveInterval: number): void {
    const progress = Math.min(this.moveTimer / moveInterval, 1);

    for (let i = 0; i < this.segments.length; i++) {
      const segment = this.segments[i];
      const next = i === 0 ? segment : this.segments[i - 1];

      segment.renderX = segment.x + (next.x - segment.x) * progress;
      segment.renderY = segment.y + (next.y - segment.y) * progress;
    }
  }

  private updatePowerUpStatus(): void {
    if (this.powerUp && Date.now() > this.powerUpEndTime) {
      this.powerUp = null;
    }
  }

  public render(ctx: CanvasRenderingContext2D, cellSize: number): void {
    if (!this.isAlive) return;

    for (let i = this.segments.length - 1; i >= 0; i--) {
      const segment = this.segments[i];
      const isHead = i === 0;
      const size = isHead ? cellSize * 0.9 : cellSize * 0.8;

      let color = this.color;
      if (this.powerUp === 'phase') {
        color = '#06b6d4';
      } else if (this.powerUp === 'speed') {
        color = '#8b5cf6';
      } else if (this.powerUp === 'slow') {
        color = '#ef4444';
      }

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(
        segment.renderX * cellSize + (cellSize - size) / 2,
        segment.renderY * cellSize + (cellSize - size) / 2,
        size,
        size,
        isHead ? 4 : 2
      );
      ctx.fill();

      if (isHead) {
        this.renderEyes(ctx, segment, cellSize);
      }
    }
  }

  private renderEyes(ctx: CanvasRenderingContext2D, head: SnakeSegment, cellSize: number): void {
    const eyeSize = cellSize * 0.15;
    const offsetX = cellSize * 0.25;
    const offsetY = cellSize * 0.2;
    const centerX = head.renderX * cellSize + cellSize / 2;
    const centerY = head.renderY * cellSize + cellSize / 2;

    let eye1X = centerX - offsetX;
    let eye1Y = centerY - offsetY;
    let eye2X = centerX + offsetX;
    let eye2Y = centerY - offsetY;

    switch (this.direction) {
      case 'up':
        eye1Y = centerY - offsetY;
        eye2Y = centerY - offsetY;
        break;
      case 'down':
        eye1Y = centerY + offsetY;
        eye2Y = centerY + offsetY;
        break;
      case 'left':
        eye1X = centerX - offsetY;
        eye2X = centerX - offsetY;
        eye1Y = centerY - offsetX;
        eye2Y = centerY + offsetX;
        break;
      case 'right':
        eye1X = centerX + offsetY;
        eye2X = centerX + offsetY;
        eye1Y = centerY - offsetX;
        eye2Y = centerY + offsetX;
        break;
    }

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2);
    ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(eye1X, eye1Y, eyeSize * 0.5, 0, Math.PI * 2);
    ctx.arc(eye2X, eye2Y, eyeSize * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  public grow(amount: number): void {
    for (let i = 0; i < Math.abs(amount); i++) {
      if (amount > 0) {
        const tail = { ...this.segments[this.segments.length - 1] };
        this.segments.push(tail);
      } else if (this.segments.length > 3) {
        this.segments.pop();
      }
    }
    this.foodsEaten++;
  }

  public addScore(amount: number): void {
    this.score = Math.max(0, this.score + amount);
  }

  public setDirection(newDirection: Direction): void {
    const opposites: Record<Direction, Direction> = {
      up: 'down',
      down: 'up',
      left: 'right',
      right: 'left'
    };
    if (opposites[newDirection] !== this.direction) {
      this.nextDirection = newDirection;
    }
  }

  public getHeadPosition(): { x: number; y: number } {
    return { x: this.segments[0].x, y: this.segments[0].y };
  }

  public getSegments(): SnakeSegment[] {
    return this.segments;
  }

  public getDirection(): Direction {
    return this.direction;
  }

  public getScore(): number {
    return this.score;
  }

  public getIsAlive(): boolean {
    return this.isAlive;
  }

  public setIsAlive(alive: boolean): void {
    this.isAlive = alive;
  }

  public getIsAI(): boolean {
    return this.isAI;
  }

  public getPowerUp(): PowerUpType {
    return this.powerUp;
  }

  public setPowerUp(powerUp: PowerUpType, duration: number): void {
    this.powerUp = powerUp;
    this.powerUpEndTime = Date.now() + duration;
  }

  public setWrapWalls(wrap: boolean): void {
    this.wrapWalls = wrap;
  }

  public getWrapWalls(): boolean {
    return this.wrapWalls;
  }

  public getFoodsEaten(): number {
    return this.foodsEaten;
  }

  public getColor(): string {
    return this.color;
  }

  public setColor(color: string): void {
    this.color = color;
  }
}