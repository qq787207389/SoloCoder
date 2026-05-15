import { Tank } from './Tank';
import { Direction, TankType, AIType, AIState } from '../constants';
import { TileMap } from '../map/TileMap';
import { Vector2 } from '../math/Vector2';
import { PlayerTank } from './PlayerTank';
import gameConfig from '../config/gameConfig.json';

export class EnemyTank extends Tank {
  public aiType: AIType;
  public aiState: AIState;
  private changeDirectionTimer: number;
  private targetPlayer: PlayerTank | null;
  private dodgeDirection: Direction | null;
  public points: number;

  constructor(x: number, y: number, aiType: AIType = AIType.NORMAL) {
    const type = aiType === AIType.BOSS ? TankType.BOSS : TankType.NORMAL;
    const speed = aiType === AIType.BOSS ? gameConfig.tank.bossSpeed : 
                  aiType === AIType.CHASER ? gameConfig.tank.enemySpeed + 0.3 :
                  gameConfig.tank.enemySpeed;
    super(x, y, type, speed);
    
    this.aiType = aiType;
    this.aiState = AIState.PATROL;
    this.changeDirectionTimer = 0;
    this.targetPlayer = null;
    this.dodgeDirection = null;
    
    switch (aiType) {
      case AIType.BOSS:
        this.health = 5;
        this.maxHealth = 5;
        this.points = 1000;
        break;
      case AIType.ELITE:
        this.health = 2;
        this.maxHealth = 2;
        this.points = 300;
        break;
      case AIType.CHASER:
        this.points = 200;
        break;
      case AIType.DODGER:
        this.points = 250;
        break;
      default:
        this.points = 100;
    }
  }

  setTargetPlayer(player: PlayerTank): void {
    this.targetPlayer = player;
  }

  updateAI(deltaTime: number, map: TileMap, currentTime: number, players: PlayerTank[]): boolean {
    this.changeDirectionTimer -= deltaTime;

    if (this.changeDirectionTimer <= 0) {
      this.changeDirectionTimer = 1000 + Math.random() * 2000;
      this.chooseNewDirection(players);
    }

    this.move(this.direction, deltaTime, map);

    let wantsToFire = false;
    if (this.aiType !== AIType.DODGER) {
      if (this.shouldFire(players) && this.canFire(currentTime)) {
        wantsToFire = true;
        this.fire(currentTime);
      }
    }

    return wantsToFire;
  }

  private chooseNewDirection(players: PlayerTank[]): void {
    switch (this.aiType) {
      case AIType.CHASER:
        this.chooseChaserDirection(players);
        break;
      case AIType.DODGER:
        this.chooseDodgeDirection(players);
        break;
      case AIType.ELITE:
        this.chooseEliteDirection(players);
        break;
      case AIType.BOSS:
        this.chooseBossDirection(players);
        break;
      default:
        this.chooseRandomDirection();
    }
  }

  private chooseRandomDirection(): void {
    const directions = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
    this.direction = directions[Math.floor(Math.random() * directions.length)];
  }

  private chooseChaserDirection(players: PlayerTank[]): void {
    const nearestPlayer = this.findNearestPlayer(players);
    if (!nearestPlayer) {
      this.chooseRandomDirection();
      return;
    }

    const dx = nearestPlayer.position.x - this.position.x;
    const dy = nearestPlayer.position.y - this.position.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      this.direction = dx > 0 ? Direction.RIGHT : Direction.LEFT;
    } else {
      this.direction = dy > 0 ? Direction.DOWN : Direction.UP;
    }
  }

  private chooseDodgeDirection(players: PlayerTank[]): void {
    const nearestPlayer = this.findNearestPlayer(players);
    if (!nearestPlayer) {
      this.chooseRandomDirection();
      return;
    }

    const dx = nearestPlayer.position.x - this.position.x;
    const dy = nearestPlayer.position.y - this.position.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      this.direction = dx > 0 ? Direction.LEFT : Direction.RIGHT;
    } else {
      this.direction = dy > 0 ? Direction.UP : Direction.DOWN;
    }
  }

  private chooseEliteDirection(players: PlayerTank[]): void {
    if (Math.random() > 0.5) {
      this.chooseChaserDirection(players);
    } else {
      this.chooseRandomDirection();
    }
  }

  private chooseBossDirection(players: PlayerTank[]): void {
    if (Math.random() > 0.3) {
      this.chooseChaserDirection(players);
    } else {
      this.chooseRandomDirection();
    }
  }

  private findNearestPlayer(players: PlayerTank[]): PlayerTank | null {
    let nearest: PlayerTank | null = null;
    let minDist = Infinity;

    for (const player of players) {
      if (!player.active) continue;
      const dist = Vector2.distance(this.position, player.position);
      if (dist < minDist) {
        minDist = dist;
        nearest = player;
      }
    }

    return nearest;
  }

  private shouldFire(players: PlayerTank[]): boolean {
    for (const player of players) {
      if (!player.active) continue;

      const sameRow = Math.abs(this.position.y - player.position.y) < 16;
      const sameCol = Math.abs(this.position.x - player.position.x) < 16;

      if (sameRow) {
        if (this.direction === Direction.LEFT && player.position.x < this.position.x) return true;
        if (this.direction === Direction.RIGHT && player.position.x > this.position.x) return true;
      }
      if (sameCol) {
        if (this.direction === Direction.UP && player.position.y < this.position.y) return true;
        if (this.direction === Direction.DOWN && player.position.y > this.position.y) return true;
      }
    }

    return Math.random() < 0.02;
  }

  setDodgeDirection(direction: Direction): void {
    this.dodgeDirection = direction;
  }
}
