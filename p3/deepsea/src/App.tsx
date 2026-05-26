import { useState } from 'react'
import { GameCanvas } from './components/GameCanvas'
import { ResourcePanel } from './components/ResourcePanel'
import { BuildPanel } from './components/BuildPanel'
import { SubmersiblePanel } from './components/SubmersiblePanel'
import { TechPanel } from './components/TechPanel'
import { EventLog } from './components/EventLog'
import { useGameStore } from './store/gameStore'

type TabType = 'build' | 'sub' | 'tech'

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('build')
  const { saveGame, loadGame } = useGameStore()

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'build', label: '建造', icon: '🔧' },
    { id: 'sub', label: '潜水器', icon: '🚤' },
    { id: 'tech', label: '科技', icon: '🔬' }
  ]

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#05051a' }}>
      <div style={{
        padding: '10px 20px',
        background: 'linear-gradient(180deg, rgba(10,30,60,0.95) 0%, rgba(5,15,30,0.8) 100%)',
        borderBottom: '1px solid #2a4a7a',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: 20, color: '#8af', margin: 0 }}>
          🌊 深海探索 - Deep Sea Explorer
        </h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={saveGame}
            style={{
              padding: '6px 16px',
              background: '#2a6',
              border: 'none',
              borderRadius: 4,
              color: 'white',
              cursor: 'pointer',
              fontSize: 12
            }}
          >
            💾 保存
          </button>
          <button
            onClick={loadGame}
            style={{
              padding: '6px 16px',
              background: '#26a',
              border: 'none',
              borderRadius: 4,
              color: 'white',
              cursor: 'pointer',
              fontSize: 12
            }}
          >
            📂 读取
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div style={{
          width: 240,
          padding: 12,
          background: 'rgba(5,10,25,0.9)',
          borderRight: '1px solid #2a4a7a',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          overflowY: 'auto'
        }}>
          <ResourcePanel />
          <EventLog />
        </div>

        <div style={{ flex: 1, position: 'relative' }}>
          <GameCanvas />

          <div style={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(10, 20, 40, 0.8)',
            padding: '8px 16px',
            borderRadius: 8,
            fontSize: 12,
            color: '#8af',
            border: '1px solid #2a4a7a'
          }}>
            右键拖拽移动 | 滚轮缩放 | 点击潜水器选中后派遣 | ESC取消
          </div>
        </div>

        <div style={{
          width: 280,
          padding: 12,
          background: 'rgba(5,10,25,0.9)',
          borderLeft: '1px solid #2a4a7a',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '8px 4px',
                  background: activeTab === tab.id ? '#2a4a7a' : '#1a2a4a',
                  border: `1px solid ${activeTab === tab.id ? '#4a8aff' : '#2a4a7a'}`,
                  borderRadius: 6,
                  color: 'white',
                  fontSize: 12,
                  cursor: 'pointer'
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'build' && <BuildPanel />}
          {activeTab === 'sub' && <SubmersiblePanel />}
          {activeTab === 'tech' && <TechPanel />}
        </div>
      </div>
    </div>
  )
}
