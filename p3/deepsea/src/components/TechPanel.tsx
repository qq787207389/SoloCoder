import { useGameStore } from '../store/gameStore'

export function TechPanel() {
  const { technologies, unlockTech, canAfford } = useGameStore()

  return (
    <div style={{
      background: 'rgba(10, 20, 40, 0.95)',
      borderRadius: 8,
      padding: 12,
      border: '1px solid #2a4a7a',
      maxHeight: '50vh',
      overflowY: 'auto'
    }}>
      <div style={{ fontSize: 14, fontWeight: 'bold', color: '#8af', marginBottom: 10 }}>
        🔬 科技树
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {technologies.map(tech => {
          const prereqsMet = tech.prerequisites.every(p =>
            technologies.find(t => t.id === p)?.unlocked
          )
          const affordable = canAfford(tech.cost)

          return (
            <div
              key={tech.id}
              style={{
                padding: 10,
                background: tech.unlocked ? '#1a4a2a' : prereqsMet ? '#1a2a4a' : '#1a1a2a',
                border: `1px solid ${tech.unlocked ? '#2a8a4a' : prereqsMet ? '#2a4a7a' : '#333'}`,
                borderRadius: 6,
                opacity: tech.unlocked || prereqsMet ? 1 : 0.5
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 'bold', color: '#fff' }}>
                  {tech.name}
                </span>
                {tech.unlocked ? (
                  <span style={{ fontSize: 11, color: '#4f8', padding: '2px 6px', background: '#1a4a2a', borderRadius: 4 }}>
                    ✓ 已解锁
                  </span>
                ) : (
                  <button
                    onClick={() => unlockTech(tech.id)}
                    disabled={!prereqsMet || !affordable}
                    style={{
                      padding: '4px 10px',
                      background: prereqsMet && affordable ? '#2a6' : '#333',
                      border: 'none',
                      borderRadius: 4,
                      color: 'white',
                      fontSize: 11,
                      cursor: prereqsMet && affordable ? 'pointer' : 'not-allowed'
                    }}
                  >
                    研究
                  </button>
                )}
              </div>
              <div style={{ fontSize: 11, color: '#aaa', marginBottom: 6 }}>
                {tech.description}
              </div>
              {!tech.unlocked && (
                <>
                  <div style={{ fontSize: 10, color: '#fa0', marginBottom: 4 }}>
                    消耗: {Object.entries(tech.cost).map(([k, v]) => `${k}:${v}`).join(', ')}
                  </div>
                  {tech.prerequisites.length > 0 && (
                    <div style={{ fontSize: 10, color: prereqsMet ? '#4f8' : '#f66' }}>
                      前置: {tech.prerequisites.map(p => technologies.find(t => t.id === p)?.name).join(', ')}
                    </div>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
