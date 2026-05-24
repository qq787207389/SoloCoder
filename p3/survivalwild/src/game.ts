import { Player } from './player';
import { MapGenerator, MAP_SIZE, TILE_SIZE } from './mapGenerator';
import { Renderer } from './renderer';
import { UISystem } from './ui';
import { WeatherSystem } from './weather';
import { AnimalSystem } from './animalAI';
import { 
  ItemType, 
  ITEM_INFO,
  BuildingType, 
  BUILDING_INFO, 
  TerrainType, 
  AnimalState, 
  GameState,
  ResourceNode,
  Building
} from './types';

export class Game {
  private player: Player;
  private map: any[][];
  private resources: ResourceNode[];
  private buildings: Building[];
  private animals: any[];
  private timeOfDay: number;
  private day: number;
  private weatherSystem: WeatherSystem;
  private renderer: Renderer;
  private ui: UISystem;
  private keys: Set<string>;
  private mouseX: number;
  private mouseY: number;
  private lastTime: number;
  private showInventory: boolean;
  private shipPartsFound: number;
  private totalShipParts: number;
  private gameOver: boolean;
  private victory: boolean;
  private seed: number;

  constructor(canvas: HTMLCanvasElement, minimap: HTMLCanvasElement) {
    this.seed = Date.now();
    const mapGen = new MapGenerator(this.seed);
    
    this.map = mapGen.generateMap();
    const spawn = mapGen.findSpawnPoint(this.map);
    this.resources = [...mapGen.generateResources(this.map), ...mapGen.generateShipParts(this.map)];
    this.animals = mapGen.generateAnimals(this.map);
    this.buildings = [];
    
    this.player = new Player(spawn.x, spawn.y);
    this.weatherSystem = new WeatherSystem();
    this.renderer = new Renderer(canvas, minimap);
    this.ui = new UISystem();
    
    this.timeOfDay = 0.3;
    this.day = 1;
    this.keys = new Set();
    this.mouseX = 0;
    this.mouseY = 0;
    this.lastTime = 0;
    this.showInventory = false;
    this.shipPartsFound = 0;
    this.totalShipParts = 5;
    this.gameOver = false;
    this.victory = false;
    
    this.setupControls();
  }

  private setupControls(): void {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.key.toLowerCase());
      
      if (e.key >= '1' && e.key <= '5') {
        this.player.hotbarIndex = parseInt(e.key) - 1;
      }
      
      if (e.key.toLowerCase() === 'e') {
        this.showInventory = !this.showInventory;
      }
      
      if (e.key.toLowerCase() === 'c') {
        this.ui.toggleCraftPanel();
      }
      
      if (e.key.toLowerCase() === 'b') {
        this.ui.toggleBuildMode();
      }
      
      if (e.key === ' ') {
        e.preventDefault();
        this.interact();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
    });

    window.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.handleLeftClick();
      }
    });

    this.player.isRunning = true;
  }

  start(): void {
    this.lastTime = performance.now();
    this.gameLoop();
  }

  private gameLoop(): void {
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    if (!this.gameOver) {
      this.update(deltaTime, currentTime / 1000);
    }
    
    this.render();
    
    requestAnimationFrame(() => this.gameLoop());
  }

  private update(deltaTime: number, currentTime: number): void {
    this.timeOfDay = (this.timeOfDay + deltaTime * 0.01) % 1;
    if (this.timeOfDay < 0.01) {
      this.day++;
      this.ui.addMessage(`第 ${this.day} 天开始了`);
    }

    this.weatherSystem.update(deltaTime);

    let isMoving = false;
    const speed = this.player.getMoveSpeed();
    let dx = 0;
    let dy = 0;

    if (this.keys.has('w')) { dy -= 1; isMoving = true; }
    if (this.keys.has('s')) { dy += 1; isMoving = true; }
    if (this.keys.has('a')) { dx -= 1; isMoving = true; }
    if (this.keys.has('d')) { dx += 1; isMoving = true; }

    if (dx !== 0 || dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      dx /= len;
      dy /= len;
      
      const newX = this.player.x + dx * speed * deltaTime;
      const newY = this.player.y + dy * speed * deltaTime;
      
      if (this.canMoveTo(newX, newY)) {
        this.player.x = newX;
        this.player.y = newY;
      }
    }

    this.player.update(deltaTime, isMoving);
    
    const tempMod = this.weatherSystem.getTemperatureModifier();
    const nearFire = this.isNearBuilding(BuildingType.CAMPFIRE, 100);
    const nearShelter = this.isNearBuilding(BuildingType.SHELTER, 80);
    
    let effectiveTemp = tempMod;
    if (nearFire) effectiveTemp += 15;
    if (nearShelter) effectiveTemp += 5;
    
    this.player.adjustTemperature(effectiveTemp, deltaTime);

    if (this.player.temperature < 30) {
      this.player.health = Math.max(0, this.player.health - deltaTime * 3);
    }

    this.animals.forEach(animal => {
      if (animal.state === AnimalState.DEAD) return;
      
      const damage = AnimalSystem.update(
        animal, 
        this.player.x, 
        this.player.y, 
        deltaTime, 
        currentTime
      );
      
      if (damage > 0) {
        this.player.health = Math.max(0, this.player.health - damage);
        this.ui.addMessage(`被攻击了! -${damage} 生命`);
      }
    });

    if (!this.player.isAlive()) {
      this.gameOver = true;
      this.ui.showGameOver(false, this.day);
    }

    if (this.shipPartsFound >= this.totalShipParts) {
      this.victory = true;
      this.gameOver = true;
      this.ui.showGameOver(true, this.day);
    }

    this.updateUI();
  }

  private canMoveTo(x: number, y: number): boolean {
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);
    
    if (tileX < 0 || tileX >= MAP_SIZE || tileY < 0 || tileY >= MAP_SIZE) {
      return false;
    }
    
    const terrain = this.map[tileY][tileX].terrain;
    if (terrain === TerrainType.WATER) return false;
    if (terrain === TerrainType.MOUNTAIN) return false;
    
    return true;
  }

  private isNearBuilding(type: BuildingType, range: number): boolean {
    return this.buildings.some(b => {
      if (b.type !== type) return false;
      const dx = b.x - this.player.x;
      const dy = b.y - this.player.y;
      return Math.sqrt(dx * dx + dy * dy) < range;
    });
  }

  private getNearbyBuildings(): BuildingType[] {
    return this.buildings
      .filter(b => {
        const dx = b.x - this.player.x;
        const dy = b.y - this.player.y;
        return Math.sqrt(dx * dx + dy * dy) < 80;
      })
      .map(b => b.type);
  }

  private handleLeftClick(): void {
    if (this.ui.isBuildMode()) {
      this.tryBuild();
    } else {
      this.tryHarvestOrAttack();
    }
  }

  private tryHarvestOrAttack(): void {
    const worldX = this.mouseX + this.player.x - window.innerWidth / 2;
    const worldY = this.mouseY + this.player.y - window.innerHeight / 2;

    for (const animal of this.animals) {
      if (animal.state === AnimalState.DEAD) continue;
      
      const dx = animal.x - worldX;
      const dy = animal.y - worldY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 40 && this.player.canAttack()) {
        const damage = this.player.attack();
        animal.health -= damage;
        
        if (animal.health <= 0) {
          animal.state = AnimalState.DEAD;
          const loot = AnimalSystem.getLoot(animal);
          loot.forEach(l => {
            this.player.inventory.addItem(l.item as ItemType, l.count);
            this.ui.addMessage(`获得 ${l.count}x ${ITEM_INFO[l.item as ItemType].name}`);
          });
        } else {
          this.ui.addMessage(`造成 ${damage} 点伤害`);
        }
        return;
      }
    }

    for (const res of this.resources) {
      if (res.amount <= 0) continue;
      
      const dx = res.x - worldX;
      const dy = res.y - worldY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 40) {
        const harvestAmount = Math.min(res.amount, this.player.getHarvestBonus());
        res.amount -= harvestAmount;
        
        if (res.type === ItemType.SHIP_PART) {
          this.shipPartsFound++;
          this.ui.addMessage(`找到船只零件! (${this.shipPartsFound}/${this.totalShipParts})`);
        }
        
        const remaining = this.player.inventory.addItem(res.type, harvestAmount);
        const info = ITEM_INFO[res.type];
        this.ui.addMessage(`采集了 ${harvestAmount - remaining}x ${info.name}`);
        return;
      }
    }
  }

  private tryBuild(): void {
    const buildingType = this.ui.getSelectedBuilding();
    if (!buildingType) return;

    const worldX = Math.round((this.mouseX + this.player.x - window.innerWidth / 2) / TILE_SIZE) * TILE_SIZE;
    const worldY = Math.round((this.mouseY + this.player.y - window.innerHeight / 2) / TILE_SIZE) * TILE_SIZE;

    const dx = worldX - this.player.x;
    const dy = worldY - this.player.y;
    if (Math.sqrt(dx * dx + dy * dy) > 150) {
      this.ui.addMessage('太远了，无法建造');
      return;
    }

    const tileX = Math.floor(worldX / TILE_SIZE);
    const tileY = Math.floor(worldY / TILE_SIZE);
    if (tileX < 0 || tileX >= MAP_SIZE || tileY < 0 || tileY >= MAP_SIZE) return;
    
    const terrain = this.map[tileY][tileX].terrain;
    if (terrain === TerrainType.WATER || terrain === TerrainType.MOUNTAIN) {
      this.ui.addMessage('无法在此处建造');
      return;
    }

    const existing = this.buildings.find(b => b.x === worldX && b.y === worldY);
    if (existing) {
      this.ui.addMessage('此处已有建筑');
      return;
    }

    const info = BUILDING_INFO[buildingType];
    if (!this.player.inventory.hasItems(info.cost)) {
      this.ui.addMessage('材料不足');
      return;
    }

    info.cost.forEach(c => {
      this.player.inventory.removeItem(c.item, c.count);
    });

    this.buildings.push({
      id: `building_${Date.now()}`,
      type: buildingType,
      x: worldX,
      y: worldY,
      health: 100,
      lit: buildingType === BuildingType.CAMPFIRE
    });

    this.ui.addMessage(`建造了 ${info.name}`);
  }

  private interact(): void {
    const selectedItem = this.player.getSelectedItem();
    
    if (selectedItem && [ItemType.BERRY, ItemType.COOKED_MEAT, ItemType.RAW_MEAT, ItemType.FRESH_WATER, ItemType.MEDKIT].includes(selectedItem)) {
      this.player.eat();
      const info = ITEM_INFO[selectedItem];
      this.ui.addMessage(`使用了 ${info.name}`);
      return;
    }

    for (const res of this.resources) {
      if (res.amount <= 0) continue;
      
      const dx = res.x - this.player.x;
      const dy = res.y - this.player.y;
      if (Math.sqrt(dx * dx + dy * dy) < 50) {
        const harvestAmount = Math.min(res.amount, this.player.getHarvestBonus());
        res.amount -= harvestAmount;
        
        if (res.type === ItemType.SHIP_PART) {
          this.shipPartsFound++;
          this.ui.addMessage(`找到船只零件! (${this.shipPartsFound}/${this.totalShipParts})`);
        }
        
        const remaining = this.player.inventory.addItem(res.type, harvestAmount);
        const info = ITEM_INFO[res.type];
        this.ui.addMessage(`采集了 ${harvestAmount - remaining}x ${info.name}`);
        return;
      }
    }
  }

  private updateUI(): void {
    this.ui.updateStatus(this.player);
    this.ui.updateHotbar(this.player);
    this.ui.updateInventory(this.player, this.showInventory);
    this.ui.updateCraftPanel(this.player, this.getNearbyBuildings());
    this.ui.updateBuildPanel(this.ui.isBuildMode());
    this.ui.updateTime(this.timeOfDay, this.day, this.weatherSystem.getWeather());
  }

  private render(): void {
    const state: GameState = {
      player: this.player.serialize(),
      map: this.map,
      resources: this.resources,
      buildings: this.buildings,
      animals: this.animals,
      timeOfDay: this.timeOfDay,
      day: this.day,
      weather: this.weatherSystem.getWeather(),
      shipPartsFound: this.shipPartsFound,
      totalShipParts: this.totalShipParts,
      gameOver: this.gameOver,
      victory: this.victory,
      seed: this.seed
    };

    this.renderer.render(state);
  }

  saveGame(): string {
    const saveData = {
      player: this.player.serialize(),
      buildings: this.buildings,
      resources: this.resources,
      animals: this.animals,
      timeOfDay: this.timeOfDay,
      day: this.day,
      weather: this.weatherSystem.serialize(),
      shipPartsFound: this.shipPartsFound,
      seed: this.seed,
      map: this.map
    };
    return JSON.stringify(saveData);
  }

  static loadGame(canvas: HTMLCanvasElement, minimap: HTMLCanvasElement, saveData: string): Game {
    const data = JSON.parse(saveData);
    const game = new Game(canvas, minimap);
    
    game.player = Player.deserialize(data.player);
    game.buildings = data.buildings;
    game.resources = data.resources;
    game.animals = data.animals;
    game.timeOfDay = data.timeOfDay;
    game.day = data.day;
    game.weatherSystem = WeatherSystem.deserialize(data.weather);
    game.shipPartsFound = data.shipPartsFound;
    game.seed = data.seed;
    game.map = data.map;
    
    return game;
  }
}
