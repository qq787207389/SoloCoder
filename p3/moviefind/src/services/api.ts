import { moviesData } from '@/mocks/data'
import type { Movie } from '@/types'

export interface MovieListResponse {
  data: Movie[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function getMovies(
  page: number = 1,
  limit: number = 12,
  search: string = ''
): Promise<MovieListResponse> {
  await delay(300 + Math.random() * 200)
  
  let filtered = moviesData
  
  if (search) {
    const searchLower = search.toLowerCase()
    filtered = moviesData.filter(movie => 
      movie.title.toLowerCase().includes(searchLower) ||
      movie.genres.some(g => g.toLowerCase().includes(searchLower))
    )
  }
  
  const start = (page - 1) * limit
  const end = start + limit
  const paginated = filtered.slice(start, end)
  
  return {
    data: paginated,
    total: filtered.length,
    page,
    limit,
    hasMore: end < filtered.length
  }
}

export async function getMovieById(id: number): Promise<Movie | null> {
  await delay(200 + Math.random() * 100)
  const movie = moviesData.find(m => m.id === id)
  return movie || null
}

export async function getSimilarMovies(id: number): Promise<Movie[]> {
  await delay(200 + Math.random() * 100)
  
  const currentMovie = moviesData.find(m => m.id === id)
  if (!currentMovie) return []
  
  const similar = moviesData
    .filter(m => m.id !== id)
    .filter(m => m.genres.some(g => currentMovie.genres.includes(g)))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4)
  
  return similar
}

export async function getRecommendations(watchedIds: number[] = []): Promise<Movie[]> {
  await delay(200 + Math.random() * 100)
  
  if (watchedIds.length === 0) {
    return [...moviesData]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8)
  }
  
  const watchedGenres = new Set<string>()
  moviesData
    .filter(m => watchedIds.includes(m.id))
    .forEach(m => m.genres.forEach(g => watchedGenres.add(g)))
  
  const recommendations = moviesData
    .filter(m => !watchedIds.includes(m.id))
    .filter(m => m.genres.some(g => watchedGenres.has(g)))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8)
  
  if (recommendations.length < 8) {
    const remaining = moviesData
      .filter(m => !watchedIds.includes(m.id) && !recommendations.includes(m))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8 - recommendations.length)
    recommendations.push(...remaining)
  }
  
  return recommendations
}
