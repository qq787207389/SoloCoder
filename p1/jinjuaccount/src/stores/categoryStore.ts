import { defineStore } from 'pinia'
import type { Category } from '@/types'

interface CategoryState {
  categories: Category[]
}

const STORAGE_KEY = 'jinju_categories'

const defaultCategories: Omit<Category, 'id'>[] = [
  { name: '餐饮', parentId: null, type: 'expense', icon: 'Food', color: '#F56C6C', level: 1 },
  { name: '早午餐', parentId: '餐饮', type: 'expense', icon: 'Sunny', color: '#E6A23C', level: 2 },
  { name: '晚餐', parentId: '餐饮', type: 'expense', icon: 'Moon', color: '#67C23A', level: 2 },
  { name: '交通', parentId: null, type: 'expense', icon: 'Van', color: '#409EFF', level: 1 },
  { name: '购物', parentId: null, type: 'expense', icon: 'ShoppingCart', color: '#909399', level: 1 },
  { name: '娱乐', parentId: null, type: 'expense', icon: 'Film', color: '#E6A23C', level: 1 },
  { name: '居住', parentId: null, type: 'expense', icon: 'HomeFilled', color: '#67C23A', level: 1 },
  { name: '医疗', parentId: null, type: 'expense', icon: 'MedicineBox', color: '#F56C6C', level: 1 },
  { name: '教育', parentId: null, type: 'expense', icon: 'Reading', color: '#409EFF', level: 1 },
  { name: '工资', parentId: null, type: 'income', icon: 'Wallet', color: '#67C23A', level: 1 },
  { name: '奖金', parentId: null, type: 'income', icon: 'Trophy', color: '#E6A23C', level: 1 },
  { name: '投资', parentId: null, type: 'income', icon: 'TrendCharts', color: '#409EFF', level: 1 },
  { name: '兼职', parentId: null, type: 'income', icon: 'Briefcase', color: '#909399', level: 1 },
]

export const useCategoryStore = defineStore('category', {
  state: (): CategoryState => ({
    categories: [],
  }),

  getters: {
    expenseCategories: (state) => state.categories.filter((c) => c.type === 'expense'),
    incomeCategories: (state) => state.categories.filter((c) => c.type === 'income'),
    rootCategories: (state) => state.categories.filter((c) => c.level === 1),

    getCategoryTree: (state) => {
      const buildTree = (parentId: string | null, type: 'income' | 'expense'): Category[] => {
        return state.categories
          .filter((c) => c.parentId === parentId && c.type === type)
          .map((c) => ({
            ...c,
            children: buildTree(c.id, type),
          }))
      }
      return (type: 'income' | 'expense') => buildTree(null, type)
    },

    getSubCategories: (state) => (parentId: string) => {
      return state.categories.filter((c) => c.parentId === parentId)
    },

    getCategoryById: (state) => (id: string) => {
      return state.categories.find((c) => c.id === id)
    },
  },

  actions: {
    initCategories() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const data = JSON.parse(saved)
          this.categories = data.categories || []
        }

        if (this.categories.length === 0) {
          this.categories = defaultCategories.map((c) => ({
            ...c,
            id: c.name,
          }))
          this.saveState()
        }
      } catch (e) {
        console.error('Failed to load categories:', e)
      }
    },

    saveState() {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          categories: this.categories,
        })
      )
    },

    addCategory(category: Omit<Category, 'id'>) {
      const newCategory: Category = {
        ...category,
        id: crypto.randomUUID(),
      }
      this.categories.push(newCategory)
      this.saveState()
      return newCategory
    },

    updateCategory(id: string, updates: Partial<Category>) {
      const index = this.categories.findIndex((c) => c.id === id)
      if (index !== -1) {
        this.categories[index] = { ...this.categories[index], ...updates }
        this.saveState()
      }
    },

    deleteCategory(id: string) {
      const index = this.categories.findIndex((c) => c.id === id)
      if (index !== -1) {
        this.categories.splice(index, 1)
        this.categories = this.categories.filter((c) => c.parentId !== id)
        this.saveState()
      }
    },
  },
})
