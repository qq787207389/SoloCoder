<template>
  <div class="animate-fade-in max-w-2xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="font-serif text-3xl font-bold text-gray-800 mb-1">购物清单</h1>
        <p class="text-gray-500">共 {{ shoppingStore.totalCount }} 项食材</p>
      </div>
      <button 
        v-if="shoppingStore.completedItems.length > 0"
        @click="shoppingStore.clearCompleted"
        class="text-sm text-gray-500 hover:text-primary-500 transition-colors"
      >
        清除已完成
      </button>
    </div>

    <div v-if="shoppingStore.pendingItems.length > 0" class="mb-8">
      <h2 class="text-lg font-semibold text-gray-700 mb-4 flex items-center">
        <ShoppingCart class="w-5 h-5 mr-2 text-primary-500" />
        待购买 ({{ shoppingStore.pendingCount }})
      </h2>
      <div class="space-y-3">
        <div 
          v-for="item in shoppingStore.pendingItems" 
          :key="item.id"
          class="bg-white rounded-2xl p-4 shadow-md flex items-center gap-4 animate-slide-up"
        >
          <input
            type="checkbox"
            :checked="item.checked"
            @change="shoppingStore.toggleItem(item.id)"
            class="w-6 h-6 rounded-lg border-gray-300 text-primary-500 focus:ring-primary-400 cursor-pointer"
          />
          <div class="flex-1">
            <p class="font-medium text-gray-800">{{ item.name }}</p>
          </div>
          <div class="flex items-center gap-2">
            <button 
              @click="updateQuantity(item.id, -1)"
              class="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <Minus class="w-4 h-4" />
            </button>
            <span class="w-12 text-center font-medium">
              {{ item.quantity }} {{ item.unit }}
            </span>
            <button 
              @click="updateQuantity(item.id, 1)"
              class="w-8 h-8 rounded-full bg-primary-100 hover:bg-primary-200 text-primary-600 flex items-center justify-center transition-colors"
            >
              <Plus class="w-4 h-4" />
            </button>
          </div>
          <button 
            @click="shoppingStore.removeItem(item.id)"
            class="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <div v-if="shoppingStore.completedItems.length > 0">
      <h2 class="text-lg font-semibold text-gray-700 mb-4 flex items-center">
        <CheckCircle class="w-5 h-5 mr-2 text-green-500" />
        已完成 ({{ shoppingStore.completedItems.length }})
      </h2>
      <div class="space-y-3">
        <div 
          v-for="item in shoppingStore.completedItems" 
          :key="item.id"
          class="bg-gray-50 rounded-2xl p-4 flex items-center gap-4"
        >
          <input
            type="checkbox"
            :checked="item.checked"
            @change="shoppingStore.toggleItem(item.id)"
            class="w-6 h-6 rounded-lg border-gray-300 text-primary-500 focus:ring-primary-400 cursor-pointer"
          />
          <div class="flex-1">
            <p class="font-medium text-gray-400 line-through">{{ item.name }}</p>
          </div>
          <span class="text-gray-400">
            {{ item.quantity }} {{ item.unit }}
          </span>
          <button 
            @click="shoppingStore.removeItem(item.id)"
            class="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <div v-if="shoppingStore.totalCount === 0" class="text-center py-20">
      <ShoppingBag class="w-20 h-20 text-gray-200 mx-auto mb-4" />
      <h3 class="text-xl font-semibold text-gray-600 mb-2">购物清单是空的</h3>
      <p class="text-gray-400 mb-6">浏览食谱，将需要的食材加入清单</p>
      <router-link to="/" class="btn-primary">
        浏览食谱
      </router-link>
    </div>

    <div v-if="shoppingStore.totalCount > 0" class="mt-8 flex gap-4">
      <button 
        @click="showAddForm = true"
        class="btn-secondary flex-1 flex items-center justify-center"
      >
        <Plus class="w-5 h-5 mr-2" />
        添加食材
      </button>
      <button 
        @click="shoppingStore.clearAll"
        class="btn-ghost text-red-500 hover:bg-red-50"
      >
        清空全部
      </button>
    </div>

    <div 
      v-if="showAddForm" 
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="showAddForm = false"
    >
      <div class="bg-white rounded-3xl p-6 w-full max-w-md animate-slide-up">
        <h3 class="text-xl font-bold text-gray-800 mb-6">添加食材</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">食材名称</label>
            <input
              v-model="newItem.name"
              type="text"
              class="input-field"
              placeholder="例如：鸡蛋"
              list="ingredient-suggestions"
            />
            <datalist id="ingredient-suggestions">
              <option v-for="s in suggestions" :key="s" :value="s" />
            </datalist>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">数量</label>
              <input
                v-model.number="newItem.quantity"
                type="number"
                min="1"
                class="input-field"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">单位</label>
              <select v-model="newItem.unit" class="input-field">
                <option v-for="u in units" :key="u" :value="u">{{ u }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="flex gap-4 mt-8">
          <button 
            @click="showAddForm = false"
            class="btn-ghost flex-1"
          >
            取消
          </button>
          <button 
            @click="addNewItem"
            class="btn-primary flex-1"
            :disabled="!newItem.name"
          >
            添加
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ShoppingCart, ShoppingBag, Plus, Minus, Trash2, CheckCircle } from 'lucide-vue-next'
import { useShoppingStore } from '@/stores/shopping'
import { ingredientSuggestions } from '@/mocks/data'

const shoppingStore = useShoppingStore()

const showAddForm = ref(false)
const suggestions = ingredientSuggestions
const units = ['克', '个', '毫升', '勺', '片', '把', '适量']

const newItem = ref({
  name: '',
  quantity: 1,
  unit: '克'
})

function updateQuantity(id: string, delta: number) {
  const item = shoppingStore.items.find(i => i.id === id)
  if (item) {
    shoppingStore.updateQuantity(id, item.quantity + delta)
  }
}

function addNewItem() {
  if (!newItem.value.name) return
  
  shoppingStore.addItem({
    name: newItem.value.name,
    quantity: newItem.value.quantity,
    unit: newItem.value.unit
  })
  
  newItem.value = {
    name: '',
    quantity: 1,
    unit: '克'
  }
  showAddForm.value = false
}
</script>
