export interface Book {
  id: string
  isbn?: string
  title: string
  author: string
  cover?: string
  description: string
  tags: string[]
  embedding?: number[]
  addedAt: number
  readStatus: 'want' | 'reading' | 'finished'
  rating?: number
  pages?: number
  currentPage?: number
}

export interface Note {
  id: string
  bookId?: string
  title: string
  content: string
  tags: string[]
  createdAt: number
  updatedAt: number
  references: string[]
}

export interface ReadingRecord {
  id: string
  bookId: string
  date: string
  duration: number
  pagesRead: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: number
  condition: {
    type: 'streak' | 'books' | 'pages' | 'notes'
    value: number
  }
}

export interface UserSettings {
  yearlyGoal: number
  speechRate: number
  theme: 'light' | 'dark'
  notifications: boolean
}

export type NodeType = 'book' | 'note' | 'tag' | 'author'

export interface GraphNode {
  id: string
  label: string
  type: NodeType
  x?: number
  y?: number
  vx?: number
  vy?: number
}

export interface GraphEdge {
  source: string
  target: string
  type: string
}

export interface KnowledgeGraph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}
