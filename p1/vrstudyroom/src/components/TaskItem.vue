<script setup lang="ts">
import { ref } from 'vue'
import { Trash2, Pencil, Check } from 'lucide-vue-next'
import type { Task } from '@/types'
import { useTaskStore } from '@/stores/task'
import { useAppStore } from '@/stores/app'
import { useStatisticsStore } from '@/stores/statistics'

const props = defineProps<{
  task: Task
}>()

const taskStore = useTaskStore()
const appStore = useAppStore()
const statisticsStore = useStatisticsStore()

const isEditing = ref(false)
const editTitle = ref(props.task.title)

function toggleComplete() {
  const wasCompleted = props.task.completed
  taskStore.toggleTask(props.task.id)
  if (!wasCompleted) {
    appStore.triggerConfetti()
    statisticsStore.incrementCompletedTasks()
  }
}

function startEditing() {
  isEditing.value = true
  editTitle.value = props.task.title
}

function saveEdit() {
  if (editTitle.value.trim()) {
    taskStore.updateTaskTitle(props.task.id, editTitle.value)
  }
  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
  editTitle.value = props.task.title
}

function deleteTask() {
  taskStore.deleteTask(props.task.id)
}
</script>

<template>
  <div 
    class="group flex items-center gap-3 p-3 bg-card rounded-lg border border-border transition-all duration-300 hover:shadow-sm"
    :class="{ 'opacity-60': task.completed }"
  >
    <input 
      type="checkbox" 
      :checked="task.completed"
      @change="toggleComplete"
      class="custom-checkbox flex-shrink-0"
    />
    
    <div v-if="isEditing" class="flex-1 flex items-center gap-2">
      <input 
        v-model="editTitle"
        @keyup.enter="saveEdit"
        @keyup.escape="cancelEdit"
        @blur="saveEdit"
        class="flex-1 px-2 py-1 bg-muted rounded border-none outline-none text-foreground"
        autofocus
      />
      <button @click="saveEdit" class="p-1 text-primary hover:bg-muted rounded">
        <Check class="w-4 h-4" />
      </button>
    </div>
    
    <div v-else class="flex-1 flex items-center justify-between min-w-0">
      <span 
        class="text-sm text-foreground truncate transition-all"
        :class="{ 'line-through text-muted-foreground': task.completed }"
      >
        {{ task.title }}
      </span>
      <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          @click="startEditing"
          class="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
        >
          <Pencil class="w-3.5 h-3.5" />
        </button>
        <button 
          @click="deleteTask"
          class="p-1.5 text-muted-foreground hover:text-secondary hover:bg-muted rounded transition-colors"
        >
          <Trash2 class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>
