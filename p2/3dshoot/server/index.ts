import { WebSocketServer, WebSocket } from 'ws'
import express from 'express'
import http from 'http'

interface Player {
  id: string
  name: string
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number }
  velocity: { x: number; y: number; z: number }
  health: number
  kills: number
  deaths: number
  lastShot: number
  roomId: string | null
}

interface Room {
  id: string
  players: Map<string, Player>
  maxPlayers: number
  name: string
}

interface NetworkMessage {
  type: string
  payload: any
}

const app = express()
const server = http.createServer(app)
const wss = new WebSocketServer({ server })

const players = new Map<string, Player>()
const rooms = new Map<string, Room>()
const sockets = new Map<string, WebSocket>()

function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

function broadcast(roomId: string, message: NetworkMessage, excludeId?: string) {
  const room = rooms.get(roomId)
  if (!room) return
  
  room.players.forEach((player) => {
    if (excludeId && player.id === excludeId) return
    const socket = sockets.get(player.id)
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message))
    }
  })
}

function broadcastWorldState() {
  rooms.forEach((room) => {
    const playersData = Array.from(room.players.values()).map((p) => ({
      playerId: p.id,
      name: p.name,
      x: p.position.x,
      y: p.position.y,
      z: p.position.z,
      rotation: p.rotation,
      vx: p.velocity.x,
      vy: p.velocity.y,
      vz: p.velocity.z,
      health: p.health,
      kills: p.kills,
      deaths: p.deaths,
      timestamp: Date.now()
    }))
    
    broadcast(room.id, {
      type: 'worldState',
      payload: { players: playersData }
    })
  })
}

function handlePlayerShoot(playerId: string, payload: any) {
  const player = players.get(playerId)
  if (!player || !player.roomId) return
  
  const now = Date.now()
  if (now - player.lastShot < 100) return
  player.lastShot = now
  
  const room = rooms.get(player.roomId)
  if (!room) return
  
  const origin = { x: payload.ox, y: payload.oy, z: payload.oz }
  const direction = { x: payload.dx, y: payload.dy, z: payload.dz }
  
  const dirLen = Math.sqrt(direction.x ** 2 + direction.y ** 2 + direction.z ** 2)
  direction.x /= dirLen
  direction.y /= dirLen
  direction.z /= dirLen
  
  room.players.forEach((target) => {
    if (target.id === playerId) return
    
    const toTarget = {
      x: target.position.x - origin.x,
      y: target.position.y + 1 - origin.y,
      z: target.position.z - origin.z
    }
    
    const dot = toTarget.x * direction.x + toTarget.y * direction.y + toTarget.z * direction.z
    if (dot < 0 || dot > 50) return
    
    const closest = {
      x: origin.x + direction.x * dot,
      y: origin.y + direction.y * dot,
      z: origin.z + direction.z * dot
    }
    
    const dist = Math.sqrt(
      (closest.x - target.position.x) ** 2 +
      (closest.y - (target.position.y + 1)) ** 2 +
      (closest.z - target.position.z) ** 2
    )
    
    if (dist < 0.8) {
      const damage = 25
      target.health -= damage
      
      if (target.health <= 0) {
        target.health = 100
        target.position = {
          x: (Math.random() - 0.5) * 40,
          y: 1,
          z: (Math.random() - 0.5) * 40
        }
        target.deaths++
        player.kills++
        
        broadcast(player.roomId!, {
          type: 'kill',
          payload: {
            killer: player.id,
            killerName: player.name,
            victim: target.id,
            victimName: target.name
          }
        })
      }
      
      broadcast(player.roomId!, {
        type: 'hit',
        payload: {
          target: target.id,
          health: target.health
        }
      })
    }
  })
}

function createRoom(name: string): Room {
  const id = generateId()
  const room: Room = {
    id,
    name,
    players: new Map(),
    maxPlayers: 10
  }
  rooms.set(id, room)
  return room
}

function joinRoom(playerId: string, roomId: string) {
  const player = players.get(playerId)
  const room = rooms.get(roomId)
  
  if (!player || !room) return false
  if (room.players.size >= room.maxPlayers) return false
  
  if (player.roomId) {
    const oldRoom = rooms.get(player.roomId)
    if (oldRoom) {
      oldRoom.players.delete(playerId)
      broadcast(player.roomId, {
        type: 'playerLeave',
        payload: { playerId, name: player.name }
      })
    }
  }
  
  player.roomId = roomId
  room.players.set(playerId, player)
  
  broadcast(roomId, {
    type: 'playerJoin',
    payload: {
      playerId,
      name: player.name,
      position: player.position
    }
  }, playerId)
  
  return true
}

wss.on('connection', (ws) => {
  const playerId = generateId()
  const player: Player = {
    id: playerId,
    name: `玩家${playerId.substr(0, 4).toUpperCase()}`,
    position: { x: (Math.random() - 0.5) * 20, y: 1, z: (Math.random() - 0.5) * 20 },
    rotation: { x: 0, y: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    health: 100,
    kills: 0,
    deaths: 0,
    lastShot: 0,
    roomId: null
  }
  
  players.set(playerId, player)
  sockets.set(playerId, ws)
  
  ws.send(JSON.stringify({
    type: 'welcome',
    payload: {
      playerId,
      name: player.name,
      position: player.position
    }
  }))
  
  if (rooms.size === 0) {
    createRoom('默认房间')
  }
  
  const firstRoom = rooms.values().next().value
  if (firstRoom) {
    joinRoom(playerId, firstRoom.id)
    
    ws.send(JSON.stringify({
      type: 'roomJoined',
      payload: {
        roomId: firstRoom.id,
        roomName: firstRoom.name,
        players: Array.from(firstRoom.players.values()).map((p) => ({
          id: p.id,
          name: p.name,
          position: p.position,
          health: p.health,
          kills: p.kills,
          deaths: p.deaths
        }))
      }
    }))
  }
  
  ws.on('message', (data) => {
    try {
      const message: NetworkMessage = JSON.parse(data.toString())
      
      switch (message.type) {
        case 'playerState': {
          const p = players.get(playerId)
          if (p) {
            p.position = {
              x: message.payload.x || 0,
              y: message.payload.y || 1,
              z: message.payload.z || 0
            }
            p.rotation = message.payload.rotation || { x: 0, y: 0 }
            p.velocity = {
              x: message.payload.vx || 0,
              y: message.payload.vy || 0,
              z: message.payload.vz || 0
            }
          }
          break
        }
        
        case 'shoot': {
          handlePlayerShoot(playerId, message.payload)
          break
        }
        
        case 'joinRoom': {
          joinRoom(playerId, message.payload.roomId)
          break
        }
      }
    } catch (e) {
      console.error('消息解析错误:', e)
    }
  })
  
  ws.on('close', () => {
    const p = players.get(playerId)
    if (p && p.roomId) {
      const room = rooms.get(p.roomId)
      if (room) {
        room.players.delete(playerId)
        broadcast(p.roomId, {
          type: 'playerLeave',
          payload: { playerId, name: p.name }
        })
      }
    }
    
    players.delete(playerId)
    sockets.delete(playerId)
  })
})

setInterval(broadcastWorldState, 1000 / 60)

const PORT = 8080
server.listen(PORT, () => {
  console.log(`都市风暴 - 游戏服务器启动`)
  console.log(`WebSocket 服务器运行在 ws://localhost:${PORT}`)
  console.log(`支持最多 10 人同时在线`)
})
