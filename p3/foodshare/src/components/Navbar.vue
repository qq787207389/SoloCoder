<template>
  <nav class="bg-white shadow-md sticky top-0 z-50">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <router-link to="/" class="flex items-center space-x-2">
          <span class="text-2xl">🍳</span>
          <span class="text-xl font-bold text-primary-600 font-serif">食记</span>
        </router-link>

        <div class="hidden md:flex items-center space-x-6">
          <router-link 
            to="/" 
            class="text-gray-700 hover:text-primary-500 transition-colors font-medium"
          >
            首页
          </router-link>
          <router-link 
            to="/create" 
            class="text-gray-700 hover:text-primary-500 transition-colors font-medium"
          >
            创建食谱
          </router-link>
        </div>

        <div class="flex items-center space-x-4">
          <router-link to="/shopping" class="relative p-2 text-gray-700 hover:text-primary-500 transition-colors">
            <ShoppingBag class="w-6 h-6" />
            <span 
              v-if="shoppingStore.pendingCount > 0"
              class="absolute -top-1 -right-1 bg-primary-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
            >
              {{ shoppingStore.pendingCount }}
            </span>
          </router-link>
          <router-link to="/profile" class="p-2 text-gray-700 hover:text-primary-500 transition-colors">
            <User class="w-6 h-6" />
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ShoppingBag, User } from 'lucide-vue-next'
import { useShoppingStore } from '@/stores/shopping'

const shoppingStore = useShoppingStore()
</script>
