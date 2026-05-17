import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { Book, Note, ReadingRecord, Achievement, UserSettings } from '@/types'

interface WisdomReadDB extends DBSchema {
  books: {
    key: string
    value: Book
    indexes: { 'by-isbn': string; 'by-status': string; 'by-tags': string }
  }
  notes: {
    key: string
    value: Note
    indexes: { 'by-book': string; 'by-tags': string; 'by-date': number }
  }
  readingRecords: {
    key: string
    value: ReadingRecord
    indexes: { 'by-date': string; 'by-book': string }
  }
  achievements: {
    key: string
    value: Achievement
  }
  settings: {
    key: string
    value: UserSettings
  }
}

const DB_NAME = 'wisdomread-db'
const DB_VERSION = 1

let db: IDBPDatabase<WisdomReadDB> | null = null

export async function initDB() {
  if (db) return db

  db = await openDB<WisdomReadDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const booksStore = db.createObjectStore('books', { keyPath: 'id' })
      booksStore.createIndex('by-isbn', 'isbn', { unique: false })
      booksStore.createIndex('by-status', 'readStatus', { unique: false })

      const notesStore = db.createObjectStore('notes', { keyPath: 'id' })
      notesStore.createIndex('by-book', 'bookId', { unique: false })
      notesStore.createIndex('by-date', 'updatedAt', { unique: false })

      const recordsStore = db.createObjectStore('readingRecords', { keyPath: 'id' })
      recordsStore.createIndex('by-date', 'date', { unique: false })
      recordsStore.createIndex('by-book', 'bookId', { unique: false })

      db.createObjectStore('achievements', { keyPath: 'id' })
      db.createObjectStore('settings', { keyPath: 'id' })
    }
  })

  return db
}

export async function getDB() {
  if (!db) await initDB()
  return db!
}

export const bookDB = {
  async getAll(): Promise<Book[]> {
    const db = await getDB()
    return db.getAll('books')
  },

  async getById(id: string): Promise<Book | undefined> {
    const db = await getDB()
    return db.get('books', id)
  },

  async add(book: Book): Promise<string> {
    const db = await getDB()
    return db.add('books', book)
  },

  async update(book: Book): Promise<string> {
    const db = await getDB()
    return db.put('books', book)
  },

  async delete(id: string): Promise<void> {
    const db = await getDB()
    return db.delete('books', id)
  },

  async getByStatus(status: Book['readStatus']): Promise<Book[]> {
    const db = await getDB()
    return db.getAllFromIndex('books', 'by-status', status)
  }
}

export const noteDB = {
  async getAll(): Promise<Note[]> {
    const db = await getDB()
    return db.getAll('notes')
  },

  async getById(id: string): Promise<Note | undefined> {
    const db = await getDB()
    return db.get('notes', id)
  },

  async getByBookId(bookId: string): Promise<Note[]> {
    const db = await getDB()
    return db.getAllFromIndex('notes', 'by-book', bookId)
  },

  async add(note: Note): Promise<string> {
    const db = await getDB()
    return db.add('notes', note)
  },

  async update(note: Note): Promise<string> {
    const db = await getDB()
    return db.put('notes', note)
  },

  async delete(id: string): Promise<void> {
    const db = await getDB()
    return db.delete('notes', id)
  }
}

export const recordDB = {
  async getAll(): Promise<ReadingRecord[]> {
    const db = await getDB()
    return db.getAll('readingRecords')
  },

  async getByDate(date: string): Promise<ReadingRecord[]> {
    const db = await getDB()
    return db.getAllFromIndex('readingRecords', 'by-date', date)
  },

  async add(record: ReadingRecord): Promise<string> {
    const db = await getDB()
    return db.add('readingRecords', record)
  }
}

export const settingsDB = {
  async get(): Promise<UserSettings | undefined> {
    const db = await getDB()
    return db.get('settings', 'default')
  },

  async update(settings: UserSettings): Promise<string> {
    const db = await getDB()
    return db.put('settings', { ...settings, id: 'default' })
  }
}

export const achievementDB = {
  async getAll(): Promise<Achievement[]> {
    const db = await getDB()
    return db.getAll('achievements')
  },

  async add(achievement: Achievement): Promise<string> {
    const db = await getDB()
    return db.put('achievements', achievement)
  },

  async update(achievement: Achievement): Promise<string> {
    const db = await getDB()
    return db.put('achievements', achievement)
  }
}
