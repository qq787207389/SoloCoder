type EventCallback = (...args: unknown[]) => void

class EventBus {
  private events: Map<string, EventCallback[]> = new Map()

  on(event: string, callback: EventCallback): () => void {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)!.push(callback)

    return () => {
      const callbacks = this.events.get(event)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  emit(event: string, ...args: unknown[]): void {
    const callbacks = this.events.get(event)
    if (callbacks) {
      callbacks.forEach((cb) => cb(...args))
    }
  }

  off(event: string, callback?: EventCallback): void {
    if (!callback) {
      this.events.delete(event)
      return
    }

    const callbacks = this.events.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  clear(): void {
    this.events.clear()
  }
}

export const eventBus = new EventBus()

export const EVENTS = {
  GAME_START: 'game:start',
  TURN_START: 'turn:start',
  TURN_END: 'turn:end',
  UNIT_SELECTED: 'unit:selected',
  UNIT_MOVED: 'unit:moved',
  UNIT_ATTACKED: 'unit:attacked',
  UNIT_DAMAGED: 'unit:damaged',
  UNIT_HEALED: 'unit:healed',
  UNIT_KILLED: 'unit:killed',
  ACTION_PERFORMED: 'action:performed',
  COVER_DESTROYED: 'cover:destroyed',
  SMOKE_ADDED: 'smoke:added',
  MINE_TRIGGERED: 'mine:triggered',
  LOG_MESSAGE: 'log:message',
  ANIMATION_START: 'animation:start',
  ANIMATION_COMPLETE: 'animation:complete',
  PHASE_CHANGE: 'phase:change',
  GAME_OVER: 'game:over',
  VICTORY: 'game:victory',
} as const
