import React from 'react'
import { useGameStore } from '../store/gameStore'
import { Equipment } from '../types'

const EQUIPMENT_TYPES: Record<string, string> = {
  weapon: '⚔️ 武器',
  armor: '🛡️ 防具',
  accessory: '💍 饰品',
  horse: '🐎 坐骑'
}

const RARITY_COLORS: Record<string, string> = {
  N: '#7f8c8d',
  R: '#3498db',
  SR: '#9b59b6',
  SSR: '#f39c12',
  UR: '#e74c3c'
}

export const InventoryView: React.FC = () => {
  const { playerData } = useGameStore()

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px' }}>🎒 背包</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
        {playerData.inventory.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#7f8c8d', fontSize: '18px' }}>
            背包空空如也...
          </div>
        ) : (
          playerData.inventory.map((item: Equipment, index: number) => (
            <div
              key={index}
              style={{
                padding: '16px',
                borderRadius: '12px',
                border: `2px solid ${RARITY_COLORS[item.rarity]}`,
                background: '#ecf0f1'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{EQUIPMENT_TYPES[item.type]}</span>
                <span style={{ color: RARITY_COLORS[item.rarity], fontWeight: 'bold' }}>{item.rarity}</span>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>{item.name}</div>
              <div style={{ fontSize: '12px', color: '#7f8c8d' }}>
                {Object.entries(item.stats).map(([stat, value]) => (
                  <div key={stat}>{stat}: {value}</div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
