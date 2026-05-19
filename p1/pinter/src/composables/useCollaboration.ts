import { ref, onUnmounted } from 'vue'
import type { CollaborativeAction } from '@/types'
import { generateId } from '@/utils'

export function useCollaboration(boardId: string) {
  const isConnected = ref(false)
  const actions = ref<CollaborativeAction[]>([])
  const onlineUsers = ref<string[]>([])
  
  let broadcastChannel: BroadcastChannel | null = null

  function connect() {
    if (typeof BroadcastChannel === 'undefined') {
      console.warn('BroadcastChannel not supported')
      return
    }

    broadcastChannel = new BroadcastChannel(`board-${boardId}`)
    
    broadcastChannel.onmessage = (event) => {
      const action: CollaborativeAction = event.data
      
      if (action.type === 'user_join') {
        if (!onlineUsers.value.includes(action.userId)) {
          onlineUsers.value.push(action.userId)
        }
      } else if (action.type === 'user_leave') {
        onlineUsers.value = onlineUsers.value.filter(id => id !== action.userId)
      } else {
        actions.value.push(action)
      }
    }

    isConnected.value = true

    broadcastAction({
      type: 'user_join',
      payload: {},
      userId: 'current-user',
    })
  }

  function disconnect() {
    if (broadcastChannel) {
      broadcastAction({
        type: 'user_leave',
        payload: {},
        userId: 'current-user',
      })
      broadcastChannel.close()
      broadcastChannel = null
    }
    isConnected.value = false
  }

  function broadcastAction(action: Omit<CollaborativeAction, 'actionId' | 'timestamp'>) {
    if (!broadcastChannel || !isConnected.value) return

    const fullAction: CollaborativeAction = {
      ...action,
      actionId: generateId(),
      timestamp: Date.now()
    }

    broadcastChannel.postMessage(fullAction)
    
    if (action.type !== 'user_join' && action.type !== 'user_leave') {
      actions.value.push(fullAction)
    }
  }

  function broadcastCardAdd(card: any) {
    broadcastAction({
      type: 'card_add',
      payload: card,
      userId: 'current-user'
    })
  }

  function broadcastCardRemove(cardId: string) {
    broadcastAction({
      type: 'card_remove',
      payload: { id: cardId },
      userId: 'current-user'
    })
  }

  function broadcastCardMove(cardId: string, position: { x: number; y: number }) {
    broadcastAction({
      type: 'card_move',
      payload: { id: cardId, position },
      userId: 'current-user'
    })
  }

  function broadcastCardUpdate(cardId: string, updates: any) {
    broadcastAction({
      type: 'card_update',
      payload: { id: cardId, ...updates },
      userId: 'current-user'
    })
  }

  function onAction(callback: (action: CollaborativeAction) => void) {
    const handler = (event: MessageEvent) => {
      callback(event.data)
    }
    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', handler)
    }
    return () => {
      if (broadcastChannel) {
        broadcastChannel.removeEventListener('message', handler)
      }
    }
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    isConnected,
    actions,
    onlineUsers,
    connect,
    disconnect,
    broadcastAction,
    broadcastCardAdd,
    broadcastCardRemove,
    broadcastCardMove,
    broadcastCardUpdate,
    onAction
  }
}
