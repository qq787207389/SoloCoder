import React from 'react'
import { useGameStore } from '../store/gameStore'

export const BattleView: React.FC = () => {
  const { battleLogs, battleResult, setCurrentView } = useGameStore()

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>⚔️ 战斗记录</h2>

      {battleResult && (
        <div style={{
          textAlign: 'center',
          padding: '20px',
          marginBottom: '20px',
          borderRadius: '12px',
          fontSize: '24px',
          fontWeight: 'bold',
          background: battleResult === 'player'
            ? 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)'
            : 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
          color: 'white'
        }}>
          {battleResult === 'player' ? '🎉 胜利！' : '💀 战败...'}
        </div>
      )}

      <div style={{
        background: '#2c3e50',
        borderRadius: '12px',
        padding: '20px',
        maxHeight: '500px',
        overflowY: 'auto'
      }}>
        {battleLogs.map((log, index) => (
          <div
            key={index}
            style={{
              padding: '8px 12px',
              marginBottom: '4px',
              borderRadius: '6px',
              background: log.type === 'damage' ? 'rgba(231, 76, 60, 0.2)' :
                         log.type === 'heal' ? 'rgba(46, 204, 113, 0.2)' :
                         log.type === 'skill' ? 'rgba(155, 89, 182, 0.2)' :
                         'rgba(255, 255, 255, 0.1)',
              color: 'white'
            }}
          >
            {log.message}
          </div>
        ))}
        {battleLogs.length === 0 && (
          <div style={{ color: '#95a5a6', textAlign: 'center', padding: '40px' }}>
            战斗进行中...
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <button
          onClick={() => setCurrentView('home')}
          style={{
            padding: '14px 40px',
            fontSize: '18px',
            fontWeight: 'bold',
            color: 'white',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer'
          }}
        >
          返回主页
        </button>
      </div>
    </div>
  )
}
