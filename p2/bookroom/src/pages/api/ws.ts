import { Server } from 'ws'
import type { NextApiRequest, NextApiResponse } from 'next'

const clients = new Map<string, Set<WebSocket>>()

interface WSMessage {
  type: string
  payload: any
  userId?: string
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if ((res.socket as any).server.wss) {
    res.end()
    return
  }

  const server = (res.socket as any).server
  const wss = new Server({ noServer: true })
  server.wss = wss

  wss.on('connection', (ws) => {
    let currentUserId: string | null = null

    ws.on('message', (data) => {
      try {
        const message: WSMessage = JSON.parse(data.toString())

        if (message.type === 'join' && message.userId) {
          currentUserId = message.userId
          if (!clients.has(currentUserId)) {
            clients.set(currentUserId, new Set())
          }
          clients.get(currentUserId)!.add(ws)
          broadcastUserStatus(currentUserId, 'online')
        }

        if (message.type === 'chat' && message.payload) {
          const { receiverId } = message.payload
          sendToUser(receiverId, message)
        }

        if (message.type === 'new_post' && message.payload) {
          broadcastToAll(message)
        }

        if (message.type === 'notification' && message.payload) {
          const { userId } = message.payload
          sendToUser(userId, message)
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    })

    ws.on('close', () => {
      if (currentUserId && clients.has(currentUserId)) {
        clients.get(currentUserId)!.delete(ws)
        if (clients.get(currentUserId)!.size === 0) {
          clients.delete(currentUserId)
          broadcastUserStatus(currentUserId, 'offline')
        }
      }
    })
  })

  server.on('upgrade', (request: any, socket: any, head: any) => {
    wss.handleUpgrade(request, socket, head, (ws: any) => {
      wss.emit('connection', ws, request)
    })
  })

  res.end()
}

function sendToUser(userId: string, message: WSMessage) {
  const userClients = clients.get(userId)
  if (userClients) {
    userClients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(message))
      }
    })
  }
}

function broadcastToAll(message: WSMessage) {
  clients.forEach((userClients) => {
    userClients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(message))
      }
    })
  })
}

function broadcastUserStatus(userId: string, status: 'online' | 'offline') {
  const message: WSMessage = {
    type: 'presence',
    payload: {
      userId,
      status
    }
  }
  broadcastToAll(message)
}