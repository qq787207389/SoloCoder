import type {
  Unit, Building, ResourceNode, Camera, FogData,
  BuildingType, UnitType, Owner, GameResources
} from '../types';
import { EntityManager } from './EntityManager';
import { Pathfinding } from './Pathfinding';
import { SpatialGrid } from './SpatialGrid';
import { ResourceSystem } from '../systems/ResourceSystem';
import { BuildingSystem } from '../systems/BuildingSystem';
import { UnitSystem } from '../systems/UnitSystem';
import { CombatSystem } from '../systems/CombatSystem';
import { FogSystem } from '../systems/FogSystem';
import { AISystem } from '../ai/AISystem';
import { Renderer } from '../render/Renderer';
import { InputManager } from '../input/InputManager';
import { clamp } from '../utils/math';
import mapConfig from '../config/map.json';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private miniMapCanvas: HTMLCanvasElement;
  private entityManager: EntityManager;
  private pathfinding: Pathfinding;
  private spatialGrid: SpatialGrid;
  private resourceSystem: ResourceSystem;
  private buildingSystem: BuildingSystem;
  private unitSystem: UnitSystem;
  private combatSystem: CombatSystem;
  private fogSystem: FogSystem;
  private aiSystem: AISystem;
  private renderer: Renderer;
  private inputManager: InputManager;

  private units: Unit[] = [];
  private buildings: Building[] = [];
  private resources: ResourceNode[] = [];
  private selectedUnitIds: Set<string> = new Set();
  private groups: Map<number, string[]> = new Map();
  private gameResources: { player: GameResources; ai: GameResources };
  private fog: FogData;
  private camera: Camera;
  private buildingPlacement: BuildingType | null = null;

  private mapWidth: number = 64;
  private mapHeight: number = 64;
  private tileSize: number = 32;
  private gameTime: number = 0;
  private gameOver: boolean = false;
  private winner: Owner | null = null;
  private towerAttackCooldowns: Map<string, number> = new Map();

  private lastTime: number = 0;
  private running: boolean = false;

  constructor(canvas: HTMLCanvasElement, miniMapCanvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.miniMapCanvas = miniMapCanvas;

    const mapData = {
      width: this.mapWidth,
      height: this.mapHeight,
      tileSize: this.tileSize,
      tiles: this.createMapTiles(),
      resources: []
    };

    this.entityManager = new EntityManager();
    this.pathfinding = new Pathfinding(mapData);
    this.spatialGrid = new SpatialGrid(64, this.mapWidth, this.mapHeight);
    this.resourceSystem = new ResourceSystem();
    this.buildingSystem = new BuildingSystem(this.entityManager);
    this.unitSystem = new UnitSystem(this.pathfinding);
    this.combatSystem = new CombatSystem();
    this.fogSystem = new FogSystem(this.mapWidth, this.mapHeight, this.tileSize);
    this.aiSystem = new AISystem(this.entityManager);

    const ctx = canvas.getContext('2d')!;
    const miniMapCtx = miniMapCanvas.getContext('2d')!;
    this.renderer = new Renderer(ctx, miniMapCtx, this.tileSize, this.mapWidth, this.mapHeight);

    this.camera = { x: 0, y: 0, zoom: 1 };
    this.fog = this.fogSystem.createFogData();
    this.gameResources = {
      player: { gold: 1500, wood: 800, population: 0, maxPopulation: 30 },
      ai: { gold: 1500, wood: 800, population: 0, maxPopulation: 30 }
    };

    this.inputManager = new InputManager(canvas, this.camera, this.tileSize);
    this.setupInputHandlers();
  }

  private createMapTiles(): number[][] {
    const tiles: number[][] = [];
    for (let y = 0; y < this.mapHeight; y++) {
      tiles[y] = [];
      for (let x = 0; x < this.mapWidth; x++) {
        tiles[y][x] = 0;
      }
    }
    return tiles;
  }

  private setupInputHandlers(): void {
    this.inputManager.onSelect((x, y, additive) => {
      this.handleSelect(x, y, additive);
    });

    this.inputManager.onBoxSelect((x1, y1, x2, y2, additive) => {
      this.handleBoxSelect(x1, y1, x2, y2, additive);
    });

    this.inputManager.onRightClick((x, y) => {
      this.handleRightClick(x, y);
    });

    this.inputManager.onCameraMove((dx, dy) => {
      this.camera.x = clamp(this.camera.x + dx, 0, this.mapWidth * this.tileSize - this.canvas.width / this.camera.zoom);
      this.camera.y = clamp(this.camera.y + dy, 0, this.mapHeight * this.tileSize - this.canvas.height / this.camera.zoom);
      this.inputManager.updateCamera(this.camera);
    });

    this.inputManager.onZoom((delta, x, y) => {
      const worldPos = this.inputManager.screenToWorld(x, y);
      this.camera.zoom = clamp(this.camera.zoom + delta, 0.5, 2);
      this.camera.x = worldPos.x - x / this.camera.zoom;
      this.camera.y = worldPos.y - y / this.camera.zoom;
      this.inputManager.updateCamera(this.camera);
    });

    this.inputManager.onGroup((group, set) => {
      if (set) {
        this.groups.set(group, Array.from(this.selectedUnitIds));
      } else {
        const groupUnits = this.groups.get(group);
        if (groupUnits) {
          this.selectedUnitIds.clear();
          groupUnits.forEach(id => this.selectedUnitIds.add(id));
        }
      }
    });

    this.inputManager.onPlaceBuilding((type) => {
      this.buildingPlacement = type;
    });
  }

  private handleSelect(x: number, y: number, additive: boolean): void {
    for (const unit of this.units) {
      if (unit.owner !== 'player' || unit.state === 'dead') continue;
      const dx = x - (unit.x + unit.width / 2);
      const dy = y - (unit.y + unit.height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < unit.width) {
        if (!additive) this.selectedUnitIds.clear();
        this.selectedUnitIds.add(unit.id);
        return;
      }
    }

    if (!additive) {
      this.selectedUnitIds.clear();
    }
  }

  private handleBoxSelect(x1: number, y1: number, x2: number, y2: number, additive: boolean): void {
    const worldX1 = x1 / this.camera.zoom + this.camera.x;
    const worldY1 = y1 / this.camera.zoom + this.camera.y;
    const worldX2 = x2 / this.camera.zoom + this.camera.x;
    const worldY2 = y2 / this.camera.zoom + this.camera.y;

    const minX = Math.min(worldX1, worldX2);
    const minY = Math.min(worldY1, worldY2);
    const maxX = Math.max(worldX1, worldX2);
    const maxY = Math.max(worldY1, worldY2);

    if (!additive) this.selectedUnitIds.clear();

    for (const unit of this.units) {
      if (unit.owner !== 'player' || unit.state === 'dead') continue;
      const centerX = unit.x + unit.width / 2;
      const centerY = unit.y + unit.height / 2;
      if (centerX >= minX && centerX <= maxX && centerY >= minY && centerY <= maxY) {
        this.selectedUnitIds.add(unit.id);
      }
    }
  }

  private handleRightClick(x: number, y: number): void {
    if (this.buildingPlacement) {
      this.placeBuilding(this.buildingPlacement, x, y);
      return;
    }

    if (this.selectedUnitIds.size === 0) return;

    for (const enemy of this.units) {
      if (enemy.owner === 'player' || enemy.state === 'dead') continue;
      const dx = x - (enemy.x + enemy.width / 2);
      const dy = y - (enemy.y + enemy.height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < enemy.width) {
        for (const id of this.selectedUnitIds) {
          const unit = this.units.find(u => u.id === id);
          if (unit && unit.state !== 'dead') {
            this.unitSystem.attackTarget(unit, enemy.id, 'unit', enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, this.buildings, this.resources);
          }
        }
        return;
      }
    }

    for (const building of this.buildings) {
      if (building.owner === 'player') continue;
      if (x >= building.x && x <= building.x + building.width &&
          y >= building.y && y <= building.y + building.height) {
        for (const id of this.selectedUnitIds) {
          const unit = this.units.find(u => u.id === id);
          if (unit && unit.state !== 'dead') {
            this.unitSystem.attackTarget(unit, building.id, 'building', building.x + building.width / 2, building.y + building.height / 2, this.buildings, this.resources);
          }
        }
        return;
      }
    }

    for (const resource of this.resources) {
      if (resource.amount <= 0) continue;
      const dx = x - resource.x;
      const dy = y - resource.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.tileSize) {
        for (const id of this.selectedUnitIds) {
          const unit = this.units.find(u => u.id === id);
          if (unit && unit.unitType === 'worker' && unit.state !== 'dead') {
            this.unitSystem.gatherResource(unit, resource.id, resource.x, resource.y, this.buildings, this.resources);
          }
        }
        return;
      }
    }

    let index = 0;
    const count = this.selectedUnitIds.size;
    for (const id of this.selectedUnitIds) {
      const unit = this.units.find(u => u.id === id);
      if (unit && unit.state !== 'dead') {
        const offset = this.getFormationOffset(index, count);
        this.unitSystem.moveTo(unit, x + offset.x, y + offset.y, this.buildings, this.resources);
      }
      index++;
    }
  }

  private getFormationOffset(index: number, total: number): { x: number; y: number } {
    const cols = Math.ceil(Math.sqrt(total));
    const row = Math.floor(index / cols);
    const col = index % cols;
    const spacing = 30;
    return {
      x: (col - cols / 2) * spacing,
      y: (row - Math.ceil(total / cols) / 2) * spacing
    };
  }

  private placeBuilding(type: BuildingType, x: number, y: number): void {
    const config = this.entityManager.getBuildingConfig(type);
    const gridX = Math.floor(x / this.tileSize) * this.tileSize;
    const gridY = Math.floor(y / this.tileSize) * this.tileSize;

    if (!this.resourceSystem.canAfford(config.cost, this.gameResources.player)) {
      return;
    }

    if (!this.buildingSystem.canPlaceBuilding(gridX, gridY, type, this.buildings, this.mapWidth, this.mapHeight)) {
      return;
    }

    this.resourceSystem.spendResources(config.cost, this.gameResources.player);

    const building = this.entityManager.createBuilding(type, gridX, gridY, 'player', false);
    this.buildings.push(building);

    for (const id of this.selectedUnitIds) {
      const unit = this.units.find(u => u.id === id);
      if (unit && unit.unitType === 'worker' && unit.state !== 'dead') {
        this.unitSystem.buildBuilding(unit, building.id, gridX + building.width / 2, gridY + building.height / 2, this.buildings, this.resources);
        break;
      }
    }

    this.buildingPlacement = null;
  }

  start(): void {
    this.initializeMap();
    this.running = true;
    this.lastTime = performance.now();
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private initializeMap(): void {
    this.resources = [];
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dist = 150;
      this.resources.push(this.entityManager.createResourceNode(
        'gold',
        8 * this.tileSize + Math.cos(angle) * dist,
        8 * this.tileSize + Math.sin(angle) * dist,
        1000
      ));
      this.resources.push(this.entityManager.createResourceNode(
        'wood',
        8 * this.tileSize + Math.cos(angle + 0.3) * dist,
        8 * this.tileSize + Math.sin(angle + 0.3) * dist,
        800
      ));
    }

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dist = 150;
      this.resources.push(this.entityManager.createResourceNode(
        'gold',
        56 * this.tileSize + Math.cos(angle) * dist,
        56 * this.tileSize + Math.sin(angle) * dist,
        1000
      ));
      this.resources.push(this.entityManager.createResourceNode(
        'wood',
        56 * this.tileSize + Math.cos(angle + 0.3) * dist,
        56 * this.tileSize + Math.sin(angle + 0.3) * dist,
        800
      ));
    }

    for (let i = 0; i < 6; i++) {
      this.resources.push(this.entityManager.createResourceNode(
        'gold',
        25 * this.tileSize + Math.random() * 14 * this.tileSize,
        25 * this.tileSize + Math.random() * 14 * this.tileSize,
        1500
      ));
      this.resources.push(this.entityManager.createResourceNode(
        'wood',
        25 * this.tileSize + Math.random() * 14 * this.tileSize,
        25 * this.tileSize + Math.random() * 14 * this.tileSize,
        1200
      ));
    }

    const playerBase = this.entityManager.createBuilding(
      'base',
      6 * this.tileSize,
      6 * this.tileSize,
      'player',
      true
    );
    this.buildings.push(playerBase);

    const aiBase = this.entityManager.createBuilding(
      'base',
      54 * this.tileSize,
      54 * this.tileSize,
      'ai',
      true
    );
    this.buildings.push(aiBase);

    for (let i = 0; i < 5; i++) {
      const unit = this.entityManager.createUnit(
        'worker',
        8 * this.tileSize + i * 20,
        10 * this.tileSize,
        'player'
      );
      this.units.push(unit);
      this.gameResources.player.population++;
    }

    for (let i = 0; i < 5; i++) {
      const unit = this.entityManager.createUnit(
        'worker',
        54 * this.tileSize + i * 20,
        56 * this.tileSize,
        'ai'
      );
      this.units.push(unit);
      this.gameResources.ai.population++;
    }

    this.camera.x = 4 * this.tileSize;
    this.camera.y = 4 * this.tileSize;
    this.inputManager.updateCamera(this.camera);
  }

  private gameLoop(currentTime: number): void {
    if (!this.running) return;

    const dt = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    if (!this.gameOver) {
      this.gameTime += dt;
      this.update(dt);
    }
    this.render();

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  private update(dt: number): void {
    this.spatialGrid.clear();
    for (const building of this.buildings) {
      this.spatialGrid.insert(building);
    }
    for (const unit of this.units) {
      if (unit.state !== 'dead') {
        this.spatialGrid.insert(unit);
      }
    }

    for (const unit of this.units) {
      if (unit.state === 'dead') continue;

      this.unitSystem.updateMovement(unit, this.buildings, this.resources, this.spatialGrid, dt);

      if (unit.owner === 'player') {
        this.resourceSystem.updateGathering(unit, this.resources, this.buildings, this.gameResources.player, dt);
        this.resourceSystem.updateReturning(unit, this.buildings, this.gameResources.player, this.resources, dt);
      } else {
        this.resourceSystem.updateGathering(unit, this.resources, this.buildings, this.gameResources.ai, dt);
        this.resourceSystem.updateReturning(unit, this.buildings, this.gameResources.ai, this.resources, dt);
      }

      this.buildingSystem.updateBuilding(unit, this.buildings, dt);
      this.combatSystem.updateCombat(unit, this.spatialGrid, this.units, this.buildings, this.gameResources, dt);
      this.combatSystem.autoAttack(unit, this.spatialGrid);
    }

    for (const building of this.buildings) {
      this.buildingSystem.updateProduction(building, this.units, building.owner, dt);
      this.combatSystem.updateTowerCombat(building, this.spatialGrid, this.units, dt, this.towerAttackCooldowns);
    }

    this.aiSystem.update(
      this.units,
      this.buildings,
      this.resources,
      this.buildings.filter(b => b.owner === 'player'),
      this.units.filter(u => u.owner === 'player'),
      this.gameResources.ai,
      dt,
      this.gameTime
    );

    this.fogSystem.updateFog(
      this.fog,
      this.units.filter(u => u.owner === 'player'),
      this.buildings.filter(b => b.owner === 'player')
    );

    this.checkGameOver();

    this.units = this.units.filter(u => u.state !== 'dead');
    this.buildings = this.buildings.filter(b => b.health > 0);
  }

  private checkGameOver(): void {
    const playerBase = this.buildings.find(b => b.buildingType === 'base' && b.owner === 'player');
    const aiBase = this.buildings.find(b => b.buildingType === 'base' && b.owner === 'ai');

    if (!playerBase) {
      this.gameOver = true;
      this.winner = 'ai';
    } else if (!aiBase) {
      this.gameOver = true;
      this.winner = 'player';
    }
  }

  private render(): void {
    this.renderer.clear();
    this.renderer.renderGround(this.camera);
    this.renderer.renderResources(this.resources, this.camera, this.fog);
    this.renderer.renderBuildings(this.buildings, this.camera, this.fog, false);
    this.renderer.renderUnits(this.units, this.camera, this.fog, this.selectedUnitIds);
    this.renderer.renderFog(this.fog, this.camera);

    if (this.buildingPlacement) {
      const mousePos = this.getMouseWorldPosition();
      if (mousePos) {
        const config = this.entityManager.getBuildingConfig(this.buildingPlacement);
        const gridX = Math.floor(mousePos.x / this.tileSize) * this.tileSize;
        const gridY = Math.floor(mousePos.y / this.tileSize) * this.tileSize;
        const canPlace = this.buildingSystem.canPlaceBuilding(
          gridX, gridY, this.buildingPlacement, this.buildings, this.mapWidth, this.mapHeight
        );
        this.renderer.renderBuildingPreview(this.buildingPlacement, gridX, gridY, canPlace, this.camera, config);
      }
    }

    this.renderer.renderMiniMap(this.units, this.buildings, this.resources, this.fog, this.camera);
    this.updateUI();
  }

  private getMouseWorldPosition(): { x: number; y: number } | null {
    return null;
  }

  private updateUI(): void {
    const goldDisplay = document.getElementById('gold-display');
    const woodDisplay = document.getElementById('wood-display');
    const popDisplay = document.getElementById('pop-display');
    const selectedCount = document.getElementById('selected-count');

    if (goldDisplay) goldDisplay.textContent = Math.floor(this.gameResources.player.gold).toString();
    if (woodDisplay) woodDisplay.textContent = Math.floor(this.gameResources.player.wood).toString();
    if (popDisplay) popDisplay.textContent = `${this.gameResources.player.population}/${this.gameResources.player.maxPopulation}`;
    if (selectedCount) selectedCount.textContent = this.selectedUnitIds.size.toString();

    const gameOverDiv = document.getElementById('game-over');
    const gameOverText = document.getElementById('game-over-text');
    if (gameOverDiv && gameOverText && this.gameOver) {
      gameOverDiv.style.display = 'flex';
      gameOverDiv.className = this.winner === 'player' ? 'victory' : 'defeat';
      gameOverText.textContent = this.winner === 'player' ? '胜利!' : '失败!';
    }
  }

  setBuildingPlacement(type: BuildingType | null): void {
    this.buildingPlacement = type;
  }

  getGameResources(): { player: GameResources; ai: GameResources } {
    return this.gameResources;
  }

  trainUnit(unitType: UnitType): boolean {
    const unitConfig = this.entityManager.getUnitConfig(unitType);

    for (const building of this.buildings) {
      if (building.owner !== 'player' || !building.isComplete) continue;

      const buildingConfig = this.entityManager.getBuildingConfig(building.buildingType);
      if (buildingConfig.produces.includes(unitType)) {
        return this.buildingSystem.startProduction(
          building,
          unitType,
          this.gameResources.player
        );
      }
    }

    return false;
  }

  restart(): void {
    this.units = [];
    this.buildings = [];
    this.resources = [];
    this.selectedUnitIds.clear();
    this.groups.clear();
    this.gameResources = {
      player: { gold: 1500, wood: 800, population: 0, maxPopulation: 30 },
      ai: { gold: 1500, wood: 800, population: 0, maxPopulation: 30 }
    };
    this.fog = this.fogSystem.createFogData();
    this.gameTime = 0;
    this.gameOver = false;
    this.winner = null;
    this.buildingPlacement = null;
    this.towerAttackCooldowns.clear();
    this.initializeMap();

    const gameOverDiv = document.getElementById('game-over');
    if (gameOverDiv) {
      gameOverDiv.style.display = 'none';
    }
  }

  isGameOver(): boolean {
    return this.gameOver;
  }
}
