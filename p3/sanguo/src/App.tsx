import React from 'react'
import { useGameStore } from './store/gameStore'
import { HomeView } from './components/HomeView'
import { HeroesView } from './components/HeroesView'
import { FormationView } from './components/FormationView'
import { GachaView } from './components/GachaView'
import { BattleView } from './components/BattleView'
import { InventoryView } from './components/InventoryView'
import { ActivityView } from './components/ActivityView'
import { GachaAnimation } from './components/GachaAnimation'

export const App: React.FC = () => {
  const { currentView, setCurrentView, gachaResults, showGachaAnimation, closeGachaAnimation } = useGameStore()

  const navItems = [
    { view: 'home' as const, label: '主页', icon: '🏠' },
    { view: 'heroes' as const, label: '武将', icon: '⚔️' },
    { view: 'formation' as const, label: '阵容', icon: '🏰' },
    { view: 'gacha' as const, label: '招募', icon: '🎯' },
    { view: 'activity' as const, label: '活动', icon: '🔥' },
    { view: 'inventory' as const, label: '背包', icon: '🎒' }
  ]

  const renderView = () => {
    switch (currentView) {
      case 'home': return <HomeView />
      case 'heroes': return <HeroesView />
      case 'formation': return <FormationView />
      case 'gacha': return <GachaView />
      case 'battle': return <BattleView />
      case 'activity': return <ActivityView />
      case 'inventory': return <InventoryView />
      default: return <HomeView />
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      {currentView !== 'battle' && (
        <nav style={{
          background: 'white',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          padding: '0 20px',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'center',
            gap: '8px'
          }}>
            {navItems.map(item => (
              <button
                key={item.view}
                onClick={() => setCurrentView(item.view)}
                style={{
                  padding: '16px 20px',
                  fontSize: '14px',
                  fontWeight: currentView === item.view ? 'bold' : 'normal',
                  color: currentView === item.view ? '#667eea' : '#7f8c8d',
                  background: currentView === item.view ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  borderBottom: currentView === item.view ? '3px solid #667eea' : '3px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        </nav>
      )}

      <main>
        {renderView()}
      </main>

      {showGachaAnimation && (
        <GachaAnimation results={gachaResults} onClose={closeGachaAnimation} />
      )}
    </div>
  )
}
