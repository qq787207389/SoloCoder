import { TILE_SIZE, ENEMY_SPEED, CLIMB_SPEED, ENEMY_TRAP_DURATION, ENEMY_AI, type EnemyAIType } from './constants';
import type { Enemy, Particle, Player } from './types';
import type { GameMap } from './map';

export class EnemyController {
  private enemies: Enemy[] = [];
  private gravity: number = 800;
  private particles: Particle[] = [];
  private nextId: number = 0;

  constructor() {}

  spawnEnemy(col: number, row: number, aiType: EnemyAIType): void {
    const enemy: Enemy = {
      id: this.nextId++,
      x: col * TILE_SIZE + 2,
      y: row * TILE_SIZE,
      vx: 0,
      vy: 0,
      width: TILE_SIZE - 4,
      height: TILE_SIZE,
      onGround: false,
      onLadder: false,
      facing: Math.random() > 0.5 ? 'right' : 'left',
      aiType,
      trapped: false,
      trapTimer: 0,
      patrolDir: Math.random() > 0.5 ? 1 : -1,
      animFrame: 0,
      animTimer: 0,
      hasGold: false,
    };
    this.enemies.push(enemy);
  }

  update(dt: number, map: GameMap, player: Player): void {
    for (const enemy of this.enemies) {
      this.updateEnemy(enemy, dt, map, player);
    }
    this.updateParticles(dt);
  }

  private updateEnemy(enemy: Enemy, dt: number, map: GameMap, player: Player): void {
    if (enemy.trapped) {
      enemy.trapTimer -= dt * 1000;
      if (enemy.trapTimer <= 0) {
        enemy.trapped = false;
        enemy.vy = -200;
      }
      return;
    }

    const tilePos = map.worldToTile(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
    const footTile = map.worldToTile(enemy.x + enemy.width / 2, enemy.y + enemy.height - 1);
    enemy.onLadder = map.isLadder(tilePos.col, tilePos.row) ||
                     map.isLadder(tilePos.col, tilePos.row + 1) ||
                     map.isLadder(footTile.col, footTile.row);

    this.updateAI(enemy, map, player);

    if (enemy.onLadder && (enemy.aiType === ENEMY_AI.CLIMB)) {
      enemy.vy = 0;
      if (this.shouldClimbUp(enemy, map, player)) {
        const headTileY = enemy.y + 4;
        const headTile = map.worldToTile(enemy.x + enemy.width / 2, headTileY);
        if (map.isSolid(headTile.col, headTile.row) && map.isLadder(footTile.col, footTile.row)) {
          const platformTopY = headTile.row * TILE_SIZE;
          if (enemy.y <= platformTopY + TILE_SIZE + 4) {
            enemy.y = platformTopY - TILE_SIZE;
            enemy.vy = 0;
            enemy.onGround = true;
            enemy.onLadder = false;
          }
        } else {
          enemy.vy = -CLIMB_SPEED * 0.8;
        }
      } else if (this.shouldClimbDown(enemy, map, player)) {
        enemy.vy = CLIMB_SPEED * 0.8;
      }
    } else {
      enemy.vy += this.gravity * dt;
      if (enemy.vy > 600) enemy.vy = 600;
    }

    this.moveEnemy(enemy, dt, map);
    this.checkHoleFall(enemy, map);
  }

  private updateAI(enemy: Enemy, map: GameMap, player: Player): void {
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    switch (enemy.aiType) {
      case ENEMY_AI.PATROL:
        this.patrolAI(enemy, map);
        break;
      case ENEMY_AI.CHASE:
        this.chaseAI(enemy, map, dx, dist);
        break;
      case ENEMY_AI.CLIMB:
        this.climbAI(enemy, map, dx, dy, dist);
        break;
    }
  }

  private patrolAI(enemy: Enemy, map: GameMap): void {
    enemy.vx = enemy.patrolDir * ENEMY_SPEED * 0.8;
    enemy.facing = enemy.patrolDir > 0 ? 'right' : 'left';

    const frontTileX = enemy.patrolDir > 0
      ? enemy.x + enemy.width + 4
      : enemy.x - 4;
    const frontTile = map.worldToTile(frontTileX, enemy.y + enemy.height / 2);
    if (map.isSolid(frontTile.col, frontTile.row)) {
      enemy.patrolDir *= -1;
      return;
    }

    const groundCheckX = enemy.patrolDir > 0
      ? enemy.x + enemy.width + 4
      : enemy.x - 4;
    const groundCheckY = enemy.y + enemy.height + 4;
    const groundTile = map.worldToTile(groundCheckX, groundCheckY);
    if (!map.isSolid(groundTile.col, groundTile.row) && !map.isHole(groundTile.col, groundTile.row)) {
      const tileBelow = map.worldToTile(enemy.x + enemy.width / 2, enemy.y + enemy.height + 2);
      if (map.isSolid(tileBelow.col, tileBelow.row)) {
        enemy.patrolDir *= -1;
      }
    }
  }

  private chaseAI(enemy: Enemy, map: GameMap, dx: number, dist: number): void {
    const chaseRange = TILE_SIZE * 10;

    if (dist < chaseRange) {
      const dir = dx > 0 ? 1 : -1;
      enemy.vx = dir * ENEMY_SPEED;
      enemy.facing = dir > 0 ? 'right' : 'left';

      const frontTileX = dir > 0 ? enemy.x + enemy.width + 4 : enemy.x - 4;
      const frontTile = map.worldToTile(frontTileX, enemy.y + enemy.height / 2);
      if (map.isSolid(frontTile.col, frontTile.row)) {
        enemy.vx = 0;
      }
    } else {
      this.patrolAI(enemy, map);
    }
  }

  private climbAI(enemy: Enemy, map: GameMap, dx: number, _dy: number, dist: number): void {
    const chaseRange = TILE_SIZE * 12;

    if (dist < chaseRange) {
      const dir = dx > 0 ? 1 : -1;
      enemy.vx = dir * ENEMY_SPEED * 0.9;
      enemy.facing = dir > 0 ? 'right' : 'left';

      const frontTileX = dir > 0 ? enemy.x + enemy.width + 4 : enemy.x - 4;
      const frontTile = map.worldToTile(frontTileX, enemy.y + enemy.height / 2);
      if (map.isSolid(frontTile.col, frontTile.row)) {
        enemy.vx = 0;
      }
    } else {
      this.patrolAI(enemy, map);
    }
  }

  private shouldClimbUp(enemy: Enemy, map: GameMap, player: Player): boolean {
    const dy = player.y - enemy.y;
    const tile = map.worldToTile(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
    return dy < -TILE_SIZE && map.isLadder(tile.col, tile.row) && enemy.onLadder;
  }

  private shouldClimbDown(enemy: Enemy, map: GameMap, player: Player): boolean {
    const dy = player.y - enemy.y;
    const tile = map.worldToTile(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
    return dy > TILE_SIZE && map.isLadder(tile.col, tile.row) && enemy.onLadder;
  }

  private moveEnemy(enemy: Enemy, dt: number, map: GameMap): void {
    let newX = enemy.x + enemy.vx * dt;
    if (!this.checkEnemyCollision(newX, enemy.y, enemy.width, enemy.height, map)) {
      enemy.x = newX;
    } else {
      enemy.x = this.snapToTile(enemy.x, enemy.vx);
      enemy.vx = 0;
      if (enemy.aiType === ENEMY_AI.PATROL) {
        enemy.patrolDir *= -1;
      }
    }

    let newY = enemy.y + enemy.vy * dt;
    if (!this.checkEnemyCollision(enemy.x, newY, enemy.width, enemy.height, map)) {
      enemy.y = newY;
      enemy.onGround = false;
    } else {
      if (enemy.vy > 0) {
        enemy.onGround = true;
        enemy.y = this.snapToTileY(enemy.y, enemy.vy);
      } else {
        enemy.y = this.snapToTileY(enemy.y, enemy.vy);
      }
      enemy.vy = 0;
    }
  }

  private checkEnemyCollision(x: number, y: number, w: number, h: number, map: GameMap): boolean {
    const points = [
      { x: x + 2, y: y + 2 },
      { x: x + w - 2, y: y + 2 },
      { x: x + 2, y: y + h - 2 },
      { x: x + w - 2, y: y + h - 2 },
    ];

    for (const point of points) {
      const tile = map.worldToTile(point.x, point.y);
      if (map.isSolid(tile.col, tile.row)) {
        return true;
      }
    }
    return false;
  }

  private checkHoleFall(enemy: Enemy, map: GameMap): void {
    const footTile = map.worldToTile(enemy.x + enemy.width / 2, enemy.y + enemy.height - 1);
    if (map.isHole(footTile.col, footTile.row) && !enemy.trapped) {
      enemy.trapped = true;
      enemy.trapTimer = ENEMY_TRAP_DURATION;
      enemy.vx = 0;
      enemy.vy = 0;
      enemy.y = footTile.row * TILE_SIZE + TILE_SIZE / 2;
      this.spawnTrapParticles(enemy.x + enemy.width / 2, enemy.y);
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

  private spawnTrapParticles(x: number, y: number): void {
    for (let i = 0; i < 10; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * TILE_SIZE,
        y: y + (Math.random() - 0.5) * TILE_SIZE,
        vx: (Math.random() - 0.5) * 80,
        vy: -Math.random() * 80 - 30,
        life: 0.5,
        maxLife: 0.5,
        color: '#8b4513',
        size: 3,
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

  getEnemies(): Enemy[] {
    return this.enemies.map(e => ({ ...e }));
  }

  getParticles(): Particle[] {
    return this.particles;
  }

  reset(): void {
    this.enemies = [];
    this.particles = [];
    this.nextId = 0;
  }

  checkPlayerCollision(playerX: number, playerY: number, playerW: number, playerH: number): Enemy | null {
    for (const enemy of this.enemies) {
      if (enemy.trapped) {
        continue;
      }
      if (
        playerX < enemy.x + enemy.width &&
        playerX + playerW > enemy.x &&
        playerY < enemy.y + enemy.height &&
        playerY + playerH > enemy.y
      ) {
        return enemy;
      }
    }
    return null;
  }

  canWalkOnEnemy(enemy: Enemy, playerY: number, playerH: number): boolean {
    if (!enemy.trapped) return false;
    return playerY + playerH <= enemy.y + 8;
  }

  getTrappedEnemyAt(x: number, y: number): Enemy | null {
    for (const enemy of this.enemies) {
      if (enemy.trapped &&
          x >= enemy.x && x <= enemy.x + enemy.width &&
          y >= enemy.y && y <= enemy.y + enemy.height) {
        return enemy;
      }
    }
    return null;
  }
}
