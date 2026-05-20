import { defineStore } from 'pinia'
import type { TravelDiary, WishlistItem, UserStats, TravelType } from '../types'
import { generateId, localStorageHelper, getYearFromDate } from '../utils'

const STORAGE_KEY_DIARIES = 'traveltrack_diaries'
const STORAGE_KEY_WISHLIST = 'traveltrack_wishlist'

export const useTravelStore = defineStore('travel', {
  state: () => ({
    diaries: localStorageHelper.get<TravelDiary[]>(STORAGE_KEY_DIARIES, []),
    wishlist: localStorageHelper.get<WishlistItem[]>(STORAGE_KEY_WISHLIST, []),
    isLoading: false,
    error: null as string | null
  }),

  getters: {
    sortedDiaries: (state): TravelDiary[] => {
      return [...state.diaries].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    },

    activeWishlist: (state): WishlistItem[] => {
      return state.wishlist.filter(item => !item.isCompleted)
    },

    userStats: (state): UserStats => {
      const countries = new Set<string>()
      const cities = new Set<string>()
      const tripsByType: Record<TravelType, number> = {
        city: 0,
        nature: 0,
        food: 0,
        culture: 0,
        other: 0
      }
      const tripsByYear: Record<number, number> = {}
      let totalPhotos = 0

      state.diaries.forEach(diary => {
        countries.add(diary.location.country)
        cities.add(diary.location.city)
        tripsByType[diary.type]++
        
        const year = getYearFromDate(diary.date)
        tripsByYear[year] = (tripsByYear[year] || 0) + 1
        
        totalPhotos += diary.photos.length
      })

      return {
        countriesVisited: Array.from(countries),
        citiesVisited: Array.from(cities),
        totalTrips: state.diaries.length,
        totalPhotos,
        tripsByType,
        tripsByYear
      }
    },

    getDiaryById: (state) => (id: string): TravelDiary | undefined => {
      return state.diaries.find(d => d.id === id)
    },

    getWishlistItemById: (state) => (id: string): WishlistItem | undefined => {
      return state.wishlist.find(w => w.id === id)
    }
  },

  actions: {
    addDiary(diary: Omit<TravelDiary, 'id' | 'createdAt' | 'updatedAt'>): void {
      const newDiary: TravelDiary = {
        ...diary,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      this.diaries.push(newDiary)
      this.persistDiaries()
    },

    updateDiary(id: string, updates: Partial<TravelDiary>): void {
      const index = this.diaries.findIndex(d => d.id === id)
      if (index !== -1) {
        this.diaries[index] = {
          ...this.diaries[index],
          ...updates,
          updatedAt: new Date().toISOString()
        }
        this.persistDiaries()
      }
    },

    deleteDiary(id: string): void {
      this.diaries = this.diaries.filter(d => d.id !== id)
      this.persistDiaries()
    },

    addWishlistItem(item: Omit<WishlistItem, 'id' | 'addedAt' | 'isCompleted'>): void {
      const newItem: WishlistItem = {
        ...item,
        id: generateId(),
        addedAt: new Date().toISOString(),
        isCompleted: false
      }
      this.wishlist.push(newItem)
      this.persistWishlist()
    },

    updateWishlistItem(id: string, updates: Partial<WishlistItem>): void {
      const index = this.wishlist.findIndex(w => w.id === id)
      if (index !== -1) {
        this.wishlist[index] = {
          ...this.wishlist[index],
          ...updates
        }
        this.persistWishlist()
      }
    },

    deleteWishlistItem(id: string): void {
      this.wishlist = this.wishlist.filter(w => w.id !== id)
      this.persistWishlist()
    },

    completeWishlistItem(id: string, diaryData: Partial<TravelDiary>): void {
      const item = this.wishlist.find(w => w.id === id)
      if (item) {
        this.addDiary({
          location: item.location,
          date: diaryData.date || new Date().toISOString().split('T')[0],
          description: diaryData.description || item.notes || '',
          photos: diaryData.photos || [],
          type: diaryData.type || 'other'
        })
        this.updateWishlistItem(id, { isCompleted: true })
      }
    },

    importData(data: { diaries?: TravelDiary[], wishlist?: WishlistItem[] }): void {
      if (data.diaries) {
        this.diaries = data.diaries
      }
      if (data.wishlist) {
        this.wishlist = data.wishlist
      }
      this.persistDiaries()
      this.persistWishlist()
    },

    exportData(): { diaries: TravelDiary[], wishlist: WishlistItem[] } {
      return {
        diaries: this.diaries,
        wishlist: this.wishlist
      }
    },

    clearAllData(): boolean {
      try {
        this.diaries = []
        this.wishlist = []
        this.persistDiaries()
        this.persistWishlist()
        return true
      } catch (error) {
        console.error('清除数据失败:', error)
        return false
      }
    },

    persistDiaries(): void {
      localStorageHelper.set(STORAGE_KEY_DIARIES, this.diaries)
    },

    persistWishlist(): void {
      localStorageHelper.set(STORAGE_KEY_WISHLIST, this.wishlist)
    }
  }
})
