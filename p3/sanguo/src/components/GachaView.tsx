import React from 'react'
import { useGameStore } from '../store/gameStore'
import { GACHA_POOLS } from '../data/gacha'

export const GachaView: React.FC = () => {
  const { performGachaPull, playerData } = useGameStore()

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '30px', textAlign: 'center' }}>🎯 武将招募</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {Object.entries(GACHA_POOLS).map(([id, pool]) => {
          const cost = id === 'friend' ? 100 : 160
          const currency = id === 'friend' ? '💰 金币' : '💎 玉石'
          const pityCount = playerData.pityCounters[id] || 0

          return (
            <div
              key={id}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '20px',
                padding: '24px',
                color: 'white',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)'
              }}
            >
              <h3 style={{ marginBottom: '16px', fontSize: '24px' }}>{pool.name}</h3>

              <div style={{ marginBottom: '20px' }}>
                {pool.rates.map(rate => (
                  <div key={rate.rarity} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>{rate.rarity}</span>
                    <span>{(rate.rate * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>

              {pool.hardPity > 0 && (
                <div style={{ marginBottom: '16px', fontSize: '14px', opacity: 0.9 }}>
                  <div>💫 保底进度: {pityCount}/{pool.hardPity}</div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.3)', borderRadius: '4px', marginTop: '8px', overflow: 'hidden' }}>
                    <div style={{ width: `${(pityCount / pool.hardPity) * 100}%`, height: '100%', background: '#f39c12', borderRadius: '4px', transition: 'width 0.3s' }} />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => performGachaPull(id, 1)}
                  style={{
                    padding: '14px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#667eea',
                    background: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  单抽 ({currency} {cost})
                </button>
                <button
                  onClick={() => performGachaPull(id, 10)}
                  style={{
                    padding: '14px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: 'white',
                    background: 'linear-gradient(135deg, #f39c12 0%, #e74c3c 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  十连抽 ({currency} {cost * 10}) ★必出SR以上★
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
