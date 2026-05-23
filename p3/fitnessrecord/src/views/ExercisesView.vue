<script setup lang="ts">
import { ref, computed } from 'vue';
import { Dumbbell, Heart, Wind, Search } from 'lucide-vue-next';
import { useExercisesStore } from '@/stores/exercises';

const exercisesStore = useExercisesStore();

const searchQuery = ref('');
const activeFilter = ref<string>('all');

const filters = [
  { id: 'all', label: '全部' },
  { id: 'strength', label: '力量' },
  { id: 'cardio', label: '有氧' },
  { id: 'flexibility', label: '柔韧' }
];

const muscleGroupLabels: Record<string, string> = {
  chest: '胸部',
  back: '背部',
  shoulders: '肩部',
  arms: '手臂',
  legs: '腿部',
  core: '核心',
  cardio: '心肺',
  fullbody: '全身'
};

const typeIcons: Record<string, any> = {
  strength: Dumbbell,
  cardio: Heart,
  flexibility: Wind
};

const typeColors: Record<string, string> = {
  strength: 'text-emerald-400 bg-emerald-500/20',
  cardio: 'text-red-400 bg-red-500/20',
  flexibility: 'text-blue-400 bg-blue-500/20'
};

const filteredExercises = computed(() => {
  let exercises = exercisesStore.allExercises;
  
  if (activeFilter.value !== 'all') {
    exercises = exercises.filter(e => e.type === activeFilter.value);
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    exercises = exercises.filter(e => 
      e.name.toLowerCase().includes(query) ||
      muscleGroupLabels[e.muscleGroup]?.includes(query)
    );
  }
  
  return exercises;
});
</script>

<template>
  <div class="min-h-screen bg-gray-950 pb-20">
    <div class="px-4 pt-8 pb-4">
      <h1 class="text-2xl font-bold text-white mb-6">动作库</h1>

      <div class="relative mb-6">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索动作..."
          class="w-full bg-gray-900 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>

      <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          v-for="filter in filters"
          :key="filter.id"
          @click="activeFilter = filter.id"
          class="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200"
          :class="[
            activeFilter === filter.id
              ? 'bg-emerald-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          ]"
        >
          {{ filter.label }}
        </button>
      </div>

      <div class="space-y-3">
        <div
          v-for="exercise in filteredExercises"
          :key="exercise.id"
          class="bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-gray-700 transition-colors"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center"
              :class="typeColors[exercise.type]"
            >
              <component :is="typeIcons[exercise.type]" class="w-6 h-6" />
            </div>
            <div class="flex-1">
              <h3 class="text-white font-medium">{{ exercise.name }}</h3>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                  {{ muscleGroupLabels[exercise.muscleGroup] || exercise.muscleGroup }}
                </span>
              </div>
            </div>
          </div>
          <p v-if="exercise.description" class="text-gray-400 text-sm mt-3">
            {{ exercise.description }}
          </p>
        </div>
      </div>

      <div v-if="filteredExercises.length === 0" class="text-center py-12">
        <Dumbbell class="w-16 h-16 text-gray-700 mx-auto mb-4" />
        <p class="text-gray-500">没有找到相关动作</p>
      </div>
    </div>
  </div>
</template>
