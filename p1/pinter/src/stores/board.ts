import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Board } from '@/types'
import { generateId } from '@/utils'

export const useBoardStore = defineStore('board', () => {
  const boards = ref<Map<string, Board>>(new Map())
  const currentBoardId = ref<string | null>(null)
  const isLoading = ref(false)

  const currentBoard = computed(() => 
    currentBoardId.value ? boards.value.get(currentBoardId.value) : null
  )

  const publicBoards = computed(() => 
    Array.from(boards.value.values()).filter(b => b.visibility === 'public')
  )

  const collaborativeBoards = computed(() => 
    Array.from(boards.value.values()).filter(b => b.visibility === 'collaborative')
  )

  function initMockBoards() {
    const mockBoards: Board[] = [
      {
        id: 'board1',
        title: 'UI 设计灵感',
        description: '收集优秀的用户界面设计作品',
        cover: 'https://picsum.photos/seed/ui-design/800/400',
        visibility: 'public',
        ownerId: 'user1',
        collaborators: ['user2'],
        cardIds: ['card1', 'card2', 'card3'],
        tags: ['设计', 'UI', '灵感'],
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-20')
      },
      {
        id: 'board2',
        title: '风景摄影',
        description: '世界各地的美丽风景',
        cover: 'https://picsum.photos/seed-landscape/800/400',
        visibility: 'public',
        ownerId: 'user2',
        collaborators: [],
        cardIds: ['card4', 'card5'],
        tags: ['摄影', '风景'],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-18')
      },
      {
        id: 'board3',
        title: '我的私密画板',
        description: '私人收藏',
        cover: 'https://picsum.photos/seed-private/800/400',
        visibility: 'private',
        ownerId: 'user1',
        collaborators: [],
        cardIds: [],
        tags: ['私人'],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01')
      },
      {
        id: 'board4',
        title: '协作项目',
        description: '团队协作的项目画板',
        cover: 'https://picsum.photos/seed-collab/800/400',
        visibility: 'collaborative',
        ownerId: 'user1',
        collaborators: ['user2', 'user3'],
        cardIds: ['card6'],
        tags: ['协作', '项目'],
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-15')
      }
    ]

    mockBoards.forEach(board => {
      boards.value.set(board.id, board)
    })
  }

  function getBoardsByOwner(ownerId: string): Board[] {
    return Array.from(boards.value.values()).filter(b => b.ownerId === ownerId)
  }

  function getBoardById(boardId: string): Board | undefined {
    return boards.value.get(boardId)
  }

  async function createBoard(
    data: Omit<Board, 'id' | 'ownerId' | 'cardIds' | 'createdAt' | 'updatedAt'>
  ): Promise<Board> {
    isLoading.value = true
    await new Promise(resolve => setTimeout(resolve, 300))

    const newBoard: Board = {
      ...data,
      id: generateId(),
      ownerId: 'user1',
      cardIds: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    boards.value.set(newBoard.id, newBoard)
    isLoading.value = false
    return newBoard
  }

  async function updateBoard(boardId: string, updates: Partial<Board>): Promise<void> {
    isLoading.value = true
    await new Promise(resolve => setTimeout(resolve, 300))

    const board = boards.value.get(boardId)
    if (board) {
      Object.assign(board, updates, { updatedAt: new Date() })
    }
    isLoading.value = false
  }

  async function deleteBoard(boardId: string): Promise<void> {
    isLoading.value = true
    await new Promise(resolve => setTimeout(resolve, 300))

    boards.value.delete(boardId)
    if (currentBoardId.value === boardId) {
      currentBoardId.value = null
    }
    isLoading.value = false
  }

  function setCurrentBoard(boardId: string | null) {
    currentBoardId.value = boardId
  }

  function addCardToBoard(boardId: string, cardId: string) {
    const board = boards.value.get(boardId)
    if (board && !board.cardIds.includes(cardId)) {
      board.cardIds.push(cardId)
      board.updatedAt = new Date()
    }
  }

  function removeCardFromBoard(boardId: string, cardId: string) {
    const board = boards.value.get(boardId)
    if (board) {
      board.cardIds = board.cardIds.filter(id => id !== cardId)
      board.updatedAt = new Date()
    }
  }

  function addCollaborator(boardId: string, userId: string) {
    const board = boards.value.get(boardId)
    if (board && !board.collaborators.includes(userId)) {
      board.collaborators.push(userId)
      board.updatedAt = new Date()
    }
  }

  function removeCollaborator(boardId: string, userId: string) {
    const board = boards.value.get(boardId)
    if (board) {
      board.collaborators = board.collaborators.filter(id => id !== userId)
      board.updatedAt = new Date()
    }
  }

  function searchBoards(query: string): Board[] {
    const lowerQuery = query.toLowerCase()
    return Array.from(boards.value.values()).filter(
      board =>
        board.title.toLowerCase().includes(lowerQuery) ||
        board.description.toLowerCase().includes(lowerQuery) ||
        board.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  function getFollowingBoards(userIds: string[]): Board[] {
    return Array.from(boards.value.values()).filter(
      board => userIds.includes(board.ownerId) && board.visibility !== 'private'
    )
  }

  return {
    boards,
    currentBoardId,
    isLoading,
    currentBoard,
    publicBoards,
    collaborativeBoards,
    initMockBoards,
    getBoardsByOwner,
    getBoardById,
    createBoard,
    updateBoard,
    deleteBoard,
    setCurrentBoard,
    addCardToBoard,
    removeCardFromBoard,
    addCollaborator,
    removeCollaborator,
    searchBoards,
    getFollowingBoards
  }
})
