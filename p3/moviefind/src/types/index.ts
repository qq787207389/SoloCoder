export interface Movie {
  id: number
  title: string
  poster: string
  rating: number
  year: number
  genres: string[]
  overview: string
  cast: Actor[]
  releaseDate: string
  duration: number
}

export interface Actor {
  name: string
  photo: string
  character: string
}

export interface Playlist {
  id: string
  name: string
  movies: number[]
  isDefault: boolean
  createdAt: number
}

export interface UserRating {
  movieId: number
  rating: number
  createdAt: number
}

export type PlaylistType = 'watchlist' | 'watched' | 'favorite'
