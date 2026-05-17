import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { Question } from '@/types'

interface QuestionsQueryParams {
  page?: number
  limit?: number
  difficulty?: string
  type?: string
  tags?: string[]
  search?: string
  sort?: string
  order?: string
}

interface QuestionsResponse {
  data: Question[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function useQuestions(params: QuestionsQueryParams = {}) {
  const queryParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        queryParams.set(key, value.join(','))
      } else {
        queryParams.set(key, String(value))
      }
    }
  })

  return useQuery({
    queryKey: ['questions', queryParams.toString()],
    queryFn: async (): Promise<QuestionsResponse> => {
      const response = await fetch(`/api/questions?${queryParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch questions')
      }
      return response.json()
    },
  })
}

export function useQuestion(id: string | undefined) {
  return useQuery({
    queryKey: ['question', id],
    queryFn: async (): Promise<{ data: Question }> => {
      if (!id) throw new Error('No question ID')
      const response = await fetch(`/api/questions/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch question')
      }
      return response.json()
    },
    enabled: !!id,
  })
}

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async (): Promise<{ data: string[] }> => {
      const response = await fetch('/api/tags')
      if (!response.ok) {
        throw new Error('Failed to fetch tags')
      }
      return response.json()
    },
  })
}
