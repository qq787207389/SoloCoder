import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GameMode, AIType } from '../types/game'

interface GameSettings {
  mode: GameMode
  playerCount: number
  aiCount: number
  aiDifficulty: AIType
  mapSeed?: number
}

export default function MainMenu() {
  const navigate = useNavigate()
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<GameSettings>({
    mode: GameMode.CLASSIC,
    playerCount: 1,
    aiCount: 3,
    aiDifficulty: AIType.SMART,
  })

  const startGame = () => {
    navigate('/game', { state: settings })
  }

  const getModeName = (mode: GameMode) => {
    switch (mode) {
      case GameMode.CLASSIC: return '经典模式'
      case GameMode.TEAM: return '团队对战'
      case GameMode.CTF: return '夺旗模式'
    }
  }

  const getModeDesc = (mode: GameMode) => {
    switch (mode) {
      case GameMode.CLASSIC: return '最后存活者获胜'
      case GameMode.TEAM: return '团队协作消灭对方'
      case GameMode.CTF: return '保护旗帜，炸掉对方旗帜'
    }
  }

  if (showSettings) {
    return (
      <div className="menu-container">
        <h1 className="pixel-text game-title">游戏设置</h1>
        
        <div className="mode-select" style={{ gridTemplateColumns: 'repeat(3, 1fr)', maxWidth: '600px' }}>
          {[GameMode.CLASSIC, GameMode.TEAM, GameMode.CTF].map((mode) => (
            <div
              key={mode}
              className={`mode-card ${settings.mode === mode ? 'selected' : ''}`}
              onClick={() => setSettings({ ...settings, mode })}
            >
              <div style={{ fontSize: '12px', marginBottom: '8px' }}>{getModeName(mode)}</div>
              <div style={{ fontSize: '8px', color: '#aaa' }}>{getModeDesc(mode)}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '32px', minWidth: '400px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
              玩家数量: {settings.playerCount}
            </label>
            <input
              type="range"
              min="1"
              max="4"
              value={settings.playerCount}
              onChange={(e) => setSettings({ ...settings, playerCount: parseInt(e.target.value) })}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
              AI数量: {settings.aiCount}
            </label>
            <input
              type="range"
              min="0"
              max="7"
              value={settings.aiCount}
              onChange={(e) => setSettings({ ...settings, aiCount: parseInt(e.target.value) })}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
              AI难度
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[AIType.DEFENSIVE, AIType.SMART, AIType.AGGRESSIVE].map((diff) => (
                <button
                  key={diff}
                  className={`pixel-btn ${settings.aiDifficulty === diff ? '' : 'pixel-btn-secondary'}`}
                  style={{ fontSize: '10px', padding: '8px 16px', flex: 1 }}
                  onClick={() => setSettings({ ...settings, aiDifficulty: diff })}
                >
                  {diff === AIType.DEFENSIVE ? '保守' : diff === AIType.SMART ? '普通' : '激进'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            className="pixel-btn pixel-btn-secondary"
            onClick={() => setShowSettings(false)}
          >
            返回
          </button>
          <button
            className="pixel-btn pixel-btn-green"
            onClick={startGame}
          >
            开始游戏
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="menu-container">
      <h1 className="pixel-text game-title">BOOM MAN</h1>
      <p className="pixel-text game-subtitle">经典炸弹人 · 现代重制版</p>
      
      <div className="menu-buttons">
        <button className="pixel-btn" onClick={startGame}>
          快速开始
        </button>
        <button className="pixel-btn pixel-btn-secondary" onClick={() => setShowSettings(true)}>
          游戏设置
        </button>
        <button className="pixel-btn pixel-btn-green" onClick={() => navigate('/room')}>
          房间系统
        </button>
      </div>

      <div style={{ marginTop: '48px', textAlign: 'center' }}>
        <div style={{ fontSize: '10px', color: '#888', marginBottom: '8px' }}>
          操作说明
        </div>
        <div style={{ fontSize: '10px', color: '#aaa' }}>
          P1: WASD 移动 | 空格 放弹 | Q 遥控引爆
        </div>
        <div style={{ fontSize: '10px', color: '#aaa', marginTop: '4px' }}>
          P2: 方向键 移动 | 回车 放弹 | RCtrl 遥控引爆
        </div>
      </div>
    </div>
  )
}
