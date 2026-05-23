import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task } from '@/types'
import { generateId, getTodayDateString } from '@/utils/time'

const STORAGE_KEY = 'tongzhuo-tasks'

function loadTasks(): Task[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const tasks = JSON.parse(stored) as Task[]
      const today = getTodayDateString()
      return tasks.filter(task => {
        const taskDate = new Date(task.createdAt).toISOString().split('T')[0]
        return taskDate === today || !task.completed
      })
    }
  } catch (e) {
    console.error('Failed to load tasks:', e)
  }
  return []
}

function saveTasks(tasks: Task[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch (e) {
    console.error('Failed to save tasks:', e)
  }
}

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>(loadTasks())

  const todayTasks = computed(() => {
    const today = getTodayDateString()
    return tasks.value.filter(task => {
      const taskDate = new Date(task.createdAt).toISOString().split('T')[0]
      return taskDate === today
    })
  })

  const completedCount = computed(() => 
    todayTasks.value.filter(t => t.completed).length
  )

  function addTask(title: string) {
    const task: Task = {
      id: generateId(),
      title: title.trim(),
      completed: false,
      createdAt: Date.now()
    }
    tasks.value.unshift(task)
    saveTasks(tasks.value)
  }

  function toggleTask(id: string) {
    const task = tasks.value.find(t => t.id === id)
    if (task) {
      task.completed = !task.completed
      task.completedAt = task.completed ? Date.now() : undefined
      saveTasks(tasks.value)
    }
  }

  function deleteTask(id: string) {
    tasks.value = tasks.value.filter(t => t.id !== id)
    saveTasks(tasks.value)
  }

  function updateTaskTitle(id: string, title: string) {
    const task = tasks.value.find(t => t.id === id)
    if (task) {
      task.title = title.trim()
      saveTasks(tasks.value)
    }
  }

  function clearCompletedTasks() {
    tasks.value = tasks.value.filter(t => !t.completed)
    saveTasks(tasks.value)
  }

  return {
    tasks,
    todayTasks,
    completedCount,
    addTask,
    toggleTask,
    deleteTask,
    updateTaskTitle,
    clearCompletedTasks
  }
})
