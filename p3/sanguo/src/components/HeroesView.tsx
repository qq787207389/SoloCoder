import React, { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { HeroCard } from './HeroCard'
import { Hero } from '../types'

export const HeroesView: React.FC = () => {
  const { playerData, levelUpHero, starUpHero } = useGameStore()
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null)

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px' }}>🏯 武将列表</h2>

      <div style={{ display: 'flex', gap: '40px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
            {playerData.heroes.map(hero => (
              <HeroCard
                key={hero.id}
                hero={hero}
                selected={selectedHero?.id === hero.id}
                onClick={() => setSelectedHero(hero)}
                showStats
              />
            ))}
          </div>
        </div>

        {selectedHero && (
          <div style={{ width: '320px', background: '#ecf0f1', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ marginBottom: '16px', textAlign: 'center' }}>{selectedHero.name}</h3>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>等级</span>
                <span style={{ fontWeight: 'bold' }}>Lv.{selectedHero.level}/100</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>星级</span>
                <span style={{ color: '#f1c40f' }}>
                  {'★'.repeat(selectedHero.star)}{'☆'.repeat(selectedHero.maxStar - selectedHero.star)}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => {
                  levelUpHero(selectedHero.id)
                  const updated = playerData.heroes.find(h => h.id === selectedHero.id)
                  if (updated) setSelectedHero({ ...updated })
                }}
                style={{
                  padding: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: 'white',
                  background: 'linear-gradient(135deg, #3498db 0%, #2ecc71 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                升级 (💰{selectedHero.level * 100})
              </button>
              <button
                onClick={() => {
                  starUpHero(selectedHero.id)
                  const updated = playerData.heroes.find(h => h.id === selectedHero.id)
                  if (updated) setSelectedHero({ ...updated })
                }}
                style={{
                  padding: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: 'white',
                  background: 'linear-gradient(135deg, #f39c12 0%, #e74c3c 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                升星 (💎{(selectedHero.star + 1) * 1000})
              </button>
            </div>

            <div style={{ marginTop: '24px' }}>
              <h4 style={{ marginBottom: '12px' }}>技能</h4>
              {selectedHero.skills.map(skillId => (
                <div key={skillId} style={{ background: 'white', padding: '12px', borderRadius: '8px', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>技能 {skillId}</div>
                  <div style={{ fontSize: '12px', color: '#7f8c8d' }}>强力武将技能</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
