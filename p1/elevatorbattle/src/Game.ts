import {
  TILE_SIZE,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GameState,
  Bullet,
  ItemType,
  FLOOR_HEIGHT,
} from './types';
import { GameLoop } from './GameLoop';
import { Input } from './Input';
import { MapSystem } from './MapSystem';
import { ElevatorSystem } from './ElevatorSystem';
import { Player } from './Player';
import { EnemySystem } from './EnemySystem';
import { BulletSystem } from './BulletSystem';
import { CameraSystem } from './CameraSystem';
import { ItemSystem } from './ItemSystem';
import { Renderer } from './Renderer';

export class Game extends GameLoop {
  private input: Input;
  private mapSystem: MapSystem;
  private elevatorSystem: ElevatorSystem;
  private player: Player;
  private enemySystem: EnemySystem;
  private bulletSystem: BulletSystem;
  private cameraSystem: CameraSystem;
  private itemSystem: ItemSystem;
  private renderer: Renderer;

  private gameState: GameState = GameState.MENU;
  private level: number = 1;

  constructor(canvas: HTMLCanvasElement) {
    super();

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    this.input = new Input();
    this.mapSystem = new MapSystem();
    this.elevatorSystem = new ElevatorSystem(this.mapSystem);
    this.player = new Player(TILE_SIZE * 2, 0);
    this.enemySystem = new EnemySystem();
    this.bulletSystem = new BulletSystem();
    this.cameraSystem = new CameraSystem();
    this.itemSystem = new ItemSystem();
    this.renderer = new Renderer(canvas);

    this.setupEventListeners();
    this.startLevel(this.level);
  }

  private setupEventListeners(): void {
    this.cameraSystem.setOnReinforcements(() => {
      const count = 2 + Math.floor(this.level / 2);
      this.enemySystem.spawnReinforcements(this.mapSystem, count);
      this.renderer.setScreenShake(10);
    });
  }

  private startLevel(level: number): void {
    this.level = level;
    this.mapSystem.generateLevel(level);
    this.elevatorSystem.initialize(level);
    this.enemySystem.initialize(this.mapSystem, level);
    this.cameraSystem.initialize(this.mapSystem, level);
    this.itemSystem.initialize(this.mapSystem);
    this.bulletSystem.clear();

    const floors = this.mapSystem.getFloors();
    const startY = (floors[0].yOffset + FLOOR_HEIGHT - 2) * TILE_SIZE;
    const totalFiles = this.mapSystem.calculateTotalFiles();

    const score = this.player.stats.score;
    this.player.reset(TILE_SIZE * 2, startY);
    this.player.stats.score = score;
    this.player.stats.level = level;
    this.player.stats.totalFiles = totalFiles;

    this.mapSystem.setExitOpen(false);
    this.gameState = GameState.PLAYING;
  }

  private restartGame(): void {
    this.level = 1;
    this.player.stats.score = 0;
    this.startLevel(this.level);
  }

  protected update(dt: number): void {
    if (this.input.isPause()) {
      if (this.gameState === GameState.PLAYING) {
        this.gameState = GameState.PAUSED;
        this.pause();
      } else if (this.gameState === GameState.PAUSED) {
        this.gameState = GameState.PLAYING;
        this.resume();
      }
    }

    if (this.gameState === GameState.MENU) {
      if (this.input.isStart()) {
        this.restartGame();
      }
    } else if (this.gameState === GameState.WIN) {
      if (this.input.isRestart()) {
        this.restartGame();
      } else if (this.input.isStart()) {
        this.startLevel(this.level + 1);
      }
    } else if (this.gameState === GameState.LOSE) {
      if (this.input.isRestart()) {
        this.restartGame();
      }
    } else if (this.gameState === GameState.PLAYING) {
      this.updateGame(dt);
    }

    this.input.update();
  }

  private updateGame(dt: number): void {
    this.elevatorSystem.update(dt, this.player.getRect());

    this.player.update(
      dt,
      this.input,
      this.mapSystem,
      this.elevatorSystem,
      (bullet: Bullet) => {
        this.bulletSystem.addBullet(bullet);
        this.bulletSystem.createMuzzleFlash(
          bullet.x,
          bullet.y,
          this.player.direction
        );
        this.enemySystem.onPlayerShot();
      },
      () => {
        this.handleKick();
      },
      () => {
        this.renderer.setScreenShake(3);
        this.checkExitOpen();
      },
      () => {
        this.handleWin();
      }
    );

    this.enemySystem.update(
      dt,
      this.player,
      this.mapSystem,
      this.elevatorSystem,
      (bullet: Bullet) => {
        this.bulletSystem.addBullet(bullet);
      },
      () => {
        this.cameraSystem.triggerAlert();
      }
    );

    const enemyRects = this.enemySystem
      .getEnemies()
      .map((e) => ({ id: e.id, rect: this.enemySystem.getEnemyRect(e) }));

    this.bulletSystem.update(
      dt,
      this.mapSystem,
      this.player.getRect(),
      enemyRects,
      (damage: number) => {
        this.player.takeDamage(damage);
        this.renderer.setScreenShake(5);
        this.bulletSystem.createBloodParticles(
          this.player.x + this.player.width / 2,
          this.player.y + this.player.height / 2
        );
        if (this.player.stats.health <= 0) {
          this.handleLose();
        }
      },
      (enemyId: number, damage: number) => {
        const enemy = this.enemySystem
          .getEnemies()
          .find((e) => e.id === enemyId);
        if (enemy) {
          this.bulletSystem.createBloodParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
        }
        const killed = this.enemySystem.damageEnemy(enemyId, damage);
        if (killed) {
          this.player.stats.score += 100;
          this.renderer.setScreenShake(4);
        }
      }
    );

    this.cameraSystem.update(dt, this.player, this.mapSystem);

    this.itemSystem.update(dt, this.player, (type: ItemType) => {
      this.renderer.setScreenShake(2);
    });

    if (this.player.stats.health <= 0) {
      this.handleLose();
    }

    this.checkExitOpen();
  }

  private handleKick(): void {
    for (const enemy of this.enemySystem.getEnemies()) {
      if (
        this.elevatorSystem.canKickEnemy(
          this.player.getRect(),
          this.player.direction,
          this.enemySystem.getEnemyRect(enemy)
        )
      ) {
        this.enemySystem.kickEnemy(enemy.id, this.player.direction);
        this.renderer.setScreenShake(6);
        this.player.stats.score += 50;
      }
    }
  }

  private checkExitOpen(): void {
    if (this.mapSystem.allFilesCollected() && !this.mapSystem.isExitOpen()) {
      this.mapSystem.setExitOpen(true);
      this.renderer.setScreenShake(8);
    }
  }

  private handleWin(): void {
    this.gameState = GameState.WIN;
    this.player.stats.score += 1000;
    this.renderer.setScreenShake(15);
  }

  private handleLose(): void {
    this.gameState = GameState.LOSE;
    this.renderer.setScreenShake(20);
  }

  protected render(alpha: number): void {
    this.renderer.render(
      alpha,
      this.gameState,
      this.mapSystem,
      this.elevatorSystem,
      this.player,
      this.enemySystem,
      this.bulletSystem,
      this.cameraSystem,
      this.itemSystem
    );
  }
}
