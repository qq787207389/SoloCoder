import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Card } from '@/types'
import { generateId, generateTagsFromFilename } from '@/utils'
import { useIndexedDB } from '@/composables/useIndexedDB'

export const useCardStore = defineStore('card', () => {
  const cards = ref<Map<string, Card>>(new Map())
  const currentCardId = ref<string | null>(null)
  const isLoading = ref(false)
  const searchHistory = ref<string[]>([])

  const { saveImage, getImage } = useIndexedDB()

  const currentCard = computed(() => 
    currentCardId.value ? cards.value.get(currentCardId.value) : null
  )

  function initMockCards() {
    const mockCards: Card[] = [
      {
        id: 'card1',
        boardId: 'board1',
        imageUrl: 'https://picsum.photos/seed-card1/600/800',
        thumbnail: 'https://picsum.photos/seed-card1/200/267',
        title: '现代简约界面设计',
        description: '简洁优雅的用户界面设计',
        tags: ['设计', 'UI', '现代'],
        sourceUrl: 'https://dribbble.com',
        position: { x: 0, y: 0 },
        size: { width: 236, height: 315 },
        commentIds: ['comment1', 'comment2'],
        likes: ['user2', 'user3'],
        createdAt: new Date('2024-01-12'),
        updatedAt: new Date('2024-01-12')
      },
      {
        id: 'card2',
        boardId: 'board1',
        imageUrl: 'https://picsum.photos/seed-card2/600/400',
        thumbnail: 'https://picsum.photos/seed-card2/200/133',
        title: 'Dashboard 设计',
        description: '数据可视化仪表盘',
        tags: ['设计', 'Dashboard', '数据'],
        position: { x: 250, y: 0 },
        size: { width: 236, height: 157 },
        commentIds: [],
        likes: ['user2'],
        createdAt: new Date('2024-01-13'),
        updatedAt: new Date('2024-01-13')
      },
      {
        id: 'card3',
        boardId: 'board1',
        imageUrl: 'https://picsum.photos/seed-card3/600/600',
        thumbnail: 'https://picsum.photos/seed-card3/200/200',
        title: 'App 图标设计',
        description: '移动应用图标集合',
        tags: ['设计', '图标', 'App'],
        sourceUrl: 'https://behance.net',
        position: { x: 0, y: 330 },
        size: { width: 236, height: 236 },
        commentIds: ['comment3'],
        likes: [],
        createdAt: new Date('2024-01-14'),
        updatedAt: new Date('2024-01-14')
      },
      {
        id: 'card4',
        boardId: 'board2',
        imageUrl: 'https://picsum.photos/seed-card4/800/600',
        thumbnail: 'https://picsum.photos/seed-card4/200/150',
        title: '山巅日出',
        description: '壮丽的山间日出景色',
        tags: ['风景', '山脉', '日出'],
        position: { x: 0, y: 0 },
        size: { width: 236, height: 177 },
        commentIds: [],
        likes: ['user1'],
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-16')
      },
      {
        id: 'card5',
        boardId: 'board2',
        imageUrl: 'https://picsum.photos/seed-card5/600/900',
        thumbnail: 'https://picsum.photos/seed-card5/200/300',
        title: '海边日落',
        description: '宁静的海滩日落时刻',
        tags: ['风景', '海洋', '日落'],
        position: { x: 250, y: 0 },
        size: { width: 236, height: 354 },
        commentIds: [],
        likes: ['user3'],
        createdAt: new Date('2024-01-17'),
        updatedAt: new Date('2024-01-17')
      },
      {
        id: 'card6',
        boardId: 'board4',
        imageUrl: 'https://picsum.photos/seed-card6/600/450',
        thumbnail: 'https://picsum.photos/seed-card6/200/150',
        title: '协作设计稿',
        description: '团队共同完成的设计项目',
        tags: ['协作', '设计', '项目'],
        position: { x: 0, y: 0 },
        size: { width: 236, height: 177 },
        commentIds: [],
        likes: [],
        createdAt: new Date('2024-02-12'),
        updatedAt: new Date('2024-02-12')
      }
    ]

    mockCards.forEach(card => {
      cards.value.set(card.id, card)
    })
  }

  function getCardsByBoard(boardId: string): Card[] {
    return Array.from(cards.value.values()).filter(c => c.boardId === boardId)
  }

  function getCardById(cardId: string): Card | undefined {
    return cards.value.get(cardId)
  }

  async function createCard(
    boardId: string,
    imageFile: File,
    data: Partial<Card> = {}
  ): Promise<Card> {
    isLoading.value = true
    await new Promise(resolve => setTimeout(resolve, 500))

    const imageId = generateId()
    const reader = new FileReader()
    
    const base64Promise = new Promise<string>((resolve) => {
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(imageFile)
    })

    const imageUrl = await base64Promise
    await saveImage(imageId, imageUrl)

    const autoTags = generateTagsFromFilename(imageFile.name)

    const newCard: Card = {
      id: generateId(),
      boardId,
      imageUrl,
      thumbnail: imageUrl,
      title: data.title || imageFile.name.replace(/\.[^/.]+$/, ''),
      description: data.description || '',
      tags: [...new Set([...autoTags, ...(data.tags || [])])],
      sourceUrl: data.sourceUrl,
      position: data.position || { x: 0, y: 0 },
      size: data.size || { width: 236, height: 300 },
      commentIds: [],
      likes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    cards.value.set(newCard.id, newCard)
    isLoading.value = false
    return newCard
  }

  async function updateCard(cardId: string, updates: Partial<Card>): Promise<void> {
    isLoading.value = true
    await new Promise(resolve => setTimeout(resolve, 300))

    const card = cards.value.get(cardId)
    if (card) {
      Object.assign(card, updates, { updatedAt: new Date() })
    }
    isLoading.value = false
  }

  async function deleteCard(cardId: string): Promise<void> {
    isLoading.value = true
    await new Promise(resolve => setTimeout(resolve, 300))

    cards.value.delete(cardId)
    if (currentCardId.value === cardId) {
      currentCardId.value = null
    }
    isLoading.value = false
  }

  function setCurrentCard(cardId: string | null) {
    currentCardId.value = cardId
  }

  function toggleLike(cardId: string, userId: string) {
    const card = cards.value.get(cardId)
    if (card) {
      const index = card.likes.indexOf(userId)
      if (index > -1) {
        card.likes.splice(index, 1)
      } else {
        card.likes.push(userId)
      }
    }
  }

  function moveCardToBoard(cardId: string, newBoardId: string) {
    const card = cards.value.get(cardId)
    if (card) {
      card.boardId = newBoardId
      card.updatedAt = new Date()
    }
  }

  function addCommentToCard(cardId: string, commentId: string) {
    const card = cards.value.get(cardId)
    if (card && !card.commentIds.includes(commentId)) {
      card.commentIds.push(commentId)
      card.updatedAt = new Date()
    }
  }

  function removeCommentFromCard(cardId: string, commentId: string) {
    const card = cards.value.get(cardId)
    if (card) {
      card.commentIds = card.commentIds.filter(id => id !== commentId)
      card.updatedAt = new Date()
    }
  }

  function searchCards(query: string, tags: string[] = [], colors: string[] = []): Card[] {
    const lowerQuery = query.toLowerCase()
    return Array.from(cards.value.values()).filter(card => {
      const matchesQuery = !query || 
        card.title.toLowerCase().includes(lowerQuery) ||
        card.description.toLowerCase().includes(lowerQuery)
      
      const matchesTags = tags.length === 0 || 
        tags.some(tag => card.tags.includes(tag))
      
      return matchesQuery && matchesTags
    })
  }

  function getLikedCards(userId: string): Card[] {
    return Array.from(cards.value.values()).filter(c => c.likes.includes(userId))
  }

  function addSearchHistory(query: string) {
    if (!searchHistory.value.includes(query)) {
      searchHistory.value.unshift(query)
      if (searchHistory.value.length > 10) {
        searchHistory.value.pop()
      }
    }
  }

  return {
    cards,
    currentCardId,
    isLoading,
    searchHistory,
    currentCard,
    initMockCards,
    getCardsByBoard,
    getCardById,
    createCard,
    updateCard,
    deleteCard,
    setCurrentCard,
    toggleLike,
    moveCardToBoard,
    addCommentToCard,
    removeCommentFromCard,
    searchCards,
    getLikedCards,
    addSearchHistory
  }
})
