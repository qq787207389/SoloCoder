import { IEntity, distance } from '../utils/collision';
import { WolfState, WolfStateType, WOLF, GAME_HEIGHT, GAME_WIDTH, BALLOON_COLORS, MEAT } from '../utils/constants';
import { SpriteRenderer } from '../rendering/Sprite';
import { Rock } from './Rock';

export class Wolf implements IEntity {
  public x: number;
  public y: number;
  public width: number = WOLF.WIDTH;
  public height: number = WOLF.HEIGHT;
  public active: boolean = true;

  public state: WolfStateType;
  public isPink: boolean = false;
  public balloonColor: string;
  public hasBalloon: boolean = true;
  public velocityY: number = 0;
  public isLeftmost: boolean = false;
  private wasShot: boolean = false;

  private speed: number;
  private directionX: number = 0;
  private rockThrowTimer: number = 0;
  private bonusDropTimer: number = 0;
  private animFrame: number = 0;
  private animTimer: number = 0;

  constructor(
    x: number,
    y: number,
    state: WolfStateType,
    speed: number,
    isPink: boolean = false
  ) {
    this.x = x;
    this.y = y;
    this.state = state;
    this.speed = speed;
    this.isPink = isPink;
    this.balloonColor = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];

    if (state === WolfState.BALLOONING) {
      this.directionX = Math.random() > 0.5 ? 1 : -1;
    }
  }

  public update(deltaTime: number): void {
    if (!this.active) return;

    this.animTimer += deltaTime;
    if (this.animTimer > 200) {
      this.animFrame = (this.animFrame + 1) % 2;
      this.animTimer = 0;
    }

    switch (this.state) {
      case WolfState.BALLOONING:
        this.updateBallooning(deltaTime);
        break;
      case WolfState.FALLING:
        this.updateFalling(deltaTime);
        break;
      case WolfState.CLIMBING:
        this.updateClimbing(deltaTime);
        break;
      case WolfState.ASCENDING:
        this.updateAscending(deltaTime);
        break;
      case WolfState.REACHED_TOP:
        this.updateReachedTop(deltaTime);
        break;
      case WolfState.ATTACKING:
        this.updateAttacking(deltaTime);
        break;
      case WolfState.DEAD:
        this.active = false;
        break;
    }

    if (this.isPink) {
      this.bonusDropTimer += deltaTime;
    }
  }

  private updateBallooning(deltaTime: number): void {
    this.y += this.speed * (deltaTime / 1000);
    this.x += this.directionX * this.speed * 0.3 * (deltaTime / 1000);

    if (this.x < 150 || this.x > GAME_WIDTH - 100) {
      this.directionX *= -1;
    }

    if (this.y > GAME_HEIGHT - 80) {
      this.state = WolfState.CLIMBING;
      this.x = 80;
    }
  }

  private updateFalling(deltaTime: number): void {
    this.velocityY += 500 * (deltaTime / 1000);
    this.y += this.velocityY * (deltaTime / 1000);

    if (this.y > GAME_HEIGHT - 60) {
      if (this.wasShot) {
        this.state = WolfState.DEAD;
        this.active = false;
      } else {
        this.y = GAME_HEIGHT - 60;
        this.state = WolfState.CLIMBING;
        this.x = 80;
      }
    }
  }

  private updateClimbing(deltaTime: number): void {
    this.y -= WOLF.CLIMB_SPEED * (deltaTime / 1000);

    if (this.y < 100) {
      this.state = WolfState.ATTACKING;
    }
  }

  private updateAscending(deltaTime: number): void {
    this.y -= this.speed * (deltaTime / 1000);
    this.x += this.directionX * this.speed * 0.3 * (deltaTime / 1000);

    if (this.x < 150 || this.x > GAME_WIDTH - 100) {
      this.directionX *= -1;
    }

    if (this.y < 60) {
      this.state = WolfState.REACHED_TOP;
      this.y = 60;
    }
  }

  private updateReachedTop(_deltaTime: number): void {
  }

  private updateAttacking(deltaTime: number): void {
    this.rockThrowTimer += deltaTime;
  }

  public popBalloon(): void {
    if (!this.hasBalloon) return;
    
    this.hasBalloon = false;
    this.wasShot = true;
    this.state = WolfState.FALLING;
    this.velocityY = 50;
  }

  public grabMeat(): void {
    this.hasBalloon = false;
    this.wasShot = true;
    this.state = WolfState.FALLING;
    this.velocityY = 100;
  }

  public canThrowRock(): boolean {
    return this.state === WolfState.ATTACKING && this.rockThrowTimer > WOLF.ROCK_THROW_INTERVAL;
  }

  public throwRock(): Rock | null {
    if (!this.canThrowRock()) return null;
    
    this.rockThrowTimer = 0;
    return new Rock(this.x + this.width / 2, this.y + this.height / 2, 200, 100);
  }

  public canDropBonus(): boolean {
    return this.isPink && this.bonusDropTimer > 2000;
  }

  public resetBonusTimer(): void {
    this.bonusDropTimer = 0;
  }

  public getBalloonCenter(): { x: number; y: number } {
    return {
      x: this.x + this.width / 2,
      y: this.y - WOLF.BALLOON_RADIUS - 10
    };
  }

  public checkMeatProximity(meatX: number, meatY: number): boolean {
    if (!this.hasBalloon || this.state !== WolfState.BALLOONING) return false;
    
    const dist = distance(
      this.x + this.width / 2,
      this.y + this.height / 2,
      meatX,
      meatY
    );
    
    return dist < MEAT.DETECT_RADIUS;
  }

  public render(sprite: SpriteRenderer): void {
    if (!this.active) return;

    if (this.hasBalloon) {
      const balloonCenter = this.getBalloonCenter();
      sprite.drawBalloon(balloonCenter.x, balloonCenter.y, WOLF.BALLOON_RADIUS, this.balloonColor);
    }

    sprite.drawWolf(this.x, this.y, this.isPink);

    if (this.state === WolfState.CLIMBING) {
      sprite.drawLadder(60, 100, 40, GAME_HEIGHT - 150);
    }
  }

  public isOnLadder(): boolean {
    return this.state === WolfState.CLIMBING || this.state === WolfState.ATTACKING;
  }

  public getLadderY(): number {
    return this.y;
  }
}
