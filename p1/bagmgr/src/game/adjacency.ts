import type { Item, AdjacencyEffect, ItemType, ElementType } from './types';
import type { InventoryGrid } from './inventory';
import { getRotatedShape } from './inventory';

export interface AdjacencyResult {
  itemId: string;
  bonusAttack: number;
  bonusDefense: number;
  bonusHp: number;
  bonusStamina: number;
  descriptions: string[];
  affectedItems: string[];
}

export function getItemAdjacencyEffects(
  grid: InventoryGrid,
  item: Item
): AdjacencyResult {
  const result: AdjacencyResult = {
    itemId: item.id,
    bonusAttack: 0,
    bonusDefense: 0,
    bonusHp: 0,
    bonusStamina: 0,
    descriptions: [],
    affectedItems: [],
  };

  if (!item.position) return result;

  const shape = getRotatedShape(item);
  const occupiedCells = shape.map((c) => ({
    x: item.position!.x + c.dx,
    y: item.position!.y + c.dy,
  }));

  const directions = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
  ];

  const checkedNeighbors = new Set<string>();

  for (const cell of occupiedCells) {
    for (const dir of directions) {
      const nx = cell.x + dir.dx;
      const ny = cell.y + dir.dy;

      if (nx < 0 || nx >= grid.width || ny < 0 || ny >= grid.height) continue;

      const neighborCell = grid.cells[ny][nx];
      if (!neighborCell.itemId || neighborCell.itemId === item.id) continue;

      if (checkedNeighbors.has(neighborCell.itemId)) continue;
      checkedNeighbors.add(neighborCell.itemId);

      const neighborItem = grid.items.get(neighborCell.itemId);
      if (!neighborItem) continue;

      result.affectedItems.push(neighborItem.id);

      if (item.adjacencyEffects) {
        for (const effect of item.adjacencyEffects) {
          if (matchesEffectTarget(effect, neighborItem)) {
            applyEffect(result, effect);
          }
        }
      }

      if (neighborItem.adjacencyEffects) {
        for (const effect of neighborItem.adjacencyEffects) {
          if (matchesEffectTarget(effect, item)) {
            applyEffect(result, effect);
          }
        }
      }
    }
  }

  return result;
}

function matchesEffectTarget(effect: AdjacencyEffect, target: Item): boolean {
  if (effect.targetType && effect.targetType !== target.type) return false;
  if (effect.targetElement && effect.targetElement !== 'none' && effect.targetElement !== target.element) return false;
  if (!effect.targetType && !effect.targetElement) return true;
  return true;
}

function applyEffect(result: AdjacencyResult, effect: AdjacencyEffect) {
  switch (effect.effect) {
    case 'enchant':
      result.bonusAttack += effect.value;
      break;
    case 'boost':
      result.bonusAttack += effect.value;
      result.bonusDefense += effect.value;
      break;
    case 'corrupt':
      result.bonusAttack -= effect.value;
      break;
    case 'stabilize':
      result.bonusHp += effect.value;
      break;
    case 'empower':
      result.bonusAttack += effect.value * 2;
      break;
    case 'weaken':
      result.bonusDefense -= effect.value;
      break;
  }
  result.descriptions.push(effect.description);
}

export function getAllAdjacencyEffects(grid: InventoryGrid): Map<string, AdjacencyResult> {
  const results = new Map<string, AdjacencyResult>();
  for (const item of grid.items.values()) {
    results.set(item.id, getItemAdjacencyEffects(grid, item));
  }
  return results;
}

export function getItemEffectiveStats(
  grid: InventoryGrid,
  item: Item
): {
  attack: number;
  defense: number;
  hp: number;
  stamina: number;
} {
  const adjacency = getItemAdjacencyEffects(grid, item);
  return {
    attack: (item.stats.attack || 0) + adjacency.bonusAttack,
    defense: (item.stats.defense || 0) + adjacency.bonusDefense,
    hp: (item.stats.hp || 0) + adjacency.bonusHp,
    stamina: (item.stats.stamina || 0) + adjacency.bonusStamina,
  };
}

export function getTotalEffectiveStats(grid: InventoryGrid): {
  attack: number;
  defense: number;
  hp: number;
  stamina: number;
} {
  let attack = 0;
  let defense = 0;
  let hp = 0;
  let stamina = 0;

  for (const item of grid.items.values()) {
    const stats = getItemEffectiveStats(grid, item);
    attack += stats.attack;
    defense += stats.defense;
    hp += stats.hp;
    stamina += stats.stamina;
  }

  return { attack, defense, hp, stamina };
}

export function getAdjacentItems(grid: InventoryGrid, item: Item): Item[] {
  const adjacent: Item[] = [];
  if (!item.position) return adjacent;

  const shape = getRotatedShape(item);
  const occupiedCells = shape.map((c) => ({
    x: item.position!.x + c.dx,
    y: item.position!.y + c.dy,
  }));

  const seen = new Set<string>();
  const directions = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
  ];

  for (const cell of occupiedCells) {
    for (const dir of directions) {
      const nx = cell.x + dir.dx;
      const ny = cell.y + dir.dy;
      if (nx < 0 || nx >= grid.width || ny < 0 || ny >= grid.height) continue;
      const neighborItemId = grid.cells[ny][nx].itemId;
      if (neighborItemId && neighborItemId !== item.id && !seen.has(neighborItemId)) {
        seen.add(neighborItemId);
        const neighbor = grid.items.get(neighborItemId);
        if (neighbor) adjacent.push(neighbor);
      }
    }
  }

  return adjacent;
}
