import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Comment } from '@/types'
import { generateId } from '@/utils'

export const useCommentStore = defineStore('comment', () => {
  const comments = ref<Map<string, Comment>>(new Map())
  const isLoading = ref(false)

  function initMockComments() {
    const mockComments: Comment[] = [
      {
        id: 'comment1',
        cardId: 'card1',
        userId: 'user2',
        content: '这个设计太棒了！配色很舒服',
        mentions: [],
        replies: [],
        createdAt: new Date('2024-01-13')
      },
      {
        id: 'comment2',
        cardId: 'card1',
        userId: 'user3',
        content: '@摄影师小红 同意，这种留白处理很高级',
        mentions: ['user2'],
        parentId: 'comment1',
        replies: [],
        createdAt: new Date('2024-01-14')
      },
      {
        id: 'comment3',
        cardId: 'card3',
        userId: 'user1',
        content: '图标风格很统一，收藏了',
        mentions: [],
        replies: [],
        createdAt: new Date('2024-01-15')
      }
    ]

    mockComments.forEach(comment => {
      comments.value.set(comment.id, comment)
    })
  }

  function getCommentsByCard(cardId: string): Comment[] {
    return Array.from(comments.value.values())
      .filter(c => c.cardId === cardId && !c.parentId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  function getReplies(commentId: string): Comment[] {
    return Array.from(comments.value.values())
      .filter(c => c.parentId === commentId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  }

  function getCommentById(commentId: string): Comment | undefined {
    return comments.value.get(commentId)
  }

  async function createComment(
    cardId: string,
    userId: string,
    content: string,
    parentId?: string
  ): Promise<Comment> {
    isLoading.value = true
    await new Promise(resolve => setTimeout(resolve, 300))

    const mentionRegex = /@(\S+)/g
    const mentions: string[] = []
    let match
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1])
    }

    const newComment: Comment = {
      id: generateId(),
      cardId,
      userId,
      content,
      mentions,
      parentId,
      replies: [],
      createdAt: new Date()
    }

    comments.value.set(newComment.id, newComment)

    if (parentId) {
      const parent = comments.value.get(parentId)
      if (parent && !parent.replies.includes(newComment.id)) {
        parent.replies.push(newComment.id)
      }
    }

    isLoading.value = false
    return newComment
  }

  async function deleteComment(commentId: string): Promise<void> {
    isLoading.value = true
    await new Promise(resolve => setTimeout(resolve, 300))

    const comment = comments.value.get(commentId)
    if (comment) {
      const repliesToDelete = [...comment.replies]
      repliesToDelete.forEach(replyId => {
        comments.value.delete(replyId)
      })

      if (comment.parentId) {
        const parent = comments.value.get(comment.parentId)
        if (parent) {
          parent.replies = parent.replies.filter(id => id !== commentId)
        }
      }

      comments.value.delete(commentId)
    }

    isLoading.value = false
  }

  function getCommentCount(cardId: string): number {
    return Array.from(comments.value.values()).filter(c => c.cardId === cardId).length
  }

  function getUserComments(userId: string): Comment[] {
    return Array.from(comments.value.values())
      .filter(c => c.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  return {
    comments,
    isLoading,
    initMockComments,
    getCommentsByCard,
    getReplies,
    getCommentById,
    createComment,
    deleteComment,
    getCommentCount,
    getUserComments
  }
})
