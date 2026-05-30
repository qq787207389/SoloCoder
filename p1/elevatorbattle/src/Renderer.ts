import {
  TILE_SIZE,
  MAP_WIDTH,
  MAP_HEIGHT,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  TileType,
  Direction,
  GameState,
  EnemyState,
  EnemyType,
  ItemType,
  FLOOR_HEIGHT,
} from './types';
import { MapSystem } from './MapSystem';
import { ElevatorSystem } from './ElevatorSystem';
import { Player } from './Player';
import { EnemySystem } from './EnemySystem';
import { BulletSystem } from './BulletSystem';
import { CameraSystem } from './CameraSystem';
import { ItemSystem } from './ItemSystem';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private cameraX: number = 0;
  private cameraY: number = 0;
  private screenShake: number = 0;
  private time: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;
  }

  public setScreenShake(amount: number): void {
    this.screenShake = Math.max(this.screenShake, amount);
  }

  public render(
    alpha: number,
    gameState: GameState,
    mapSystem: MapSystem,
    elevatorSystem: ElevatorSystem,
    player: Player,
    enemySystem: EnemySystem,
    bulletSystem: BulletSystem,
    cameraSystem: CameraSystem,
    itemSystem: ItemSystem
  ): void {
    this.time += 0.016;

    let shakeX = 0,
      shakeY = 0;
    if (this.screenShake > 0) {
      shakeX = (Math.random() - 0.5) * this.screenShake;
      shakeY = (Math.random() - 0.5) * this.screenShake;
      this.screenShake *= 0.9;
      if (this.screenShake < 0.5) this.screenShake = 0;
    }

    const targetCamY = player.y - CANVAS_HEIGHT / 2;
    this.cameraY += (targetCamY - this.cameraY) * 0.1;
    this.cameraY = Math.max(0, Math.min(this.cameraY, MAP_HEIGHT * TILE_SIZE - CANVAS_HEIGHT));

    this.ctx.save();
    this.ctx.translate(shakeX, shakeY);

    this.ctx.fillStyle = '#0a0a12';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.ctx.save();
    this.ctx.translate(0, -this.cameraY);

    this.renderMap(mapSystem);
    this.renderItems(itemSystem);
    this.renderElevators(elevatorSystem);
    this.renderEscalators(elevatorSystem);
    this.renderEnemies(enemySystem);
    this.renderPlayer(player);
    this.renderBullets(bulletSystem);
    this.renderCameras(cameraSystem);
    this.renderParticles(bulletSystem);

    this.ctx.restore();

    if (gameState === GameState.PLAYING) {
      this.renderHUD(player, mapSystem, enemySystem, cameraSystem);
    } else if (gameState === GameState.MENU) {
      this.renderMenu();
    } else if (gameState === GameState.WIN) {
      this.renderWinScreen(player);
    } else if (gameState === GameState.LOSE) {
      this.renderLoseScreen();
    } else if (gameState === GameState.PAUSED) {
      this.renderPauseScreen();
    }

    this.ctx.restore();
  }

  private renderMap(mapSystem: MapSystem): void {
    const startY = Math.floor(this.cameraY / TILE_SIZE);
    const endY = Math.min(MAP_HEIGHT, startY + Math.ceil(CANVAS_HEIGHT / TILE_SIZE) + 2);

    for (let y = startY; y < endY; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const tile = mapSystem.getTileGrid(x, y);
        this.renderTile(x, y, tile, mapSystem);
      }
    }
  }

  private renderTile(x: number, y: number, tile: TileType, mapSystem: MapSystem): void {
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;

    switch (tile) {
      case TileType.WALL:
        this.ctx.fillStyle = '#2a2a3a';
        this.ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        this.ctx.fillStyle = '#1a1a2a';
        this.ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        this.ctx.fillStyle = '#3a3a4a';
        this.ctx.fillRect(px + 4, py + 4, 4, 4);
        break;

      case TileType.FLOOR:
        this.ctx.fillStyle = '#4a4a5a';
        this.ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        if ((x + y) % 2 === 0) {
          this.ctx.fillStyle = '#3a3a4a';
          this.ctx.fillRect(px, py, TILE_SIZE, 2);
        }
        break;

      case TileType.ROOM_FLOOR:
        this.ctx.fillStyle = '#3a4a3a';
        this.ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        this.ctx.fillStyle = '#2a3a2a';
        this.ctx.fillRect(px, py, TILE_SIZE, 2);
        break;

      case TileType.DOOR_RED:
        this.ctx.fillStyle = '#8b0000';
        this.ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        this.ctx.fillStyle = '#cc0000';
        this.ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
        this.ctx.fillStyle = '#ffcc00';
        this.ctx.fillRect(px + TILE_SIZE - 10, py + TILE_SIZE / 2 - 2, 4, 4);
        break;

      case TileType.ELEVATOR_SHAFT:
        this.ctx.fillStyle = '#1a1a2a';
        this.ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        this.ctx.fillStyle = '#0a0a1a';
        this.ctx.fillRect(px + 4, py, TILE_SIZE - 8, TILE_SIZE);
        this.ctx.fillStyle = '#2a2a3a';
        for (let i = 0; i < TILE_SIZE; i += 8) {
          this.ctx.fillRect(px, py + i, TILE_SIZE, 2);
        }
        break;

      case TileType.ESCALATOR_UP:
      case TileType.ESCALATOR_DOWN:
        this.ctx.fillStyle = '#3a3a4a';
        this.ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        const dir = tile === TileType.ESCALATOR_UP ? -1 : 1;
        const offset = (this.time * 20 * dir) % 16;
        this.ctx.fillStyle = '#5a5a6a';
        for (let i = -8; i < TILE_SIZE + 8; i += 8) {
          const stepY = py + ((i + offset + TILE_SIZE) % TILE_SIZE);
          this.ctx.fillRect(px + 2, stepY, TILE_SIZE - 4, 3);
        }
        this.ctx.fillStyle = '#00ffaa';
        this.ctx.fillRect(px + TILE_SIZE / 2 - 2, py + (dir > 0 ? TILE_SIZE - 10 : 2), 4, 4);
        break;

      case TileType.EXIT:
        const exitOpen = mapSystem.isExitOpen();
        this.ctx.fillStyle = exitOpen ? '#00aa00' : '#333';
        this.ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        if (exitOpen) {
          const brightness = 0.5 + Math.sin(this.time * 5) * 0.3;
          this.ctx.fillStyle = `rgba(0, 255, 0, ${brightness})`;
          this.ctx.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
          this.ctx.fillStyle = '#00ff00';
          this.ctx.font = '16px monospace';
          this.ctx.textAlign = 'center';
          this.ctx.fillText('↑', px + TILE_SIZE / 2, py + TILE_SIZE / 2 + 5);
        } else {
          this.ctx.fillStyle = '#666';
          this.ctx.font = '10px monospace';
          this.ctx.textAlign = 'center';
          this.ctx.fillText('🔒', px + TILE_SIZE / 2, py + TILE_SIZE / 2 + 3);
        }
        break;

      case TileType.EMPTY:
      default:
        this.ctx.fillStyle = '#0a0a12';
        this.ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        break;
    }
  }

  private renderPlayer(player: Player): void {
    const flash = player.invincible && Math.floor(this.time * 20) % 2 === 0;
    if (flash) return;

    const px = player.x;
    const py = player.y;
    const facing = player.direction;

    if (player.stats.hasArmor) {
      this.ctx.fillStyle = 'rgba(100, 150, 255, 0.3)';
      this.ctx.beginPath();
      this.ctx.arc(
        px + player.width / 2,
        py + player.height / 2,
        player.width * 0.8,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    }

    this.ctx.fillStyle = '#2244aa';
    this.ctx.fillRect(px + 4, py + 8, player.width - 8, player.height - 12);

    this.ctx.fillStyle = '#ffcc99';
    this.ctx.fillRect(px + 6, py, player.width - 12, 12);

    this.ctx.fillStyle = '#000';
    const eyeX = facing === Direction.RIGHT ? px + player.width - 10 : px + 6;
    this.ctx.fillRect(eyeX, py + 4, 4, 3);

    const legOffset = player.animFrame % 2 === 0 ? 0 : 3;
    this.ctx.fillStyle = '#1a1a3a';
    this.ctx.fillRect(px + 4, py + player.height - 6, 6, 6 - legOffset);
    this.ctx.fillRect(px + player.width - 10, py + player.height - 6, 6, 6 + legOffset - 3);

    if (player.isShooting) {
      const gunX = facing === Direction.RIGHT ? px + player.width : px - 10;
      this.ctx.fillStyle = '#333';
      this.ctx.fillRect(gunX, py + 12, 10, 4);

      this.ctx.fillStyle = '#ffff00';
      const muzzleX = facing === Direction.RIGHT ? gunX + 10 : gunX;
      this.ctx.fillRect(muzzleX, py + 11, 4, 6);
    } else {
      const gunX = facing === Direction.RIGHT ? px + player.width - 4 : px - 6;
      this.ctx.fillStyle = '#333';
      this.ctx.fillRect(gunX, py + 12, 10, 4);
    }

    if (player.isKicking) {
      const kickX = facing === Direction.RIGHT ? px + player.width : px - TILE_SIZE * 0.8;
      this.ctx.fillStyle = '#ffcc99';
      this.ctx.fillRect(kickX, py + player.height - 12, TILE_SIZE * 0.8, 6);

      this.ctx.strokeStyle = '#ffff00';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(
        kickX + TILE_SIZE * 0.4,
        py + player.height - 9,
        12,
        0,
        Math.PI * 2
      );
      this.ctx.stroke();
    }
  }

  private renderEnemies(enemySystem: EnemySystem): void {
    for (const enemy of enemySystem.getAllEnemies()) {
      if (enemy.state === EnemyState.DEAD) {
        this.ctx.fillStyle = 'rgba(100, 0, 0, 0.5)';
        this.ctx.fillRect(enemy.x, enemy.y + enemy.height - 8, enemy.width, 8);
        continue;
      }

      const flash = enemy.stunned && Math.floor(this.time * 15) % 2 === 0;

      const bodyColor =
        enemy.type === EnemyType.GUARD
          ? flash
            ? '#ffff00'
            : '#664422'
          : flash
          ? '#ffff00'
          : '#442244';

      const alertColor =
        enemy.state === EnemyState.CHASE
          ? '#ff0000'
          : enemy.state === EnemyState.ALERT
          ? '#ffaa00'
          : null;

      this.ctx.fillStyle = alertColor || bodyColor;
      this.ctx.fillRect(enemy.x + 4, enemy.y + 8, enemy.width - 8, enemy.height - 12);

      this.ctx.fillStyle = '#ffcc99';
      this.ctx.fillRect(enemy.x + 6, enemy.y, enemy.width - 12, 12);

      this.ctx.fillStyle = '#000';
      const eyeX =
        enemy.direction === Direction.RIGHT
          ? enemy.x + enemy.width - 10
          : enemy.x + 6;
      this.ctx.fillRect(eyeX, enemy.y + 4, 4, 3);

      this.ctx.fillStyle = '#1a1a1a';
      this.ctx.fillRect(enemy.x + 4, enemy.y + enemy.height - 6, 6, 6);
      this.ctx.fillRect(enemy.x + enemy.width - 10, enemy.y + enemy.height - 6, 6, 6);

      const gunX =
        enemy.direction === Direction.RIGHT
          ? enemy.x + enemy.width - 4
          : enemy.x - 6;
      this.ctx.fillStyle = '#222';
      this.ctx.fillRect(gunX, enemy.y + 12, 10, 4);

      if (enemy.state === EnemyState.ALERT) {
        this.ctx.fillStyle = '#ffaa00';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('!', enemy.x + enemy.width / 2, enemy.y - 4);
      } else if (enemy.state === EnemyState.CHASE) {
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('!!', enemy.x + enemy.width / 2, enemy.y - 4);
      }

      if (enemy.health < enemy.maxHealth) {
        const healthPercent = enemy.health / enemy.maxHealth;
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(enemy.x, enemy.y - 8, enemy.width, 4);
        this.ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.2 ? '#ffaa00' : '#ff0000';
        this.ctx.fillRect(enemy.x, enemy.y - 8, enemy.width * healthPercent, 4);
      }
    }
  }

  private renderElevators(elevatorSystem: ElevatorSystem): void {
    for (const elevator of elevatorSystem.getElevators()) {
      const ex = elevator.shaftX * TILE_SIZE;
      const ey = elevator.y;

      this.ctx.fillStyle = '#444';
      this.ctx.fillRect(ex, ey, TILE_SIZE, TILE_SIZE);

      this.ctx.fillStyle = '#333';
      this.ctx.fillRect(ex + 2, ey + 2, TILE_SIZE - 4, TILE_SIZE - 4);

      if (elevator.doorsOpen) {
        const doorOffset = Math.floor((1 - elevator.doorTimer / 2) * 12);
        this.ctx.fillStyle = '#888';
        this.ctx.fillRect(ex + 4, ey + 4, 12 - doorOffset, TILE_SIZE - 8);
        this.ctx.fillRect(ex + TILE_SIZE - 16 + doorOffset, ey + 4, 12 - doorOffset, TILE_SIZE - 8);

        this.ctx.fillStyle = '#222';
        this.ctx.fillRect(ex + 4 + (12 - doorOffset), ey + 4, TILE_SIZE - 8 - (12 - doorOffset) * 2, TILE_SIZE - 8);
      } else {
        this.ctx.fillStyle = '#888';
        this.ctx.fillRect(ex + 4, ey + 4, 12, TILE_SIZE - 8);
        this.ctx.fillRect(ex + TILE_SIZE - 16, ey + 4, 12, TILE_SIZE - 8);

        this.ctx.fillStyle = '#aaa';
        this.ctx.fillRect(ex + TILE_SIZE / 2 - 1, ey + TILE_SIZE / 2 - 6, 2, 12);
      }

      this.ctx.fillStyle = elevator.moving ? '#ff0' : '#0ff';
      this.ctx.fillRect(ex + 4, ey + 2, 4, 2);
      this.ctx.fillRect(ex + TILE_SIZE - 8, ey + 2, 4, 2);

      this.ctx.fillStyle = '#fff';
      this.ctx.font = '10px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`${elevator.currentFloor + 1}F`, ex + TILE_SIZE / 2, ey + TILE_SIZE + 12);
    }
  }

  private renderEscalators(elevatorSystem: ElevatorSystem): void {
    for (const escalator of elevatorSystem.getEscalators()) {
      const ex = escalator.x;
      const startY = Math.min(escalator.startY, escalator.endY);
      const endY = Math.max(escalator.startY, escalator.endY);

      this.ctx.fillStyle = 'rgba(0, 255, 170, 0.1)';
      this.ctx.fillRect(ex, startY, TILE_SIZE, endY - startY + TILE_SIZE);

      this.ctx.strokeStyle = '#00aa88';
      this.ctx.lineWidth = 2;
      const arrowDir = escalator.direction === 'up' ? -1 : 1;
      const arrowY = (startY + endY) / 2 + Math.sin(this.time * 3) * 10 * arrowDir;
      this.ctx.beginPath();
      this.ctx.moveTo(ex + TILE_SIZE / 2, arrowY - 5 * arrowDir);
      this.ctx.lineTo(ex + TILE_SIZE / 2 - 5, arrowY + 5 * arrowDir);
      this.ctx.lineTo(ex + TILE_SIZE / 2 + 5, arrowY + 5 * arrowDir);
      this.ctx.closePath();
      this.ctx.stroke();
    }
  }

  private renderBullets(bulletSystem: BulletSystem): void {
    for (const bullet of bulletSystem.getBullets()) {
      this.ctx.fillStyle = bullet.isPlayerBullet ? '#ffff00' : '#ff4444';
      this.ctx.fillRect(bullet.x - 4, bullet.y - 2, 8, 4);

      this.ctx.fillStyle = bullet.isPlayerBullet ? 'rgba(255, 255, 0, 0.3)' : 'rgba(255, 68, 68, 0.3)';
      const trailLen = 8;
      const trailX = bullet.vx > 0 ? bullet.x - trailLen : bullet.x + 4;
      this.ctx.fillRect(trailX, bullet.y - 1, trailLen, 2);
    }
  }

  private renderParticles(bulletSystem: BulletSystem): void {
    for (const p of bulletSystem.getParticles()) {
      const alpha = p.life / p.maxLife;
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = alpha;
      this.ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    this.ctx.globalAlpha = 1;
  }

  private renderCameras(cameraSystem: CameraSystem): void {
    for (const camera of cameraSystem.getCameras()) {
      const cx = camera.x;
      const cy = camera.y;

      this.ctx.fillStyle = '#444';
      this.ctx.fillRect(cx - 8, cy - 4, 16, 8);

      this.ctx.fillStyle = camera.spotted ? '#ff0000' : '#00ff00';
      this.ctx.fillRect(cx - 2, cy - 2, 4, 4);

      const viewAngle = camera.angle;
      const halfFov = 0.3;
      const dist = camera.viewDistance;

      const gradient = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, dist);
      const alpha = camera.spotted ? 0.3 : 0.1;
      gradient.addColorStop(0, `rgba(255, 255, 0, ${alpha})`);
      gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy);
      this.ctx.arc(
        cx,
        cy,
        dist,
        viewAngle - halfFov + Math.PI / 2,
        viewAngle + halfFov + Math.PI / 2
      );
      this.ctx.closePath();
      this.ctx.fill();

      if (camera.spotted) {
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'center';
        const blink = Math.floor(this.time * 10) % 2 === 0;
        if (blink) {
          this.ctx.fillText('!', cx, cy - 10);
        }
      }
    }
  }

  private renderItems(itemSystem: ItemSystem): void {
    for (const item of itemSystem.getItems()) {
      const ix = item.x;
      const iy = item.y + Math.sin(this.time * 3) * 3;

      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      this.ctx.beginPath();
      this.ctx.arc(ix, iy, 12, 0, Math.PI * 2);
      this.ctx.fill();

      switch (item.type) {
        case ItemType.SMG:
          this.ctx.fillStyle = '#333';
          this.ctx.fillRect(ix - 10, iy - 4, 20, 8);
          this.ctx.fillStyle = '#666';
          this.ctx.fillRect(ix - 8, iy + 2, 6, 6);
          this.ctx.fillStyle = '#ff6600';
          this.ctx.font = '8px monospace';
          this.ctx.textAlign = 'center';
          this.ctx.fillText('SMG', ix, iy - 8);
          break;

        case ItemType.ARMOR:
          this.ctx.fillStyle = '#4466aa';
          this.ctx.beginPath();
          this.ctx.moveTo(ix - 8, iy - 8);
          this.ctx.lineTo(ix + 8, iy - 8);
          this.ctx.lineTo(ix + 8, iy + 2);
          this.ctx.lineTo(ix, iy + 8);
          this.ctx.lineTo(ix - 8, iy + 2);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.strokeStyle = '#6688cc';
          this.ctx.lineWidth = 2;
          this.ctx.stroke();
          break;

        case ItemType.HEALTH:
          this.ctx.fillStyle = '#ff0000';
          this.ctx.fillRect(ix - 8, iy - 3, 16, 6);
          this.ctx.fillRect(ix - 3, iy - 8, 6, 16);
          break;

        case ItemType.AMMO:
          this.ctx.fillStyle = '#ffcc00';
          this.ctx.fillRect(ix - 6, iy - 6, 12, 12);
          this.ctx.fillStyle = '#aa8800';
          this.ctx.font = '8px monospace';
          this.ctx.textAlign = 'center';
          this.ctx.fillText('●●●', ix, iy + 2);
          break;
      }
    }
  }

  private renderHUD(
    player: Player,
    mapSystem: MapSystem,
    enemySystem: EnemySystem,
    cameraSystem: CameraSystem
  ): void {
    const hudY = 10;

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(10, hudY, 200, 60);
    this.ctx.strokeStyle = '#00ff88';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(10, hudY, 200, 60);

    this.ctx.fillStyle = '#ff0000';
    this.ctx.fillRect(20, hudY + 10, 100, 10);
    this.ctx.fillStyle = '#00ff00';
    const healthPercent = player.stats.health / player.stats.maxHealth;
    this.ctx.fillRect(20, hudY + 10, 100 * healthPercent, 10);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '10px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`HP: ${player.stats.health}/${player.stats.maxHealth}`, 130, hudY + 18);

    this.ctx.fillStyle = '#333';
    this.ctx.fillRect(20, hudY + 28, 100, 8);
    this.ctx.fillStyle = '#ffcc00';
    const ammoPercent = player.stats.ammo / player.stats.maxAmmo;
    this.ctx.fillRect(20, hudY + 28, 100 * ammoPercent, 8);
    this.ctx.fillStyle = '#fff';
    this.ctx.fillText(`弹药: ${player.stats.ammo}/${player.stats.maxAmmo}`, 130, hudY + 35);

    const weapon = player.stats.hasSMG ? '冲锋枪' : '消音手枪';
    this.ctx.fillStyle = '#00ff88';
    this.ctx.fillText(`武器: ${weapon}`, 20, hudY + 50);

    if (player.stats.hasArmor) {
      this.ctx.fillStyle = '#6688ff';
      this.ctx.fillText(`防弹衣: ${Math.ceil(player.stats.armorTimer)}s`, 110, hudY + 50);
    }

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(CANVAS_WIDTH - 210, hudY, 200, 50);
    this.ctx.strokeStyle = '#00ff88';
    this.ctx.strokeRect(CANVAS_WIDTH - 210, hudY, 200, 50);

    this.ctx.fillStyle = '#fff';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(
      `文件: ${player.stats.filesCollected}/${player.stats.totalFiles}`,
      CANVAS_WIDTH - 200,
      hudY + 18
    );
    this.ctx.fillText(
      `分数: ${player.stats.score}`,
      CANVAS_WIDTH - 200,
      hudY + 35
    );
    this.ctx.fillText(
      `关卡: ${player.stats.level}`,
      CANVAS_WIDTH - 100,
      hudY + 35
    );

    if (enemySystem.isAlerted() || cameraSystem.isGlobalAlert()) {
      const alertX = CANVAS_WIDTH / 2 - 60;
      const flash = Math.floor(this.time * 8) % 2 === 0;
      this.ctx.fillStyle = flash ? 'rgba(255, 0, 0, 0.8)' : 'rgba(150, 0, 0, 0.8)';
      this.ctx.fillRect(alertX, hudY, 120, 30);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 14px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('⚠ 警报 ⚠', CANVAS_WIDTH / 2, hudY + 20);

      if (cameraSystem.getReinforcementTimer() > 0) {
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = '10px monospace';
        this.ctx.fillText(
          `增援: ${Math.ceil(3 - cameraSystem.getReinforcementTimer())}s`,
          CANVAS_WIDTH / 2,
          hudY + 45
        );
      }
    }

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(10, CANVAS_HEIGHT - 35, CANVAS_WIDTH - 20, 25);
    this.ctx.fillStyle = '#888';
    this.ctx.font = '10px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      'WASD/方向键:移动  J/空格:射击  K:踢人  F:交互  Q:电梯上  E:电梯下  ESC:暂停',
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT - 18
    );

    if (mapSystem.allFilesCollected() && !mapSystem.isExitOpen()) {
      this.ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
      this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      this.ctx.fillStyle = '#00ff00';
      this.ctx.font = 'bold 16px monospace';
      this.ctx.textAlign = 'center';
      const flash = Math.floor(this.time * 3) % 2 === 0;
      if (flash) {
        this.ctx.fillText('所有文件已收集! 前往车库出口!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
      }
    }
  }

  private renderMenu(): void {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#0a0a2a');
    gradient.addColorStop(1, '#1a0a1a');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    for (let i = 0; i < 50; i++) {
      this.ctx.fillStyle = `rgba(0, 255, 136, ${Math.random() * 0.3})`;
      this.ctx.fillRect(
        Math.random() * CANVAS_WIDTH,
        Math.random() * CANVAS_HEIGHT,
        2,
        2
      );
    }

    this.ctx.fillStyle = '#00ff88';
    this.ctx.font = 'bold 48px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('电梯大战', CANVAS_WIDTH / 2, 150);

    this.ctx.fillStyle = '#00aa55';
    this.ctx.font = '24px monospace';
    this.ctx.fillText('ELEVATOR BATTLE', CANVAS_WIDTH / 2, 190);

    this.ctx.fillStyle = '#aaa';
    this.ctx.font = '14px monospace';
    const lines = [
      '潜入办公大楼，收集所有机密文件',
      '然后从车库出口安全撤离',
      '',
      '小心巡逻警卫、特工和监控摄像头',
      '用消音手枪悄悄解决他们',
      '或者用电梯轿厢压扁他们！',
    ];
    lines.forEach((line, i) => {
      this.ctx.fillText(line, CANVAS_WIDTH / 2, 260 + i * 24);
    });

    const blink = Math.floor(this.time * 2) % 2 === 0;
    if (blink) {
      this.ctx.fillStyle = '#00ff88';
      this.ctx.font = 'bold 18px monospace';
      this.ctx.fillText('按 ENTER 或 空格 开始游戏', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 80);
    }

    this.ctx.fillStyle = '#666';
    this.ctx.font = '12px monospace';
    this.ctx.fillText(
      'WASD移动 | J射击 | K踢人 | F交互 | Q上/E下电梯',
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT - 40
    );
  }

  private renderWinScreen(player: Player): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.ctx.fillStyle = '#00ff88';
    this.ctx.font = 'bold 48px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('任务完成!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '18px monospace';
    this.ctx.fillText(`最终得分: ${player.stats.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    this.ctx.fillText(
      `收集文件: ${player.stats.filesCollected}/${player.stats.totalFiles}`,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2 + 30
    );
    this.ctx.fillText(
      `完成关卡: ${player.stats.level}`,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2 + 60
    );

    const blink = Math.floor(this.time * 2) % 2 === 0;
    if (blink) {
      this.ctx.fillStyle = '#00ff88';
      this.ctx.font = 'bold 16px monospace';
      this.ctx.fillText('按 R 重新开始 | 按 ENTER 进入下一关', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 80);
    }
  }

  private renderLoseScreen(): void {
    this.ctx.fillStyle = 'rgba(50, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.ctx.fillStyle = '#ff0000';
    this.ctx.font = 'bold 48px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('任务失败', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);

    this.ctx.fillStyle = '#aaa';
    this.ctx.font = '16px monospace';
    this.ctx.fillText('你被发现了...', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);

    const blink = Math.floor(this.time * 2) % 2 === 0;
    if (blink) {
      this.ctx.fillStyle = '#fff';
      this.ctx.font = 'bold 16px monospace';
      this.ctx.fillText('按 R 重新开始', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 80);
    }
  }

  private renderPauseScreen(): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.ctx.fillStyle = '#00ff88';
    this.ctx.font = 'bold 36px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('游戏暂停', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

    this.ctx.fillStyle = '#aaa';
    this.ctx.font = '14px monospace';
    this.ctx.fillText('按 ESC 或 P 继续游戏', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
  }
}
