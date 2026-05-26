import { useGameStore } from '../store/gameStore'

const RESOURCE_NAMES: Record<string, string> = {
  ore: '矿石',
  organic: '有机物',
  rare_ore: '稀有矿',
  crystal: '水晶',
  fuel: '燃料',
  biomass: '生物质',
  alloy: '合金',
  electronics: '电子元件'
}

const RESOURCE_COLORS: Record<string, string> = {
  ore: '#c0a080',
  organic: '#40c060',
  rare_ore: '#80a0ff',
  crystal: '#c080ff',
  fuel: '#ffc040',
  biomass: '#80ff80',
  alloy: '#a0a0a0',
  electronics: '#ff80c0'
}

export function ResourcePanel() {
  const { resources, currentPower, maxPower, currentOxygen, maxOxygen, day, paused, setPaused } = useGameStore()

  return (
    <div style={{
      background: 'rgba(10, 20, 40, 0.95)',
      borderRadius: 8,
      padding: 12,
      border: '1px solid #2a4a7a',
      minWidth: 200
    }}>
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 14, color: '#8af' }}>
          第 {day} 天
        </div>
        <button
          onClick={() => setPaused(!paused)}
          style={{
            background: paused ? '#2a6' : '#a42',
            border: 'none',
            color: 'white',
            padding: '4px 12px',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 12
          }}
        >
          {paused ? '▶ 继续' : '⏸ 暂停'}
        </button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#aa0', marginBottom: 4 }}>
          <span>⚡ 电力</span>
          <span>{Math.floor(currentPower)}/{maxPower}</span>
        </div>
        <div style={{ height: 6, background: '#222', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #aa0, #ff0)',
            width: `${(currentPower / maxPower) * 100}%`,
            transition: 'width 0.3s'
          }} />
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#0af', marginBottom: 4 }}>
          <span>💨 氧气</span>
          <span>{Math.floor(currentOxygen)}/{maxOxygen}</span>
        </div>
        <div style={{ height: 6, background: '#222', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #08a, #0af)',
            width: `${(currentOxygen / maxOxygen) * 100}%`,
            transition: 'width 0.3s'
          }} />
        </div>
      </div>

      <div style={{ fontSize: 13, fontWeight: 'bold', color: '#8af', marginBottom: 8 }}>
        资源库存
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {Object.entries(resources).map(([key, value]) => (
          <div key={key} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12
          }}>
            <div style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: RESOURCE_COLORS[key]
            }} />
            <span style={{ color: '#ccc' }}>{RESOURCE_NAMES[key]}:</span>
            <span style={{ color: '#fff', fontWeight: 'bold' }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
