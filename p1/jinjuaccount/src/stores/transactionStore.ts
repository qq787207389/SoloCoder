import { defineStore } from 'pinia'
import type { Transaction, TransactionFilters, HistoryState, FilterView } from '@/types'

interface TransactionState {
  transactions: HistoryState<Transaction[]>
  filters: TransactionFilters
  filterViews: FilterView[]
  loading: boolean
}

const STORAGE_KEY = 'jinju_transactions'
const MAX_HISTORY = 50

function createHistoryState<T>(initial: T): HistoryState<T> {
  return {
    past: [],
    present: initial,
    future: [],
  }
}

export const useTransactionStore = defineStore('transaction', {
  state: (): TransactionState => ({
    transactions: createHistoryState<Transaction[]>([]),
    filters: {},
    filterViews: [],
    loading: false,
  }),

  getters: {
    currentTransactions: (state) => state.transactions.present,

    filteredTransactions: (state) => {
      let result = [...state.transactions.present]

      if (state.filters.bookId) {
        result = result.filter((t) => t.bookId === state.filters.bookId)
      }

      if (state.filters.type) {
        result = result.filter((t) => t.type === state.filters.type)
      }

      if (state.filters.categoryId) {
        result = result.filter((t) => t.categoryId === state.filters.categoryId)
      }

      if (state.filters.minAmount !== undefined) {
        result = result.filter((t) => t.baseAmount >= state.filters.minAmount!)
      }

      if (state.filters.maxAmount !== undefined) {
        result = result.filter((t) => t.baseAmount <= state.filters.maxAmount!)
      }

      if (state.filters.startDate) {
        result = result.filter((t) => t.date >= state.filters.startDate!)
      }

      if (state.filters.endDate) {
        result = result.filter((t) => t.date <= state.filters.endDate!)
      }

      if (state.filters.keyword) {
        const keyword = state.filters.keyword.toLowerCase()
        result = result.filter(
          (t) =>
            t.note.toLowerCase().includes(keyword) ||
            t.categoryName.toLowerCase().includes(keyword)
        )
      }

      if (state.filters.tags && state.filters.tags.length > 0) {
        result = result.filter((t) =>
          state.filters.tags!.some((tag) => t.tags.includes(tag))
        )
      }

      return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    },

    canUndo: (state) => state.transactions.past.length > 0,
    canRedo: (state) => state.transactions.future.length > 0,
  },

  actions: {
    initTransactions() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const data = JSON.parse(saved)
          this.transactions.present = data.transactions || []
          this.filterViews = data.filterViews || []
        }
      } catch (e) {
        console.error('Failed to load transactions:', e)
      }
    },

    saveState() {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          transactions: this.transactions.present,
          filterViews: this.filterViews,
        })
      )
    },

    saveAndNotify() {
      this.saveState()
      if (this.transactions.past.length > MAX_HISTORY) {
        this.transactions.past.shift()
      }
    },

    addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) {
      const newTransaction: Transaction = {
        ...transaction,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      this.transactions.past.push([...this.transactions.present])
      this.transactions.present.push(newTransaction)
      this.transactions.future = []
      this.saveAndNotify()
      return newTransaction
    },

    addTransactions(
      transactions: Array<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>
    ) {
      const newTransactions = transactions.map((t) => ({
        ...t,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))

      this.transactions.past.push([...this.transactions.present])
      this.transactions.present.push(...newTransactions)
      this.transactions.future = []
      this.saveAndNotify()
      return newTransactions
    },

    updateTransaction(id: string, updates: Partial<Transaction>) {
      const index = this.transactions.present.findIndex((t) => t.id === id)
      if (index !== -1) {
        this.transactions.past.push([...this.transactions.present])
        this.transactions.present[index] = {
          ...this.transactions.present[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        }
        this.transactions.future = []
        this.saveAndNotify()
      }
    },

    deleteTransaction(id: string) {
      const index = this.transactions.present.findIndex((t) => t.id === id)
      if (index !== -1) {
        this.transactions.past.push([...this.transactions.present])
        this.transactions.present.splice(index, 1)
        this.transactions.future = []
        this.saveAndNotify()
      }
    },

    undo() {
      if (this.canUndo) {
        const previous = this.transactions.past.pop()!
        this.transactions.future.unshift([...this.transactions.present])
        this.transactions.present = previous
        this.saveState()
      }
    },

    redo() {
      if (this.canRedo) {
        const next = this.transactions.future.shift()!
        this.transactions.past.push([...this.transactions.present])
        this.transactions.present = next
        this.saveState()
      }
    },

    setFilters(filters: TransactionFilters) {
      this.filters = { ...filters }
    },

    saveFilterView(name: string) {
      const view: FilterView = {
        id: crypto.randomUUID(),
        name,
        filters: { ...this.filters },
        createdAt: new Date().toISOString(),
      }
      this.filterViews.push(view)
      this.saveState()
      return view
    },

    deleteFilterView(id: string) {
      const index = this.filterViews.findIndex((v) => v.id === id)
      if (index !== -1) {
        this.filterViews.splice(index, 1)
        this.saveState()
      }
    },

    importTransactions(transactions: Transaction[]) {
      this.transactions.past.push([...this.transactions.present])
      this.transactions.present.push(...transactions)
      this.transactions.future = []
      this.saveAndNotify()
    },

    clearBookTransactions(bookId: string) {
      this.transactions.past.push([...this.transactions.present])
      this.transactions.present = this.transactions.present.filter(
        (t) => t.bookId !== bookId
      )
      this.transactions.future = []
      this.saveAndNotify()
    },
  },
})
