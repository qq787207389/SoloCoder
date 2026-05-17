import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Book } from '@/types'
import { bookDB } from '@/utils/db'
import { getEmbedding, recommendBooks, simpleCollaborativeFiltering } from '@/utils/ai'
import { buildBookIndex, searchBooks, addBookToIndex, updateBookInIndex } from '@/utils/search'

export const useBookStore = defineStore('book', () => {
  const books = ref<Book[]>([])
  const loading = ref(false)
  const currentBook = ref<Book | null>(null)

  const wantToRead = computed(() => 
    books.value.filter(b => b.readStatus === 'want')
  )

  const reading = computed(() => 
    books.value.filter(b => b.readStatus === 'reading')
  )

  const finished = computed(() => 
    books.value.filter(b => b.readStatus === 'finished')
  )

  const allTags = computed(() => {
    const tagSet = new Set<string>()
    books.value.forEach(book => book.tags.forEach(tag => tagSet.add(tag)))
    return Array.from(tagSet)
  })

  async function loadBooks() {
    loading.value = true
    try {
      books.value = await bookDB.getAll()
      buildBookIndex(books.value)
    } finally {
      loading.value = false
    }
  }

  async function addBook(book: Omit<Book, 'id' | 'addedAt' | 'embedding'>) {
    const newBook: Book = {
      ...book,
      id: crypto.randomUUID(),
      addedAt: Date.now()
    }

    try {
      const embedding = await getEmbedding(
        `${newBook.title} ${newBook.author} ${newBook.description} ${newBook.tags.join(' ')}`
      )
      newBook.embedding = Array.from(embedding)
    } catch (e) {
      console.error('Failed to generate embedding:', e)
    }

    const bookToSave = JSON.parse(JSON.stringify(newBook))
    await bookDB.add(bookToSave)
    books.value.push(newBook)
    addBookToIndex(newBook)
    return newBook
  }

  async function updateBook(book: Book) {
    const index = books.value.findIndex(b => b.id === book.id)
    if (index !== -1) {
      try {
        const embedding = await getEmbedding(
          `${book.title} ${book.author} ${book.description} ${book.tags.join(' ')}`
        )
        book.embedding = Array.from(embedding)
      } catch (e) {
        console.error('Failed to generate embedding:', e)
      }
      
      books.value[index] = book
      const bookToSave = JSON.parse(JSON.stringify(book))
      await bookDB.update(bookToSave)
      updateBookInIndex(book)
    }
  }

  async function deleteBook(id: string) {
    books.value = books.value.filter(b => b.id !== id)
    await bookDB.delete(id)
  }

  function getBookById(id: string) {
    return books.value.find(b => b.id === id)
  }

  function search(query: string): Book[] {
    const ids = searchBooks(query)
    return ids.map(id => books.value.find(b => b.id === id)!).filter(Boolean)
  }

  function getRecommendationsForBook(bookId: string, topK: number = 5): Book[] {
    const book = books.value.find(b => b.id === bookId)
    if (!book) return []
    return recommendBooks(book, books.value, topK)
  }

  function getPersonalizedRecommendations(topK: number = 5): Book[] {
    const userBooks = books.value.filter(b => b.readStatus === 'finished' || b.readStatus === 'reading')
    return simpleCollaborativeFiltering(userBooks, books.value, topK)
  }

  function setCurrentBook(book: Book | null) {
    currentBook.value = book
  }

  return {
    books,
    loading,
    currentBook,
    wantToRead,
    reading,
    finished,
    allTags,
    loadBooks,
    addBook,
    updateBook,
    deleteBook,
    getBookById,
    search,
    getRecommendationsForBook,
    getPersonalizedRecommendations,
    setCurrentBook
  }
})
