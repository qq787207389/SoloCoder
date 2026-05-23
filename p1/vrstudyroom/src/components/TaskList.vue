<script setup lang="ts">
import { ref } from 'vue'
import { Plus, ListTodo } from 'lucide-vue-next'
import { useTaskStore } from '@/stores/task'
import TaskItem from './TaskItem.vue'

const taskStore = useTaskStore()
const newTaskTitle = ref('')
const isAdding = ref(false)

function addTask() {
  if (newTaskTitle.value.trim()) {
    taskStore.addTask(newTaskTitle.value)
    newTaskTitle.value = ''
  }
  isAdding.value = false
}

function startAdding() {
  isAdding.value = true
  newTaskTitle.value = ''
}
</script>

<template>
  <div class="bg-card rounded-xl p-5 shadow-sm border border-border h-full flex flex-col">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <ListTodo class="w-5 h-5 text-primary" />
        <h2 class="text-lg font-medium text-foreground">今日任务</h2>
        <span class="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {{ taskStore.completedCount }}/{{ taskStore.todayTasks.length }}
        </span>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto space-y-2 pr-1 -mr-1">
      <TaskItem 
        v-for="task in taskStore.todayTasks" 
        :key="task.id" 
        :task="task" 
      />
      
      <div v-if="taskStore.todayTasks.length === 0" class="text-center py-8 text-muted-foreground">
        <p class="text-sm">还没有任务，添加一个开始吧</p>
      </div>
    </div>

    <div class="mt-4 pt-4 border-t border-border">
      <div v-if="isAdding" class="flex gap-2">
        <input 
          v-model="newTaskTitle"
          @keyup.enter="addTask"
          @keyup.escape="isAdding = false"
          placeholder="输入任务名称..."
          class="flex-1 px-3 py-2 bg-muted rounded-lg border-none outline-none text-sm text-foreground placeholder-muted-foreground"
          autofocus
        />
        <button 
          @click="addTask"
          class="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          添加
        </button>
      </div>
      <button 
        v-else
        @click="startAdding"
        class="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-muted text-muted-foreground rounded-lg text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        <Plus class="w-4 h-4" />
        添加新任务
      </button>
    </div>
  </div>
</template>
