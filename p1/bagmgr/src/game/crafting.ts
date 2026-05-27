import type { Item, CraftingRecipe, ItemType, ElementType } from './types';
import { getItemById, createItemInstance } from './items';
import type { InventoryGrid } from './inventory';
import { getRotatedShape } from './inventory';
import { getAdjacentItems } from './adjacency';

export const CRAFTING_RECIPES: CraftingRecipe[] = [
  {
    id: 'iron_sword',
    name: '铁剑',
    resultItemId: 'iron_sword',
    requiredMaterials: [
      { itemType: 'material', shape: [{ dx: 0, dy: 0 }, { dx: 1, dy: 0 }] },
      { itemType: 'material', shape: [{ dx: 0, dy: 0 }] },
    ],
    description: '将铁锭和木材合成为铁剑',
  },
  {
    id: 'fire_sword',
    name: '火焰剑',
    resultItemId: 'flame_sword',
    requiredMaterials: [
      { itemType: 'weapon', element: 'none' },
      { itemType: 'gem', element: 'fire' },
    ],
    description: '将宝石与武器合成为魔法武器',
  },
  {
    id: 'ice_sword',
    name: '寒冰剑',
    resultItemId: 'ice_sword',
    requiredMaterials: [
      { itemType: 'weapon', element: 'none' },
      { itemType: 'gem', element: 'ice' },
    ],
    description: '将冰霜宝石与武器合成为寒冰剑',
  },
  {
    id: 'health_ring',
    name: '生命戒指',
    resultItemId: 'ring_of_life',
    requiredMaterials: [
      { itemType: 'material', shape: [{ dx: 0, dy: 0 }] },
      { itemType: 'gem' },
    ],
    description: '将材料与宝石合成为戒指',
  },
  {
    id: 'magic_scroll',
    name: '魔法卷轴',
    resultItemId: 'fireball_scroll',
    requiredMaterials: [
      { itemType: 'material', shape: [{ dx: 0, dy: 0 }] },
      { itemType: 'gem', element: 'fire' },
    ],
    description: '将魔法水晶与材料合成为卷轴',
  },
  {
    id: 'mega_potion',
    name: '高级药水',
    resultItemId: 'greater_health_potion',
    requiredMaterials: [
      { itemType: 'potion', shape: [{ dx: 0, dy: 0 }] },
      { itemType: 'potion', shape: [{ dx: 0, dy: 0 }] },
    ],
    description: '将两瓶药水合成为更强大的药水',
  },
  {
    id: 'dragon_armor',
    name: '龙鳞甲',
    resultItemId: 'dragon_scale_armor',
    requiredMaterials: [
      { itemType: 'material', element: 'fire' },
      { itemType: 'armor' },
    ],
    description: '将龙鳞与护甲合成为龙鳞甲',
  },
];

export interface CraftingCheckResult {
  canCraft: boolean;
  recipe: CraftingRecipe | null;
  materials: Item[];
  reason?: string;
}

function matchesMaterial(item: Item, requirement: CraftingRecipe['requiredMaterials'][0]): boolean {
  if (requirement.itemType && item.type !== requirement.itemType) return false;
  if (requirement.element && requirement.element !== 'none' && item.element !== requirement.element) return false;
  if (requirement.shape) {
    const itemShape = getRotatedShape(item);
    if (itemShape.length !== requirement.shape.length) return false;
  }
  return true;
}

export function checkAdjacentCrafting(
  grid: InventoryGrid,
  itemA: Item,
  itemB: Item
): CraftingCheckResult {
  const adjacent = getAdjacentItems(grid, itemA);
  if (!adjacent.find((a) => a.id === itemB.id)) {
    return { canCraft: false, recipe: null, materials: [], reason: '物品不相邻' };
  }

  for (const recipe of CRAFTING_RECIPES) {
    const mats = [itemA, itemB];
    const reqs = [...recipe.requiredMaterials];

    let allMatched = true;
    const matchedItems: Item[] = [];

    for (const req of reqs) {
      let found = false;
      for (let i = 0; i < mats.length; i++) {
        if (!matchedItems.includes(mats[i]) && matchesMaterial(mats[i], req)) {
          matchedItems.push(mats[i]);
          found = true;
          break;
        }
      }
      if (!found) {
        allMatched = false;
        break;
      }
    }

    if (allMatched && matchedItems.length === recipe.requiredMaterials.length) {
      return { canCraft: true, recipe, materials: matchedItems };
    }
  }

  return { canCraft: false, recipe: null, materials: [], reason: '没有匹配的合成配方' };
}

export function findAllCraftablePairs(grid: InventoryGrid): CraftingCheckResult[] {
  const results: CraftingCheckResult[] = [];
  const seen = new Set<string>();

  for (const item of grid.items.values()) {
    const adjacent = getAdjacentItems(grid, item);
    for (const adj of adjacent) {
      const pairKey = [item.id, adj.id].sort().join('-');
      if (seen.has(pairKey)) continue;
      seen.add(pairKey);

      const result = checkAdjacentCrafting(grid, item, adj);
      if (result.canCraft && result.recipe) {
        results.push(result);
      }
    }
  }

  return results;
}

export function executeCrafting(
  grid: InventoryGrid,
  itemA: Item,
  itemB: Item
): { success: boolean; newItem: Item | null; reason?: string } {
  const check = checkAdjacentCrafting(grid, itemA, itemB);
  if (!check.canCraft || !check.recipe) {
    return { success: false, newItem: null, reason: check.reason || '无法合成' };
  }

  for (const mat of check.materials) {
    const pos = mat.position;
    if (pos) {
      const shape = getRotatedShape(mat);
      for (const c of shape) {
        const cx = pos.x + c.dx;
        const cy = pos.y + c.dy;
        if (cx >= 0 && cx < grid.width && cy >= 0 && cy < grid.height) {
          grid.cells[cy][cx].itemId = null;
        }
      }
    }
    grid.items.delete(mat.id);
  }

  const newItem = createItemInstance(check.recipe.resultItemId);
  if (newItem) {
    newItem.position = null;
    return { success: true, newItem };
  }

  return { success: false, newItem: null, reason: '创建物品失败' };
}

export function getRecipeById(id: string): CraftingRecipe | undefined {
  return CRAFTING_RECIPES.find((r) => r.id === id);
}
