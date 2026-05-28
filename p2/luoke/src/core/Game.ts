import { GameLoop } from './GameLoop';
import { Renderer } from './Renderer';
import { InputManager } from './Input';
import { Player } from '../game/Player';
import { Projectile } from '../game/Projectile';
import { Enemy, PatrolBot, Turret } from '../game/Enemy';
import { Boss } from '../game/Boss';
import { UIManager } from '../ui/UI';
import { LEVELS } from '../levels/LevelData';
import { GameScreen, Particle, ElementType, Platform } from '../utils/types';
import { WEAPON_CONFIGS } from '../utils/constants';

export class Game {
  private renderer: Renderer;
  private input: InputManager;
  private gameLoop: GameLoop;
  private ui: UIManager;
  private player: Player;
  private projectiles: Projectile[] = [];
  private enemies: Enemy[] = [];
  private particles: Particle[] = [];
  private currentScreen: GameScreen = GameScreen.MAIN_MENU;
  private currentLevel: string = '';
  private boss: Boss | null = null;
  private bossFightStarted: boolean = false;
  private defeatedBosses: Set<string> = new Set();
  private paused: boolean = false;

  constructor() {
    this.renderer = new Renderer('game-canvas');
    this.input = new InputManager();
    this.ui = new UIManager(this.renderer, this.input);
    this.player = new Player(100, 400, this.input);
    this.gameLoop = new GameLoop(this.update.bind(this), this.render.bind(this));
  }

  public start(): void {
    const loading = document.getElementById('loading');
    if (loading) loading.style.display = 'none';
    
    this.gameLoop.start();
  }

  private update(deltaTime: number): void {
    switch (this.currentScreen) {
      case GameScreen.MAIN_MENU:
        this.updateMainMenu();
        break;
      case GameScreen.LEVEL_SELECT:
        this.updateLevelSelect();
        break;
      case GameScreen.LAB:
        this.updateLab();
        break;
      case GameScreen.PLAYING:
      case GameScreen.BOSS_FIGHT:
        if (!this.paused) {
          this.updateGame(deltaTime);
        } else {
          this.updatePauseMenu();
        }
        break;
      case GameScreen.VICTORY:
        this.updateVictory();
        break;
      case GameScreen.GAME_OVER:
        this.updateGameOver();
        break;
    }
  }

  private updateMainMenu(): void {
    const selection = this.ui.renderMainMenu();
    
    if (selection) {
      switch (selection) {
        case '开始游戏':
          this.currentScreen = GameScreen.LEVEL_SELECT;
          break;
        case '关卡选择':
          this.currentScreen = GameScreen.LEVEL_SELECT;
          break;
        case '实验室':
          this.currentScreen = GameScreen.LAB;
          break;
        case '退出':
          break;
      }
    }
  }

  private updateLevelSelect(): void {
    this.ui.setDefeatedBosses(this.defeatedBosses);
    const selection = this.ui.renderLevelSelect();
    
    if (selection === 'back') {
      this.currentScreen = GameScreen.MAIN_MENU;
    } else if (selection) {
      this.startLevel(selection);
    }
  }

  private updateLab(): void {
    const selection = this.ui.renderLab(this.player.getPlayerState());
    
    if (selection === 'back') {
      this.currentScreen = GameScreen.MAIN_MENU;
    } else if (selection === 'health') {
      this.player.getPlayerState().gears -= 100;
      this.player.upgradeHealth();
    } else if (selection === 'energy') {
      this.player.getPlayerState().gears -= 100;
      this.player.upgradeEnergy();
    }
  }

  private startLevel(levelId: string): void {
    this.currentLevel = levelId;
    const level = LEVELS[levelId];
    
    this.player.reset(100, 400);
    this.projectiles = [];
    this.enemies = [];
    this.particles = [];
    this.boss = new Boss(level.bossPosition.x, level.bossPosition.y, level.element, 300);
    this.bossFightStarted = false;
    this.paused = false;
    
    level.enemySpawns.forEach(spawn => {
      if (spawn.type === 'patrol') {
        this.enemies.push(new PatrolBot(spawn.x, spawn.y, level.element));
      } else if (spawn.type === 'turret') {
        this.enemies.push(new Turret(spawn.x, spawn.y, level.element));
      }
    });
    
    this.currentScreen = GameScreen.PLAYING;
  }

  private updateGame(deltaTime: number): void {
    const level = LEVELS[this.currentLevel];
    const playerState = this.player.getPlayerState();
    
    if (this.input.isKeyPressed('PAUSE')) {
      this.paused = true;
    }

    this.player.update(deltaTime, level.platforms);
    
    if (this.player.isShooting()) {
      const shot = this.player.shoot();
      if (shot) {
        const config = WEAPON_CONFIGS[shot.element];
        this.projectiles.push(new Projectile(
          shot.x, shot.y,
          config.projectileSize.x, config.projectileSize.y,
          shot.vx, shot.vy,
          shot.element, shot.damage, true
        ));
      }
    }

    if (this.input.isKeyPressed('OVERLOAD') && playerState.overload >= 100) {
      this.triggerOverload();
    }

    const playerPos = this.player.getPosition();
    
    this.enemies.forEach(enemy => {
      enemy.update(deltaTime, level.platforms, playerPos.x, playerPos.y);
      
      if (enemy instanceof Turret) {
        const shot = enemy.shoot(playerPos.x, playerPos.y);
        if (shot) {
          this.projectiles.push(new Projectile(
            shot.x, shot.y,
            10, 10,
            shot.vx, shot.vy,
            shot.element, shot.damage, false
          ));
        }
      }
    });

    if (!this.bossFightStarted && playerPos.x > 2000) {
      this.bossFightStarted = true;
      this.boss?.activate();
      this.currentScreen = GameScreen.BOSS_FIGHT;
    }

    if (this.boss && this.bossFightStarted) {
      this.boss.update(deltaTime, level.platforms, playerPos.x, playerPos.y);
      
      const attacks = this.boss.attack(playerPos.x, playerPos.y);
      attacks.forEach(attack => {
        if (attack.type === 'projectile') {
          this.projectiles.push(new Projectile(
            attack.x, attack.y,
            attack.size, attack.size,
            attack.vx, attack.vy,
            attack.element, attack.damage, false
          ));
        }
      });
    }

    this.projectiles = this.projectiles.filter(proj => {
      proj.update(deltaTime, level.platforms);
      return proj.isActive();
    });

    this.checkCollisions();

    this.particles = this.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.lifetime--;
      return p.lifetime > 0;
    });

    this.renderer.setCamera(playerPos.x, playerPos.y, level.width, level.height);

    this.enemies = this.enemies.filter(e => e.isActive());
    
    if (this.player.getHealth() <= 0) {
      this.currentScreen = GameScreen.GAME_OVER;
    }
    
    if (this.boss && this.bossFightStarted && this.boss.getHealth() <= 0) {
      this.handleVictory();
    }
    
    this.input.update();
  }

  private checkCollisions(): void {
    const playerPos = this.player.getPosition();
    const playerRect = {
      x: playerPos.x,
      y: playerPos.y,
      width: this.player.getWidth(),
      height: this.player.getHeight()
    };

    this.projectiles.forEach(proj => {
      if (!proj.isActive()) return;
      
      const projRect = {
        x: proj.getPosition().x,
        y: proj.getPosition().y,
        width: proj.getWidth(),
        height: proj.getHeight()
      };

      if (proj.isFromPlayer()) {
        this.enemies.forEach(enemy => {
          if (!enemy.isActive()) return;
          const enemyRect = {
            x: enemy.getPosition().x,
            y: enemy.getPosition().y,
            width: enemy.getWidth(),
            height: enemy.getHeight()
          };
          
          if (this.checkRectCollision(projRect, enemyRect)) {
            enemy.takeDamage(proj.getDamage());
            proj.setActive(false);
            this.particles.push(...proj.createHitParticles());
            
            if (!enemy.isActive()) {
              this.particles.push(...enemy.createDeathParticles());
              this.player.addGears(enemy.getPoints());
              this.player.addOverload();
            }
          }
        });

        if (this.boss && this.bossFightStarted && this.boss.isBossActive()) {
          const bossRect = {
            x: this.boss.getPosition().x,
            y: this.boss.getPosition().y,
            width: this.boss.getWidth(),
            height: this.boss.getHeight()
          };
          
          if (this.checkRectCollision(projRect, bossRect)) {
            this.boss.takeDamage(proj.getDamage(), proj.getElement());
            proj.setActive(false);
            this.particles.push(...proj.createHitParticles());
            
            if (!this.boss.isBossActive()) {
              this.particles.push(...this.boss.createDeathParticles());
            }
          }
        }
      } else {
        if (this.checkRectCollision(projRect, playerRect)) {
          this.player.takeDamage(proj.getDamage());
          proj.setActive(false);
          this.particles.push(...proj.createHitParticles());
        }
      }
    });

    this.enemies.forEach(enemy => {
      if (!enemy.isActive()) return;
      const enemyRect = {
        x: enemy.getPosition().x,
        y: enemy.getPosition().y,
        width: enemy.getWidth(),
        height: enemy.getHeight()
      };
      
      if (this.checkRectCollision(enemyRect, playerRect)) {
        this.player.takeDamage(enemy.getDamage());
      }
    });

    if (this.boss && this.bossFightStarted && this.boss.isBossActive()) {
      const bossRect = {
        x: this.boss.getPosition().x,
        y: this.boss.getPosition().y,
        width: this.boss.getWidth(),
        height: this.boss.getHeight()
      };
      
      if (this.checkRectCollision(bossRect, playerRect)) {
        this.player.takeDamage(20);
      }
    }
  }

  private checkRectCollision(a: any, b: any): boolean {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }

  private triggerOverload(): void {
    this.particles.push(...this.player.createOverloadParticles());
    
    this.enemies.forEach(enemy => {
      if (enemy.isActive()) {
        enemy.takeDamage(100);
        if (!enemy.isActive()) {
          this.particles.push(...enemy.createDeathParticles());
          this.player.addGears(enemy.getPoints());
        }
      }
    });
    
    if (this.boss && this.bossFightStarted) {
      this.boss.takeDamage(50, ElementType.NEUTRAL);
    }
  }

  private updatePauseMenu(): void {
    const selection = this.ui.renderPauseMenu();
    
    if (selection === '继续游戏') {
      this.paused = false;
    } else if (selection === '重新开始') {
      this.startLevel(this.currentLevel);
    } else if (selection === '返回主菜单') {
      this.paused = false;
      this.currentScreen = GameScreen.MAIN_MENU;
      this.ui.resetSelections();
    }
  }

  private handleVictory(): void {
    const level = LEVELS[this.currentLevel];
    this.player.unlockWeapon(level.element);
    this.defeatedBosses.add(this.currentLevel);
    this.currentScreen = GameScreen.VICTORY;
  }

  private updateVictory(): void {
    if (this.ui.renderVictory()) {
      this.currentScreen = GameScreen.LEVEL_SELECT;
      this.ui.resetSelections();
    }
  }

  private updateGameOver(): void {
    if (this.ui.renderGameOver()) {
      this.startLevel(this.currentLevel);
    }
  }

  private render(): void {
    if (this.currentScreen === GameScreen.PLAYING || this.currentScreen === GameScreen.BOSS_FIGHT) {
      const level = LEVELS[this.currentLevel];
      this.renderer.clear(level.backgroundColor);
      
      this.renderPlatforms(level.platforms);
      
      this.enemies.forEach(enemy => enemy.render(this.renderer));
      
      if (this.boss) {
        this.boss.render(this.renderer);
      }
      
      this.player.render(this.renderer);
      
      this.projectiles.forEach(proj => proj.render(this.renderer));
      
      this.particles.forEach(p => this.renderer.drawParticle(p));
      
      const bossHealth = this.boss && this.bossFightStarted ? this.boss.getHealth() : -1;
      const bossMaxHealth = this.boss ? this.boss.getMaxHealth() : -1;
      const bossElement = this.boss ? this.boss.getElement() : ElementType.NEUTRAL;
      
      this.ui.renderHUD(this.player.getPlayerState(), bossHealth, bossMaxHealth, bossElement);
      
      if (this.paused) {
        this.ui.renderPauseMenu();
      }
    }
  }

  private renderPlatforms(platforms: Platform[]): void {
    platforms.forEach(platform => {
      let color = '#666666';
      
      switch (platform.type) {
        case 'solid':
          color = '#555555';
          break;
        case 'breakable':
          color = '#886644';
          break;
        case 'spike':
          color = '#ff4444';
          break;
        case 'conveyor':
          color = '#448844';
          break;
      }
      
      this.renderer.drawRect(platform.x, platform.y, platform.width, platform.height, color);
      
      if (platform.type !== 'spike') {
        this.renderer.drawRect(platform.x, platform.y, platform.width, 4, '#888888');
      }
    });
  }
}
