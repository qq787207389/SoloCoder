import React from 'react'
import { useGameStore } from '../store/gameStore'

export const HomeView: React.FC = () => {
  const { playerData, setCurrentView, startBattle } = useGameStore()
  const enemies = [
    { id: 'enemy1', name: '黄巾军', rarity: 'R' as const, faction: 'qun' as const, level: 30, star: 0, maxStar: 7, baseStats: { hp: 2000, atk: 250, def: 100, spd: 80, critRate: 0.05, critDamage: 1.2 }, growthStats: { hp: 20, atk: 2.5, def: 1, spd: 0.8, critRate: 0.001, critDamage: 0.01 }, skills: ['s1010'], fate: [], talentPoints: 0, talents: [], equipment: [] },
    { id: 'enemy2', name: '董卓军', rarity: 'SR' as const, faction: 'qun' as const, level: 40, star: 1, maxStar: 7, baseStats: { hp: 2500, atk: 320, def: 130, spd: 90, critRate: 0.08, critDamage: 1.3 }, growthStats: { hp: 25, atk: 3.2, def: 1.3, spd: 0.9, critRate: 0.001, critDamage: 0.01 }, skills: ['s1009'], fate: [], talentPoints: 0, talents: [], equipment: [] }
  ]

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '10px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          霸业三国志
        </h1>
        <p style={{ color: '#7f8c8d' }}>策略卡牌 · 回合对战 · 武将养成</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: 'linear-gradient(135deg, #f39c12 0%, #e74c3c 100%)', padding: '16px 32px', borderRadius: '12px', color: 'white', fontWeight: 'bold' }}>
          💰 金币: {playerData.gold.toLocaleString()}
        </div>
        <div style={{ background: 'linear-gradient(135deg, #3498db 0%, #2ecc71 100%)', padding: '16px 32px', borderRadius: '12px', color: 'white', fontWeight: 'bold' }}>
          💎 玉石: {playerData.jade.toLocaleString()}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {[
          { icon: '⚔️', name: '武将', view: 'heroes' as const, color: '#e74c3c' },
          { icon: '🏰', name: '阵容', view: 'formation' as const, color: '#3498db' },
          { icon: '🎯', name: '招募', view: 'gacha' as const, color: '#9b59b6' },
          { icon: '🎒', name: '背包', view: 'inventory' as const, color: '#f39c12' },
          { icon: '🔥', name: '虎牢关', view: 'activity' as const, color: '#e67e22' }
        ].map(item => (
          <button
            key={item.view}
            onClick={() => setCurrentView(item.view)}
            style={{
              padding: '24px',
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'white',
              background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}cc 100%)`,
              border: 'none',
              borderRadius: '16px',
              cursor: 'pointer',
              boxShadow: `0 4px 20px ${item.color}40`,
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = `0 8px 30px ${item.color}60`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = `0 4px 20px ${item.color}40`
            }}
          >
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>{item.icon}</div>
            {item.name}
          </button>
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        <button
          onClick={() => startBattle(enemies)}
          style={{
            padding: '20px 60px',
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'white',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '30px',
            cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.5)',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          ⚔️ 开始战斗
        </button>
      </div>
    </div>
  )
}
