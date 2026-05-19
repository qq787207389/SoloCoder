export interface User {
  id: string
  username: string
  avatar: string
  email: string
  bio: string
  followers: string[]
  following: string[]
  createdAt: Date
}

export type BoardVisibility = 'public' | 'private' | 'collaborative'

export interface Board {
  id: string
  title: string
  description: string
  cover: string
  visibility: BoardVisibility
  ownerId: string
  collaborators: string[]
  cardIds: string[]
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Card {
  id: string
  boardId: string
  imageUrl: string
  thumbnail: string
  title: string
  description: string
  tags: string[]
  sourceUrl?: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  commentIds: string[]
  likes: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Comment {
  id: string
  cardId: string
  userId: string
  content: string
  mentions: string[]
  parentId?: string
  replies: string[]
  createdAt: Date
}

export interface Notification {
  id: string
  userId: string
  type: 'comment' | 'like' | 'follow' | 'collaboration'
  content: string
  relatedId?: string
  read: boolean
  createdAt: Date
}

export interface ImageEditState {
  id: string
  originalUrl: string
  croppedUrl?: string
  rotation: number
  filter: string
  annotations: Annotation[]
}

export interface Annotation {
  id: string
  type: 'arrow' | 'text' | 'rectangle'
  position: { x: number; y: number }
  content?: string
  color: string
}

export interface SearchQuery {
  query: string
  tags: string[]
  colors: string[]
  sourceUrl?: string
}

export interface SmartCollection {
  id: string
  name: string
  query: SearchQuery
  createdAt: Date
}

export interface CollaborativeAction {
  type: 'card_add' | 'card_remove' | 'card_move' | 'card_update'
  payload: any
  userId: string
  timestamp: number
  actionId: string
}
