import { Player } from './Player';
import { GameConfig } from '@/config/GameConfig';

export class AIController {
  player: Player;
  target: Player;
  isActive: boolean;
  aiState: 'idle' | 'chase' | 'retreat' | 'collect';
  decisionTimer: number;
  decisionInterval: number;
  moveDirection: number;
  shouldInflate: boolean;
  targetY: number;

  constructor(player: Player, target: Player) {
    this.player = player;
    this.target = target;
    this.isActive = true;
    this.aiState = 'idle';
    this.decisionTimer = 0;
    this.decisionInterval = 500;
    this.moveDirection = 0;
    this.shouldInflate = false;
    this.targetY = GameConfig.HEIGHT / 2;
  }

  update(delta: number): void {
    if (!this.isActive || !this.player.isAlive) {
      this.player.stopMoving();
      this.player.stopInflating();
      return;
    }

    this.decisionTimer += delta;
    if (this.decisionTimer >= this.decisionInterval) {
      this.makeDecision();
      this.decisionTimer = 0;
    }

    this.executeDecision(delta);
  }

  makeDecision(): void {
    if (!this.target.isAlive) {
      this.aiState = 'idle';
      return;
    }

    const dx = this.target.x - this.player.x;
    const dy = this.target.y - this.player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const inflationPercent = this.player.inflation.getPercentage();

    if (inflationPercent < 0.2) {
      this.aiState = 'retreat';
    } else if (dist < 200) {
      this.aiState = 'chase';
    } else if (Math.random() < 0.3) {
      this.aiState = 'collect';
    } else {
      this.aiState = 'chase';
    }

    this.targetY = this.target.y + Phaser.Math.Between(-50, 50);

    switch (this.aiState) {
      case 'chase':
        this.moveDirection = dx > 0 ? 1 : -1;
        if (Math.abs(dx) < 50) {
          this.moveDirection = 0;
        }
        break;
      case 'retreat':
        this.moveDirection = dx > 0 ? -1 : 1;
        this.targetY = this.player.y - 100;
        break;
      case 'collect':
        this.moveDirection = Math.random() > 0.5 ? 1 : -1;
        this.targetY = Phaser.Math.Between(150, GameConfig.HEIGHT - 150);
        break;
      default:
        this.moveDirection = 0;
        this.targetY = GameConfig.HEIGHT / 2;
    }
  }

  executeDecision(delta: number): void {
    if (this.moveDirection < 0) {
      this.player.moveLeft();
    } else if (this.moveDirection > 0) {
      this.player.moveRight();
    } else {
      this.player.stopMoving();
    }

    const dy = this.targetY - this.player.y;
    const inflationPercent = this.player.inflation.getPercentage();

    if (dy < -30 && inflationPercent > 0.1 && this.player.inflation.canInflate()) {
      this.player.startInflating();
    } else if (dy > 50 || inflationPercent < 0.15) {
      this.player.stopInflating();
    } else if (this.aiState === 'chase' && this.target.y < this.player.y - 20 && inflationPercent > 0.2) {
      this.player.startInflating();
    } else if (this.player.isInflating && this.player.y < this.targetY - 50) {
      this.player.stopInflating();
    }
  }

  setActive(active: boolean): void {
    this.isActive = active;
    if (!active) {
      this.player.stopMoving();
      this.player.stopInflating();
    }
  }

  setTarget(target: Player): void {
    this.target = target;
  }
}
