import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Phaser from 'phaser'
import GameScene from '../game/GameScene'
import { DEFAULT_CONFIG } from '../types/game'

export default function Game() {
  const location = useLocation()
  const navigate = useNavigate()
  const gameRef = useRef<HTMLDivElement>(null)
  const [gameStats, setGameStats] = useState<any>(null)
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    if (!gameRef.current) return

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: Math.max(DEFAULT_CONFIG.mapWidth * DEFAULT_CONFIG.tileSize + 100, 800),
      height: Math.max(DEFAULT_CONFIG.mapHeight * DEFAULT_CONFIG.tileSize + 100, 600),
      parent: gameRef.current,
      scene: [GameScene],
      backgroundColor: '#1a1a2e',
    }

    const game = new Phaser.Game(config)

    const sceneData = (location.state as any) || {}

    game.events.once('ready', () => {
      const scene = game.scene.getScene('GameScene') as GameScene
      scene.init(sceneData)
      scene.create()

      scene.setOnGameEnd((stats) => {
        setGameStats(stats)
        setShowResult(true)
      })
    })

    return () => {
      game.destroy(true)
    }
  }, [location.state])

  const restartGame = () => {
    setShowResult(false)
    setGameStats(null)
    window.location.reload()
  }

  const backToMenu = () => {
    navigate('/')
  }

  return (
    <div className="game-container">
      <button
        className="pixel-btn pixel-btn-secondary back-btn"
        onClick={backToMenu}
        style={{ pointerEvents: 'auto' }}
      >
        ← 退出
      </button>

      <div ref={gameRef} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} />

      {showResult && gameStats && (
        <div className="result-screen">
          <h1 className="pixel-text result-title">
            {gameStats.players.find((p: any) => p.isWinner)
              ? `${gameStats.players.find((p: any) => p.isWinner)?.name} 获胜!`
              : '游戏结束'}
          </h1>

          <div className="stats-table">
            <div
              className="stat-row"
              style={{
                color: '#ffd93d',
                borderBottom: '2px solid rgba(255,217,61,0.3)',
                marginBottom: '8px',
              }}
            >
              <span>玩家</span>
              <span>击杀</span>
              <span>死亡</span>
              <span>道具</span>
              <span>自爆</span>
            </div>
            {gameStats.players
              .sort((a: any, b: any) => (b.isWinner ? 1 : 0) - (a.isWinner ? 1 : 0) || b.kills - a.kills)
              .map((player: any, index: number) => (
                <div
                  key={index}
                  className={`stat-row ${player.isWinner ? 'winner' : ''}`}
                >
                  <span style={{ color: player.isWinner ? '#ffd93d' : undefined }}>
                    {player.isWinner && '👑 '}
                    {player.name}
                  </span>
                  <span>{player.kills}</span>
                  <span>{player.deaths}</span>
                  <span>{player.powerUpsCollected}</span>
                  <span>{player.selfDestructs}</span>
                </div>
              ))}
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button className="pixel-btn pixel-btn-green" onClick={restartGame}>
              再来一局
            </button>
            <button className="pixel-btn pixel-btn-secondary" onClick={backToMenu}>
              返回菜单
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
