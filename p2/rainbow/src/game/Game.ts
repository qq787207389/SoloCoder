import { GAME_WIDTH, GAME_HEIGHT, GRAVITY, LEVEL_HEIGHT, SEA_LEVEL_Y, MAX_LIVES, GameState } from '../utils/Constants';
import { GameLoop } from './GameLoop';
import { InputManager } from './InputManager';
import { Camera } from './Camera';
import { Renderer } from '../rendering/Renderer';
import { Level } from '../level/Level';
import { LEVEL_1 } from '../level/LevelData';
import { Player } from '../entities/Player';
import { Boss, BossPhase } from '../entities/Boss';
import { Beetle } from '../entities/Beetle';
import { Jellyfish } from '../entities/Jellyfish';
import { Dragon } from '../entities/Dragon';
import { RainbowSystem } from '../systems/RainbowSystem';
import { EnemySystem } from '../systems/EnemySystem';
import { ItemSystem, ItemType } from '../systems/ItemSystem';
import { ParticleSystem } from '../systems/ParticleSystem';
import { CollisionSystem, Rect } from './CollisionSystem';

export class Game {
  canvas: HTMLCanvasElement;
  width: number = GAME_WIDTH;
  height: number = GAME_HEIGHT;
  state: GameState = GameState.TITLE;
  gameLoop: GameLoop;
  input: InputManager;
  camera: Camera;
  renderer: Renderer;
  player: Player;
  rainbowSystem: RainbowSystem;
  enemySystem: EnemySystem;
  itemSystem: ItemSystem;
  particleSystem: ParticleSystem;
  level: Level;
  boss: Boss | null = null;
  gravity: number = GRAVITY;
  animTime: number = 0;
  bossIntroTimer: number = 0;
  levelIndex: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.input = new InputManager();
    this.camera = new Camera(GAME_WIDTH, GAME_HEIGHT);
    this.camera.setBounds(0, GAME_WIDTH, -3000, SEA_LEVEL_Y);
    this.renderer = new Renderer(canvas, GAME_WIDTH, GAME_HEIGHT, LEVEL_HEIGHT);
    this.level = new Level(LEVEL_1);
    this.player = new Player(GAME_WIDTH / 2 - 10, SEA_LEVEL_Y - 100);
    this.rainbowSystem = new RainbowSystem();
    this.enemySystem = new EnemySystem();
    this.itemSystem = new ItemSystem();
    this.particleSystem = new ParticleSystem(300);
    this.gameLoop = new GameLoop(this.update.bind(this), this.render.bind(this));

    this.populateLevel();
  }

  populateLevel(): void {
    for (const enemyDef of this.level.levelDef.enemies) {
      if (enemyDef.type === 'beetle') {
        const beetle = new Beetle(enemyDef.x, enemyDef.y, enemyDef.x - 50, enemyDef.x + 50);
        this.enemySystem.addEnemy(beetle);
      } else if (enemyDef.type === 'jellyfish') {
        const jellyfish = new Jellyfish(enemyDef.x, enemyDef.y);
        this.enemySystem.addEnemy(jellyfish);
      } else if (enemyDef.type === 'dragon') {
        const dragon = new Dragon(enemyDef.x, enemyDef.y);
        this.enemySystem.addEnemy(dragon);
      }
    }

    for (const itemDef of this.level.levelDef.items) {
      const type = ItemType[itemDef.type.toUpperCase() as keyof typeof ItemType];
      this.itemSystem.spawnItem(itemDef.x, itemDef.y, type, itemDef.requiresRainbow);
    }
  }

  start(): void {
    this.gameLoop.start();
  }

  stop(): void {
    this.gameLoop.stop();
    this.input.destroy();
  }

  update(dt: number): void {
    this.animTime += dt;

    switch (this.state) {
      case GameState.TITLE:
        if (this.input.isEnter()) {
          this.state = GameState.PLAYING;
          this.resetGame();
        }
        break;

      case GameState.PLAYING:
        this.updateGameplay(dt);
        if (this.player.lives <= 0) {
          this.state = GameState.GAMEOVER;
        }
        if (this.level.isInBossArea(this.player.y)) {
          this.state = GameState.BOSS_INTRO;
          this.bossIntroTimer = 2;
          this.spawnBoss();
        }
        if (this.input.isPause()) {
          this.state = GameState.PAUSED;
        }
        break;

      case GameState.PAUSED:
        if (this.input.isPause()) {
          this.state = GameState.PLAYING;
        }
        break;

      case GameState.BOSS_INTRO:
        this.bossIntroTimer -= dt;
        if (this.boss) {
          this.boss.update(dt, this.player.x, this.player.y);
        }
        if (this.bossIntroTimer <= 0) {
          this.state = GameState.BOSS;
        }
        break;

      case GameState.BOSS:
        this.updateGameplay(dt);
        if (this.boss && this.boss.active) {
          const bossBullets = this.boss.update(dt, this.player.x, this.player.y);
          bossBullets.forEach((b) => this.enemySystem.addBossBullet(b));
          this.checkBossRainbowDamage();
          if (this.boss.phase === BossPhase.DEAD && this.boss.y > 1000) {
            this.state = GameState.LEVELCLEAR;
          }
        }
        if (this.player.lives <= 0) {
          this.state = GameState.GAMEOVER;
        }
        if (this.input.isPause()) {
          this.state = GameState.PAUSED;
        }
        break;

      case GameState.GAMEOVER:
        if (this.input.isEnter()) {
          this.state = GameState.TITLE;
        }
        break;

      case GameState.LEVELCLEAR:
        if (this.input.isEnter()) {
          this.state = GameState.TITLE;
          this.levelIndex++;
        }
        break;
    }

    this.input.update();
  }

  updateGameplay(dt: number): void {
    this.level.update(dt);
    this.player.update(dt, this.input, this.gravity);

    if (this.input.isAttack()) {
      this.rainbowSystem.startDrawing();
    }
    if (this.input.isAttackHeld()) {
      this.rainbowSystem.isDrawing = true;
    }
    if (this.input.isAttackReleased()) {
      this.rainbowSystem.stopDrawing();
    }

    this.rainbowSystem.update(dt, this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, this.player.facing);

    if (this.input.isSpecial()) {
      const count = this.rainbowSystem.collapseAll();
      if (count > 0) {
        this.particleSystem.spawnRainbowBurst(this.player.x + this.player.w / 2, this.player.y, 30);
        this.player.addScore(count * 50);
      }
    }

    this.enemySystem.update(dt, this.gravity, this.player.x, this.player.y);
    this.itemSystem.update(dt);
    this.particleSystem.update(dt);

    if (this.player.y > SEA_LEVEL_Y + 50) {
      this.player.takeDamage();
      this.player.x = GAME_WIDTH / 2 - 10;
      this.player.y = SEA_LEVEL_Y - 200;
      this.player.vy = -200;
    }

    if (this.player.x < -50) {
      this.player.x = GAME_WIDTH - this.player.w;
    } else if (this.player.x > GAME_WIDTH + 50) {
      this.player.x = 0;
    }

    this.handlePlatformCollisions();
    this.handleRainbowPlatformCollisions();

    const score = this.enemySystem.checkRainbowCollisions(
      this.rainbowSystem.getActiveArcs(),
      (arc) => this.rainbowSystem.getArcPoints(arc, 8)
    );
    if (score > 0) {
      this.player.addScore(score);
    }

    if (this.enemySystem.checkPlayerCollisions(this.player.getRect(), this.player.invincible)) {
      this.player.takeDamage();
    }

    const collectionResult = this.itemSystem.checkCollection(this.player.getRect());
    if (collectionResult.totalScore > 0) {
      this.player.addScore(collectionResult.totalScore);
    }
    for (let i = 0; i < collectionResult.healAmount; i++) {
      this.player.heal();
    }

    this.camera.follow(this.player.x, this.player.y);
    this.camera.update(dt);
  }

  handlePlatformCollisions(): void {
    const platforms = this.level.getSolidPlatforms();
    const playerRect = this.player.getRect();
    const playerFeetY = playerRect.y + playerRect.h;

    for (const platform of platforms) {
      const platformRect = platform.getRect();
      const collision = CollisionSystem.aabbSide(playerRect, platformRect);

      if (collision.hit) {
        if (collision.side === 'top' && this.player.vy >= 0) {
          this.player.setOnGround(true);
          this.player.y = platformRect.y - this.player.h;
          if (platform.bouncy) {
            this.player.vy = -450;
            this.player.setOnGround(false);
          }
        } else if (collision.side === 'bottom') {
          this.player.vy = 0;
          this.player.y = platformRect.y + platformRect.h;
        } else if (collision.side === 'left') {
          this.player.x = platformRect.x - this.player.w;
          this.player.vx = 0;
        } else if (collision.side === 'right') {
          this.player.x = platformRect.x + platformRect.w;
          this.player.vx = 0;
        }
      }
    }
  }

  handleRainbowPlatformCollisions(): void {
    const arcs = this.rainbowSystem.getPlatformArcs();
    const playerFeetX = this.player.x + this.player.w / 2;
    const playerFeetY = this.player.y + this.player.h;

    if (this.player.vy >= 0) {
      for (const arc of arcs) {
        const points = this.rainbowSystem.getArcPoints(arc, 12);
        for (let i = 0; i < points.length - 1; i++) {
          const p1 = points[i];
          const p2 = points[i + 1];
          const minX = Math.min(p1.x, p2.x);
          const maxX = Math.max(p1.x, p2.x);

          if (playerFeetX >= minX - 3 && playerFeetX <= maxX + 3) {
            const dx = p2.x - p1.x;
            let lineY: number;
            if (Math.abs(dx) < 0.001) {
              lineY = p1.y;
            } else {
              const t = Math.max(0, Math.min(1, (playerFeetX - p1.x) / dx));
              lineY = p1.y + t * (p2.y - p1.y);
            }

            if (playerFeetY >= lineY - 6 && playerFeetY <= lineY + 8) {
              this.player.y = lineY - this.player.h;
              this.player.setOnGround(true);
              return;
            }
          }
        }
      }
    }
  }

  checkBossRainbowDamage(): void {
    if (!this.boss || !this.boss.active) return;

    const arcs = this.rainbowSystem.getActiveArcs();
    const bossRect = this.boss.getRect();
    const bossCenterX = this.boss.x + this.boss.w / 2;

    for (const arc of arcs) {
      const points = this.rainbowSystem.getArcPoints(arc, 8);
      for (let i = 0; i < points.length - 1; i++) {
        const hit = CollisionSystem.lineIntersectsRect(
          points[i].x,
          points[i].y,
          points[i + 1].x,
          points[i + 1].y,
          bossRect
        );
        if (hit) {
          const damaged = this.boss.takeRainbowDamage(1);
          if (damaged) {
            this.particleSystem.spawnRainbowBurst(bossCenterX, this.boss.y, 15);
            this.player.addScore(100);
          }
          break;
        }
      }
    }
  }

  render(alpha: number): void {
    this.renderer.begin();

    switch (this.state) {
      case GameState.TITLE:
        this.renderer.renderTitleScreen(this.animTime);
        break;

      case GameState.PAUSED:
        this.renderGameWorld(alpha);
        this.renderer.renderPauseScreen();
        break;

      case GameState.GAMEOVER:
        this.renderGameWorld(alpha);
        this.renderer.renderGameOver(this.player.score, this.animTime);
        break;

      case GameState.LEVELCLEAR:
        this.renderGameWorld(alpha);
        this.renderer.renderLevelClear(this.player.score, this.animTime);
        break;

      default:
        this.renderGameWorld(alpha);
        break;
    }

    this.renderer.end();
  }

  renderGameWorld(alpha: number): void {
    const levelProgress = (SEA_LEVEL_Y - this.player.y) / LEVEL_HEIGHT;
    this.renderer.renderBackground(this.camera.y, levelProgress, alpha);
    this.renderer.renderPlatforms(this.level.getPlatforms(), this.camera);
    this.renderer.renderRainbow(this.rainbowSystem.getActiveArcs(), this.rainbowSystem, this.camera);
    this.renderer.renderItems(this.itemSystem.getItems(), this.camera);
    this.renderer.renderEnemies(this.enemySystem.getEnemies(), this.camera);
    this.renderer.renderBullets(this.enemySystem.getDragonBullets(), this.enemySystem.getBossBullets(), this.camera);

    if (this.boss && this.boss.active) {
      this.renderer.renderBoss(this.boss, this.camera);
    }

    this.renderer.renderPlayer(this.player, this.camera, alpha);
    this.renderer.renderParticles(this.particleSystem.getActiveParticles(), this.camera);

    const bossHp = this.state === GameState.BOSS && this.boss ? this.boss.hp : undefined;
    const bossMaxHp = this.state === GameState.BOSS && this.boss ? this.boss.maxHp : undefined;
    this.renderer.hudRenderer.render(
      this.player.lives,
      MAX_LIVES,
      this.player.score,
      SEA_LEVEL_Y - this.player.y,
      LEVEL_HEIGHT,
      bossHp,
      bossMaxHp
    );
  }

  spawnBoss(): void {
    this.boss = new Boss(GAME_WIDTH / 2 - 48, 50);
    this.boss.active = true;
  }

  resetGame(): void {
    this.player.reset(GAME_WIDTH / 2 - 10, SEA_LEVEL_Y - 100);
    this.rainbowSystem.clear();
    this.enemySystem.clear();
    this.itemSystem.clear();
    this.particleSystem.clear();
    this.boss = null;
    this.camera.x = this.player.x - GAME_WIDTH / 2;
    this.camera.y = this.player.y - GAME_HEIGHT / 2;
    this.camera.update(0);
    this.populateLevel();
  }
}
