import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ShoppingItem, Ingredient } from '../types';
import { getFromStorage, setToStorage } from '../utils/storage';

const STORAGE_KEY = 'foodshare_shopping_list';

export const useShoppingStore = defineStore('shopping', () => {
  const items = ref<ShoppingItem[]>(getFromStorage<ShoppingItem[]>(STORAGE_KEY, []));

  const pendingItems = computed(() => items.value.filter(item => !item.checked));
  const completedItems = computed(() => items.value.filter(item => item.checked));
  const pendingCount = computed(() => pendingItems.value.length);
  const totalCount = computed(() => items.value.length);

  function saveToStorage() {
    setToStorage(STORAGE_KEY, items.value);
  }

  function addItem(item: Omit<ShoppingItem, 'id' | 'checked' | 'addedAt'>) {
    const existingIndex = items.value.findIndex(
      i => i.name.toLowerCase() === item.name.toLowerCase() && i.unit === item.unit
    );

    if (existingIndex !== -1) {
      items.value[existingIndex].quantity += item.quantity;
    } else {
      const newItem: ShoppingItem = {
        ...item,
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        checked: false,
        addedAt: new Date().toISOString(),
      };
      items.value.push(newItem);
    }
    saveToStorage();
  }

  function addIngredients(ingredients: Ingredient[]) {
    ingredients.forEach(ing => {
      const quantity = parseFloat(ing.quantity) || 1;
      addItem({
        name: ing.name,
        quantity,
        unit: ing.unit,
      });
    });
  }

  function removeItem(id: string) {
    items.value = items.value.filter(item => item.id !== id);
    saveToStorage();
  }

  function toggleItem(id: string) {
    const item = items.value.find(item => item.id === id);
    if (item) {
      item.checked = !item.checked;
      saveToStorage();
    }
  }

  function updateQuantity(id: string, quantity: number) {
    const item = items.value.find(item => item.id === id);
    if (item) {
      item.quantity = Math.max(0, quantity);
      saveToStorage();
    }
  }

  function clearCompleted() {
    items.value = items.value.filter(item => !item.checked);
    saveToStorage();
  }

  function clearAll() {
    items.value = [];
    saveToStorage();
  }

  return {
    items,
    pendingItems,
    completedItems,
    pendingCount,
    totalCount,
    addItem,
    addIngredients,
    removeItem,
    toggleItem,
    updateQuantity,
    clearCompleted,
    clearAll,
  };
});
