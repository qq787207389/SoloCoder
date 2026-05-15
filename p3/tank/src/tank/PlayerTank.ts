import { Tank } from './Tank';
import { Direction, TankType, KEYS } from '../constants';
import { TileMap } from '../map/TileMap';
import gameConfig from '../config/gameConfig.json';

interface Controls {
  up: string;
  down: string;
  left: string;
  right: string;
  fire: string;
}

export class PlayerTank extends Tank {
  public playerIndex: number;
  private controls: Controls;
  public lives: number;
  public score: number;

  constructor(x: number, y: number, playerIndex: number = 0) {
    const type = playerIndex === 0 ? TankType.PLAYER1 : TankType.PLAYER2;
    super(x, y, type, gameConfig.tank.playerSpeed);
    this.playerIndex = playerIndex;
    this.lives = 3;
    this.score = 0;
    this.controls = this.getControls();
  }

  private getControls(): Controls {
    if (this.playerIndex === 0) {
      return {
        up: KEYS.P1_UP,
        down: KEYS.P1_DOWN,
        left: KEYS.P1_LEFT,
        right: KEYS.P1_RIGHT,
        fire: KEYS.P1_FIRE
      };
    } else {
      return {
        up: KEYS.P2_UP,
        down: KEYS.P2_DOWN,
        left: KEYS.P2_LEFT,
        right: KEYS.P2_RIGHT,
        fire: KEYS.P2_FIRE
      };
    }
  }

  handleInput(keys: Set<string>, deltaTime: number, map: TileMap, currentTime: number): boolean {
    let wantsToFire = false;

    if (keys.has(this.controls.up)) {
      this.move(Direction.UP, deltaTime, map);
    } else if (keys.has(this.controls.down)) {
      this.move(Direction.DOWN, deltaTime, map);
    } else if (keys.has(this.controls.left)) {
      this.move(Direction.LEFT, deltaTime, map);
    } else if (keys.has(this.controls.right)) {
      this.move(Direction.RIGHT, deltaTime, map);
    }

    if (keys.has(this.controls.fire) && this.canFire(currentTime)) {
      wantsToFire = true;
      this.fire(currentTime);
    }

    return wantsToFire;
  }

  respawn(x: number, y: number): void {
    this.position.set(x, y);
    this.direction = Direction.UP;
    this.health = 1;
    this.active = true;
    this.setInvincible(3000);
    this.updateBounds();
  }

  addScore(points: number): void {
    this.score += points;
  }

  loseLife(): void {
    this.lives--;
    if (this.lives <= 0) {
      this.lives = 0;
    }
  }

  hasLivesLeft(): boolean {
    return this.lives > 0;
  }
}
