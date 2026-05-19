import { ref } from 'vue'
import { openDB } from 'idb'

let dbInstance: any = null

async function getDB(): Promise<any> {
  if (!dbInstance) {
    dbInstance = await openDB('huabanji-db', 1, {
      upgrade(db: any) {
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('edits')) {
          const editStore = db.createObjectStore('edits', { keyPath: 'id' })
          editStore.createIndex('imageId', 'imageId', { unique: false })
        }
        if (!db.objectStoreNames.contains('searchHistory')) {
          db.createObjectStore('searchHistory', { keyPath: 'query' })
        }
      },
    })
  }
  return dbInstance
}

export function useIndexedDB() {
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  async function saveImage(id: string, data: string): Promise<void> {
    try {
      isLoading.value = true
      const db = await getDB()
      await db.put('images', { id, data, createdAt: new Date() })
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function getImage(id: string): Promise<string | undefined> {
    try {
      isLoading.value = true
      const db = await getDB()
      const result = await db.get('images', id)
      return result?.data
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function deleteImage(id: string): Promise<void> {
    try {
      const db = await getDB()
      await db.delete('images', id)
    } catch (e) {
      error.value = e as Error
      throw e
    }
  }

  async function saveEdit(id: string, imageId: string, state: any): Promise<void> {
    try {
      const db = await getDB()
      await db.put('edits', { id, imageId, state, createdAt: new Date() })
    } catch (e) {
      error.value = e as Error
      throw e
    }
  }

  async function getEdit(id: string): Promise<any | undefined> {
    try {
      const db = await getDB()
      const result = await db.get('edits', id)
      return result?.state
    } catch (e) {
      error.value = e as Error
      throw e
    }
  }

  async function saveSearchHistory(query: string): Promise<void> {
    try {
      const db = await getDB()
      await db.put('searchHistory', { query, timestamp: Date.now() })
    } catch (e) {
      error.value = e as Error
      throw e
    }
  }

  async function getSearchHistory(): Promise<string[]> {
    try {
      const db = await getDB()
      const history = await db.getAll('searchHistory')
      return history
        .sort((a: any, b: any) => b.timestamp - a.timestamp)
        .slice(0, 10)
        .map((item: any) => item.query)
    } catch (e) {
      error.value = e as Error
      throw e
    }
  }

  return {
    isLoading,
    error,
    saveImage,
    getImage,
    deleteImage,
    saveEdit,
    getEdit,
    saveSearchHistory,
    getSearchHistory,
  }
}
