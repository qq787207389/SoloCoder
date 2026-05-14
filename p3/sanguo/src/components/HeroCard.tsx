import React from 'react'
import { Hero } from '../types'

interface HeroCardProps {
  hero: Hero
  onClick?: () => void
  selected?: boolean
  showStats?: boolean
}

const FACTION_COLORS: Record<string, string> = {
  wei: '#3498db',
  shu: '#e74c3c',
  wu: '#27ae60',
  qun: '#9b59b6'
}

const RARITY_COLORS: Record<string, string> = {
  N: '#7f8c8d',
  R: '#3498db',
  SR: '#9b59b6',
  SSR: '#f39c12',
  UR: '#e74c3c'
}

const FACTION_NAMES: Record<string, string> = {
  wei: '魏国',
  shu: '蜀国',
  wu: '吴国',
  qun: '群雄'
}

export const HeroCard: React.FC<HeroCardProps> = ({ hero, onClick, selected, showStats }) => {
  return (
    <div
      onClick={onClick}
      style={{
        width: '160px',
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: selected ? '0 0 20px rgba(243, 156, 18, 0.8)' : '0 4px 12px rgba(0,0,0,0.15)',
        transition: 'all 0.3s ease',
        transform: onClick ? 'scale(1)' : 'scale(1)',
        border: `3px solid ${RARITY_COLORS[hero.rarity]}`
      }}
      onMouseEnter={(e) => onClick && (e.currentTarget.style.transform = 'scale(1.05)')}
      onMouseLeave={(e) => onClick && (e.currentTarget.style.transform = 'scale(1)')}
    >
      <div
        style={{
          height: '180px',
          background: `linear-gradient(135deg, ${FACTION_COLORS[hero.faction]} 0%, #2c3e50 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        <div
          style={{
            fontSize: '64px',
            color: 'white',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
          }}
        >
          {hero.name.charAt(0)}
        </div>
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: RARITY_COLORS[hero.rarity],
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          {hero.rarity}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            display: 'flex',
            gap: '2px'
          }}
        >
          {Array.from({ length: hero.maxStar }).map((_, i) => (
            <span
              key={i}
              style={{
                color: i < hero.star ? '#f1c40f' : '#7f8c8d',
                fontSize: '14px'
              }}
            >
              ★
            </span>
          ))}
        </div>
      </div>
      <div
        style={{
          background: '#ecf0f1',
          padding: '12px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{hero.name}</h3>
          <span style={{ fontSize: '12px', color: FACTION_COLORS[hero.faction] }}>{FACTION_NAMES[hero.faction]}</span>
        </div>
        <div style={{ fontSize: '12px', color: '#7f8c8d', marginBottom: '8px' }}>
          Lv.{hero.level}
        </div>
        {showStats && (
          <div style={{ fontSize: '11px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
            <div>❤️ {hero.baseStats.hp + hero.growthStats.hp * (hero.level - 1)}</div>
            <div>⚔️ {hero.baseStats.atk + hero.growthStats.atk * (hero.level - 1)}</div>
            <div>🛡️ {hero.baseStats.def + hero.growthStats.def * (hero.level - 1)}</div>
            <div>💨 {hero.baseStats.spd + hero.growthStats.spd * (hero.level - 1)}</div>
          </div>
        )}
      </div>
    </div>
  )
}
