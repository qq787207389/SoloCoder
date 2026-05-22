<template>
  <div class="bg-white rounded-2xl p-6 shadow-md">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-serif font-bold text-xl text-gray-800 flex items-center">
        <ShoppingBag class="w-5 h-5 mr-2 text-primary-500" />
        食材清单
      </h3>
      <button 
        v-if="showAddButton"
        @click="$emit('add-all')"
        class="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
      >
        <Plus class="w-4 h-4 mr-1" />
        加入购物清单
      </button>
    </div>

    <div class="space-y-2">
      <div 
        v-for="ingredient in ingredients" 
        :key="ingredient.id"
        class="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors"
        :class="{ 'bg-gray-50': ingredient.checked }"
      >
        <input
          v-if="checkable"
          type="checkbox"
          :checked="ingredient.checked"
          @change="$emit('toggle', ingredient.id)"
          class="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-400 mr-3 cursor-pointer"
        />
        <span 
          class="flex-1 text-gray-700"
          :class="{ 'line-through text-gray-400': ingredient.checked }"
        >
          {{ ingredient.name }}
        </span>
        <span class="text-gray-500 text-sm">
          {{ ingredient.quantity }} {{ ingredient.unit }}
        </span>
      </div>
    </div>

    <div v-if="ingredients.length === 0" class="text-center py-8 text-gray-400">
      暂无食材
    </div>
  </div>
</template>

<script setup lang="ts">
import { ShoppingBag, Plus } from 'lucide-vue-next'
import type { Ingredient } from '@/types'

defineProps<{
  ingredients: Ingredient[]
  checkable?: boolean
  showAddButton?: boolean
}>()

defineEmits<{
  (e: 'toggle', id: string): void
  (e: 'add-all'): void
}>()
</script>
