import type { Book } from '@/types'

let transformersModule: any = null
let embeddingModel: any = null
let initAttempted = false

async function loadTransformers() {
  if (transformersModule) return transformersModule
  try {
    transformersModule = await import('@xenova/transformers')
    if (transformersModule.env) {
      transformersModule.env.allowLocalModels = false
      transformersModule.env.allowRemoteModels = true
    }
    return transformersModule
  } catch (error) {
    console.warn('Transformers 加载失败，将使用模拟模式:', error)
    return null
  }
}

export async function initEmbeddingModel() {
  if (embeddingModel) return embeddingModel
  if (initAttempted) return null
  initAttempted = true

  try {
    const transformers = await loadTransformers()
    if (!transformers?.pipeline) {
      console.warn('使用模拟嵌入模式')
      return null
    }
    embeddingModel = await transformers.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
    return embeddingModel
  } catch (error) {
    console.warn('AI 模型加载失败，使用模拟模式:', error)
    return null
  }
}

export async function getEmbedding(text: string): Promise<number[]> {
  const model = await initEmbeddingModel()
  if (!model) {
    return getMockEmbedding(text)
  }
  try {
    const output = await model(text, { pooling: 'mean', normalize: true })
    return Array.from(output.data)
  } catch {
    return getMockEmbedding(text)
  }
}

function getMockEmbedding(text: string): number[] {
  const hash = hashString(text)
  const dim = 384
  const result: number[] = []
  for (let i = 0; i < dim; i++) {
    const val = Math.sin(hash + i * 0.1) * 0.5 + 0.5
    result.push(val)
  }
  const norm = Math.sqrt(result.reduce((a, b) => a + b * b, 0))
  return result.map(v => v / norm)
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0
  let dotProduct = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

export function recommendBooks(
  targetBook: Book,
  allBooks: Book[],
  topK: number = 5
): Book[] {
  if (!targetBook.embedding) return []

  const similarities = allBooks
    .filter(book => book.id !== targetBook.id && book.embedding)
    .map(book => ({
      book,
      similarity: cosineSimilarity(targetBook.embedding!, book.embedding!)
    }))
    .sort((a, b) => b.similarity - a.similarity)

  return similarities.slice(0, topK).map(item => item.book)
}

export function recommendByTags(
  tags: string[],
  allBooks: Book[],
  topK: number = 5
): Book[] {
  const tagSet = new Set(tags)
  return allBooks
    .map(book => {
      const matchCount = book.tags.filter(t => tagSet.has(t)).length
      return { book, score: matchCount / Math.max(book.tags.length, 1) }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(item => item.book)
}

export async function generateReadingSuggestions(
  topic: string,
  books: Book[]
): Promise<{ suggestions: string[]; recommendedBooks: Book[] }> {
  try {
    const topicEmbedding = await getEmbedding(topic)
    
    const bookScores = books
      .filter(book => book.embedding)
      .map(book => ({
        book,
        score: cosineSimilarity(topicEmbedding, book.embedding!)
      }))
      .sort((a, b) => b.score - a.score)

    const recommendedBooks = bookScores.slice(0, 3).map(b => b.book)
    
    const suggestions = [
      `基于您对"${topic}"的兴趣，推荐从以下书籍开始：`,
      ...recommendedBooks.map(b => `• 《${b.title}》- ${b.author}`),
      '',
      '阅读建议：',
      '1. 先浏览书籍目录和简介，了解整体框架',
      '2. 每天固定时间阅读30分钟，培养习惯',
      '3. 遇到重要观点及时记录笔记',
      '4. 读完后尝试用自己的话总结核心内容'
    ]

    return { suggestions, recommendedBooks }
  } catch {
    const recommendedBooks = books.slice(0, 3)
    const suggestions = [
      `为您推荐以下书籍：`,
      ...recommendedBooks.map(b => `• 《${b.title}》- ${b.author}`),
      '',
      '阅读建议：',
      '1. 先浏览书籍目录和简介，了解整体框架',
      '2. 每天固定时间阅读30分钟，培养习惯',
      '3. 遇到重要观点及时记录笔记',
      '4. 读完后尝试用自己的话总结核心内容'
    ]
    return { suggestions, recommendedBooks }
  }
}

export async function answerQuestion(
  question: string,
  context: string
): Promise<string> {
  try {
    const questionEmbedding = await getEmbedding(question)
    const sentences = context.split(/[。！？.!?]/).filter(s => s.trim())
    
    let bestMatch = ''
    let bestScore = -1

    for (const sentence of sentences) {
      if (sentence.trim().length < 10) continue
      const sentenceEmbedding = await getEmbedding(sentence)
      const score = cosineSimilarity(questionEmbedding, sentenceEmbedding)
      if (score > bestScore) {
        bestScore = score
        bestMatch = sentence
      }
    }

    if (bestScore > 0.3) {
      return `根据内容分析，相关信息：${bestMatch.trim()}。\n\n（这是基于语义相似度的智能匹配结果，仅供参考）`
    } else {
      return '抱歉，在当前书籍摘要中未找到与您问题相关的内容。建议查阅更多相关章节。'
    }
  } catch {
    return 'AI 问答功能暂时不可用，请查阅书籍摘要获取相关信息。'
  }
}

export function simpleCollaborativeFiltering(
  userBooks: Book[],
  allBooks: Book[],
  topK: number = 5
): Book[] {
  const userTags = new Set<string>()
  userBooks.forEach(book => book.tags.forEach(tag => userTags.add(tag)))
  
  return allBooks
    .filter(book => !userBooks.find(ub => ub.id === book.id))
    .map(book => {
      const tagOverlap = book.tags.filter(t => userTags.has(t)).length
      const score = tagOverlap / (book.tags.length + userBooks.length)
      return { book, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(item => item.book)
}
