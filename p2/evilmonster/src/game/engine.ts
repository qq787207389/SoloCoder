import {
  GameMap,
  Monster,
  Adventurer,
  Trap,
  MonsterType,
  AdventurerClass,
  TrapType,
  SpellType,
  Point,
  Particle,
  GameState,
  AdventurerState,
  MonsterState,
  RoomType,
} from '../types/game';
import { MONSTER_CONFIGS } from './config/monsters';
import { ADVENTURER_CONFIGS } from './config/adventurers';
import { TRAP_CONFIGS } from './config/traps';
import { SPELL_CONFIGS } from './config/spells';
import { ROOM_CONFIGS } from './config/rooms';
import { findPath, findRandomPath } from './pathfinding';
import {
  createMap,
  digTile,
  placeRoom,
  findEmptyFloorTile,
  getHeartPosition,
  getEntrancePosition,
  canPlaceRoom,
} from './map';

const TILE_SIZE = 40;
const MAP_WIDTH = 30;
const MAP_HEIGHT = 20;

export class GameEngine {
  map: GameMap;
  monsters: Map<string, Monster> = new Map();
  adventurers: Map<string, Adventurer> = new Map();
  traps: Map<string, Trap> = new Map();
  particles: Particle[] = [];
  gameState: GameState;
  spellCooldowns: Map<SpellType, number> = new Map();
  heartAttackCooldown: number = 0;
  lastUpdate: number = 0;
  deltaTime: number = 0;

  private listeners: Set<() => void> = new Set();

  constructor() {
    this.map = createMap(MAP_WIDTH, MAP_HEIGHT);
    this.gameState = this.createInitialState();
    this.initializeSpells();
  }

  private createInitialState(): GameState {
    return {
      mode: 'management',
      gold: 500,
      fear: 0,
      mana: 100,
      maxMana: 100,
      wave: 0,
      waveTimer: 60,
      heartHealth: 500,
      maxHeartHealth: 500,
      gameOver: false,
      selectedTool: null,
      selectedRoomType: null,
      selectedMonsterType: null,
      selectedTrapType: null,
      selectedEntityId: null,
      cameraX: 0,
      cameraY: 0,
      zoom: 1,
      isPaused: false,
    };
  }

  private initializeSpells(): void {
    for (const type of ['fireball', 'lightning', 'heal'] as SpellType[]) {
      this.spellCooldowns.set(type, 0);
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener();
    }
  }

  start(): void {
    this.lastUpdate = performance.now();
    this.gameLoop();
  }

  private gameLoop = (): void => {
    const now = performance.now();
    this.deltaTime = (now - this.lastUpdate) / 1000;
    this.lastUpdate = now;

    if (!this.gameState.isPaused && !this.gameState.gameOver) {
      this.update(this.deltaTime);
    }

    this.notify();
    requestAnimationFrame(this.gameLoop);
  };

  update(dt: number): void {
    this.updateWaveTimer(dt);
    this.updateMonsters(dt);
    this.updateAdventurers(dt);
    this.updateTraps(dt);
    this.updateParticles(dt);
    this.updateSpellCooldowns(dt);
    this.regenerateMana(dt);
    this.heartAttackCooldown = Math.max(0, this.heartAttackCooldown - dt);
    this.checkGameOver();
  }

  private updateWaveTimer(dt: number): void {
    this.gameState.waveTimer -= dt;
    if (this.gameState.waveTimer <= 0) {
      this.spawnWave();
      this.gameState.wave++;
      this.gameState.waveTimer = Math.max(15, 30 - this.gameState.wave * 1);
    }
  }

  private spawnWave(): void {
    const entrance = getEntrancePosition(this.map);
    if (!entrance) return;

    const adventurerCount = 1 + Math.floor(this.gameState.wave * 0.5);
    const classes: AdventurerClass[] = ['warrior', 'mage', 'thief'];

    for (let i = 0; i < adventurerCount; i++) {
      const adventurerClass = classes[Math.floor(Math.random() * classes.length)];
      this.spawnAdventurer(adventurerClass, entrance.x, entrance.y);
    }

    this.gameState.mode = 'combat';
  }

  spawnAdventurer(adventurerClass: AdventurerClass, x: number, y: number): Adventurer {
    const config = ADVENTURER_CONFIGS[adventurerClass];
    const id = `adv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const adventurer: Adventurer = {
      id,
      type: 'adventurer',
      adventurerClass,
      x: x + Math.random() * 0.5 - 0.25,
      y: y + Math.random() * 0.5 - 0.25,
      health: config.maxHealth,
      maxHealth: config.maxHealth,
      speed: config.speed,
      attack: config.attack,
      state: 'exploring',
      path: [],
      pathIndex: 0,
      gold: 0,
      effects: [],
      attackCooldown: 0,
      lootPriority: config.lootPriority,
    };

    this.adventurers.set(id, adventurer);
    return adventurer;
  }

  spawnMonster(monsterType: MonsterType, x: number, y: number): Monster | null {
    const config = MONSTER_CONFIGS[monsterType];
    if (this.gameState.gold < config.cost) return null;

    this.gameState.gold -= config.cost;
    const id = `mon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const monster: Monster = {
      id,
      type: 'monster',
      monsterType,
      x: x + Math.random() * 0.5 - 0.25,
      y: y + Math.random() * 0.5 - 0.25,
      health: config.maxHealth,
      maxHealth: config.maxHealth,
      speed: config.speed,
      attack: config.attack,
      level: 1,
      mood: 100,
      salary: config.salary,
      state: 'patrolling',
      patrolPath: findRandomPath(this.map, { x, y }, 10),
      patrolIndex: 0,
      effects: [],
      attackCooldown: 0,
    };

    this.monsters.set(id, monster);
    return monster;
  }

  placeTrap(trapType: TrapType, x: number, y: number): Trap | null {
    const config = TRAP_CONFIGS[trapType];
    if (this.gameState.gold < config.cost) return null;

    const tile = this.map.tiles[y]?.[x];
    if (!tile || !tile.passable || tile.trapId) return null;

    this.gameState.gold -= config.cost;
    const id = `trap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const trap: Trap = {
      id,
      type: trapType,
      x,
      y,
      cooldown: 0,
      maxCooldown: config.cooldown,
      damage: config.damage,
      linkedTraps: [],
      triggered: false,
    };

    this.traps.set(id, trap);
    tile.trapId = id;
    return trap;
  }

  placeToolRoom(roomType: RoomType, x: number, y: number): boolean {
    const config = ROOM_CONFIGS[roomType];
    if (this.gameState.gold < config.cost) return false;
    if (!canPlaceRoom(this.map, x, y, config.width, config.height)) return false;

    this.gameState.gold -= config.cost;
    const room = placeRoom(this.map, roomType, x, y, config.width, config.height);
    return room !== null;
  }

  dig(x: number, y: number): boolean {
    return digTile(this.map, x, y);
  }

  castSpell(spellType: SpellType, targetX: number, targetY: number): boolean {
    const config = SPELL_CONFIGS[spellType];
    const cooldown = this.spellCooldowns.get(spellType) || 0;

    if (cooldown > 0 || this.gameState.mana < config.manaCost) return false;

    this.gameState.mana -= config.manaCost;
    this.spellCooldowns.set(spellType, config.cooldown);

    if (spellType === 'heal') {
      for (const monster of this.monsters.values()) {
        const dist = Math.sqrt(
          Math.pow(monster.x - targetX, 2) + Math.pow(monster.y - targetY, 2)
        );
        if (dist <= config.range) {
          monster.health = Math.min(monster.maxHealth, monster.health - config.damage);
          this.spawnParticles(monster.x, monster.y, config.color, 10);
        }
      }
    } else {
      for (const adventurer of this.adventurers.values()) {
        const dist = Math.sqrt(
          Math.pow(adventurer.x - targetX, 2) + Math.pow(adventurer.y - targetY, 2)
        );
        if (dist <= config.range) {
          this.damageEntity(adventurer, config.damage);
          this.spawnParticles(adventurer.x, adventurer.y, config.color, 15);
        }
      }
      this.spawnParticles(targetX, targetY, config.color, 20);
    }

    return true;
  }

  private updateMonsters(dt: number): void {
    for (const monster of this.monsters.values()) {
      if (monster.state === 'dead') continue;

      this.updateEntityEffects(monster, dt);
      this.updateMonsterMood(monster, dt);

      if (monster.mood <= 0) {
        monster.state = 'striking';
      }

      if (monster.state === 'striking') continue;

      monster.attackCooldown = Math.max(0, monster.attackCooldown - dt);

      const nearestAdventurer = this.findNearestAdventurer(monster);

      if (nearestAdventurer) {
        const dist = this.getDistance(monster, nearestAdventurer);
        if (dist < 1.5) {
          monster.state = 'fighting';
          monster.targetId = nearestAdventurer.id;
          if (monster.attackCooldown <= 0) {
            this.damageEntity(nearestAdventurer, monster.attack);
            monster.attackCooldown = 1;
            this.spawnParticles(nearestAdventurer.x, nearestAdventurer.y, '#ff0000', 5);
          }
        } else {
          monster.state = 'fighting';
          this.moveTowards(monster, nearestAdventurer, dt);
        }
      } else {
        monster.state = 'patrolling';
        this.patrol(monster, dt);
      }

      if (monster.health <= 0) {
        monster.state = 'dead';
        this.monsters.delete(monster.id);
      }
    }
  }

  private updateAdventurers(dt: number): void {
    const heartPos = getHeartPosition(this.map);

    for (const adventurer of this.adventurers.values()) {
      if (adventurer.state === 'dead') continue;

      this.updateEntityEffects(adventurer, dt);

      const isStunned = adventurer.effects.some((e) => e.type === 'stunned');
      if (isStunned) continue;

      adventurer.attackCooldown = Math.max(0, adventurer.attackCooldown - dt);

      if (adventurer.health < adventurer.maxHealth * 0.3 && adventurer.state !== 'fleeing') {
        adventurer.state = 'fleeing';
        const entrance = getEntrancePosition(this.map);
        if (entrance) {
          adventurer.path = findPath(this.map, this.getTilePos(adventurer), entrance);
          adventurer.pathIndex = 0;
        }
      }

      const nearestMonster = this.findNearestMonster(adventurer);

      if (adventurer.state === 'fleeing') {
        this.followPath(adventurer, dt);
        const entrance = getEntrancePosition(this.map);
        if (entrance && this.getDistance(adventurer, entrance) < 1) {
          this.adventurers.delete(adventurer.id);
          continue;
        }
      } else if (nearestMonster && this.getDistance(adventurer, nearestMonster) < 1.5) {
        adventurer.state = 'fighting';
        adventurer.targetId = nearestMonster.id;
        if (adventurer.attackCooldown <= 0) {
          this.damageEntity(nearestMonster, adventurer.attack);
          adventurer.attackCooldown = 1;
          this.spawnParticles(nearestMonster.x, nearestMonster.y, '#ffff00', 5);
        }
      } else if (heartPos) {
        adventurer.state = 'exploring';
        if (adventurer.path.length === 0 || adventurer.pathIndex >= adventurer.path.length) {
          const heartNearby = this.findNearbyPassableTile(heartPos);
          if (heartNearby) {
            adventurer.path = findPath(this.map, this.getTilePos(adventurer), heartNearby);
            adventurer.pathIndex = 0;
          }
        }
        this.followPath(adventurer, dt);

        if (this.getDistance(adventurer, heartPos) < 2 && this.heartAttackCooldown <= 0) {
          const damage = Math.max(1, Math.floor(adventurer.attack * 0.3));
          this.gameState.heartHealth -= damage;
          this.heartAttackCooldown = 1;
          this.spawnParticles(heartPos.x, heartPos.y, '#ff0000', 5);
        }
      } else {
        adventurer.state = 'exploring';
        if (adventurer.path.length === 0 || adventurer.pathIndex >= adventurer.path.length) {
          const randomTarget = this.findRandomExplorableTile(adventurer);
          if (randomTarget) {
            adventurer.path = findPath(this.map, this.getTilePos(adventurer), randomTarget);
            adventurer.pathIndex = 0;
          }
        }
        this.followPath(adventurer, dt);
      }

      this.checkTrapCollision(adventurer);

      if (adventurer.health <= 0) {
        adventurer.state = 'dead';
        this.gameState.gold += 20 + Math.floor(this.gameState.wave * 5);
        this.gameState.fear += 5;
        this.adventurers.delete(adventurer.id);
      }
    }

    if (this.adventurers.size === 0 && this.gameState.mode === 'combat') {
      this.gameState.mode = 'management';
    }
  }

  private updateEntityEffects(entity: Monster | Adventurer, dt: number): void {
    for (let i = entity.effects.length - 1; i >= 0; i--) {
      const effect = entity.effects[i];
      effect.duration -= dt;

      if (effect.damagePerSecond > 0) {
        entity.health -= effect.damagePerSecond * dt;
      }

      if (effect.duration <= 0) {
        entity.effects.splice(i, 1);
      }
    }
  }

  private updateMonsterMood(monster: Monster, dt: number): void {
    const config = MONSTER_CONFIGS[monster.monsterType];
    monster.mood -= config.moodDecay * dt * 0.1;
    monster.mood = Math.max(0, monster.mood);
  }

  private updateTraps(dt: number): void {
    for (const trap of this.traps.values()) {
      trap.cooldown = Math.max(0, trap.cooldown - dt);
      if (trap.triggered && trap.cooldown <= 0) {
        trap.triggered = false;
      }
    }
  }

  private checkTrapCollision(adventurer: Adventurer): void {
    const tileX = Math.floor(adventurer.x + 0.5);
    const tileY = Math.floor(adventurer.y + 0.5);
    const tile = this.map.tiles[tileY]?.[tileX];

    if (!tile?.trapId) return;

    const trap = this.traps.get(tile.trapId);
    if (!trap || trap.cooldown > 0) return;

    const config = TRAP_CONFIGS[trap.type];
    trap.triggered = true;
    trap.cooldown = trap.maxCooldown;

    if (trap.type === 'pressure_plate') {
      for (const linkedId of trap.linkedTraps) {
        const linkedTrap = this.traps.get(linkedId);
        if (linkedTrap) {
          this.triggerTrap(linkedTrap, adventurer);
        }
      }
    } else {
      this.triggerTrap(trap, adventurer);
    }
  }

  private triggerTrap(trap: Trap, target: Adventurer): void {
    const config = TRAP_CONFIGS[trap.type];
    this.damageEntity(target, trap.damage);

    if (config.effect) {
      target.effects.push({ ...config.effect });
    }

    this.spawnParticles(target.x, target.y, config.color, 10);
  }

  private damageEntity(entity: Monster | Adventurer, damage: number): void {
    entity.health -= damage;
  }

  private updateParticles(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private updateSpellCooldowns(dt: number): void {
    for (const type of this.spellCooldowns.keys()) {
      const cd = this.spellCooldowns.get(type) || 0;
      this.spellCooldowns.set(type, Math.max(0, cd - dt));
    }
  }

  private regenerateMana(dt: number): void {
    this.gameState.mana = Math.min(
      this.gameState.maxMana,
      this.gameState.mana + 5 * dt
    );
  }

  private findNearestAdventurer(monster: Monster): Adventurer | null {
    let nearest: Adventurer | null = null;
    let minDist = Infinity;

    for (const adventurer of this.adventurers.values()) {
      const dist = this.getDistance(monster, adventurer);
      if (dist < minDist && dist < 8) {
        minDist = dist;
        nearest = adventurer;
      }
    }

    return nearest;
  }

  private findNearestMonster(adventurer: Adventurer): Monster | null {
    let nearest: Monster | null = null;
    let minDist = Infinity;

    for (const monster of this.monsters.values()) {
      if (monster.state === 'dead' || monster.state === 'striking') continue;
      const dist = this.getDistance(adventurer, monster);
      if (dist < minDist && dist < 6) {
        minDist = dist;
        nearest = monster;
      }
    }

    return nearest;
  }

  private getDistance(a: { x: number; y: number }, b: { x: number; y: number }): number {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  }

  private getTilePos(entity: { x: number; y: number }): Point {
    return {
      x: Math.floor(entity.x + 0.5),
      y: Math.floor(entity.y + 0.5),
    };
  }

  private moveTowards(
    entity: Monster | Adventurer,
    target: { x: number; y: number },
    dt: number
  ): void {
    const dx = target.x - entity.x;
    const dy = target.y - entity.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0.1) {
      const speed = entity.speed * dt;
      entity.x += (dx / dist) * speed;
      entity.y += (dy / dist) * speed;
    }
  }

  private followPath(adventurer: Adventurer, dt: number): void {
    if (adventurer.path.length === 0 || adventurer.pathIndex >= adventurer.path.length) return;

    const target = adventurer.path[adventurer.pathIndex];
    const dx = target.x - adventurer.x;
    const dy = target.y - adventurer.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 0.2) {
      adventurer.pathIndex++;
    } else {
      const speed = adventurer.speed * dt;
      adventurer.x += (dx / dist) * speed;
      adventurer.y += (dy / dist) * speed;
    }
  }

  private patrol(monster: Monster, dt: number): void {
    if (monster.patrolPath.length === 0) {
      monster.patrolPath = findRandomPath(this.map, this.getTilePos(monster), 10);
      monster.patrolIndex = 0;
    }

    if (monster.patrolIndex >= monster.patrolPath.length) {
      monster.patrolPath = findRandomPath(this.map, this.getTilePos(monster), 10);
      monster.patrolIndex = 0;
      return;
    }

    const target = monster.patrolPath[monster.patrolIndex];
    const dx = target.x - monster.x;
    const dy = target.y - monster.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 0.2) {
      monster.patrolIndex++;
    } else {
      const speed = monster.speed * dt * 0.5;
      monster.x += (dx / dist) * speed;
      monster.y += (dy / dist) * speed;
    }
  }

  private findRandomExplorableTile(entity: Adventurer): Point | null {
    const candidates: Point[] = [];

    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        const tile = this.map.tiles[y][x];
        if (tile.passable && Math.random() < 0.1) {
          candidates.push({ x, y });
        }
      }
    }

    return candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : null;
  }

  private findNearbyPassableTile(target: Point): Point | null {
    const directions = [
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: -1 },
      { x: 1, y: 1 },
      { x: -1, y: 1 },
      { x: -1, y: -1 },
    ];

    for (const dir of directions) {
      const x = target.x + dir.x;
      const y = target.y + dir.y;
      if (x >= 0 && x < this.map.width && y >= 0 && y < this.map.height) {
        if (this.map.tiles[y][x].passable) {
          return { x, y };
        }
      }
    }
    return null;
  }

  hasHatchery(): boolean {
    return this.map.rooms.some((room) => room.type === 'hatchery');
  }

  getAvailableMonsterTypes(): MonsterType[] {
    const types: MonsterType[] = ['imp'];
    if (this.hasHatchery()) {
      types.push('skeleton', 'assassin');
    }
    return types;
  }

  spawnParticles(x: number, y: number, color: string, count: number): void {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        id: `p_${Date.now()}_${i}`,
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 0.5 + Math.random() * 0.5,
        maxLife: 1,
        color,
        size: 3 + Math.random() * 3,
      });
    }
  }

  private checkGameOver(): void {
    if (this.gameState.heartHealth <= 0) {
      this.gameState.gameOver = true;
    }
  }

  getSpellCooldown(spellType: SpellType): number {
    return this.spellCooldowns.get(spellType) || 0;
  }

  feedMonster(monsterId: string): boolean {
    const monster = this.monsters.get(monsterId);
    if (!monster || this.gameState.gold < 10) return false;

    this.gameState.gold -= 10;
    monster.mood = Math.min(100, monster.mood + 30);
    return true;
  }

  paySalary(): boolean {
    let totalSalary = 0;
    for (const monster of this.monsters.values()) {
      totalSalary += monster.salary;
    }

    if (this.gameState.gold < totalSalary) return false;

    this.gameState.gold -= totalSalary;
    for (const monster of this.monsters.values()) {
      monster.mood = Math.min(100, monster.mood + 50);
    }
    return true;
  }

  render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, width, height);

    const offsetX = (width - this.map.width * TILE_SIZE * this.gameState.zoom) / 2;
    const offsetY = (height - this.map.height * TILE_SIZE * this.gameState.zoom) / 2;

    ctx.save();
    ctx.translate(offsetX + this.gameState.cameraX, offsetY + this.gameState.cameraY);
    ctx.scale(this.gameState.zoom, this.gameState.zoom);

    this.renderMap(ctx);
    this.renderRooms(ctx);
    this.renderTraps(ctx);
    this.renderMonsters(ctx);
    this.renderAdventurers(ctx);
    this.renderParticles(ctx);

    ctx.restore();
  }

  private renderMap(ctx: CanvasRenderingContext2D): void {
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        const tile = this.map.tiles[y][x];
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        switch (tile.type) {
          case 'rock':
            ctx.fillStyle = '#2a2a3a';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = '#1a1a2a';
            ctx.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            break;
          case 'floor':
            ctx.fillStyle = '#3a3a4a';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = '#2a2a3a';
            ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
            break;
          case 'room':
            ctx.fillStyle = '#4a4a5a';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            break;
          case 'entrance':
            ctx.fillStyle = '#4a6a4a';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = '#6a8a6a';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('⚔', px + TILE_SIZE / 2, py + TILE_SIZE / 2 + 6);
            break;
          case 'heart':
            ctx.fillStyle = '#4a2a3a';
            ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = '#ff4466';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('♥', px + TILE_SIZE / 2, py + TILE_SIZE / 2 + 8);
            break;
        }
      }
    }
  }

  private renderRooms(ctx: CanvasRenderingContext2D): void {
    for (const room of this.map.rooms) {
      const config = ROOM_CONFIGS[room.type];
      const px = room.x * TILE_SIZE;
      const py = room.y * TILE_SIZE;
      const w = room.width * TILE_SIZE;
      const h = room.height * TILE_SIZE;

      ctx.strokeStyle = config.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(px + 2, py + 2, w - 4, h - 4);

      ctx.fillStyle = config.color;
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(config.name, px + w / 2, py + h / 2 + 4);
    }
  }

  private renderTraps(ctx: CanvasRenderingContext2D): void {
    for (const trap of this.traps.values()) {
      const config = TRAP_CONFIGS[trap.type];
      const px = trap.x * TILE_SIZE;
      const py = trap.y * TILE_SIZE;

      ctx.fillStyle = trap.triggered ? '#ff4444' : config.color;
      ctx.globalAlpha = trap.cooldown > 0 ? 0.3 : 0.8;

      ctx.font = '16px Arial';
      ctx.textAlign = 'center';

      let icon = '▼';
      if (trap.type === 'spike') icon = '▲';
      if (trap.type === 'gas') icon = '☁';
      if (trap.type === 'boulder') icon = '●';
      if (trap.type === 'pressure_plate') icon = '▬';

      ctx.fillText(icon, px + TILE_SIZE / 2, py + TILE_SIZE / 2 + 5);
      ctx.globalAlpha = 1;
    }
  }

  private renderMonsters(ctx: CanvasRenderingContext2D): void {
    for (const monster of this.monsters.values()) {
      if (monster.state === 'dead') continue;

      const config = MONSTER_CONFIGS[monster.monsterType];
      const px = monster.x * TILE_SIZE;
      const py = monster.y * TILE_SIZE;
      const radius = TILE_SIZE / 3;

      ctx.fillStyle = monster.state === 'striking' ? '#888888' : config.color;
      ctx.beginPath();
      ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();

      const healthPercent = monster.health / monster.maxHealth;
      ctx.fillStyle = '#333333';
      ctx.fillRect(px + 5, py - 5, TILE_SIZE - 10, 4);
      ctx.fillStyle = healthPercent > 0.5 ? '#44ff44' : healthPercent > 0.25 ? '#ffff44' : '#ff4444';
      ctx.fillRect(px + 5, py - 5, (TILE_SIZE - 10) * healthPercent, 4);

      if (monster.mood < 30) {
        ctx.fillStyle = '#ff4444';
        ctx.font = '10px Arial';
        ctx.fillText('😠', px + TILE_SIZE - 10, py + 10);
      }
    }
  }

  private renderAdventurers(ctx: CanvasRenderingContext2D): void {
    for (const adventurer of this.adventurers.values()) {
      if (adventurer.state === 'dead') continue;

      const config = ADVENTURER_CONFIGS[adventurer.adventurerClass];
      const px = adventurer.x * TILE_SIZE;
      const py = adventurer.y * TILE_SIZE;
      const radius = TILE_SIZE / 3;

      ctx.fillStyle = config.color;
      ctx.beginPath();
      ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';

      let icon = '⚔';
      if (adventurer.adventurerClass === 'mage') icon = '✦';
      if (adventurer.adventurerClass === 'thief') icon = '◆';
      ctx.fillText(icon, px + TILE_SIZE / 2, py + TILE_SIZE / 2 + 4);

      const healthPercent = adventurer.health / adventurer.maxHealth;
      ctx.fillStyle = '#333333';
      ctx.fillRect(px + 5, py - 5, TILE_SIZE - 10, 4);
      ctx.fillStyle = healthPercent > 0.5 ? '#44ff44' : healthPercent > 0.25 ? '#ffff44' : '#ff4444';
      ctx.fillRect(px + 5, py - 5, (TILE_SIZE - 10) * healthPercent, 4);

      if (adventurer.state === 'fleeing') {
        ctx.fillStyle = '#ffff00';
        ctx.font = '10px Arial';
        ctx.fillText('!', px + TILE_SIZE - 8, py + 8);
      }
    }
  }

  private renderParticles(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      const alpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(p.x * TILE_SIZE + TILE_SIZE / 2, p.y * TILE_SIZE + TILE_SIZE / 2, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  screenToWorld(screenX: number, screenY: number, canvasWidth: number, canvasHeight: number): Point {
    const offsetX = (canvasWidth - this.map.width * TILE_SIZE * this.gameState.zoom) / 2;
    const offsetY = (canvasHeight - this.map.height * TILE_SIZE * this.gameState.zoom) / 2;

    return {
      x: Math.floor((screenX - offsetX - this.gameState.cameraX) / this.gameState.zoom / TILE_SIZE),
      y: Math.floor((screenY - offsetY - this.gameState.cameraY) / this.gameState.zoom / TILE_SIZE),
    };
  }

  handleTileClick(x: number, y: number): void {
    if (this.gameState.gameOver) return;

    const tile = this.map.tiles[y]?.[x];
    if (!tile) return;

    switch (this.gameState.selectedTool) {
      case 'dig':
        this.dig(x, y);
        break;
      case 'room':
        if (this.gameState.selectedRoomType) {
          this.placeToolRoom(this.gameState.selectedRoomType, x, y);
        }
        break;
      case 'monster':
        if (this.gameState.selectedMonsterType && tile.passable) {
          this.spawnMonster(this.gameState.selectedMonsterType, x, y);
        }
        break;
      case 'trap':
        if (this.gameState.selectedTrapType) {
          this.placeTrap(this.gameState.selectedTrapType, x, y);
        }
        break;
      default:
        break;
    }
  }

  handleSpellClick(
    spellType: SpellType,
    screenX: number,
    screenY: number,
    canvasWidth: number,
    canvasHeight: number
  ): boolean {
    const worldPos = this.screenToWorld(screenX, screenY, canvasWidth, canvasHeight);
    return this.castSpell(spellType, worldPos.x, worldPos.y);
  }
}

let engineInstance: GameEngine | null = null;

export function getEngine(): GameEngine {
  if (!engineInstance) {
    engineInstance = new GameEngine();
  }
  return engineInstance;
}
