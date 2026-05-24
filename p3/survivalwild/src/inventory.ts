import { ItemType, InventorySlot, ITEM_INFO, RECIPES, Recipe, BuildingType } from './types';

export class Inventory {
  private slots: InventorySlot[];
  private size: number;

  constructor(size: number = 20) {
    this.size = size;
    this.slots = Array(size).fill(null).map(() => ({ item: null, count: 0 }));
  }

  addItem(item: ItemType, count: number = 1): number {
    const info = ITEM_INFO[item];
    let remaining = count;

    if (info.stackable) {
      for (const slot of this.slots) {
        if (slot.item === item && slot.count < (info.maxStack || 99)) {
          const canAdd = Math.min(remaining, (info.maxStack || 99) - slot.count);
          slot.count += canAdd;
          remaining -= canAdd;
          if (remaining <= 0) return 0;
        }
      }
    }

    for (const slot of this.slots) {
      if (slot.item === null) {
        slot.item = item;
        slot.count = Math.min(remaining, info.stackable ? (info.maxStack || 99) : 1);
        remaining -= slot.count;
        if (remaining <= 0) return 0;
      }
    }

    return remaining;
  }

  removeItem(item: ItemType, count: number = 1): boolean {
    if (this.countItem(item) < count) return false;

    let remaining = count;
    for (let i = this.slots.length - 1; i >= 0; i--) {
      const slot = this.slots[i];
      if (slot.item === item) {
        const toRemove = Math.min(remaining, slot.count);
        slot.count -= toRemove;
        remaining -= toRemove;
        if (slot.count <= 0) {
          slot.item = null;
          slot.count = 0;
        }
        if (remaining <= 0) return true;
      }
    }
    return true;
  }

  countItem(item: ItemType): number {
    return this.slots
      .filter(s => s.item === item)
      .reduce((sum, s) => sum + s.count, 0);
  }

  hasItems(items: { item: ItemType; count: number }[]): boolean {
    return items.every(({ item, count }) => this.countItem(item) >= count);
  }

  getSlot(index: number): InventorySlot | null {
    if (index < 0 || index >= this.size) return null;
    return this.slots[index];
  }

  setSlot(index: number, slot: InventorySlot): void {
    if (index >= 0 && index < this.size) {
      this.slots[index] = slot;
    }
  }

  getSlots(): InventorySlot[] {
    return [...this.slots];
  }

  getSize(): number {
    return this.size;
  }

  canCraft(recipe: Recipe, nearbyBuildings: BuildingType[]): boolean {
    if (!this.hasItems(recipe.ingredients)) return false;
    if (recipe.requires && !nearbyBuildings.includes(recipe.requires)) return false;
    return true;
  }

  craft(recipe: Recipe, nearbyBuildings: BuildingType[]): boolean {
    if (!this.canCraft(recipe, nearbyBuildings)) return false;

    for (const ing of recipe.ingredients) {
      this.removeItem(ing.item, ing.count);
    }

    this.addItem(recipe.result, recipe.resultCount);
    return true;
  }

  getAvailableRecipes(nearbyBuildings: BuildingType[]): { recipe: Recipe; available: boolean }[] {
    return RECIPES.map(r => ({
      recipe: r,
      available: this.canCraft(r, nearbyBuildings)
    }));
  }

  serialize(): InventorySlot[] {
    return [...this.slots];
  }

  static deserialize(data: InventorySlot[]): Inventory {
    const inv = new Inventory(data.length);
    data.forEach((slot, i) => {
      inv.setSlot(i, { ...slot });
    });
    return inv;
  }
}
