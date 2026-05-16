import * as THREE from 'three'
import { NETWORK_CONFIG } from '../config/WeaponConfig'

interface PlayerState {
  id: string
  position: THREE.Vector3
  rotation: { x: number; y: number }
  velocity: THREE.Vector3
  health: number
  timestamp: number
}

interface NetworkMessage {
  type: string
  payload: any
}

export class NetworkClient {
  private socket: WebSocket | null
  private playerId: string | null
  private roomId: string | null
  private isConnected: boolean
  
  private otherPlayers: Map<string, PlayerState>
  private playerStates: Map<string, PlayerState[]>
  
  private inputSequence: number
  private pendingInputs: any[]
  private lastServerState: PlayerState | null
  
  private onPlayerJoinCallback: ((playerId: string) => void) | null
  private onPlayerLeaveCallback: ((playerId: string) => void) | null
  private onPlayerStateCallback: ((state: PlayerState) => void) | null
  private onShootCallback: ((data: any) => void) | null
  private onKillCallback: ((data: any) => void) | null

  constructor() {
    this.socket = null
    this.playerId = null
    this.roomId = null
    this.isConnected = false
    
    this.otherPlayers = new Map()
    this.playerStates = new Map()
    
    this.inputSequence = 0
    this.pendingInputs = []
    this.lastServerState = null
    
    this.onPlayerJoinCallback = null
    this.onPlayerLeaveCallback = null
    this.onPlayerStateCallback = null
    this.onShootCallback = null
    this.onKillCallback = null
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(NETWORK_CONFIG.serverUrl)
        
        this.socket.onopen = () => {
          this.isConnected = true
          console.log('[Network] Connected to server')
          resolve()
        }
        
        this.socket.onmessage = (event) => {
          const message: NetworkMessage = JSON.parse(event.data)
          this.handleMessage(message)
        }
        
        this.socket.onerror = (error) => {
          console.error('[Network] Connection error:', error)
          reject(error)
        }
        
        this.socket.onclose = () => {
          this.isConnected = false
          console.log('[Network] Disconnected from server')
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  public disconnect() {
    if (this.socket) {
      this.socket.close()
    }
  }

  private handleMessage(message: NetworkMessage) {
    switch (message.type) {
      case 'welcome':
        this.playerId = message.payload.playerId
        break
      case 'roomJoined':
        this.roomId = message.payload.roomId
        break
      case 'playerJoin':
        this.handlePlayerJoin(message.payload)
        break
      case 'playerLeave':
        this.handlePlayerLeave(message.payload)
        break
      case 'playerState':
        this.handlePlayerState(message.payload)
        break
      case 'shoot':
        this.handleShoot(message.payload)
        break
      case 'kill':
        this.handleKill(message.payload)
        break
      case 'worldState':
        this.handleWorldState(message.payload)
        break
    }
  }

  private handlePlayerJoin(payload: any) {
    console.log('[Network] Player joined:', payload.playerId)
    if (this.onPlayerJoinCallback) {
      this.onPlayerJoinCallback(payload.playerId)
    }
  }

  private handlePlayerLeave(payload: any) {
    console.log('[Network] Player left:', payload.playerId)
    this.otherPlayers.delete(payload.playerId)
    this.playerStates.delete(payload.playerId)
    
    if (this.onPlayerLeaveCallback) {
      this.onPlayerLeaveCallback(payload.playerId)
    }
  }

  private handlePlayerState(payload: any) {
    const state: PlayerState = {
      id: payload.playerId,
      position: new THREE.Vector3(payload.x, payload.y, payload.z),
      rotation: payload.rotation,
      velocity: new THREE.Vector3(payload.vx, payload.vy, payload.vz),
      health: payload.health,
      timestamp: payload.timestamp
    }
    
    if (payload.playerId === this.playerId) {
      this.lastServerState = state
      this.reconcileState(state)
    } else {
      if (!this.playerStates.has(payload.playerId)) {
        this.playerStates.set(payload.playerId, [])
      }
      this.playerStates.get(payload.playerId)!.push(state)
      
      if (this.onPlayerStateCallback) {
        this.onPlayerStateCallback(state)
      }
    }
  }

  private handleShoot(payload: any) {
    if (this.onShootCallback) {
      this.onShootCallback(payload)
    }
  }

  private handleKill(payload: any) {
    if (this.onKillCallback) {
      this.onKillCallback(payload)
    }
  }

  private handleWorldState(payload: any) {
    payload.players.forEach((playerState: any) => {
      if (playerState.playerId !== this.playerId) {
        const state: PlayerState = {
          id: playerState.playerId,
          position: new THREE.Vector3(playerState.x, playerState.y, playerState.z),
          rotation: playerState.rotation,
          velocity: new THREE.Vector3(playerState.vx, playerState.vy, playerState.vz),
          health: playerState.health,
          timestamp: playerState.timestamp
        }
        
        if (!this.playerStates.has(playerState.playerId)) {
          this.playerStates.set(playerState.playerId, [])
        }
        this.playerStates.get(playerState.playerId)!.push(state)
      }
    })
  }

  private reconcileState(serverState: PlayerState) {
    let state = serverState
    
    for (const input of this.pendingInputs) {
      if (input.sequence > serverState.timestamp) {
        state = this.applyInput(state, input)
      }
    }
    
    if (this.onPlayerStateCallback) {
      this.onPlayerStateCallback(state)
    }
  }

  private applyInput(state: PlayerState, input: any): PlayerState {
    const newState = { ...state }
    newState.position.x += input.dx
    newState.position.z += input.dz
    newState.rotation = input.rotation
    return newState
  }

  public sendPlayerState(
    position: THREE.Vector3,
    rotation: { x: number; y: number },
    velocity: THREE.Vector3
  ) {
    if (!this.isConnected || !this.socket) return
    
    this.inputSequence++
    
    const message: NetworkMessage = {
      type: 'playerState',
      payload: {
        x: position.x,
        y: position.y,
        z: position.z,
        rotation,
        vx: velocity.x,
        vy: velocity.y,
        vz: velocity.z,
        sequence: this.inputSequence,
        timestamp: Date.now()
      }
    }
    
    this.pendingInputs.push({
      sequence: this.inputSequence,
      dx: velocity.x * 0.016,
      dz: velocity.z * 0.016,
      rotation
    })
    
    if (this.pendingInputs.length > NETWORK_CONFIG.maxPredictionFrames) {
      this.pendingInputs.shift()
    }
    
    this.socket.send(JSON.stringify(message))
  }

  public sendShoot(origin: THREE.Vector3, direction: THREE.Vector3) {
    if (!this.isConnected || !this.socket) return
    
    const message: NetworkMessage = {
      type: 'shoot',
      payload: {
        ox: origin.x,
        oy: origin.y,
        oz: origin.z,
        dx: direction.x,
        dy: direction.y,
        dz: direction.z,
        timestamp: Date.now()
      }
    }
    
    this.socket.send(JSON.stringify(message))
  }

  public sendJoinRoom(roomId: string) {
    if (!this.isConnected || !this.socket) return
    
    const message: NetworkMessage = {
      type: 'joinRoom',
      payload: { roomId }
    }
    
    this.socket.send(JSON.stringify(message))
  }

  public getInterpolatedPlayerState(playerId: string): PlayerState | null {
    const states = this.playerStates.get(playerId)
    if (!states || states.length < 2) return null
    
    const now = Date.now()
    const renderTime = now - NETWORK_CONFIG.interpolationDelay
    
    while (states.length >= 2 && states[1].timestamp <= renderTime) {
      states.shift()
    }
    
    if (states.length < 2) return states[0] || null
    
    const t0 = states[0].timestamp
    const t1 = states[1].timestamp
    const alpha = (renderTime - t0) / (t1 - t0)
    
    return {
      id: playerId,
      position: states[0].position.clone().lerp(states[1].position, alpha),
      rotation: {
        x: states[0].rotation.x + (states[1].rotation.x - states[0].rotation.x) * alpha,
        y: states[0].rotation.y + (states[1].rotation.y - states[0].rotation.y) * alpha
      },
      velocity: states[0].velocity.clone().lerp(states[1].velocity, alpha),
      health: states[0].health,
      timestamp: renderTime
    }
  }

  public getPlayerId(): string | null {
    return this.playerId
  }

  public getRoomId(): string | null {
    return this.roomId
  }

  public onPlayerJoin(callback: (playerId: string) => void) {
    this.onPlayerJoinCallback = callback
  }

  public onPlayerLeave(callback: (playerId: string) => void) {
    this.onPlayerLeaveCallback = callback
  }

  public onPlayerState(callback: (state: PlayerState) => void) {
    this.onPlayerStateCallback = callback
  }

  public onShoot(callback: (data: any) => void) {
    this.onShootCallback = callback
  }

  public onKill(callback: (data: any) => void) {
    this.onKillCallback = callback
  }
}
