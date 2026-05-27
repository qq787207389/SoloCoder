import { create } from 'zustand';
import type { GameState, PlayerState, GameScreen, Backpack, Item, DungeonFloor, CombatState } from '@/game/types';
import { BACKPACKS } from '@/game/backpacks';
import { generateDungeonFloor } from '@/game/dungeon';
import { createItemInstance, getRandomItemIdByRarity } from '@/game/items';
import { createInventoryGrid, InventoryGrid, canPlaceItem, getRotatedShape, rotateShape } from '@/game/inventory';

function createInitialPlayerState(backpack: Backpack): PlayerState {
  return {
    hp: backpack.baseStats.hp,
    maxHp: backpack.baseStats.hp,
    stamina: backpack.baseStats.stamina,
    maxStamina: backpack.baseStats.stamina,
    attack: backpack.baseStats.attack,
    defense: backpack.baseStats.defense,
    gold: 50,
    level: 1,
    exp: 0,
    inventory: [],
    backpack,
    currentFloor: 1,
    inCombat: false,
    currentCombat: null,
    currentLoot: [],
    permanentBuffs: [],
  };
}

function createStarterItems(backpackId: string): Item[] {
  const items: Item[] = [];
  const addItem = (templateId: string) => {
    const item = createItemInstance(templateId);
    if (item) items.push(item);
  };

  switch (backpackId) {
    case 'warrior':
      addItem('iron_sword');
      addItem('leather_shield');
      addItem('iron_shield');
      addItem('health_potion');
      addItem('health_potion');
      break;
    case 'alchemist':
      addItem('short_sword');
      addItem('health_potion');
      addItem('health_potion');
      addItem('mana_potion');
      addItem('bread');
      break;
    case 'rogue':
      addItem('short_sword');
      addItem('short_sword');
      addItem('iron_shield');
      addItem('health_potion');
      break;
    case 'mage':
      addItem('short_sword');
      addItem('ring_of_life');
      addItem('fireball_scroll');
      addItem('mana_potion');
      addItem('health_potion');
      break;
    default:
      addItem('iron_sword');
      addItem('health_potion');
      break;
  }

  return items;
}

interface GameStore extends GameState {
  inventoryGrid: InventoryGrid | null;

  startNewGame: (backpackId: string) => void;
  setScreen: (screen: GameScreen) => void;
  selectItem: (itemId: string | null) => void;
  setDraggedItem: (itemId: string | null) => void;
  setHoveredCell: (cell: { x: number; y: number } | null) => void;
  setMessage: (message: string | null) => void;

  addItem: (item: Item) => boolean;
  removeItem: (itemId: string) => void;
  moveItem: (itemId: string, x: number, y: number) => boolean;
  rotateItem: (itemId: string) => boolean;

  enterCombat: (combatState: CombatState) => void;
  exitCombat: () => void;
  updateCombat: (combatState: CombatState) => void;

  setLoot: (items: Item[]) => void;
  keepLootItem: (itemId: string) => void;
  discardLootItem: (itemId: string) => void;

  goToNextFloor: () => void;
  updatePlayer: (updates: Partial<PlayerState>) => void;
  healPlayer: (amount: number) => void;
  damagePlayer: (amount: number) => void;

  consumeItem: (itemId: string) => void;

  setDungeon: (dungeon: DungeonFloor | null) => void;
  moveToRoom: (roomId: string) => void;

  rebuildInventoryGrid: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  screen: 'menu',
  player: createInitialPlayerState(BACKPACKS[0]),
  dungeon: null,
  inventoryGrid: null,
  selectedItemId: null,
  draggedItemId: null,
  hoveredCell: null,
  message: null,
  seed: Date.now(),

  startNewGame: (backpackId: string) => {
    const backpack = BACKPACKS.find((b) => b.id === backpackId) || BACKPACKS[0];
    const player = createInitialPlayerState(backpack);
    const starterItems = createStarterItems(backpackId);
    player.inventory = starterItems;

    const grid = createInventoryGrid(backpack);
    for (const item of starterItems) {
      const pos = findFirstEmptyPosition(grid, item);
      if (pos) {
        item.position = { x: pos.x, y: pos.y };
        item.rotation = pos.rotation;
        const shape = getRotatedShape(item);
        for (const c of shape) {
          grid.cells[pos.y + c.dy][pos.x + c.dx].itemId = item.id;
        }
        grid.items.set(item.id, item);
      }
    }

    const dungeon = generateDungeonFloor(1);

    set({
      screen: 'dungeon',
      player,
      dungeon,
      inventoryGrid: grid,
      selectedItemId: null,
      draggedItemId: null,
    });
  },

  setScreen: (screen) => set({ screen }),
  selectItem: (itemId) => set({ selectedItemId: itemId }),
  setDraggedItem: (itemId) => set({ draggedItemId: itemId }),
  setHoveredCell: (cell) => set({ hoveredCell: cell }),
  setMessage: (message) => set({ message }),

  addItem: (item) => {
    const state = get();
    const grid = state.inventoryGrid;
    if (!grid) return false;

    const pos = findFirstEmptyPosition(grid, item);
    if (!pos) return false;

    item.position = { x: pos.x, y: pos.y };
    item.rotation = pos.rotation;
    const shape = getRotatedShape(item);
    for (const c of shape) {
      grid.cells[pos.y + c.dy][pos.x + c.dx].itemId = item.id;
    }
    grid.items.set(item.id, item);

    set({
      inventoryGrid: { ...grid },
      player: { ...state.player, inventory: [...state.player.inventory, item] },
    });
    return true;
  },

  removeItem: (itemId) => {
    const state = get();
    const grid = state.inventoryGrid;
    if (!grid) return;

    const item = grid.items.get(itemId);
    if (!item || !item.position) return;

    const shape = getRotatedShape(item);
    for (const c of shape) {
      const cx = item.position.x + c.dx;
      const cy = item.position.y + c.dy;
      if (cx >= 0 && cx < grid.width && cy >= 0 && cy < grid.height) {
        grid.cells[cy][cx].itemId = null;
      }
    }
    grid.items.delete(itemId);

    set({
      inventoryGrid: { ...grid },
      player: {
        ...state.player,
        inventory: state.player.inventory.filter((i) => i.id !== itemId),
      },
    });
  },

  moveItem: (itemId, x, y) => {
    const state = get();
    const grid = state.inventoryGrid;
    if (!grid) return false;

    const item = grid.items.get(itemId);
    if (!item || !item.position) return false;

    const oldPos = { ...item.position };
    const shape = getRotatedShape(item);

    const newCells = shape.map((c) => ({ x: x + c.dx, y: y + c.dy }));
    for (const cell of newCells) {
      if (cell.x < 0 || cell.x >= grid.width || cell.y < 0 || cell.y >= grid.height) return false;
      const existingItemId = grid.cells[cell.y][cell.x].itemId;
      if (existingItemId && existingItemId !== itemId) return false;
    }

    for (const c of shape) {
      grid.cells[oldPos.y + c.dy][oldPos.x + c.dx].itemId = null;
    }

    for (const c of shape) {
      grid.cells[y + c.dy][x + c.dx].itemId = item.id;
    }
    item.position = { x, y };

    set({ inventoryGrid: { ...grid } });
    return true;
  },

  rotateItem: (itemId) => {
    const state = get();
    const grid = state.inventoryGrid;
    if (!grid) return false;

    const item = grid.items.get(itemId);
    if (!item || !item.position) return false;

    const oldRotation = item.rotation;
    item.rotation = (item.rotation + 90) % 360;

    const newShape = getRotatedShape(item);
    for (const c of newShape) {
      const cx = item.position.x + c.dx;
      const cy = item.position.y + c.dy;
      if (cx < 0 || cx >= grid.width || cy < 0 || cy >= grid.height) {
        item.rotation = oldRotation;
        return false;
      }
      const existingItemId = grid.cells[cy][cx].itemId;
      if (existingItemId && existingItemId !== itemId) {
        item.rotation = oldRotation;
        return false;
      }
    }

    const oldShape = rotateShape(item.shape, oldRotation);
    for (const c of oldShape) {
      grid.cells[item.position.y + c.dy][item.position.x + c.dx].itemId = null;
    }
    for (const c of newShape) {
      grid.cells[item.position.y + c.dy][item.position.x + c.dx].itemId = item.id;
    }

    set({ inventoryGrid: { ...grid } });
    return true;
  },

  enterCombat: (combatState) => {
    set({
      screen: 'combat',
      player: { ...get().player, inCombat: true, currentCombat: combatState },
    });
  },

  exitCombat: () => {
    set({
      screen: 'dungeon',
      player: { ...get().player, inCombat: false, currentCombat: null },
    });
  },

  updateCombat: (combatState) => {
    set({ player: { ...get().player, currentCombat: combatState } });
  },

  setLoot: (items) => {
    set({ screen: 'loot', player: { ...get().player, currentLoot: items } });
  },

  keepLootItem: (itemId) => {
    const state = get();
    const lootItem = state.player.currentLoot.find((i) => i.id === itemId);
    if (!lootItem) return;

    if (state.addItem(lootItem)) {
      set({
        player: {
          ...get().player,
          currentLoot: get().player.currentLoot.filter((i) => i.id !== itemId),
        },
      });
    }
  },

  discardLootItem: (itemId) => {
    const state = get();
    set({
      player: {
        ...state.player,
        currentLoot: state.player.currentLoot.filter((i) => i.id !== itemId),
      },
    });
  },

  goToNextFloor: () => {
    const state = get();
    const nextFloor = state.player.currentFloor + 1;
    const dungeon = generateDungeonFloor(nextFloor);

    set({
      dungeon,
      player: {
        ...state.player,
        currentFloor: nextFloor,
        stamina: Math.min(state.player.maxStamina, state.player.stamina + 10),
      },
    });
  },

  updatePlayer: (updates) => {
    set({ player: { ...get().player, ...updates } });
  },

  healPlayer: (amount) => {
    const state = get();
    set({
      player: {
        ...state.player,
        hp: Math.min(state.player.maxHp, state.player.hp + amount),
      },
    });
  },

  damagePlayer: (amount) => {
    const state = get();
    const newHp = Math.max(0, state.player.hp - amount);
    set({
      player: { ...state.player, hp: newHp },
    });
    if (newHp <= 0) {
      set({ screen: 'gameover' });
    }
  },

  consumeItem: (itemId) => {
    const state = get();
    const grid = state.inventoryGrid;
    if (!grid) return;

    const item = grid.items.get(itemId);
    if (!item) return;

    if (item.quantity && item.quantity > 1) {
      item.quantity--;
      set({ inventoryGrid: { ...grid } });
    } else {
      get().removeItem(itemId);
    }
  },

  setDungeon: (dungeon) => set({ dungeon }),

  moveToRoom: (roomId) => {
    const state = get();
    if (!state.dungeon) return;

    const newDungeon = { ...state.dungeon, playerRoomId: roomId };
    const room = newDungeon.rooms.find((r) => r.id === roomId);
    if (room) room.discovered = true;

    set({ dungeon: newDungeon });
  },

  rebuildInventoryGrid: () => {
    const state = get();
    const grid = createInventoryGrid(state.player.backpack);
    for (const item of state.player.inventory) {
      if (item.position) {
        const shape = getRotatedShape(item);
        let canPlace = true;
        for (const c of shape) {
          const cx = item.position.x + c.dx;
          const cy = item.position.y + c.dy;
          if (cx < 0 || cx >= grid.width || cy < 0 || cy >= grid.height) {
            canPlace = false;
            break;
          }
          if (grid.cells[cy][cx].itemId) {
            canPlace = false;
            break;
          }
        }
        if (canPlace) {
          for (const c of shape) {
            const cx = item.position.x + c.dx;
            const cy = item.position.y + c.dy;
            grid.cells[cy][cx].itemId = item.id;
          }
          grid.items.set(item.id, item);
        } else {
          const newPos = findFirstEmptyPosition(grid, item);
          if (newPos) {
            item.position = { x: newPos.x, y: newPos.y };
            item.rotation = newPos.rotation;
            const newShape = getRotatedShape(item);
            for (const c of newShape) {
              grid.cells[newPos.y + c.dy][newPos.x + c.dx].itemId = item.id;
            }
            grid.items.set(item.id, item);
          }
        }
      }
    }
    set({ inventoryGrid: grid });
  },
}));

function findFirstEmptyPosition(grid: InventoryGrid, item: Item): { x: number; y: number; rotation: number } | null {
  for (let rotation = 0; rotation < 360; rotation += 90) {
    const rotatedShape = rotateShape(item.shape, rotation);
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        let canPlace = true;
        for (const c of rotatedShape) {
          const cx = x + c.dx;
          const cy = y + c.dy;
          if (cx < 0 || cx >= grid.width || cy < 0 || cy >= grid.height) {
            canPlace = false;
            break;
          }
          const existingItemId = grid.cells[cy][cx].itemId;
          if (existingItemId && existingItemId !== item.id) {
            canPlace = false;
            break;
          }
        }
        if (canPlace) {
          return { x, y, rotation };
        }
      }
    }
  }
  return null;
}
