export interface Location {
  id: string
  name: string
  country: string
  city: string
  lat: number
  lng: number
}

export interface TravelPhoto {
  id: string
  url: string
  caption?: string
}

export type TravelType = 'city' | 'nature' | 'food' | 'culture' | 'other'

export interface TravelDiary {
  id: string
  location: Location
  date: string
  description: string
  photos: TravelPhoto[]
  type: TravelType
  createdAt: string
  updatedAt: string
}

export interface WishlistItem {
  id: string
  location: Location
  priority: 'high' | 'medium' | 'low'
  notes?: string
  addedAt: string
  isCompleted: boolean
}

export interface UserStats {
  countriesVisited: string[]
  citiesVisited: string[]
  totalTrips: number
  totalPhotos: number
  tripsByType: Record<TravelType, number>
  tripsByYear: Record<number, number>
}

export interface MapBounds {
  west: number
  south: number
  east: number
  north: number
}

export interface SearchResult {
  id: string
  name: string
  country: string
  city: string
  lat: number
  lng: number
  formattedAddress: string
}

export interface AppState {
  diaries: TravelDiary[]
  wishlist: WishlistItem[]
  isLoading: boolean
  error: string | null
}
