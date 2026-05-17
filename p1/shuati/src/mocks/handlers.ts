import { http, HttpResponse } from 'msw'
import { questions, comments } from './data'
import type { Question, Comment } from '@/types'

export const handlers = [
  http.get('/api/questions', ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')
    const difficulty = url.searchParams.get('difficulty')
    const type = url.searchParams.get('type')
    const tags = url.searchParams.get('tags')?.split(',').filter(Boolean) || []
    const search = url.searchParams.get('search') || ''
    const sort = url.searchParams.get('sort') || 'number'
    const order = url.searchParams.get('order') || 'asc'

    let filteredQuestions = [...questions]

    if (difficulty) {
      filteredQuestions = filteredQuestions.filter(q => q.difficulty === difficulty)
    }

    if (type) {
      filteredQuestions = filteredQuestions.filter(q => q.type === type)
    }

    if (tags.length > 0) {
      filteredQuestions = filteredQuestions.filter(q =>
        tags.some(tag => q.tags.includes(tag))
      )
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredQuestions = filteredQuestions.filter(
        q =>
          q.title.toLowerCase().includes(searchLower) ||
          q.description.toLowerCase().includes(searchLower) ||
          q.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    filteredQuestions.sort((a, b) => {
      let comparison = 0
      switch (sort) {
        case 'number':
          comparison = a.number - b.number
          break
        case 'difficulty':
          const diffOrder = { easy: 1, medium: 2, hard: 3 }
          comparison = diffOrder[a.difficulty] - diffOrder[b.difficulty]
          break
        case 'passRate':
          comparison = a.passRate - b.passRate
          break
        default:
          comparison = a.number - b.number
      }
      return order === 'desc' ? -comparison : comparison
    })

    const total = filteredQuestions.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex)

    return HttpResponse.json({
      data: paginatedQuestions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  }),

  http.get('/api/questions/:id', ({ params }) => {
    const { id } = params
    const question = questions.find(q => q.id === id)

    if (!question) {
      return HttpResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: question })
  }),

  http.get('/api/questions/:id/comments', ({ params }) => {
    const { id } = params
    const questionComments = comments.filter(c => c.questionId === id)

    return HttpResponse.json({ data: questionComments })
  }),

  http.post('/api/questions/:id/comments', async ({ request, params }) => {
    const { id } = params
    const body = await request.json() as { content: string; userId: string; username: string; avatar: string }

    const newComment: Comment = {
      id: String(Date.now()),
      questionId: id as string,
      userId: body.userId,
      username: body.username,
      avatar: body.avatar,
      content: body.content,
      likes: 0,
      liked: false,
      createdAt: new Date().toISOString(),
    }

    comments.unshift(newComment)

    return HttpResponse.json({ data: newComment }, { status: 201 })
  }),

  http.post('/api/submit', async ({ request }) => {
    const body = await request.json() as {
      questionId: string
      code: string
      language: string
    }

    const question = questions.find(q => q.id === body.questionId)

    if (!question) {
      return HttpResponse.json({ error: 'Question not found' }, { status: 404 })
    }

    return HttpResponse.json({
      data: {
        submissionId: String(Date.now()),
        status: 'pending',
      },
    })
  }),

  http.get('/api/tags', () => {
    const allTags = new Set<string>()
    questions.forEach(q => q.tags.forEach(tag => allTags.add(tag)))

    return HttpResponse.json({
      data: Array.from(allTags).sort(),
    })
  }),

  http.get('/api/stats', () => {
    const totalQuestions = questions.length
    const easyCount = questions.filter(q => q.difficulty === 'easy').length
    const mediumCount = questions.filter(q => q.difficulty === 'medium').length
    const hardCount = questions.filter(q => q.difficulty === 'hard').length

    return HttpResponse.json({
      data: {
        totalQuestions,
        easyCount,
        mediumCount,
        hardCount,
        totalSubmissions: questions.reduce((sum, q) => sum + q.submissions, 0),
      },
    })
  }),
]
