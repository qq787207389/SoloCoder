import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { SubmersibleType } from '../types/game'

const SUBMERSIBLE_INFO: Record<SubmersibleType, { name: string; desc: string }> = {
  scout: { name: '侦察艇', desc: '快速、灵活，适合探索未知区域' },
  miner: { name: '采矿机器人', desc: '大容量货舱，高效采集资源' },
  research: { name: '科研潜艇', desc: '可下潜至最深处，进行科学研究' }
}

const SUBMERSIBLE_COLORS: Record<SubmersibleType, string> = {
  scout: '#ffff00',
  miner: '#8b4513',
  research: '#9370db'
}

export function SubmersiblePanel() {
  const { submersibles, selectedSubmersible, selectSubmersible, recallSubmersible, buildSubmersible, canAfford } = useGameStore()
  const [buildType, setBuildType] = useState<SubmersibleType | null>(null)
  const [newName, setNewName] = useState('')

  const subTypes: SubmersibleType[] = ['scout', 'miner', 'research']

  const handleBuild = () => {
    if (buildType && newName) {
      const success = buildSubmersible(buildType, newName)
      if (success) {
        setBuildType(null)
        setNewName('')
      }
    }
  }

  return (
    <div style={{
      background: 'rgba(10, 20, 40, 0.95)',
      borderRadius: 8,
      padding: 12,
      border: '1px solid #2a4a7a'
    }}>
      <div style={{ fontSize: 14, fontWeight: 'bold', color: '#8af', marginBottom: 10 }}>
        🚤 潜水器
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {submersibles.map(sub => (
          <div
            key={sub.id}
            onClick={() => selectSubmersible(sub.id === selectedSubmersible ? undefined : sub.id)}
            style={{
              padding: 8,
              background: selectedSubmersible === sub.id ? '#2a4a7a' : '#1a2a4a',
              border: `1px solid ${selectedSubmersible === sub.id ? '#4a8aff' : '#2a4a7a'}`,
              borderRadius: 6,
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{
                width: 24,
                height: 14,
                borderRadius: 7,
                background: SUBMERSIBLE_COLORS[sub.type]
              }} />
              <span style={{ fontSize: 13, fontWeight: 'bold', color: '#fff' }}>{sub.name}</span>
              <span style={{
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: 4,
                background: sub.status === 'docked' ? '#2a6' : sub.status === 'exploring' ? '#a82' : '#a22'
              }}>
                {sub.status === 'docked' ? '停泊' : sub.status === 'exploring' ? '探索中' : sub.status === 'returning' ? '返航中' : '损坏'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 11, color: '#aaa' }}>
              <div>深度: {sub.maxDepth}m</div>
              <div>货舱: {sub.cargoCapacity}</div>
              <div>燃料: {Math.floor(sub.fuel)}/{sub.maxFuel}</div>
              <div>耐久: {sub.health}/{sub.maxHealth}</div>
            </div>
            {sub.status !== 'docked' && (
              <button
                onClick={(e) => { e.stopPropagation(); recallSubmersible(sub.id) }}
                style={{
                  marginTop: 6,
                  width: '100%',
                  padding: '4px 8px',
                  background: '#a42',
                  border: 'none',
                  borderRadius: 4,
                  color: 'white',
                  fontSize: 11,
                  cursor: 'pointer'
                }}
              >
                召回
              </button>
            )}
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid #2a4a7a', paddingTop: 10 }}>
        <div style={{ fontSize: 12, color: '#8af', marginBottom: 8 }}>建造新潜水器</div>
        {!buildType ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {subTypes.map(type => (
              <button
                key={type}
                onClick={() => setBuildType(type)}
                disabled={!canAfford(getSubCost(type))}
                style={{
                  padding: 6,
                  background: canAfford(getSubCost(type)) ? '#1a3a5a' : '#1a1a2a',
                  border: '1px solid #2a4a7a',
                  borderRadius: 4,
                  color: 'white',
                  fontSize: 11,
                  cursor: canAfford(getSubCost(type)) ? 'pointer' : 'not-allowed',
                  opacity: canAfford(getSubCost(type)) ? 1 : 0.5,
                  textAlign: 'left'
                }}
              >
                <b>{SUBMERSIBLE_INFO[type].name}</b> - {SUBMERSIBLE_INFO[type].desc}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 12, color: '#fff' }}>
              建造: {SUBMERSIBLE_INFO[buildType].name}
            </div>
            <input
              type="text"
              placeholder="输入潜水器名称"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{
                padding: '6px 8px',
                background: '#0a1525',
                border: '1px solid #2a4a7a',
                borderRadius: 4,
                color: 'white',
                fontSize: 12
              }}
            />
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={handleBuild}
                disabled={!newName}
                style={{
                  flex: 1,
                  padding: '6px',
                  background: '#2a6',
                  border: 'none',
                  borderRadius: 4,
                  color: 'white',
                  fontSize: 12,
                  cursor: newName ? 'pointer' : 'not-allowed',
                  opacity: newName ? 1 : 0.5
                }}
              >
                确认建造
              </button>
              <button
                onClick={() => { setBuildType(null); setNewName('') }}
                style={{
                  padding: '6px 12px',
                  background: '#622',
                  border: 'none',
                  borderRadius: 4,
                  color: 'white',
                  fontSize: 12,
                  cursor: 'pointer'
                }}
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function getSubCost(type: SubmersibleType): { ore?: number; alloy?: number; electronics?: number; fuel?: number } {
  const costs: Record<SubmersibleType, { ore?: number; alloy?: number; electronics?: number; fuel?: number }> = {
    scout: { ore: 40, alloy: 20, electronics: 15, fuel: 50 },
    miner: { ore: 80, alloy: 40, electronics: 20, fuel: 60 },
    research: { ore: 60, alloy: 30, electronics: 40, fuel: 70 }
  }
  return costs[type]
}
