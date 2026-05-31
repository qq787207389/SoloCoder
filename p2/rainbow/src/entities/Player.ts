import {
  PLAYER_WIDTH,
  PLAYER_HEIGHT,
  PLAYER_SPEED,
  PLAYER_JUMP_FORCE,
  MAX_LIVES,
  INVINCIBLE_TIME,
} from '../utils/Constants';
import { InputManager } from '../game/InputManager';

export class Player {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  facing: number;
  onGround: boolean;
  lives: number;
  invincible: boolean;
  invincibleTimer: number;
  score: number;
  animTime: number;
  isDrawingRainbow: boolean;
  jumpPressed: boolean;
  jumpHeld: boolean;
  coyoteTime: number = 0.1;
  coyoteTimer: number;
  jumpBufferTime: number = 0.12;
  jumpBufferTimer: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.w = PLAYER_WIDTH;
    this.h = PLAYER_HEIGHT;
    this.facing = 1;
    this.onGround = false;
    this.lives = MAX_LIVES;
    this.invincible = false;
    this.invincibleTimer = 0;
    this.score = 0;
    this.animTime = 0;
    this.isDrawingRainbow = false;
    this.jumpPressed = false;
    this.jumpHeld = false;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
  }

  update(dt: number, input: InputManager, gravity: number): void {
    this.invincibleTimer = Math.max(0, this.invincibleTimer - dt);
    this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
    this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);
    this.animTime += dt;

    this.invincible = this.invincibleTimer > 0;

    if (input.isJump()) {
      this.jumpBufferTimer = this.jumpBufferTime;
    }

    let moving = false;
    if (input.isLeft()) {
      this.vx = PLAYER_SPEED * -1;
      this.facing = -1;
      moving = true;
    }
    if (input.isRight()) {
      this.vx = PLAYER_SPEED * 1;
      this.facing = 1;
      moving = true;
    }
    if (!moving) {
      this.vx *= 0.8;
    }

    const wasOnGround = this.onGround;
    this.onGround = false;

    if (wasOnGround) {
      this.coyoteTimer = this.coyoteTime;
    }

    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
      this.vy = PLAYER_JUMP_FORCE;
      this.onGround = false;
      this.jumpBufferTimer = 0;
      this.coyoteTimer = 0;
      this.jumpHeld = true;
    }

    if (this.vy < 0 && !(input.isHeld('Space') || input.isHeld('ArrowUp') || input.isHeld('KeyW'))) {
      this.vy *= 0.5;
    }

    this.vy += gravity * dt;
    this.vy = Math.min(this.vy, 600);

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.isDrawingRainbow = input.isAttackHeld();
  }

  getRect(): { x: number; y: number; w: number; h: number } {
    return {
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h,
    };
  }

  takeDamage(): boolean {
    if (!this.invincible) {
      this.lives--;
      this.invincible = true;
      this.invincibleTimer = INVINCIBLE_TIME;
      this.vy = -200;
      return true;
    }
    return false;
  }

  addScore(points: number): void {
    this.score += points;
  }

  heal(): void {
    if (this.lives < MAX_LIVES) {
      this.lives++;
    }
  }

  setOnGround(grounded: boolean): void {
    this.onGround = grounded;
    if (grounded) {
      this.vy = 0;
    }
  }

  reset(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1;
    this.onGround = false;
    this.lives = MAX_LIVES;
    this.invincible = false;
    this.invincibleTimer = 0;
    this.score = 0;
    this.animTime = 0;
    this.isDrawingRainbow = false;
    this.jumpPressed = false;
    this.jumpHeld = false;
    this.coyoteTimer = 0;
    this.jumpBufferTimer = 0;
  }
}
