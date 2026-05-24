import { Inventory } from './inventory';
import { ItemType, InventorySlot } from './types';

export class Player {
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  hunger: number;
  thirst: number;
  stamina: number;
  temperature: number;
  inventory: Inventory;
  hotbarIndex: number;
  isRunning: boolean;
  attackCooldown: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.health = 100;
    this.maxHealth = 100;
    this.hunger = 100;
    this.thirst = 100;
    this.stamina = 100;
    this.temperature = 37;
    this.inventory = new Inventory(20);
    this.hotbarIndex = 0;
    this.isRunning = false;
    this.attackCooldown = 0;
  }

  update(deltaTime: number, isMoving: boolean): void {
    this.hunger = Math.max(0, this.hunger - deltaTime * 0.3);
    this.thirst = Math.max(0, this.thirst - deltaTime * 0.5);

    if (isMoving && this.isRunning && this.stamina > 0) {
      this.stamina = Math.max(0, this.stamina - deltaTime * 15);
    } else if (!this.isRunning || !isMoving) {
      this.stamina = Math.min(100, this.stamina + deltaTime * 10);
    }

    if (this.hunger <= 0) {
      this.health = Math.max(0, this.health - deltaTime * 2);
    }
    if (this.thirst <= 0) {
      this.health = Math.max(0, this.health - deltaTime * 4);
    }

    if (this.hunger > 50 && this.thirst > 50) {
      this.health = Math.min(this.maxHealth, this.health + deltaTime * 1);
    }

    if (this.attackCooldown > 0) {
      this.attackCooldown = Math.max(0, this.attackCooldown - deltaTime);
    }
  }

  adjustTemperature(amount: number, deltaTime: number): void {
    const target = 37 + amount;
    this.temperature += (target - this.temperature) * deltaTime * 0.5;
  }

  eat(): void {
    const slot = this.getSelectedSlot();
    if (!slot || !slot.item) return;

    if (slot.item === ItemType.BERRY) {
      this.hunger = Math.min(100, this.hunger + 15);
      this.inventory.removeItem(slot.item, 1);
    } else if (slot.item === ItemType.COOKED_MEAT) {
      this.hunger = Math.min(100, this.hunger + 40);
      this.inventory.removeItem(slot.item, 1);
    } else if (slot.item === ItemType.RAW_MEAT) {
      this.hunger = Math.min(100, this.hunger + 20);
      this.health = Math.max(0, this.health - 10);
      this.inventory.removeItem(slot.item, 1);
    } else if (slot.item === ItemType.FRESH_WATER) {
      this.thirst = Math.min(100, this.thirst + 50);
      this.inventory.removeItem(slot.item, 1);
    } else if (slot.item === ItemType.MEDKIT) {
      this.health = Math.min(this.maxHealth, this.health + 50);
      this.inventory.removeItem(slot.item, 1);
    }
  }

  getSelectedSlot(): InventorySlot | null {
    return this.inventory.getSlot(this.hotbarIndex);
  }

  getSelectedItem(): ItemType | null {
    return this.getSelectedSlot()?.item || null;
  }

  canAttack(): boolean {
    return this.attackCooldown <= 0;
  }

  attack(): number {
    const item = this.getSelectedItem();
    let damage = 10;
    let cooldown = 0.5;

    if (item === ItemType.STONE_AXE) {
      damage = 25;
      cooldown = 0.8;
    } else if (item === ItemType.IRON_AXE) {
      damage = 40;
      cooldown = 0.6;
    } else if (item === ItemType.BOW) {
      if (this.inventory.countItem(ItemType.ARROW) > 0) {
        this.inventory.removeItem(ItemType.ARROW, 1);
        damage = 35;
        cooldown = 1;
      } else {
        return 0;
      }
    }

    this.attackCooldown = cooldown;
    return damage;
  }

  getHarvestBonus(): number {
    const item = this.getSelectedItem();
    if (item === ItemType.STONE_AXE) return 2;
    if (item === ItemType.STONE_PICKAXE) return 2;
    if (item === ItemType.IRON_AXE) return 3;
    return 1;
  }

  getMoveSpeed(): number {
    const base = 100;
    if (this.isRunning && this.stamina > 0) {
      return base * 2;
    }
    return base;
  }

  isAlive(): boolean {
    return this.health > 0;
  }

  serialize(): any {
    return {
      x: this.x,
      y: this.y,
      health: this.health,
      hunger: this.hunger,
      thirst: this.thirst,
      stamina: this.stamina,
      temperature: this.temperature,
      inventory: this.inventory.serialize(),
      hotbarIndex: this.hotbarIndex
    };
  }

  static deserialize(data: any): Player {
    const player = new Player(data.x, data.y);
    player.health = data.health;
    player.hunger = data.hunger;
    player.thirst = data.thirst;
    player.stamina = data.stamina;
    player.temperature = data.temperature;
    player.inventory = Inventory.deserialize(data.inventory);
    player.hotbarIndex = data.hotbarIndex;
    return player;
  }
}
