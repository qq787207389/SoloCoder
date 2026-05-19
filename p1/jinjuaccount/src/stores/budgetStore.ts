import { defineStore } from 'pinia'
import type { Budget } from '@/types'

interface BudgetState {
  budgets: Budget[]
  notifiedBudgets: Set<string>
}

const STORAGE_KEY = 'jinju_budgets'

export const useBudgetStore = defineStore('budget', {
  state: (): BudgetState => ({
    budgets: [],
    notifiedBudgets: new Set(),
  }),

  getters: {
    getBookBudgets: (state) => (bookId: string) => {
      return state.budgets.filter((b) => b.bookId === bookId)
    },

    getOverBudgetCategories: (state) => (bookId: string) => {
      return state.budgets.filter(
        (b) => b.bookId === bookId && b.spent / b.amount > b.threshold / 100
      )
    },
  },

  actions: {
    initBudgets() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const data = JSON.parse(saved)
          this.budgets = data.budgets || []
        }
      } catch (e) {
        console.error('Failed to load budgets:', e)
      }
    },

    saveState() {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          budgets: this.budgets,
        })
      )
    },

    addBudget(budget: Omit<Budget, 'id'>) {
      const newBudget: Budget = {
        ...budget,
        id: crypto.randomUUID(),
      }
      this.budgets.push(newBudget)
      this.saveState()
      return newBudget
    },

    updateBudget(id: string, updates: Partial<Budget>) {
      const index = this.budgets.findIndex((b) => b.id === id)
      if (index !== -1) {
        this.budgets[index] = { ...this.budgets[index], ...updates }
        this.saveState()
      }
    },

    deleteBudget(id: string) {
      const index = this.budgets.findIndex((b) => b.id === id)
      if (index !== -1) {
        this.budgets.splice(index, 1)
        this.saveState()
      }
    },

    updateSpent(bookId: string, categoryId: string, amount: number, isExpense: boolean) {
      const budget = this.budgets.find(
        (b) =>
          b.bookId === bookId && b.categoryId === categoryId
      )
      if (budget) {
        if (isExpense) {
          budget.spent += amount
        } else {
          budget.spent = Math.max(0, budget.spent - amount)
        }
        this.checkBudgetWarning(budget)
        this.saveState()
      }
    },

    checkBudgetWarning(budget: Budget) {
      const percentage = budget.spent / budget.amount
      const threshold = budget.threshold / 100

      if (percentage >= threshold && !this.notifiedBudgets.has(budget.id)) {
        this.showNotification(budget)
        this.notifiedBudgets.add(budget.id)
      }
    },

    showNotification(budget: Budget) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('⚠️ 预算预警', {
          body: `${budget.categoryName} 已使用 ${(budget.spent / budget.amount * 100).toFixed(1)}%`,
          icon: '/favicon.ico',
        })
      }
    },

    requestNotificationPermission() {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
      }
    },

    clearNotified() {
      this.notifiedBudgets.clear()
    },
  },
})
