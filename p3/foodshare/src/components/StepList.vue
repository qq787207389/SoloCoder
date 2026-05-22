<template>
  <div class="bg-white rounded-2xl p-6 shadow-md">
    <h3 class="font-serif font-bold text-xl text-gray-800 mb-6 flex items-center">
      <ListOrdered class="w-5 h-5 mr-2 text-primary-500" />
      烹饪步骤
    </h3>

    <div class="space-y-6">
      <div 
        v-for="step in steps" 
        :key="step.id"
        class="flex gap-4"
      >
        <div class="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
          {{ step.order }}
        </div>
        <div class="flex-1">
          <p class="text-gray-700 leading-relaxed mb-3">{{ step.description }}</p>
          <div v-if="step.image" class="relative rounded-xl overflow-hidden">
            <img 
              :src="step.image" 
              :alt="`步骤${step.order}`"
              class="w-full max-w-md object-cover rounded-xl"
              loading="lazy"
            />
          </div>
          <div v-if="step.duration" class="flex items-center mt-2 text-sm text-gray-500">
            <Clock class="w-4 h-4 mr-1" />
            约 {{ step.duration }} 分钟
          </div>
        </div>
      </div>
    </div>

    <div v-if="steps.length === 0" class="text-center py-8 text-gray-400">
      暂无步骤
    </div>
  </div>
</template>

<script setup lang="ts">
import { ListOrdered, Clock } from 'lucide-vue-next'
import type { CookingStep } from '@/types'

defineProps<{
  steps: CookingStep[]
}>()
</script>
