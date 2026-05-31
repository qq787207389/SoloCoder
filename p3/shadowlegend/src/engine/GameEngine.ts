import { GAME_WIDTH, GAME_HEIGHT, TILE_SIZE, SCALE, GameState, Direction, ShurikenType } from '../utils/Constants';
import { aabb } from '../utils/Collision';
import { InputManager } from './InputManager';
import { SoundManager } from './SoundManager';
import { Camera } from './Camera';
import { ParticleSystem } from './ParticleSystem';
import { ParallaxBG } from '../graphics/ParallaxBG';
import { SpriteRenderer } from '../graphics/SpriteRenderer';
import { TileMap } from '../maps/TileMap';
import { getLevel, LevelConfig } from '../maps/LevelData';
import { Player, ShurikenSpawnInfo } from '../entities/player/Player';
import { Enemy } from '../entities/enemies/Enemy';
import { Boss } from '../entities/bosses/Boss';
import { ProjectileManager } from '../entities/Projectile';
import { ItemManager } from '../entities/Item';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private input: InputManager;
  private sound: SoundManager;
  private camera: Camera;
  private particles: ParticleSystem;
  private bg: ParallaxBG;
  private sprites: SpriteRenderer;
  private tileMap: TileMap;
  private player: Player;
  private enemies: Enemy[];
  private boss: Boss | null;
  private projectiles: ProjectileManager;
  private items: ItemManager;
  private state: GameState;
  private levelConfig: LevelConfig | null;
  private currentLevel: number;
  private cycle: number;
  private cutsceneTimer: number;
  private titleTimer: number;
  private gameOverTimer: number;
  private score: number;
  private shakeTimer: number;
  private shakeIntensity: number;
  private bossMusicPlaying: boolean;
  private afterimageFrame: number;
  private bossSpawned: boolean;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;
    this.input = new InputManager();
    this.sound = new SoundManager();
    this.camera = new Camera();
    this.particles = new ParticleSystem();
    this.bg = new ParallaxBG();
    this.sprites = new SpriteRenderer();
    this.tileMap = new TileMap();
    this.player = new Player();
    this.enemies = [];
    this.boss = null;
    this.projectiles = new ProjectileManager();
    this.items = new ItemManager();
    this.state = 'title';
    this.levelConfig = null;
    this.currentLevel = 0;
    this.cycle = 0;
    this.cutsceneTimer = 0;
    this.titleTimer = 0;
    this.gameOverTimer = 0;
    this.score = 0;
    this.shakeTimer = 0;
    this.shakeIntensity = 0;
    this.bossMusicPlaying = false;
    this.afterimageFrame = 0;
    this.bossSpawned = false;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private resize(): void {
    const ratio = GAME_WIDTH / GAME_HEIGHT;
    let w = window.innerWidth;
    let h = window.innerHeight;
    if (w / h > ratio) {
      w = h * ratio;
    } else {
      h = w / ratio;
    }
    this.canvas.style.width = `${Math.floor(w)}px`;
    this.canvas.style.height = `${Math.floor(h)}px`;
    this.canvas.width = GAME_WIDTH;
    this.canvas.height = GAME_HEIGHT;
    this.ctx.imageSmoothingEnabled = false;
  }

  start(): void {
    this.loadLevel(0, 0);
    this.state = 'title';
    this.gameLoop();
  }

  private loadLevel(levelNum: number, cycle: number): void {
    this.currentLevel = levelNum;
    this.cycle = cycle;
    this.levelConfig = getLevel(levelNum, cycle);

    this.tileMap.load({
      tiles: this.levelConfig.tiles,
      upperPlatforms: this.levelConfig.upperPlatforms,
    });

    this.player = new Player();
    this.player.x = this.levelConfig.ribbonX;
    this.player.y = this.levelConfig.ribbonY - this.player.height;

    this.enemies = [];
    for (const spawn of this.levelConfig.enemySpawns) {
      const e = new Enemy();
      e.spawn(spawn.x, spawn.y - 18, spawn.type, spawn.layer, cycle);
      this.enemies.push(e);
    }

    this.boss = null;

    this.projectiles = new ProjectileManager();

    this.items = new ItemManager();
    this.items.spawnFromLevel(this.levelConfig.items, this.levelConfig.scrollItems);

    this.camera.setBounds(0, this.levelConfig.width * TILE_SIZE);
    this.camera.x = 0;
    this.camera.y = 0;

    this.bossMusicPlaying = false;
    this.bossSpawned = false;
    this.sound.stopBossMusic();
  }

  private gameLoop = (): void => {
    this.update();
    this.render();
    this.input.update();
    requestAnimationFrame(this.gameLoop);
  };

  private update(): void {
    this.titleTimer++;
    this.particles.update(1);
    if (this.shakeTimer > 0) this.shakeTimer--;

    switch (this.state) {
      case 'title':
        this.updateTitle();
        break;
      case 'cutscene':
        this.updateCutscene();
        break;
      case 'playing':
        this.updatePlaying();
        break;
      case 'boss':
        this.updatePlaying();
        break;
      case 'gameover':
        this.updateGameOver();
        break;
      case 'victory':
        break;
    }
  }

  private updateTitle(): void {
    if (this.input.isPressed('Enter') || this.input.isPressed('KeyZ')) {
      this.state = 'cutscene';
      this.cutsceneTimer = 0;
      this.loadLevel(0, 0);
      this.sound.playJump();
    }
  }

  private updateCutscene(): void {
    this.cutsceneTimer++;
    if (this.cutsceneTimer < 60) {
      this.particles.emit(this.levelConfig!.ribbonX, this.levelConfig!.ribbonY - 20, 1, 'ribbon');
    }
    if (this.cutsceneTimer > 120) {
      this.state = 'playing';
    }
  }

  private updatePlaying(): void {
    const shurikenSpawn = this.player.update(this.input, this.tileMap, 1);
    if (shurikenSpawn) {
      this.projectiles.spawnShuriken(shurikenSpawn.x, shurikenSpawn.y, shurikenSpawn.direction, shurikenSpawn.shurikenType);
      this.sound.playShurikenThrow();
    }

    if (this.input.isPressed('KeyX')) {
      this.sound.playSwordSlash();
    }

    if (this.input.isPressed('KeyZ') && this.player.grounded) {
      this.sound.playJump();
    }

    this.afterimageFrame++;
    if (this.afterimageFrame % 4 === 0 && Math.abs(this.player.vx) > 1) {
      this.particles.afterimagePositions.push({ x: this.player.x, y: this.player.y, life: 12 });
    }

    if (!this.bossSpawned && this.levelConfig) {
      const bossTriggerX = this.levelConfig.bossX - GAME_WIDTH;
      const allEnemiesDead = this.enemies.every(e => !e.active);
      if (this.player.x > bossTriggerX || allEnemiesDead) {
        const b = new Boss();
        b.spawn(this.levelConfig.bossX, this.levelConfig.bossY, this.levelConfig.bossType, this.cycle);
        this.boss = b;
        this.bossSpawned = true;
        this.state = 'boss';
        for (const enemy of this.enemies) {
          enemy.active = false;
        }
        if (!this.bossMusicPlaying) {
          this.sound.playBossMusic();
          this.bossMusicPlaying = true;
        }
      }
    }

    for (const enemy of this.enemies) {
      if (!enemy.active) continue;
      const result = enemy.update(this.player.x, this.player.y, this.tileMap, 1);
      if (result.shouldShoot) {
        this.projectiles.spawnEnemyProjectile(enemy.x + enemy.width / 2, enemy.y + 6, result.shootVx, result.shootVy, 'enemy_shuriken');
      }

      const attackHitbox = enemy.getAttackHitbox();
      if (attackHitbox && this.player.invincible <= 0) {
        if (aabb(attackHitbox, this.player.getRect())) {
          this.player.takeDamage(1);
          this.shakeScreen(5, 3);
        }
      }
    }

    if (this.boss && this.boss.active) {
      const bossResult = this.boss.update(this.player.x, this.player.y, this.tileMap, 1);
      for (const proj of bossResult.projectiles) {
        this.projectiles.spawnEnemyProjectile(proj.x, proj.y, proj.vx, proj.vy, proj.type as 'enemy_shuriken' | 'fireball');
      }
      if (this.boss.attackHitbox && this.player.invincible <= 0) {
        if (aabb(this.boss.attackHitbox, this.player.getRect())) {
          this.player.takeDamage(1);
          this.shakeScreen(8, 4);
        }
      }
      for (const clone of this.boss.clones) {
        if (!clone.active) continue;
        const cloneAttack = clone.facing === 'right'
          ? { x: clone.x + clone.width, y: clone.y + 4, width: 25, height: clone.height - 8 }
          : { x: clone.x - 25, y: clone.y + 4, width: 25, height: clone.height - 8 };
        if (this.player.invincible <= 0 && aabb(cloneAttack, this.player.getRect())) {
          this.player.takeDamage(1);
          this.shakeScreen(4, 2);
        }
      }
    }

    this.projectiles.update(this.tileMap);

    this.checkPlayerAttackHits();
    this.checkProjectileHits();

    this.items.update();
    const collected = this.items.checkPickup(this.player.getRect(), this.player.layer);
    for (const item of collected) {
      this.sound.playPickup();
      if (item.type === 'speed' || item.type === 'attack' || item.type === 'heal') {
        this.player.applyEffect(item.type);
      }
      if (item.type === 'scroll' && item.scrollType) {
        this.player.addShurikenType(item.scrollType);
      }
    }

    if (this.boss && !this.boss.active) {
      this.sound.stopBossMusic();
      this.bossMusicPlaying = false;
      this.score += 1000;
      this.particles.emit(this.boss.x + this.boss.width / 2, this.boss.y, 30, 'sakura');

      const nextLevel = this.currentLevel + 1 >= 3 ? 0 : this.currentLevel + 1;
      const nextCycle = this.currentLevel + 1 >= 3 ? this.cycle + 1 : this.cycle;
      this.boss = null;
      this.state = 'victory';

      setTimeout(() => {
        this.currentLevel = nextLevel;
        this.cycle = nextCycle;
        this.state = 'cutscene';
        this.cutsceneTimer = 0;
        this.loadLevel(this.currentLevel, this.cycle);
      }, 2000);
    } else if (this.player.hp <= 0) {
      this.state = 'gameover';
      this.gameOverTimer = 0;
      this.particles.emit(this.player.x, this.player.y, 20, 'sakura');
      this.sound.stopBossMusic();
      this.bossMusicPlaying = false;
    }

    this.camera.follow(this.player.x, this.player.y, 1);
  }

  private checkPlayerAttackHits(): void {
    const swordHitbox = this.player.getSwordHitbox();
    if (swordHitbox.width === 0) return;

    for (const enemy of this.enemies) {
      if (!enemy.active) continue;
      if (aabb(swordHitbox, enemy.getRect())) {
        const hit = enemy.takeDamage(this.player.getAttackPower(), this.player.facing);
        if (hit) {
          this.particles.emit(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 5, 'spark');
          this.sound.playHit();
          if (!enemy.active) {
            this.particles.emit(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 10, 'sakura');
            this.sound.playEnemyDeath();
            this.score += 100;
            if (enemy.dropsShuriken) {
              this.player.addShuriken(2);
            }
          }
        } else {
          this.shakeScreen(3, 2);
        }
      }
    }

    if (this.boss && this.boss.active) {
      if (aabb(swordHitbox, this.boss.getRect())) {
        this.boss.takeDamage(this.player.getAttackPower());
        this.particles.emit(this.boss.x + this.boss.width / 2, this.boss.y + this.boss.height / 2, 5, 'spark');
        this.sound.playHit();
        this.shakeScreen(4, 2);
      }
      for (const clone of this.boss.clones) {
        if (!clone.active) continue;
        if (aabb(swordHitbox, clone.getRect())) {
          clone.takeDamage(this.player.getAttackPower());
          this.particles.emit(clone.x + clone.width / 2, clone.y + clone.height / 2, 5, 'spark');
          this.sound.playHit();
        }
      }
    }
  }

  private checkProjectileHits(): void {
    for (const proj of this.projectiles.projectiles) {
      if (!proj.active) continue;

      if (proj.friendly) {
        for (const enemy of this.enemies) {
          if (!enemy.active) continue;
          if (aabb(this.projectiles.getRect(proj), enemy.getRect())) {
            const hit = enemy.takeDamage(1, proj.vx > 0 ? 'right' : 'left');
            if (hit) {
              this.particles.emit(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 3, 'spark');
              this.sound.playHit();
              if (!proj.piercing) proj.active = false;
              if (!enemy.active) {
                this.particles.emit(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 10, 'sakura');
                this.sound.playEnemyDeath();
                this.score += 100;
                if (enemy.dropsShuriken) {
                  this.player.addShuriken(2);
                }
              }
            } else {
              if (!proj.piercing) proj.active = false;
              this.shakeScreen(2, 1);
            }
          }
        }

        if (this.boss && this.boss.active) {
          if (aabb(this.projectiles.getRect(proj), this.boss.getRect())) {
            this.boss.takeDamage(1);
            this.particles.emit(this.boss.x + this.boss.width / 2, this.boss.y + this.boss.height / 2, 3, 'spark');
            this.sound.playHit();
            if (!proj.piercing) proj.active = false;
          }
          for (const clone of this.boss.clones) {
            if (!clone.active) continue;
            if (aabb(this.projectiles.getRect(proj), clone.getRect())) {
              clone.takeDamage(1);
              this.particles.emit(clone.x + clone.width / 2, clone.y + clone.height / 2, 3, 'spark');
              this.sound.playHit();
              if (!proj.piercing) proj.active = false;
            }
          }
        }
      } else {
        if (this.player.invincible <= 0 && aabb(this.projectiles.getRect(proj), this.player.getRect())) {
          this.player.takeDamage(1);
          proj.active = false;
          this.shakeScreen(5, 3);
          this.particles.emit(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, 5, 'spark');
        }
      }
    }
  }

  private shakeScreen(intensity: number, duration: number): void {
    this.shakeIntensity = intensity;
    this.shakeTimer = duration;
  }

  private updateGameOver(): void {
    this.gameOverTimer++;
    if (this.gameOverTimer > 120 && (this.input.isPressed('Enter') || this.input.isPressed('KeyZ'))) {
      this.state = 'title';
      this.loadLevel(0, 0);
      this.score = 0;
    }
  }

  private render(): void {
    const ctx = this.ctx;
    ctx.save();

    if (this.shakeTimer > 0) {
      const sx = (Math.random() - 0.5) * this.shakeIntensity * 2;
      const sy = (Math.random() - 0.5) * this.shakeIntensity * 2;
      ctx.translate(sx, sy);
    }

    switch (this.state) {
      case 'title':
        this.renderTitle(ctx);
        break;
      case 'cutscene':
        this.renderCutscene(ctx);
        break;
      case 'playing':
      case 'boss':
        this.renderPlaying(ctx);
        break;
      case 'gameover':
        this.renderPlaying(ctx);
        this.renderGameOver(ctx);
        break;
      case 'victory':
        this.renderPlaying(ctx);
        this.renderVictoryOverlay(ctx);
        break;
    }

    ctx.restore();
  }

  private renderTitle(ctx: CanvasRenderingContext2D): void {
    this.bg.render(ctx, 0, 0.25, 'forest');
    this.particles.render(ctx, 0);

    ctx.save();
    ctx.fillStyle = '#e8e0d0';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#c0392b';
    ctx.shadowBlur = 0;

    const titleY = 100 + Math.sin(this.titleTimer * 0.02) * 5;
    ctx.fillText('影 子 传 说', GAME_WIDTH / 2, titleY);

    ctx.font = '10px monospace';
    ctx.fillStyle = '#9f9f9f';
    ctx.fillText('SHADOW LEGEND', GAME_WIDTH / 2, titleY + 25);

    if (Math.floor(this.titleTimer / 30) % 2 === 0) {
      ctx.fillStyle = '#e8e0d0';
      ctx.font = '10px monospace';
      ctx.fillText('按 ENTER 或 Z 开始游戏', GAME_WIDTH / 2, 240);
    }

    ctx.fillStyle = '#6d6d6d';
    ctx.font = '8px monospace';
    ctx.fillText('← → 移动  Z 跳跃(按住飘浮)  X 刀  C 手里剑', GAME_WIDTH / 2, 280);
    ctx.restore();
  }

  private renderCutscene(ctx: CanvasRenderingContext2D): void {
    if (!this.levelConfig) return;
    const theme = this.levelConfig.theme === 'bamboo' ? 'forest' : this.levelConfig.theme;
    this.bg.render(ctx, this.camera.x, this.levelConfig.moonPhase, theme);
    this.tileMap.render(ctx, { x: this.camera.x, y: this.camera.y }, this.levelConfig.theme);
    this.particles.render(ctx, this.camera.x);

    if (this.cutsceneTimer < 60) {
      this.sprites.drawSprite(ctx, 'ribbon',
        this.levelConfig.ribbonX - this.camera.x,
        this.levelConfig.ribbonY - 10 - Math.sin(this.cutsceneTimer * 0.1) * 5,
        false, SCALE
      );
    }

    ctx.save();
    ctx.fillStyle = '#e8e0d0';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    if (this.cutsceneTimer > 30 && this.cutsceneTimer < 90) {
      ctx.globalAlpha = Math.min(1, (this.cutsceneTimer - 30) / 20);
      ctx.fillText('公主又被抓走了...', GAME_WIDTH / 2, 60);
    }
    if (this.cutsceneTimer > 80) {
      ctx.globalAlpha = Math.min(1, (this.cutsceneTimer - 80) / 20);
      ctx.fillText('追！', GAME_WIDTH / 2, 80);
    }
    ctx.restore();

    this.renderPlayerSprite(ctx);
  }

  private renderPlaying(ctx: CanvasRenderingContext2D): void {
    if (!this.levelConfig) return;
    const theme = this.levelConfig.theme === 'bamboo' ? 'forest' : this.levelConfig.theme;

    this.bg.render(ctx, this.camera.x, this.levelConfig.moonPhase, theme);

    this.tileMap.render(ctx, { x: this.camera.x, y: this.camera.y }, this.levelConfig.theme);

    this.items.render(ctx, { x: this.camera.x, y: this.camera.y }, this.sprites);

    for (const enemy of this.enemies) {
      if (!enemy.active) continue;
      const spriteName = enemy.type === 'samurai' ? 'samurai' : enemy.type === 'ninja' ? 'ninja_enemy' : 'thrower';
      const flipped = enemy.facing === 'left';
      const ex = enemy.x - this.camera.x;
      const ey = enemy.y - this.camera.y;
      if (enemy.invincible > 0 && Math.floor(enemy.invincible / 3) % 2 === 0) continue;
      this.sprites.drawSprite(ctx, spriteName, ex, ey, flipped, SCALE);
    }

    if (this.boss && this.boss.active) {
      const bossSprite = this.boss.type === 'giant_monk' ? 'monk'
        : this.boss.type === 'shadow_master' ? 'shadow_master' : 'sorcerer';
      const flipped = this.boss.facing === 'left';
      const bx = this.boss.x - this.camera.x;
      const by = this.boss.y - this.camera.y;
      if (this.boss.invincible <= 0 || Math.floor(this.boss.invincible / 3) % 2 !== 0) {
        this.sprites.drawSprite(ctx, bossSprite, bx, by, flipped, SCALE);
      }
      for (const clone of this.boss.clones) {
        if (!clone.active) continue;
        const cx = clone.x - this.camera.x;
        const cy = clone.y - this.camera.y;
        ctx.save();
        ctx.globalAlpha = 0.5;
        this.sprites.drawSprite(ctx, bossSprite, cx, cy, clone.facing === 'left', SCALE);
        ctx.restore();
      }
    }

    this.renderPlayerSprite(ctx);

    this.projectiles.render(ctx, { x: this.camera.x, y: this.camera.y }, this.sprites);
    this.particles.render(ctx, this.camera.x);

    this.renderHUD(ctx);
  }

  private renderPlayerSprite(ctx: CanvasRenderingContext2D): void {
    if (this.player.invincible > 0 && Math.floor(this.player.invincible / 3) % 2 === 0) return;

    const animState = this.player.getAnimState();
    let spriteName = 'ninja_stand';
    switch (animState) {
      case 'run':
        spriteName = ['ninja_run1', 'ninja_run2', 'ninja_run3', 'ninja_run2'][this.player.animFrame % 4] || 'ninja_run1';
        break;
      case 'jump': spriteName = 'ninja_jump'; break;
      case 'float': spriteName = 'ninja_float'; break;
      case 'sword': spriteName = 'ninja_sword'; break;
      default: spriteName = 'ninja_stand';
    }

    const flipped = this.player.facing === 'left';
    const px = this.player.x - this.camera.x;
    const py = this.player.y - this.camera.y;

    for (const ai of this.player.afterimages) {
      const aix = ai.x - this.camera.x;
      const aiy = ai.y - this.camera.y;
      ctx.save();
      ctx.globalAlpha = ai.alpha * 0.4;
      this.sprites.drawSprite(ctx, spriteName, aix, aiy, ai.facing === 'left', SCALE);
      ctx.restore();
    }

    this.sprites.drawSprite(ctx, spriteName, px, py, flipped, SCALE);

    if (this.player.attacking && this.player.swordTimer > 0) {
      const sDir = this.player.facing === 'right' ? 1 : -1;
      const sStartX = this.player.facing === 'right' ? px + this.player.width * SCALE : px;
      const sEndX = sStartX + sDir * 28;
      const sY = py + 10;
      ctx.strokeStyle = '#e8e0d0';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(sStartX, sY);
      ctx.lineTo(sEndX, sY - 4);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(232,224,208,0.5)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(sStartX, sY);
      ctx.lineTo(sEndX, sY - 4);
      ctx.stroke();
    }
  }

  private renderHUD(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    ctx.fillStyle = '#c0392b';
    for (let i = 0; i < this.player.maxHp; i++) {
      const hx = 10 + i * 14;
      const hy = 10;
      if (i < this.player.hp) {
        ctx.fillStyle = '#c0392b';
      } else {
        ctx.fillStyle = '#3d1a1a';
      }
      ctx.fillRect(hx, hy, 10, 10);
      ctx.fillRect(hx + 1, hy - 1, 8, 1);
      ctx.fillRect(hx - 1, hy + 1, 1, 8);
      ctx.fillRect(hx + 10, hy + 1, 1, 8);
      ctx.fillRect(hx + 1, hy + 10, 8, 1);
    }

    ctx.fillStyle = '#e8e0d0';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`手里剑: ${this.player.shurikenCount}`, GAME_WIDTH - 10, 18);

    if (this.player.shurikenType !== 'normal') {
      ctx.fillStyle = '#f1c40f';
      ctx.font = '8px monospace';
      ctx.fillText(`[${this.player.shurikenType}]`, GAME_WIDTH - 10, 30);
    }

    ctx.fillStyle = '#e8e0d0';
    ctx.font = '8px monospace';
    ctx.textAlign = 'center';
    const levelNames = ['竹林', '天守阁', '火山洞穴'];
    ctx.fillText(`${levelNames[this.currentLevel % 3]} 第${this.cycle + 1}轮`, GAME_WIDTH / 2, 14);

    ctx.textAlign = 'right';
    ctx.fillText(`得分: ${this.score}`, GAME_WIDTH - 10, GAME_HEIGHT - 8);

    if (this.player.speedBoost > 0) {
      ctx.fillStyle = '#00ccff';
      ctx.fillText('加速中', 60, GAME_HEIGHT - 8);
    }
    if (this.player.attackBoost > 0) {
      ctx.fillStyle = '#ff4444';
      ctx.fillText('攻击UP', 120, GAME_HEIGHT - 8);
    }

    if (this.boss && this.boss.active) {
      const barWidth = 200;
      const barX = (GAME_WIDTH - barWidth) / 2;
      const barY = GAME_HEIGHT - 16;
      ctx.fillStyle = '#3d1a1a';
      ctx.fillRect(barX, barY, barWidth, 8);
      const hpPercent = this.boss.hp / this.boss.maxHp;
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(barX, barY, barWidth * hpPercent, 8);
      ctx.strokeStyle = '#e8e0d0';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barWidth, 8);

      const bossNames: Record<string, string> = {
        giant_monk: '巨大僧侣',
        shadow_master: '忍者头目',
        fire_sorcerer: '妖术师',
      };
      ctx.fillStyle = '#e8e0d0';
      ctx.font = '8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(bossNames[this.boss.type] || 'BOSS', GAME_WIDTH / 2, barY - 2);
    }

    ctx.restore();
  }

  private renderGameOver(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = '#c0392b';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('败北', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20);
    ctx.fillStyle = '#e8e0d0';
    ctx.font = '10px monospace';
    ctx.fillText(`得分: ${this.score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10);
    if (this.gameOverTimer > 120) {
      ctx.fillStyle = '#9f9f9f';
      ctx.fillText('按 ENTER 重新开始', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 35);
    }
    ctx.restore();
  }

  private renderVictoryOverlay(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = '#f1c40f';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Boss 击破!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10);
    ctx.fillStyle = '#e8e0d0';
    ctx.font = '10px monospace';
    ctx.fillText('公主再次被掳走...', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 15);
    ctx.restore();
  }

  destroy(): void {
    this.input.destroy();
    this.sound.destroy();
  }
}
