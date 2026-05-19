import { defineStore } from 'pinia'
import type { AccountBook } from '@/types'
import { useUndoRedo } from '@/composables/useUndoRedo'

interface BookState {
  books: AccountBook[]
  currentBookId: string | null
  loading: boolean
}

const STORAGE_KEY = 'jinju_books'

export const useBookStore = defineStore('book', {
  state: (): BookState => ({
    books: [],
    currentBookId: null,
    loading: false,
  }),

  getters: {
    currentBook: (state) => {
      return state.books.find((book) => book.id === state.currentBookId) || null
    },
    bookCount: (state) => state.books.length,
  },

  actions: {
    initBooks() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const data = JSON.parse(saved)
          this.books = data.books || []
          this.currentBookId = data.currentBookId || (this.books[0]?.id || null)
        }
      } catch (e) {
        console.error('Failed to load books:', e)
      }
    },

    saveBooks() {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          books: this.books,
          currentBookId: this.currentBookId,
        })
      )
    },

    setCurrentBook(bookId: string) {
      this.currentBookId = bookId
      this.saveBooks()
    },

    addBook(book: Omit<AccountBook, 'id' | 'createdAt' | 'updatedAt'>) {
      const newBook: AccountBook = {
        ...book,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      this.books.push(newBook)
      if (!this.currentBookId) {
        this.currentBookId = newBook.id
      }
      this.saveBooks()
      return newBook
    },

    updateBook(bookId: string, updates: Partial<AccountBook>) {
      const index = this.books.findIndex((b) => b.id === bookId)
      if (index !== -1) {
        this.books[index] = {
          ...this.books[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        }
        this.saveBooks()
      }
    },

    deleteBook(bookId: string) {
      const index = this.books.findIndex((b) => b.id === bookId)
      if (index !== -1) {
        this.books.splice(index, 1)
        if (this.currentBookId === bookId) {
          this.currentBookId = this.books[0]?.id || null
        }
        this.saveBooks()
      }
    },
  },
})
