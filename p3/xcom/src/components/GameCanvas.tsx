import { useEffect, useRef } from 'react'
import { createGame, destroyGame } from '@/game/GameBootstrap'
import { useGameStore } from '@/store/gameStore'

export function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameCreatedRef = useRef(false)
  const { phase } = useGameStore()

  const isInGame = phase !== 'menu' && phase !== 'level_select'

  useEffect(() => {
    if (!containerRef.current) return

    if (isInGame && !gameCreatedRef.current) {
      createGame(containerRef.current)
      gameCreatedRef.current = true
    } else if (!isInGame && gameCreatedRef.current) {
      destroyGame()
      gameCreatedRef.current = false
    }

    return () => {
      if (gameCreatedRef.current) {
        destroyGame()
        gameCreatedRef.current = false
      }
    }
  }, [isInGame])

  if (!isInGame) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-slate-900"
      style={{ zIndex: 1 }}
    />
  )
}
