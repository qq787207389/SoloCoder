import { defineStore } from 'pinia'
import type { Playlist, UserRating } from '@/types'

interface PlaylistState {
  playlists: Playlist[]
  ratings: UserRating[]
}

const STORAGE_KEY_PLAYLISTS = 'moviefind_playlists'
const STORAGE_KEY_RATINGS = 'moviefind_ratings'

const defaultPlaylists: Playlist[] = [
  { id: 'watchlist', name: '想看', movies: [], isDefault: true, createdAt: Date.now() },
  { id: 'watched', name: '已看', movies: [], isDefault: true, createdAt: Date.now() },
  { id: 'favorite', name: '收藏', movies: [], isDefault: true, createdAt: Date.now() }
]

function loadFromStorage(): PlaylistState {
  try {
    const playlistsStr = localStorage.getItem(STORAGE_KEY_PLAYLISTS)
    const ratingsStr = localStorage.getItem(STORAGE_KEY_RATINGS)
    
    return {
      playlists: playlistsStr ? JSON.parse(playlistsStr) : defaultPlaylists,
      ratings: ratingsStr ? JSON.parse(ratingsStr) : []
    }
  } catch {
    return {
      playlists: defaultPlaylists,
      ratings: []
    }
  }
}

function saveToStorage(state: PlaylistState) {
  localStorage.setItem(STORAGE_KEY_PLAYLISTS, JSON.stringify(state.playlists))
  localStorage.setItem(STORAGE_KEY_RATINGS, JSON.stringify(state.ratings))
}

export const usePlaylistStore = defineStore('playlist', {
  state: (): PlaylistState => loadFromStorage(),
  
  getters: {
    getPlaylistById: (state) => (id: string) => {
      return state.playlists.find(p => p.id === id)
    },
    
    isInPlaylist: (state) => (movieId: number, playlistId: string) => {
      const playlist = state.playlists.find(p => p.id === playlistId)
      return playlist ? playlist.movies.includes(movieId) : false
    },
    
    getRating: (state) => (movieId: number) => {
      return state.ratings.find(r => r.movieId === movieId)?.rating || 0
    },
    
    watchedMovies: (state) => {
      const watched = state.playlists.find(p => p.id === 'watched')
      return watched ? watched.movies : []
    },
    
    customPlaylists: (state) => {
      return state.playlists.filter(p => !p.isDefault)
    }
  },
  
  actions: {
    addToPlaylist(movieId: number, playlistId: string) {
      const playlist = this.playlists.find(p => p.id === playlistId)
      if (playlist && !playlist.movies.includes(movieId)) {
        playlist.movies.push(movieId)
        saveToStorage(this.$state)
      }
    },
    
    removeFromPlaylist(movieId: number, playlistId: string) {
      const playlist = this.playlists.find(p => p.id === playlistId)
      if (playlist) {
        playlist.movies = playlist.movies.filter(id => id !== movieId)
        saveToStorage(this.$state)
      }
    },
    
    togglePlaylist(movieId: number, playlistId: string) {
      if (this.isInPlaylist(movieId, playlistId)) {
        this.removeFromPlaylist(movieId, playlistId)
      } else {
        this.addToPlaylist(movieId, playlistId)
      }
    },
    
    setRating(movieId: number, rating: number) {
      const existingIndex = this.ratings.findIndex(r => r.movieId === movieId)
      if (existingIndex >= 0) {
        this.ratings[existingIndex].rating = rating
        this.ratings[existingIndex].createdAt = Date.now()
      } else {
        this.ratings.push({ movieId, rating, createdAt: Date.now() })
      }
      saveToStorage(this.$state)
    },
    
    createPlaylist(name: string) {
      const newPlaylist: Playlist = {
        id: `custom_${Date.now()}`,
        name,
        movies: [],
        isDefault: false,
        createdAt: Date.now()
      }
      this.playlists.push(newPlaylist)
      saveToStorage(this.$state)
      return newPlaylist
    },
    
    deletePlaylist(playlistId: string) {
      this.playlists = this.playlists.filter(p => p.id !== playlistId)
      saveToStorage(this.$state)
    },
    
    updatePlaylistOrder(playlistId: string, movieIds: number[]) {
      const playlist = this.playlists.find(p => p.id === playlistId)
      if (playlist) {
        playlist.movies = movieIds
        saveToStorage(this.$state)
      }
    }
  }
})
