export interface WSMessage {
  type: 'chat' | 'notification' | 'new_post' | 'activity_update' | 'presence'
  payload: any
  timestamp: number
}

export interface ChatMessagePayload {
  id: string
  senderId: string
  receiverId: string
  content: string
  type: string
  createdAt: string
}

export interface NewPostPayload {
  postId: string
  circleId: string
  userId: string
  userName: string
  content: string
  createdAt: string
}

export interface NotificationPayload {
  id: string
  type: string
  title: string
  message: string
  userId: string
}

export interface PresencePayload {
  userId: string
  status: 'online' | 'offline'
}