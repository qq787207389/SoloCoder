import { TILE_SIZE, PLAYER_SPEED, CLIMB_SPEED } from './constants';
import type { Player, InputState, Position, Particle } from './types';
import type { GameMap } from './map';

export class PlayerController {
  private player: Player;
  private gravity: number = 800;
  private spawnPoint: Position;
  private particles: Particle[] = [];

  constructor(spawnX: number, spawnY: number) {
    this.spawnPoint = { x: spawnX * TILE_SIZE, y: spawnY * TILE_SIZE };
    this.player = this.createPlayer(this.spawnPoint.x, this.spawnPoint.y);
  }

  private createPlayer(x: number, y: number): Player {
    return {
      x: x + 2,
      y: y,
      vx: 0,
      vy: 0,
      width: TILE_SIZE - 4,
      height: TILE_SIZE,
      onGround: false,
      onLadder: false,
      facing: 'right',
      animFrame: 0,
      animTimer: 0,
      isClimbing: false,
      alive: true,
    };
  }

  update(dt: number, input: InputState, map: GameMap): void {
    if (!this.player.alive) return;

    const p = this.player;
    const tilePos = map.worldToTile(p.x + p.width / 2, p.y + p.height / 2);
    const footTile = map.worldToTile(p.x + p.width / 2, p.y + p.height - 1);

    const onLadderNow = map.isLadder(tilePos.col, tilePos.row) ||
                       map.isLadder(tilePos.col, tilePos.row + 1) ||
                       map.isLadder(footTile.col, footTile.row);
    p.onLadder = onLadderNow;

    if (input.left) {
      p.vx = -PLAYER_SPEED;
      p.facing = 'left';
    } else if (input.right) {
      p.vx = PLAYER_SPEED;
      p.facing = 'right';
    } else {
      p.vx = 0;
    }

    if (p.onLadder) {
      p.isClimbing = input.up || input.down;
      if (p.isClimbing) {
        p.vy = 0;
        if (input.up) {
          const headTileY = p.y + 4;
          const headTile = map.worldToTile(p.x + p.width / 2, headTileY);
          if (map.isSolid(headTile.col, headTile.row) && map.isLadder(footTile.col, footTile.row)) {
            const platformTopY = headTile.row * TILE_SIZE;
            if (p.y <= platformTopY + TILE_SIZE + 4) {
              p.y = platformTopY - TILE_SIZE;
              p.vy = 0;
              p.onGround = true;
              p.isClimbing = false;
              p.onLadder = false;
            }
          } else {
            p.vy = -CLIMB_SPEED;
          }
        }
        if (input.down) p.vy = CLIMB_SPEED;
      } else {
        if (!p.onGround) {
          p.vy += this.gravity * dt * 0.3;
        } else {
          p.vy = 0;
        }
      }
    } else {
      p.isClimbing = false;
      p.vy += this.gravity * dt;
      if (p.vy > 600) p.vy = 600;
    }

    this.movePlayer(dt, map);
    this.checkGoldCollection(map);
    this.updateParticles(dt);
  }

  private movePlayer(dt: number, map: GameMap): void {
    const p = this.player;

    let newX = p.x + p.vx * dt;
    if (!this.checkCollision(newX, p.y, p.width, p.height, map)) {
      p.x = newX;
    } else {
      p.x = this.snapToTile(p.x, p.vx);
      p.vx = 0;
    }

    let newY = p.y + p.vy * dt;
    if (!this.checkCollision(p.x, newY, p.width, p.height, map)) {
      p.y = newY;
      p.onGround = false;
    } else {
      if (p.vy > 0) {
        p.onGround = true;
        p.y = this.snapToTileY(p.y, p.vy);
      } else {
        p.y = this.snapToTileY(p.y, p.vy);
      }
      p.vy = 0;
    }

    this.checkHoleFall(map);
  }

  private checkCollision(x: number, y: number, w: number, h: number, map: GameMap): boolean {
    const points = [
      { x: x + 2, y: y + 2 },
      { x: x + w - 2, y: y + 2 },
      { x: x + 2, y: y + h - 2 },
      { x: x + w - 2, y: y + h - 2 },
      { x: x + w / 2, y: y + 2 },
      { x: x + w / 2, y: y + h - 2 },
    ];

    for (const point of points) {
      const tile = map.worldToTile(point.x, point.y);
      if (map.isSolid(tile.col, tile.row)) {
        return true;
      }
    }
    return false;
  }

  private checkHoleFall(map: GameMap): void {
    const p = this.player;
    const footTile = map.worldToTile(p.x + p.width / 2, p.y + p.height - 1);
    if (map.isHole(footTile.col, footTile.row)) {
      p.alive = false;
      this.spawnDeathParticles();
    }
  }

  private snapToTile(x: number, vx: number): number {
    if (vx > 0) {
      return Math.floor((x + TILE_SIZE) / TILE_SIZE) * TILE_SIZE - (TILE_SIZE - 2) - 1;
    } else if (vx < 0) {
      return Math.ceil(x / TILE_SIZE) * TILE_SIZE + 2 + 1;
    }
    return x;
  }

  private snapToTileY(y: number, vy: number): number {
    if (vy > 0) {
      return Math.floor((y + TILE_SIZE) / TILE_SIZE) * TILE_SIZE - TILE_SIZE;
    } else if (vy < 0) {
      return Math.ceil(y / TILE_SIZE) * TILE_SIZE;
    }
    return y;
  }

  private checkGoldCollection(map: GameMap): void {
    const p = this.player;
    const centerX = p.x + p.width / 2;
    const centerY = p.y + p.height / 2;
    const tile = map.worldToTile(centerX, centerY);

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const col = tile.col + dx;
        const row = tile.row + dy;
        const goldPos = map.tileToWorld(col, row);
        const goldCenterX = goldPos.x + TILE_SIZE / 2;
        const goldCenterY = goldPos.y + TILE_SIZE / 2;
        const dist = Math.sqrt(
          Math.pow(centerX - goldCenterX, 2) + Math.pow(centerY - goldCenterY, 2)
        );
        if (dist < TILE_SIZE * 0.7) {
          if (map.collectGold(col, row)) {
            this.spawnCollectParticles(goldCenterX, goldCenterY);
          }
        }
      }
    }
  }

  dig(map: GameMap): boolean {
    const p = this.player;
    if (!p.onGround) return false;

    const footTile = map.worldToTile(p.x + p.width / 2, p.y + p.height);
    const digCol = footTile.col + (p.facing === 'right' ? 1 : -1);
    const digRow = footTile.row;

    if (map.digHole(digCol, digRow)) {
      this.spawnDigParticles(digCol * TILE_SIZE + TILE_SIZE / 2, digRow * TILE_SIZE + TILE_SIZE / 2);
      return true;
    }
    return false;
  }

  private spawnCollectParticles(x: number, y: number): void {
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * (50 + Math.random() * 50),
        vy: Math.sin(angle) * (50 + Math.random() * 50),
        life: 0.6,
        maxLife: 0.6,
        color: Math.random() > 0.5 ? '#ffd700' : '#ff8c00',
        size: 3 + Math.random() * 3,
      });
    }
  }

  private spawnDigParticles(x: number, y: number): void {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * TILE_SIZE,
        y: y + (Math.random() - 0.5) * TILE_SIZE,
        vx: (Math.random() - 0.5) * 100,
        vy: -Math.random() * 100 - 50,
        life: 0.5,
        maxLife: 0.5,
        color: '#8b4513',
        size: 4,
      });
    }
  }

  private spawnDeathParticles(): void {
    const p = this.player;
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: p.x + p.width / 2,
        y: p.y + p.height / 2,
        vx: (Math.random() - 0.5) * 200,
        vy: (Math.random() - 0.5) * 200,
        life: 1,
        maxLife: 1,
        color: '#dc143c',
        size: 4,
      });
    }
  }

  private updateParticles(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 300 * dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  getPlayer(): Player {
    return { ...this.player };
  }

  getParticles(): Particle[] {
    return this.particles;
  }

  respawn(): void {
    this.player = this.createPlayer(this.spawnPoint.x, this.spawnPoint.y);
    this.particles = [];
  }

  setSpawnPoint(col: number, row: number): void {
    this.spawnPoint = { x: col * TILE_SIZE, y: row * TILE_SIZE };
  }

  getPosition(): Position {
    return { x: this.player.x, y: this.player.y };
  }

  checkEnemyCollision(enemyX: number, enemyY: number, enemyW: number, enemyH: number): boolean {
    const p = this.player;
    if (!p.alive) return false;
    return (
      p.x < enemyX + enemyW &&
      p.x + p.width > enemyX &&
      p.y < enemyY + enemyH &&
      p.y + p.height > enemyY
    );
  }

  checkExit(map: GameMap): boolean {
    if (!map.isExitActive()) return false;
    const p = this.player;
    const tile = map.worldToTile(p.x + p.width / 2, p.y + p.height / 2);
    const exitPos = map.getExitPosition();
    if (!exitPos) return false;
    return tile.col === exitPos.x && tile.row === exitPos.y;
  }

  kill(): void {
    if (this.player.alive) {
      this.player.alive = false;
      this.spawnDeathParticles();
    }
  }
}
