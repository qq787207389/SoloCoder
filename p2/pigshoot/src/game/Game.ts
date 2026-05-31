import { GAME_WIDTH, GAME_HEIGHT, GameState, WolfState, HiddenItemType, DIFFICULTY, WOLF } from '../utils/constants';
import { InputManager } from './Input';
import { AudioManager } from './Audio';
import { GameStateManager } from './State';
import { SpriteRenderer } from '../rendering/Sprite';
import { ParticleSystem } from '../rendering/Particle';
import { Player } from '../entities/Player';
import { Wolf } from '../entities/Wolf';
import { Meat } from '../entities/Meat';
import { Rock } from '../entities/Rock';
import { BonusItem } from '../entities/BonusItem';
import { HiddenItem, HiddenItemSystem } from '../entities/HiddenItem';
import { ILevel } from '../levels/Level';
import { Level1 } from '../levels/Level1';
import { Level2 } from '../levels/Level2';
import { Level3 } from '../levels/Level3';
import { circleRectCollision } from '../utils/collision';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private sprite: SpriteRenderer;
  private particles: ParticleSystem;

  private input: InputManager;
  private audio: AudioManager;
  private state: GameStateManager;
  private hiddenSystem: HiddenItemSystem;

  private player: Player;
  private wolves: Wolf[] = [];
  private meats: Meat[] = [];
  private rocks: Rock[] = [];
  private bonusItems: BonusItem[] = [];
  private hiddenItems: HiddenItem[] = [];

  private levels: ILevel[] = [];
  private currentLevel!: ILevel;

  private lastTime: number = 0;
  private accumulator: number = 0;
  private fixedTimeStep: number = 1000 / 60;
  private running: boolean = false;

  private spawnTimer: number = 0;
  private levelTime: number = 0;
  private wolvesDefeated: number = 0;
  private transitionTimer: number = 0;

  private scorePopups: Array<{ x: number; y: number; score: number; life: number }> = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.canvas.width = GAME_WIDTH;
    this.canvas.height = GAME_HEIGHT;
    
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    this.ctx = ctx;
    this.ctx.imageSmoothingEnabled = false;

    this.sprite = new SpriteRenderer(this.ctx);
    this.particles = new ParticleSystem();

    this.input = new InputManager();
    this.audio = new AudioManager();
    this.state = new GameStateManager();
    this.hiddenSystem = new HiddenItemSystem();

    this.player = new Player();

    this.levels = [new Level1(), new Level2(), new Level3()];
    this.loadLevel(0);

    this.hideLoading();
  }

  private hideLoading(): void {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = 'none';
    }
  }

  private loadLevel(index: number): void {
    this.currentLevel = this.levels[index];
    this.currentLevel.init();
    this.levelTime = 0;
    this.spawnTimer = 0;
    this.wolvesDefeated = 0;
    this.wolves = [];
    this.meats = [];
    this.rocks = [];
    this.bonusItems = [];
    this.hiddenItems = [];
    this.particles.clear();
    this.state.setWolvesReachedTop(0);
    this.state.setLevelStartTime(Date.now());
  }

  public start(): void {
    this.running = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  private gameLoop(): void {
    if (!this.running) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.accumulator += deltaTime;

    while (this.accumulator >= this.fixedTimeStep) {
      this.update(this.fixedTimeStep);
      this.accumulator -= this.fixedTimeStep;
    }

    this.render();
    requestAnimationFrame(() => this.gameLoop());
  }

  private update(deltaTime: number): void {
    const gameState = this.state.getState();

    if (this.input.isPausePressed() && gameState === GameState.PLAYING) {
      this.state.setState(GameState.PAUSED);
    } else if (this.input.isPausePressed() && gameState === GameState.PAUSED) {
      this.state.setState(GameState.PLAYING);
    }

    switch (gameState) {
      case GameState.MENU:
        this.updateMenu(deltaTime);
        break;
      case GameState.PLAYING:
        this.updateGame(deltaTime);
        break;
      case GameState.PAUSED:
        break;
      case GameState.LEVEL_TRANSITION:
        this.updateTransition(deltaTime);
        break;
      case GameState.GAME_OVER:
        this.updateGameOver(deltaTime);
        break;
    }

    this.input.update();
  }

  private updateMenu(_deltaTime: number): void {
    if (this.input.isConfirmPressed() || this.input.isShootPressed()) {
      this.state.setState(GameState.PLAYING);
      this.state.reset();
      this.loadLevel(0);
      this.player = new Player();
      this.hiddenSystem.resetAll();
      this.audio.startMusic(1);
    }
  }

  private updateGame(deltaTime: number): void {
    const inputState = this.input.getState();
    let isMoving = false;

    if (inputState.up) {
      this.player.moveUp(deltaTime);
      isMoving = true;
    }
    if (inputState.down) {
      this.player.moveDown(deltaTime);
      isMoving = true;
    }
    this.player.setMoving(isMoving);

    if (this.input.isUpPressed() || this.input.isDownPressed()) {
      this.hiddenSystem.recordMove();
    }

    this.hiddenSystem.update(deltaTime);

    if (this.input.isShootPressed()) {
      const arrow = this.player.shoot();
      if (arrow) {
        this.audio.playShoot();
        setTimeout(() => {
          if (this.player.getArrowCount() === 0 && arrow.active === false) {
            this.hiddenSystem.recordEmptyShot(this.player.getShootY());
          }
        }, 500);
      }
    }

    if (this.hiddenSystem.checkLeafTrigger()) {
      this.spawnHiddenItem(HiddenItemType.LEAF);
    }
    if (this.hiddenSystem.checkMushroomTrigger()) {
      this.spawnHiddenItem(HiddenItemType.MUSHROOM);
    }

    this.player.update(deltaTime);

    this.levelTime += deltaTime;
    this.spawnTimer += deltaTime;

    const difficultyMultiplier = Math.pow(DIFFICULTY.CYCLE_MULTIPLIER, this.state.getCurrentCycle() - 1);

    if (this.spawnTimer >= this.currentLevel.spawnRate / difficultyMultiplier) {
      const activeWolfCount = this.wolves.filter(w => w.active && w.hasBalloon).length;
      if (activeWolfCount < this.currentLevel.maxWolves * difficultyMultiplier) {
        this.wolves.push(this.currentLevel.spawnWolf(difficultyMultiplier));
      }
      this.spawnTimer = 0;
    }

    this.currentLevel.update(deltaTime);

    this.wolves.forEach(wolf => {
      wolf.update(deltaTime);

      if (wolf.state === WolfState.REACHED_TOP) {
        if (wolf.active) {
          this.state.incrementWolvesReachedTop();
          wolf.active = false;
          
          if (this.state.getCurrentLevel() === 2) {
            this.rocks.push(new Rock(
              wolf.x,
              60,
              (Math.random() - 0.5) * 100,
              50,
              true
            ));
          }
        }
      }

      if (wolf.canThrowRock()) {
        const rock = wolf.throwRock();
        if (rock) {
          this.rocks.push(rock);
          this.audio.playRockThrow();
        }
      }

      if (wolf.isPink && wolf.canDropBonus()) {
        this.bonusItems.push(new BonusItem(wolf.x + wolf.width / 2, wolf.y));
        wolf.resetBonusTimer();
      }
    });

    this.wolves = this.wolves.filter(w => w.active);

    this.meats.forEach(meat => {
      meat.update(deltaTime);

      this.wolves.forEach(wolf => {
        if (wolf.checkMeatProximity(meat.getCenterX(), meat.getCenterY())) {
          wolf.grabMeat();
          this.wolvesDefeated++;
          this.state.addScore(200);
          this.addScorePopup(wolf.x + wolf.width / 2, wolf.y, 200);
          this.particles.emitWolfHit(wolf.x + wolf.width / 2, wolf.y + wolf.height / 2);
          this.audio.playPop();
        }
      });
    });
    this.meats = this.meats.filter(m => m.active);

    this.rocks.forEach(rock => {
      rock.update(deltaTime);

      const collision = this.player.checkRockCollision(rock);
      if (collision === 'top' || collision === 'bottom') {
        rock.rebound();
        this.hiddenSystem.recordReboundHit();
        
        if (this.hiddenSystem.checkButterflyTrigger()) {
          this.spawnHiddenItem(HiddenItemType.BUTTERFLY);
        }
      } else if (collision === 'body') {
        rock.active = false;
        this.state.loseLife();
        this.audio.playHit();
        this.particles.emit(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, 10, { color: '#FF0000' });
      }
    });
    this.rocks = this.rocks.filter(r => r.active);

    this.bonusItems.forEach(bonus => {
      bonus.update(deltaTime);
    });
    this.bonusItems = this.bonusItems.filter(b => b.active);

    this.hiddenItems.forEach(item => {
      item.update(deltaTime);
    });
    this.hiddenItems = this.hiddenItems.filter(h => h.active);

    this.checkCollisions();

    this.particles.update(deltaTime);

    this.scorePopups = this.scorePopups.filter(p => {
      p.life -= deltaTime;
      p.y -= 0.5;
      return p.life > 0;
    });

    if (this.currentLevel.checkWinCondition(this.levelTime, this.wolvesDefeated)) {
      this.state.setState(GameState.LEVEL_TRANSITION);
      this.transitionTimer = 0;
      this.audio.stopMusic();
    }

    if (this.currentLevel.checkLoseCondition(this.state.getWolvesReachedTop(), this.state.getLives())) {
      this.state.setState(GameState.GAME_OVER);
      this.audio.playGameOver();
      this.audio.stopMusic();
    }

  }

  private checkCollisions(): void {
    const arrows = this.player.getArrows();

    arrows.forEach(arrow => {
      this.wolves.forEach(wolf => {
        if (!wolf.hasBalloon || !arrow.active) return;

        const balloonCenter = wolf.getBalloonCenter();
        if (circleRectCollision(balloonCenter.x, balloonCenter.y, WOLF.BALLOON_RADIUS, arrow)) {
          arrow.active = false;
          wolf.popBalloon();
          this.wolvesDefeated++;
          
          let score = 100;
          if (wolf.isLeftmost && this.state.getCurrentLevel() === 2) {
            this.hiddenSystem.recordLeftBalloonHit();
            if (this.hiddenSystem.checkBeetleTrigger()) {
              this.spawnHiddenItem(HiddenItemType.BEETLE);
            }
            score = 300;
          }
          
          this.state.addScore(score);
          this.addScorePopup(wolf.x + wolf.width / 2, wolf.y, score);
          this.particles.emitBalloonPop(balloonCenter.x, balloonCenter.y, wolf.balloonColor);
          this.audio.playPop();
          this.hiddenSystem.recordHit();

          if (this.hiddenSystem.checkCaterpillarTrigger()) {
            this.spawnHiddenItem(HiddenItemType.CATERPILLAR);
          }
        }
      });

      this.bonusItems.forEach(bonus => {
        if (!arrow.active || !bonus.active) return;
        if (arrow.checkCollision(bonus)) {
          arrow.active = false;
          if (bonus.upgrade()) {
            this.audio.playScore();
          } else {
            const value = bonus.getValue();
            this.state.addScore(value);
            this.addScorePopup(bonus.x + bonus.width / 2, bonus.y, value);
            this.particles.emitBonusCollect(bonus.x + bonus.width / 2, bonus.y + bonus.height / 2, '#FFD700');
            this.audio.playBonus();
            bonus.active = false;
          }
        }
      });

      this.hiddenItems.forEach(item => {
        if (!arrow.active || !item.active) return;
        if (arrow.checkCollision(item)) {
          arrow.active = false;
          this.collectHiddenItem(item);
        }
      });
    });

    this.rocks.forEach(rock => {
      if (rock.getReboundCount() > 0) {
        this.wolves.forEach(wolf => {
          if (!wolf.active || !wolf.hasBalloon) return;
          if (rock.checkCollision(wolf)) {
            wolf.popBalloon();
            this.wolvesDefeated++;
            this.state.addScore(150);
            this.addScorePopup(wolf.x + wolf.width / 2, wolf.y, 150);
            this.particles.emitBalloonPop(wolf.x + wolf.width / 2, wolf.y, wolf.balloonColor);
          }
        });
      }
    });
  }

  private spawnHiddenItem(type: string): void {
    const item = new HiddenItem(
      this.player.x + 50 + Math.random() * 200,
      this.player.y,
      type as any
    );
    this.hiddenItems.push(item);
    this.audio.playHiddenItem();
    this.particles.emitHiddenItem(item.x, item.y);
  }

  private collectHiddenItem(item: HiddenItem): void {
    item.collect();
    this.audio.playBonus();

    switch (item.getType()) {
      case HiddenItemType.LEAF:
        this.state.addScore(4000);
        this.addScorePopup(item.x, item.y, 4000);
        break;
      case HiddenItemType.MUSHROOM:
        this.player.setFireRateBoost(true);
        break;
      case HiddenItemType.BUTTERFLY:
        this.state.addScore(20000);
        this.addScorePopup(item.x, item.y, 20000);
        break;
      case HiddenItemType.BIRD:
        this.state.setSnakeMeat(true);
        break;
      case HiddenItemType.CATERPILLAR:
        this.state.setMeatNoCooldown(true);
        break;
      case HiddenItemType.BEETLE:
        for (let i = 0; i < 5; i++) {
          this.state.addLife();
        }
        break;
    }
  }

  private addScorePopup(x: number, y: number, score: number): void {
    this.scorePopups.push({ x, y, score, life: 1000 });
  }

  private updateTransition(deltaTime: number): void {
    this.transitionTimer += deltaTime;

    if (this.transitionTimer >= 2000) {
      this.state.nextLevel();
      const levelIndex = (this.state.getCurrentLevel() - 1) % 3;
      this.loadLevel(levelIndex);
      this.state.setState(GameState.PLAYING);
      this.audio.startMusic(this.state.getCurrentLevel(), false);
    }
  }

  private updateGameOver(_deltaTime: number): void {
    if (this.input.isConfirmPressed() || this.input.isShootPressed()) {
      this.state.setState(GameState.MENU);
    }
  }

  private render(): void {
    this.ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const gameState = this.state.getState();

    if (gameState === GameState.MENU) {
      this.renderMenu();
    } else {
      this.renderGame();
    }
  }

  private renderMenu(): void {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#228B22');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.sprite.drawCloud(100, 80, 1);
    this.sprite.drawCloud(500, 60, 0.8);
    this.sprite.drawCloud(650, 120, 0.6);

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 56px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('猪小弟', GAME_WIDTH / 2, 180);
    
    this.ctx.font = 'bold 24px monospace';
    this.ctx.fillText('拯救猪宝宝大作战！', GAME_WIDTH / 2, 230);

    this.sprite.drawMamaPig(GAME_WIDTH / 2 - 30, 280, 1.5);

    this.ctx.fillStyle = '#FFFF00';
    this.ctx.font = '20px monospace';
    this.ctx.fillText('按 空格键 或 Enter 开始游戏', GAME_WIDTH / 2, 400);

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '16px monospace';
    this.ctx.fillText('操作说明：', GAME_WIDTH / 2, 450);
    this.ctx.fillText('↑↓ / W S - 上下移动', GAME_WIDTH / 2, 480);
    this.ctx.fillText('空格 / J / Z - 射箭', GAME_WIDTH / 2, 505);
    this.ctx.fillText('P / ESC - 暂停', GAME_WIDTH / 2, 530);

    if (this.state.getHighScore() > 0) {
      this.ctx.fillStyle = '#FFD700';
      this.ctx.fillText(`最高分: ${this.state.getHighScore()}`, GAME_WIDTH / 2, 570);
    }
  }

  private renderGame(): void {
    this.currentLevel.renderBackground(this.sprite);

    this.particles.render(this.ctx);

    this.hiddenItems.forEach(item => item.render(this.sprite));

    this.wolves.forEach(wolf => wolf.render(this.sprite));

    this.meats.forEach(meat => meat.render(this.sprite));

    this.rocks.forEach(rock => rock.render(this.sprite));

    this.bonusItems.forEach(bonus => bonus.render(this.sprite));

    this.player.render(this.sprite);

    this.currentLevel.renderForeground(this.sprite);

    this.renderHUD();

    this.scorePopups.forEach(p => {
      const alpha = p.life / 1000;
      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = '#FFFF00';
      this.ctx.font = 'bold 16px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`+${p.score}`, p.x, p.y);
    });
    this.ctx.globalAlpha = 1;

    if (this.state.getState() === GameState.PAUSED) {
      this.renderPauseOverlay();
    } else if (this.state.getState() === GameState.LEVEL_TRANSITION) {
      this.renderLevelTransition();
    } else if (this.state.getState() === GameState.GAME_OVER) {
      this.renderGameOver();
    }
  }

  private renderHUD(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, GAME_WIDTH, 50);

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 18px monospace';
    this.ctx.textAlign = 'left';
    
    this.ctx.fillText(`分数: ${this.state.getScore()}`, 20, 32);
    
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`第${this.state.getCurrentCycle()}轮 - ${this.currentLevel.name}`, GAME_WIDTH / 2, 32);

    this.ctx.textAlign = 'right';
    const hearts = '❤️'.repeat(this.state.getLives());
    this.ctx.fillText(hearts, GAME_WIDTH - 20, 32);

    if (this.state.getCurrentLevel() === 2) {
      const reached = this.state.getWolvesReachedTop();
      this.ctx.fillStyle = reached >= 5 ? '#FF4444' : '#FFFFFF';
      this.ctx.fillText(`登顶: ${reached}/7`, GAME_WIDTH - 20, 55);
    }

    this.ctx.textAlign = 'left';
    this.ctx.fillStyle = '#888888';
    this.ctx.font = '12px monospace';
    
    const arrowsLeft = 2 - this.player.getArrowCount();
    this.ctx.fillText(`箭: ${'→'.repeat(arrowsLeft)}${'·'.repeat(this.player.getArrowCount())}`, 20, 50);

    if (this.player.hasFireRateBoost()) {
      this.ctx.fillStyle = '#44FF44';
      this.ctx.fillText('🍄 射速提升', 20, 65);
    }
  }

  private renderPauseOverlay(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 48px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('暂停', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20);
    
    this.ctx.font = '20px monospace';
    this.ctx.fillText('按 P 或 ESC 继续', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30);
  }

  private renderLevelTransition(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    this.ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const alpha = Math.min(1, this.transitionTimer / 500);
    this.ctx.globalAlpha = alpha;

    this.ctx.fillStyle = '#FFD700';
    this.ctx.font = 'bold 40px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('关卡完成！', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40);

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '24px monospace';
    this.ctx.fillText(`击败狼: ${this.wolvesDefeated}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10);

    this.ctx.globalAlpha = 1;
  }

  private renderGameOver(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    this.ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.ctx.fillStyle = '#FF4444';
    this.ctx.font = 'bold 56px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('游戏结束', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60);

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '28px monospace';
    this.ctx.fillText(`最终分数: ${this.state.getScore()}`, GAME_WIDTH / 2, GAME_HEIGHT / 2);

    if (this.state.getScore() >= this.state.getHighScore()) {
      this.ctx.fillStyle = '#FFD700';
      this.ctx.font = '24px monospace';
      this.ctx.fillText('🎉 新纪录！🎉', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 45);
    }

    this.ctx.fillStyle = '#AAAAAA';
    this.ctx.font = '20px monospace';
    this.ctx.fillText('按 空格键 或 Enter 返回菜单', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 100);
  }

  public destroy(): void {
    this.running = false;
    this.input.destroy();
    this.audio.stopMusic();
  }
}
