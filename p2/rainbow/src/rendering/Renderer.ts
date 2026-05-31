import { RAINBOW_COLORS } from '../utils/Constants';
import { PixelRenderer } from './PixelRenderer';
import { BackgroundRenderer } from './BackgroundRenderer';
import { HUDRenderer } from './HUDRenderer';
import { Platform, PlatformType } from '../level/Platform';
import { Camera } from '../game/Camera';
import { RainbowArc, RainbowSystem } from '../systems/RainbowSystem';
import { Player } from '../entities/Player';
import { Beetle } from '../entities/Beetle';
import { Jellyfish } from '../entities/Jellyfish';
import { Dragon, DragonBullet } from '../entities/Dragon';
import { BossBullet, Boss, BossPhase } from '../entities/Boss';
import { Particle } from '../systems/ParticleSystem';
import { Item, ItemType } from '../systems/ItemSystem';
import { lerp } from '../utils/MathUtils';
import { EnemyType } from '../entities/Enemy';

export class Renderer {
  ctx: CanvasRenderingContext2D;
  pixelRenderer: PixelRenderer;
  backgroundRenderer: BackgroundRenderer;
  hudRenderer: HUDRenderer;
  width: number;
  height: number;
  RAINBOW_COLORS: string[];

  constructor(canvas: HTMLCanvasElement, width: number, height: number, levelHeight: number) {
    this.ctx = canvas.getContext('2d')!;
    this.width = width;
    this.height = height;
    this.RAINBOW_COLORS = RAINBOW_COLORS;

    const pixelScale = canvas.width / width;
    this.ctx.setTransform(pixelScale, 0, 0, pixelScale, 0, 0);
    this.ctx.imageSmoothingEnabled = false;

    this.pixelRenderer = new PixelRenderer(this.ctx);
    this.pixelRenderer.setPixelated();

    this.backgroundRenderer = new BackgroundRenderer(this.ctx, width, height);
    this.hudRenderer = new HUDRenderer(this.ctx, this.pixelRenderer, width);

    this.backgroundRenderer.generateBackground(levelHeight);
  }

  begin(): void {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    const pixelScale = this.ctx.canvas.width / this.width;
    this.ctx.setTransform(pixelScale, 0, 0, pixelScale, 0, 0);
    this.ctx.imageSmoothingEnabled = false;
  }

  end(): void {
    this.ctx.globalAlpha = 1;
    this.ctx.globalCompositeOperation = 'source-over';
  }

  renderBackground(cameraY: number, levelProgress: number, alpha: number): void {
    this.backgroundRenderer.render(cameraY, levelProgress, alpha);
  }

  renderPlatforms(platforms: Platform[], camera: Camera): void {
    for (const platform of platforms) {
      if (!camera.isVisible(platform.x, platform.y, platform.w, platform.h)) continue;

      const sx = camera.screenX(platform.x);
      const sy = camera.screenY(platform.y);

      switch (platform.type) {
        case PlatformType.CLOUD:
          this.drawCloudPlatform(sx, sy, platform.w, platform.h, '#FFFFFF', '#CCCCCC');
          break;
        case PlatformType.MOVING_CLOUD:
          this.drawCloudPlatform(sx, sy, platform.w, platform.h, '#E0F0FF', '#A0C0E0');
          break;
        case PlatformType.ISLAND:
          this.drawIslandPlatform(sx, sy, platform.w, platform.h);
          break;
        case PlatformType.BUBBLE:
          this.drawBubblePlatform(sx, sy, platform.w, platform.h);
          break;
      }
    }
  }

  private drawCloudPlatform(x: number, y: number, w: number, h: number, fillColor: string, outlineColor: string): void {
    this.ctx.fillStyle = fillColor;
    this.ctx.beginPath();
    this.ctx.roundRect(x, y, w, h, 4);
    this.ctx.fill();

    this.ctx.fillStyle = outlineColor;
    this.ctx.fillRect(x, y + h - 2, w, 2);

    for (let i = 0; i < w; i += 8) {
      this.ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
      this.ctx.fillRect(x + i, y + 2, 2, 2);
    }
  }

  private drawIslandPlatform(x: number, y: number, w: number, h: number): void {
    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(x, y + 4, w, h - 4);

    this.ctx.fillStyle = '#228B22';
    this.ctx.fillRect(x, y, w, 6);

    this.ctx.fillStyle = '#32CD32';
    for (let i = 0; i < w; i += 4) {
      this.ctx.fillRect(x + i, y - 2, 2, 4);
      this.ctx.fillRect(x + i + 2, y - 1, 2, 3);
    }

    this.ctx.fillStyle = '#654321';
    for (let i = 0; i < w; i += 8) {
      this.ctx.fillRect(x + i + 2, y + 8, 3, 3);
      this.ctx.fillRect(x + i + 5, y + 12, 2, 2);
    }
  }

  private drawBubblePlatform(x: number, y: number, w: number, h: number): void {
    const radius = Math.min(w, h) / 2;

    const gradient = this.ctx.createRadialGradient(
      x + w / 2 - 3,
      y + h / 2 - 3,
      0,
      x + w / 2,
      y + h / 2,
      radius
    );
    gradient.addColorStop(0, 'rgba(200, 230, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(150, 200, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(100, 180, 255, 0.3)');

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x + w / 2, y + h / 2, radius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    this.ctx.beginPath();
    this.ctx.arc(x + w / 2 - radius / 3, y + h / 2 - radius / 3, radius / 4, 0, Math.PI * 2);
    this.ctx.fill();
  }

  renderRainbow(arcs: RainbowArc[], rainbowSystem: RainbowSystem, camera: Camera): void {
    for (const arc of arcs) {
      const scx = camera.screenX(arc.cx);
      const scy = camera.screenY(arc.cy);

      if (!camera.isVisible(arc.cx - arc.radius - 10, arc.cy - arc.radius - 10, arc.radius * 2 + 20, arc.radius * 2 + 20)) continue;

      const alpha = rainbowSystem.getAlpha(arc);

      for (let c = 0; c < RAINBOW_COLORS.length; c++) {
        const radiusOffset = (c - RAINBOW_COLORS.length / 2 + 0.5) * 3.5;
        const r = arc.radius + radiusOffset;
        if (r <= 0) continue;

        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        this.ctx.strokeStyle = RAINBOW_COLORS[c];
        this.ctx.lineWidth = 3.5;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.arc(scx, scy, r, arc.startAngle, arc.endAngle, arc.facing > 0);
        this.ctx.stroke();
        this.ctx.restore();
      }

      const sparkleTime = Date.now() * 0.008;
      const sparklePoints = rainbowSystem.getArcPoints(arc, 12);
      for (let i = 0; i < sparklePoints.length; i += 2) {
        const sparkleAlpha = (Math.sin(sparkleTime + i * 0.6) + 1) / 2 * alpha;
        this.ctx.fillStyle = `rgba(255, 255, 255, ${sparkleAlpha})`;
        const sx = camera.screenX(sparklePoints[i].x);
        const sy = camera.screenY(sparklePoints[i].y);
        this.ctx.fillRect(Math.floor(sx) - 1, Math.floor(sy) - 1, 2, 2);
      }
    }
  }

  renderPlayer(player: Player, camera: Camera, alpha: number): void {
    const px = camera.screenX(player.x);
    const py = camera.screenY(player.y);

    const drawX = lerp(px, px + player.vx * 0.016, alpha);
    const drawY = lerp(py, py + player.vy * 0.016, alpha);

    if (player.invincible) {
      const flicker = Math.floor(player.animTime * 15) % 2 === 0;
      if (!flicker) {
        this.ctx.globalAlpha = 0.5;
      }
    }

    if (player.isDrawingRainbow) {
      const auraGradient = this.ctx.createRadialGradient(
        drawX + player.w / 2,
        drawY + player.h / 2,
        0,
        drawX + player.w / 2,
        drawY + player.h / 2,
        player.w
      );
      for (let i = 0; i < this.RAINBOW_COLORS.length; i++) {
        auraGradient.addColorStop(i / this.RAINBOW_COLORS.length, this.RAINBOW_COLORS[i] + '80');
      }
      this.ctx.fillStyle = auraGradient;
      this.ctx.beginPath();
      this.ctx.arc(drawX + player.w / 2, drawY + player.h / 2, player.w, 0, Math.PI * 2);
      this.ctx.fill();
    }

    const legOffset = player.onGround ? Math.sin(player.animTime * 10) * 2 : 0;

    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(drawX + 4, drawY + 2, 12, 6);
    this.ctx.fillRect(drawX + 3, drawY + 4, 2, 4);
    this.ctx.fillRect(drawX + 15, drawY + 4, 2, 4);

    this.ctx.fillStyle = '#FFDBAC';
    this.ctx.fillRect(drawX + 5, drawY + 8, 10, 8);

    this.ctx.fillStyle = '#000000';
    if (player.facing > 0) {
      this.ctx.fillRect(drawX + 11, drawY + 10, 2, 2);
      this.ctx.fillRect(drawX + 7, drawY + 10, 2, 2);
    } else {
      this.ctx.fillRect(drawX + 7, drawY + 10, 2, 2);
      this.ctx.fillRect(drawX + 11, drawY + 10, 2, 2);
    }

    this.ctx.fillStyle = '#FF6B9D';
    this.ctx.fillRect(drawX + 4, drawY + 16, 12, 8);

    this.ctx.fillStyle = '#1E90FF';
    this.ctx.fillRect(drawX + 4, drawY + 24 + legOffset, 5, 4);
    this.ctx.fillRect(drawX + 11, drawY + 24 - legOffset, 5, 4);

    this.ctx.globalAlpha = 1;
  }

  renderEnemies(enemies: Array<Beetle | Jellyfish | Dragon>, camera: Camera): void {
    for (const enemy of enemies) {
      if (enemy.dead) continue;
      if (!camera.isVisible(enemy.x, enemy.y, enemy.w, enemy.h)) continue;

      const sx = camera.screenX(enemy.x);
      const sy = camera.screenY(enemy.y);

      if (enemy.frozen) {
        const rainbowIndex = Math.floor(enemy.animTime * 10) % this.RAINBOW_COLORS.length;
        this.ctx.strokeStyle = this.RAINBOW_COLORS[rainbowIndex];
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(sx - 2, sy - 2, enemy.w + 4, enemy.h + 4);
      }

      switch (enemy.type) {
        case EnemyType.BEETLE:
          this.drawBeetle(sx, sy, enemy as Beetle);
          break;
        case EnemyType.JELLYFISH:
          this.drawJellyfish(sx, sy, enemy as Jellyfish);
          break;
        case EnemyType.DRAGON:
          this.drawDragon(sx, sy, enemy as Dragon);
          break;
      }
    }
  }

  private drawBeetle(x: number, y: number, enemy: Beetle): void {
    this.ctx.fillStyle = '#8B0000';
    this.ctx.beginPath();
    this.ctx.ellipse(x + enemy.w / 2, y + enemy.h / 2, enemy.w / 2, enemy.h / 2, 0, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#A52A2A';
    this.ctx.fillRect(x + enemy.w / 2 - 1, y + 2, 2, enemy.h - 4);

    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(x + 3, y + 4, 2, 2);
    this.ctx.fillRect(x + enemy.w - 5, y + 4, 2, 2);

    const legAnim = Math.sin(enemy.animTime * 8) * 1;
    for (let i = 0; i < 3; i++) {
      const lx = x + 3 + i * 5;
      const ly = y + enemy.h - 2 + (i % 2 === 0 ? legAnim : -legAnim);
      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect(lx, ly, 2, 3);
      this.ctx.fillRect(lx, y + 2 - (i % 2 === 0 ? legAnim : -legAnim), 2, 3);
    }

    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(x + 5, y + 2);
    this.ctx.lineTo(x + 3, y - 3);
    this.ctx.moveTo(x + enemy.w - 5, y + 2);
    this.ctx.lineTo(x + enemy.w - 3, y - 3);
    this.ctx.stroke();
  }

  private drawJellyfish(x: number, y: number, enemy: Jellyfish): void {
    const floatY = Math.sin(enemy.animTime * 3) * 2;

    const gradient = this.ctx.createRadialGradient(
      x + enemy.w / 2,
      y + enemy.h / 2 + floatY,
      0,
      x + enemy.w / 2,
      y + enemy.h / 2 + floatY,
      enemy.w / 2
    );
    gradient.addColorStop(0, 'rgba(173, 216, 230, 0.9)');
    gradient.addColorStop(1, 'rgba(135, 206, 250, 0.5)');

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.ellipse(x + enemy.w / 2, y + enemy.h / 3 + floatY, enemy.w / 2, enemy.h / 3, 0, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.strokeStyle = 'rgba(135, 206, 250, 0.7)';
    this.ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const tx = x + 3 + i * 4;
      const wave = Math.sin(enemy.animTime * 5 + i) * 3;
      this.ctx.beginPath();
      this.ctx.moveTo(tx, y + enemy.h / 2 + floatY);
      this.ctx.quadraticCurveTo(tx + wave, y + enemy.h * 0.75, tx, y + enemy.h);
      this.ctx.stroke();
    }

    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(x + 5, y + enemy.h / 4 + floatY, 2, 2);
    this.ctx.fillRect(x + enemy.w - 7, y + enemy.h / 4 + floatY, 2, 2);
  }

  private drawDragon(x: number, y: number, enemy: Dragon): void {
    const wingFlap = Math.sin(enemy.animTime * 6) * 3;

    this.ctx.fillStyle = 'rgba(34, 139, 34, 0.7)';
    this.ctx.beginPath();
    this.ctx.moveTo(x + 5, y + 8);
    this.ctx.lineTo(x - 5, y + 5 + wingFlap);
    this.ctx.lineTo(x + 5, y + 15);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.moveTo(x + enemy.w - 5, y + 8);
    this.ctx.lineTo(x + enemy.w + 5, y + 5 - wingFlap);
    this.ctx.lineTo(x + enemy.w - 5, y + 15);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.fillStyle = '#228B22';
    this.ctx.beginPath();
    this.ctx.ellipse(x + enemy.w / 2, y + enemy.h / 2, enemy.w / 2, enemy.h / 3, 0, 0, Math.PI * 2);
    this.ctx.fill();

    const headX = enemy.facing > 0 ? x + enemy.w - 8 : x + 2;
    this.ctx.fillStyle = '#228B22';
    this.ctx.fillRect(headX, y + 4, 10, 10);

    this.ctx.fillStyle = '#32CD32';
    for (let i = 0; i < 4; i++) {
      this.ctx.fillRect(x + 8 + i * 6, y + 4, 3, 3);
    }

    this.ctx.fillStyle = '#000000';
    const eyeX = enemy.facing > 0 ? headX + 6 : headX + 2;
    this.ctx.fillRect(eyeX, y + 7, 2, 2);

    this.ctx.fillStyle = '#8B4513';
    this.ctx.fillRect(headX + 2, y + 1, 2, 4);
    this.ctx.fillRect(headX + 6, y + 1, 2, 4);
  }

  renderBullets(dragonBullets: DragonBullet[], bossBullets: BossBullet[], camera: Camera): void {
    for (const bullet of dragonBullets) {
      if (!camera.isVisible(bullet.x, bullet.y, bullet.w, bullet.h)) continue;

      const sx = camera.screenX(bullet.x);
      const sy = camera.screenY(bullet.y);

      const glowGradient = this.ctx.createRadialGradient(
        sx + bullet.w / 2,
        sy + bullet.h / 2,
        0,
        sx + bullet.w / 2,
        sy + bullet.h / 2,
        bullet.w * 2
      );
      glowGradient.addColorStop(0, 'rgba(255, 200, 0, 0.8)');
      glowGradient.addColorStop(0.5, 'rgba(255, 150, 0, 0.4)');
      glowGradient.addColorStop(1, 'rgba(255, 100, 0, 0)');

      this.ctx.fillStyle = glowGradient;
      this.ctx.fillRect(sx - bullet.w, sy - bullet.h, bullet.w * 3, bullet.h * 3);

      this.ctx.fillStyle = '#FFFF00';
      this.ctx.fillRect(sx, sy, bullet.w, bullet.h);
      this.ctx.fillStyle = '#FF8C00';
      this.ctx.fillRect(sx + 1, sy + 1, bullet.w - 2, bullet.h - 2);
    }

    for (const bullet of bossBullets) {
      if (!camera.isVisible(bullet.x, bullet.y, bullet.w, bullet.h)) continue;

      const sx = camera.screenX(bullet.x);
      const sy = camera.screenY(bullet.y);

      const glowColor = bullet.type === 'big' ? 'rgba(255, 0, 100, 0.8)' : 'rgba(150, 0, 255, 0.8)';
      const glowGradient = this.ctx.createRadialGradient(
        sx + bullet.w / 2,
        sy + bullet.h / 2,
        0,
        sx + bullet.w / 2,
        sy + bullet.h / 2,
        bullet.w * 2
      );
      glowGradient.addColorStop(0, glowColor);
      glowGradient.addColorStop(0.5, 'rgba(128, 0, 128, 0.4)');
      glowGradient.addColorStop(1, 'rgba(128, 0, 128, 0)');

      this.ctx.fillStyle = glowGradient;
      this.ctx.fillRect(sx - bullet.w, sy - bullet.h, bullet.w * 3, bullet.h * 3);

      this.ctx.fillStyle = bullet.type === 'big' ? '#FF0066' : '#8B008B';
      this.ctx.fillRect(sx, sy, bullet.w, bullet.h);
      this.ctx.fillStyle = '#FF00FF';
      this.ctx.fillRect(sx + 1, sy + 1, bullet.w - 2, bullet.h - 2);
    }
  }

  renderBoss(boss: Boss, camera: Camera): void {
    if (!boss.active) return;
    if (!camera.isVisible(boss.x, boss.y, boss.w, boss.h)) return;

    const sx = camera.screenX(boss.x);
    const sy = camera.screenY(boss.y);

    if (boss.hitTimer > 0 && Math.floor(boss.hitTimer * 20) % 2 === 0) {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      this.ctx.fillRect(sx, sy, boss.w, boss.h);
      return;
    }

    const wingFlap = Math.sin(boss.animTime * 4) * 8;
    const isEnraged = boss.phase === BossPhase.ENRAGED;

    const bodyColor = isEnraged ? '#CC0000' : '#228B22';
    const darkBodyColor = isEnraged ? '#8B0000' : '#006400';

    this.ctx.fillStyle = isEnraged ? 'rgba(200, 0, 0, 0.6)' : 'rgba(34, 139, 34, 0.6)';
    this.ctx.beginPath();
    this.ctx.moveTo(sx + 15, sy + 30);
    this.ctx.lineTo(sx - 20, sy + 10 + wingFlap);
    this.ctx.lineTo(sx + 15, sy + 55);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.moveTo(sx + boss.w - 15, sy + 30);
    this.ctx.lineTo(sx + boss.w + 20, sy + 10 - wingFlap);
    this.ctx.lineTo(sx + boss.w - 15, sy + 55);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.fillStyle = bodyColor;
    this.ctx.beginPath();
    this.ctx.ellipse(sx + boss.w / 2, sy + boss.h / 2, boss.w / 2.5, boss.h / 2.5, 0, 0, Math.PI * 2);
    this.ctx.fill();

    const headX = boss.facing > 0 ? sx + boss.w - 35 : sx + 10;
    this.ctx.fillStyle = bodyColor;
    this.ctx.fillRect(headX, sy + 15, 30, 35);

    this.ctx.fillStyle = darkBodyColor;
    for (let i = 0; i < 6; i++) {
      this.ctx.fillRect(sx + 20 + i * 9, sy + 18, 5, 6);
    }

    this.ctx.fillStyle = '#FFD700';
    this.ctx.fillRect(headX + 5, sy + 5, 5, 15);
    this.ctx.fillRect(headX + 20, sy + 5, 5, 15);

    this.ctx.fillStyle = '#FF0000';
    const eyeX = boss.facing > 0 ? headX + 20 : headX + 5;
    this.ctx.fillRect(eyeX, sy + 25, 5, 5);

    this.ctx.fillStyle = darkBodyColor;
    for (let i = 0; i < 3; i++) {
      this.ctx.fillRect(sx + 30 + i * 12, sy + boss.h - 15, 8, 12);
    }

    if (isEnraged) {
      const auraGradient = this.ctx.createRadialGradient(
        sx + boss.w / 2,
        sy + boss.h / 2,
        0,
        sx + boss.w / 2,
        sy + boss.h / 2,
        boss.w
      );
      auraGradient.addColorStop(0, 'rgba(255, 0, 0, 0.3)');
      auraGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      this.ctx.fillStyle = auraGradient;
      this.ctx.fillRect(sx - 20, sy - 20, boss.w + 40, boss.h + 40);
    }
  }

  renderParticles(particles: Particle[], camera: Camera): void {
    for (const particle of particles) {
      if (!particle.active) continue;
      if (!camera.isVisible(particle.x, particle.y, particle.size, particle.size)) continue;

      const sx = camera.screenX(particle.x);
      const sy = camera.screenY(particle.y);
      const alpha = particle.life / particle.maxLife;

      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = particle.color;
      this.ctx.fillRect(Math.floor(sx), Math.floor(sy), particle.size, particle.size);
    }
    this.ctx.globalAlpha = 1;
  }

  renderItems(items: Item[], camera: Camera): void {
    for (const item of items) {
      if (item.collected) continue;
      if (!camera.isVisible(item.x, item.y, item.w, item.h)) continue;

      const sx = camera.screenX(item.x);
      const sy = camera.screenY(item.y + item.bobOffset);

      switch (item.type) {
        case ItemType.COIN:
          this.drawCoin(sx, sy, item.w, item.h);
          break;
        case ItemType.GEM:
          this.drawGem(sx, sy, item.w, item.h, '#4169E1');
          break;
        case ItemType.RARE_GEM:
          this.drawRareGem(sx, sy, item.w, item.h);
          break;
        case ItemType.HEART:
          this.drawHeartItem(sx, sy, item.w, item.h);
          break;
      }
    }
  }

  private drawCoin(x: number, y: number, w: number, h: number): void {
    const shine = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;

    this.ctx.fillStyle = `rgba(255, 215, 0, ${shine})`;
    this.ctx.beginPath();
    this.ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#FFA500';
    this.ctx.beginPath();
    this.ctx.arc(x + w / 2, y + h / 2, w / 3, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.fillRect(x + 2, y + 2, 3, 3);
  }

  private drawGem(x: number, y: number, w: number, h: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(x + w / 2, y);
    this.ctx.lineTo(x + w, y + h / 2);
    this.ctx.lineTo(x + w / 2, y + h);
    this.ctx.lineTo(x, y + h / 2);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.beginPath();
    this.ctx.moveTo(x + w / 2, y + 2);
    this.ctx.lineTo(x + w - 3, y + h / 2);
    this.ctx.lineTo(x + w / 2, y + h / 2);
    this.ctx.closePath();
    this.ctx.fill();
  }

  private drawRareGem(x: number, y: number, w: number, h: number): void {
    const time = Date.now() * 0.003;
    for (let i = 0; i < this.RAINBOW_COLORS.length; i++) {
      const offset = (i / this.RAINBOW_COLORS.length) * 2;
      this.ctx.fillStyle = this.RAINBOW_COLORS[(i + Math.floor(time)) % this.RAINBOW_COLORS.length];
      this.ctx.beginPath();
      this.ctx.moveTo(x + w / 2, y + offset);
      this.ctx.lineTo(x + w - offset, y + h / 2);
      this.ctx.lineTo(x + w / 2, y + h - offset);
      this.ctx.lineTo(x + offset, y + h / 2);
      this.ctx.closePath();
      this.ctx.fill();
    }

    const sparkleTime = Date.now() * 0.01;
    for (let i = 0; i < 4; i++) {
      const angle = sparkleTime + (i * Math.PI) / 2;
      const sx = x + w / 2 + Math.cos(angle) * (w / 2 + 2);
      const sy = y + h / 2 + Math.sin(angle) * (h / 2 + 2);
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      this.ctx.fillRect(sx - 1, sy - 1, 2, 2);
    }
  }

  private drawHeartItem(x: number, y: number, w: number, h: number): void {
    this.ctx.fillStyle = '#FF0000';
    this.ctx.beginPath();
    this.ctx.moveTo(x + w / 2, y + h - 2);
    this.ctx.bezierCurveTo(x + w, y + h / 2, x + w - 2, y, x + w / 2, y + 3);
    this.ctx.bezierCurveTo(x + 2, y, x, y + h / 2, x + w / 2, y + h - 2);
    this.ctx.fill();

    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.fillRect(x + 2, y + 3, 3, 3);
  }

  renderTitleScreen(animTime: number): void {
    const gradient = this.ctx.createLinearGradient(0, this.height, 0, 0);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.5, '#4A90D9');
    gradient.addColorStop(1, '#1a1a3e');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    for (let i = 0; i < this.RAINBOW_COLORS.length; i++) {
      const arcY = 100 + i * 5;
      const arcRadius = 180 - i * 8;
      this.ctx.strokeStyle = this.RAINBOW_COLORS[i];
      this.ctx.beginPath();
      this.ctx.arc(this.width / 2, this.height - 20, arcRadius, Math.PI, 0);
      this.ctx.stroke();
    }

    const titleY = 60 + Math.sin(animTime * 2) * 5;
    const titleGradient = this.ctx.createLinearGradient(0, titleY, 0, titleY + 40);
    for (let i = 0; i < this.RAINBOW_COLORS.length; i++) {
      titleGradient.addColorStop(i / (this.RAINBOW_COLORS.length - 1), this.RAINBOW_COLORS[i]);
    }

    this.ctx.font = 'bold 36px "Microsoft YaHei", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = titleGradient;
    this.ctx.fillText('彩虹岛', this.width / 2, titleY);

    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 2;
    this.ctx.strokeText('彩虹岛', this.width / 2, titleY);

    this.ctx.font = 'bold 14px "Courier New", monospace';
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillText('Rainbow Island', this.width / 2, titleY + 30);

    const blink = Math.sin(animTime * 4) > 0;
    if (blink) {
      this.ctx.font = 'bold 14px "Microsoft YaHei", sans-serif';
      this.ctx.fillStyle = '#FFFF00';
      this.ctx.fillText('按 Enter 开始游戏', this.width / 2, 180);
    }

    this.ctx.font = '10px "Microsoft YaHei", sans-serif';
    this.ctx.fillStyle = '#CCCCCC';
    this.ctx.fillText('← → 移动  |  空格 跳跃  |  J/Z 发射彩虹', this.width / 2, this.height - 50);
    this.ctx.fillText('消灭敌人，收集宝物，攀登到彩虹岛顶端！', this.width / 2, this.height - 35);
  }

  renderGameOver(score: number, animTime: number): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    const titleY = 80 + Math.sin(animTime * 3) * 3;
    this.ctx.font = 'bold 32px "Microsoft YaHei", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#FF0000';
    this.ctx.fillText('游戏结束', this.width / 2, titleY);

    this.ctx.font = 'bold 16px "Microsoft YaHei", sans-serif';
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillText(`最终分数: ${score}`, this.width / 2, 130);

    const blink = Math.sin(animTime * 4) > 0;
    if (blink) {
      this.ctx.font = 'bold 14px "Microsoft YaHei", sans-serif';
      this.ctx.fillStyle = '#FFFF00';
      this.ctx.fillText('按 Enter 重新开始', this.width / 2, 180);
    }
  }

  renderLevelClear(score: number, animTime: number): void {
    for (let i = 0; i < 30; i++) {
      const angle = (animTime * 2 + i * 0.5) % (Math.PI * 2);
      const radius = 50 + (i % 3) * 30;
      const cx = this.width / 2 + Math.cos(angle) * radius;
      const cy = 100 + Math.sin(angle) * radius * 0.5;
      const color = this.RAINBOW_COLORS[i % this.RAINBOW_COLORS.length];
      this.ctx.fillStyle = color;
      this.ctx.fillRect(cx - 2, cy - 2, 4, 4);
    }

    const titleY = 80 + Math.sin(animTime * 2) * 5;
    const titleGradient = this.ctx.createLinearGradient(0, titleY, 0, titleY + 35);
    for (let i = 0; i < this.RAINBOW_COLORS.length; i++) {
      titleGradient.addColorStop(i / (this.RAINBOW_COLORS.length - 1), this.RAINBOW_COLORS[i]);
    }

    this.ctx.font = 'bold 28px "Microsoft YaHei", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = titleGradient;
    this.ctx.fillText('关卡完成!', this.width / 2, titleY);

    this.ctx.font = 'bold 16px "Microsoft YaHei", sans-serif';
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillText(`分数: ${score}`, this.width / 2, 130);

    const blink = Math.sin(animTime * 4) > 0;
    if (blink) {
      this.ctx.font = 'bold 14px "Microsoft YaHei", sans-serif';
      this.ctx.fillStyle = '#FFFF00';
      this.ctx.fillText('按 Enter 继续', this.width / 2, 180);
    }
  }

  renderPauseScreen(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.font = 'bold 32px "Microsoft YaHei", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillText('暂停', this.width / 2, 110);

    this.ctx.font = 'bold 14px "Microsoft YaHei", sans-serif';
    this.ctx.fillStyle = '#FFFF00';
    this.ctx.fillText('按 P 继续', this.width / 2, 150);
  }
}
