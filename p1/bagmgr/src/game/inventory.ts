import type { Item, ItemShape, Backpack, SpecialSlot } from './types';

export interface GridCell {
  x: number;
  y: number;
  itemId: string | null;
  isSpecialSlot: boolean;
  specialSlot?: SpecialSlot;
}

export interface InventoryGrid {
  width: number;
  height: number;
  cells: GridCell[][];
  items: Map<string, Item>;
}

export function createInventoryGrid(backpack: Backpack): InventoryGrid {
  const cells: GridCell[][] = [];
  for (let y = 0; y < backpack.height; y++) {
    cells[y] = [];
    for (let x = 0; x < backpack.width; x++) {
      cells[y][x] = {
        x,
        y,
        itemId: null,
        isSpecialSlot: false,
      };
    }
  }

  backpack.specialSlots.forEach((slot) => {
    for (let dy = 0; dy < slot.height; dy++) {
      for (let dx = 0; dx < slot.width; dx++) {
        const sx = slot.x + dx;
        const sy = slot.y + dy;
        if (sx < backpack.width && sy < backpack.height) {
          cells[sy][sx].isSpecialSlot = true;
          cells[sy][sx].specialSlot = slot;
        }
      }
    }
  });

  return {
    width: backpack.width,
    height: backpack.height,
    cells,
    items: new Map(),
  };
}

export function rotateShape(shape: ItemShape, rotation: number): ItemShape {
  const times = ((rotation % 360) + 360) % 360 / 90;
  let result = shape.map((c) => ({ ...c }));

  for (let t = 0; t < times; t++) {
    result = result.map((c) => ({ dx: -c.dy, dy: c.dx }));
  }

  const minDx = Math.min(...result.map((c) => c.dx));
  const minDy = Math.min(...result.map((c) => c.dy));
  result = result.map((c) => ({ dx: c.dx - minDx, dy: c.dy - minDy }));

  return result;
}

export function getRotatedShape(item: Item): ItemShape {
  return rotateShape(item.shape, item.rotation);
}

export function getOccupiedCells(item: Item, posX: number, posY: number): { x: number; y: number }[] {
  const shape = getRotatedShape(item);
  return shape.map((c) => ({ x: posX + c.dx, y: posY + c.dy }));
}

export function canPlaceItem(
  grid: InventoryGrid,
  item: Item,
  posX: number,
  posY: number
): { valid: boolean; reason?: string } {
  const occupied = getOccupiedCells(item, posX, posY);

  for (const cell of occupied) {
    if (cell.x < 0 || cell.x >= grid.width || cell.y < 0 || cell.y >= grid.height) {
      return { valid: false, reason: '超出背包边界' };
    }

    const gridCell = grid.cells[cell.y][cell.x];
    if (gridCell.itemId && gridCell.itemId !== item.id) {
      return { valid: false, reason: '与其他物品重叠' };
    }
  }

  return { valid: true };
}

export function placeItem(grid: InventoryGrid, item: Item, posX: number, posY: number): boolean {
  const check = canPlaceItem(grid, item, posX, posY);
  if (!check.valid) return false;

  if (item.position) {
    removeItem(grid, item.id);
  }

  const occupied = getOccupiedCells(item, posX, posY);
  for (const cell of occupied) {
    grid.cells[cell.y][cell.x].itemId = item.id;
  }

  item.position = { x: posX, y: posY };
  grid.items.set(item.id, item);
  return true;
}

export function removeItem(grid: InventoryGrid, itemId: string): Item | null {
  const item = grid.items.get(itemId);
  if (!item || !item.position) return null;

  const occupied = getOccupiedCells(item, item.position.x, item.position.y);
  for (const cell of occupied) {
    if (cell.x >= 0 && cell.x < grid.width && cell.y >= 0 && cell.y < grid.height) {
      grid.cells[cell.y][cell.x].itemId = null;
    }
  }

  item.position = null;
  grid.items.delete(itemId);
  return item;
}

export function moveItem(
  grid: InventoryGrid,
  itemId: string,
  newX: number,
  newY: number
): boolean {
  const item = grid.items.get(itemId);
  if (!item || !item.position) return false;

  const oldPos = { ...item.position };

  const check = canPlaceItem(grid, item, newX, newY);
  if (!check.valid) return false;

  const occupied = getOccupiedCells(item, oldPos.x, oldPos.y);
  for (const cell of occupied) {
    if (cell.x >= 0 && cell.x < grid.width && cell.y >= 0 && cell.y < grid.height) {
      grid.cells[cell.y][cell.x].itemId = null;
    }
  }

  const newOccupied = getOccupiedCells(item, newX, newY);
  for (const cell of newOccupied) {
    grid.cells[cell.y][cell.x].itemId = item.id;
  }

  item.position = { x: newX, y: newY };
  return true;
}

export function rotateItem(grid: InventoryGrid, itemId: string): boolean {
  const item = grid.items.get(itemId);
  if (!item || !item.position) return false;

  const oldRotation = item.rotation;
  item.rotation = (item.rotation + 90) % 360;

  const check = canPlaceItem(grid, item, item.position.x, item.position.y);
  if (!check.valid) {
    item.rotation = oldRotation;
    return false;
  }

  return true;
}

export function getItemAt(grid: InventoryGrid, x: number, y: number): Item | null {
  if (x < 0 || x >= grid.width || y < 0 || y >= grid.height) return null;
  const cell = grid.cells[y][x];
  if (!cell.itemId) return null;
  return grid.items.get(cell.itemId) || null;
}

export function isItemAccessible(grid: InventoryGrid, item: Item): boolean {
  if (!item.position) return false;

  const shape = getRotatedShape(item);

  for (const coord of shape) {
    const checkX = item.position.x + coord.dx;
    const checkY = item.position.y + coord.dy - 1;

    if (checkY >= 0) {
      if (grid.cells[checkY][checkX].itemId && grid.cells[checkY][checkX].itemId !== item.id) {
        return false;
      }
    }
  }

  return true;
}

export function getAccessibleItems(grid: InventoryGrid): Item[] {
  const accessible: Item[] = [];
  for (const item of grid.items.values()) {
    if (isItemAccessible(grid, item)) {
      accessible.push(item);
    }
  }
  return accessible;
}

export function findBestPosition(grid: InventoryGrid, item: Item): { x: number; y: number } | null {
  for (let rotation = 0; rotation < 360; rotation += 90) {
    item.rotation = rotation;
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        if (canPlaceItem(grid, item, x, y).valid) {
          return { x, y };
        }
      }
    }
  }
  item.rotation = 0;
  return null;
}

export function getShapeBounds(shape: ItemShape): { width: number; height: number } {
  let maxDx = 0;
  let maxDy = 0;
  for (const c of shape) {
    maxDx = Math.max(maxDx, c.dx);
    maxDy = Math.max(maxDy, c.dy);
  }
  return { width: maxDx + 1, height: maxDy + 1 };
}

export function getGridStats(grid: InventoryGrid): {
  totalAttack: number;
  totalDefense: number;
  totalHp: number;
  totalStamina: number;
  usedSlots: number;
  totalSlots: number;
  fillRatio: number;
} {
  let totalAttack = 0;
  let totalDefense = 0;
  let totalHp = 0;
  let totalStamina = 0;
  let usedSlots = 0;

  for (const item of grid.items.values()) {
    totalAttack += item.stats.attack || 0;
    totalDefense += item.stats.defense || 0;
    totalHp += item.stats.hp || 0;
    totalStamina += item.stats.stamina || 0;
  }

  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      if (grid.cells[y][x].itemId) usedSlots++;
    }
  }

  const totalSlots = grid.width * grid.height;

  return {
    totalAttack,
    totalDefense,
    totalHp,
    totalStamina,
    usedSlots,
    totalSlots,
    fillRatio: usedSlots / totalSlots,
  };
}
