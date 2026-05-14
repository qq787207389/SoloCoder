import React, { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { HeroCard } from './HeroCard'
import { Hero } from '../types'

export const FormationView: React.FC = () => {
  const { playerData, setFormation } = useGameStore()
  const [draggedHero, setDraggedHero] = useState<Hero | null>(null)

  const handleDragStart = (hero: Hero) => {
    setDraggedHero(hero)
  }

  const handleDrop = (position: number) => {
    if (draggedHero) {
      setFormation(position, draggedHero.id)
      setDraggedHero(null)
    }
  }

  const handleRemoveFromFormation = (position: number) => {
    setFormation(position, null)
  }

  const availableHeroes = playerData.heroes.filter(
    hero => !playerData.formation.includes(hero.id)
  )

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px' }}>🏰 阵容编排</h2>

      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ marginBottom: '16px' }}>出战阵容 ({playerData.formation.filter(id => id).length}/5)</h3>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {playerData.formation.map((heroId, index) => {
            const hero = heroId ? playerData.heroes.find(h => h.id === heroId) : null
            return (
              <div
                key={index}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(index)}
                style={{
                  width: '160px',
                  height: '280px',
                  border: '2px dashed #bdc3c7',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: hero ? 'transparent' : '#ecf0f1'
                }}
              >
                {hero ? (
                  <div style={{ position: 'relative' }}>
                    <HeroCard hero={hero} />
                    <button
                      onClick={() => handleRemoveFromFormation(index)}
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: '48px', color: '#bdc3c7', marginBottom: '8px' }}>+</div>
                    <div style={{ color: '#95a5a6', fontSize: '14px' }}>位置 {index + 1}</div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: '16px' }}>可上阵武将</h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {availableHeroes.map(hero => (
            <div
              key={hero.id}
              draggable
              onDragStart={() => handleDragStart(hero)}
              style={{ cursor: 'grab' }}
            >
              <HeroCard hero={hero} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
