import { useGameStore } from '../store/gameStore'

export function EventLog() {
  const { events } = useGameStore()

  const getEventColor = (type: string) => {
    switch (type) {
      case 'resource_discovery': return '#4f8'
      case 'creature_encounter': return '#f84'
      case 'treasure': return '#ff0'
      case 'earthquake': return '#f44'
      case 'pressure_warning': return '#f84'
      default: return '#8af'
    }
  }

  return (
    <div style={{
      background: 'rgba(10, 20, 40, 0.95)',
      borderRadius: 8,
      padding: 12,
      border: '1px solid #2a4a7a',
      maxHeight: 200,
      overflowY: 'auto'
    }}>
      <div style={{ fontSize: 14, fontWeight: 'bold', color: '#8af', marginBottom: 8 }}>
        📋 事件日志
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {events.slice().reverse().slice(0, 10).map(event => (
          <div
            key={event.id}
            style={{
              padding: '6px 8px',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: 4,
              borderLeft: `3px solid ${getEventColor(event.type)}`,
              fontSize: 12,
              color: '#ccc'
            }}
          >
            {event.message}
          </div>
        ))}
      </div>
    </div>
  )
}
