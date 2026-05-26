import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import { getTerrainColor, getResourceColor } from '../utils/mapGenerator'
import { ModuleType } from '../types/game'

const TILE_SIZE = 16

const MODULE_COLORS: Record<ModuleType, string> = {
  habitat: '#4a9eff',
  power: '#ffaa00',
  oxygen: '#00ff88',
  storage: '#aa88ff',
  research: '#ff66aa',
  factory: '#888888',
  nuclear: '#00ffff',
  bio_lab: '#88ff44',
  defense: '#ff4444'
}

const SUBMERSIBLE_COLORS = {
  scout: '#ffff00',
  miner: '#8b4513',
  research: '#9370db'
}

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const lastMousePos = useRef({ x: 0, y: 0 })

  const {
    map, camera, zoom, baseModules, submersibles, selectedSubmersible,
    buildMode, paused, setCamera, setZoom, setBuildMode, buildModule, selectSubmersible, dispatchSubmersible, update
  } = useGameStore()

  const pausedRef = useRef(paused)
  pausedRef.current = paused

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let lastTime = performance.now()
    let animationId: number

    const gameLoop = (currentTime: number) => {
      const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1)
      lastTime = currentTime

      try {
        if (!pausedRef.current) {
          update(deltaTime)
        }
        render(ctx)
      } catch (e) {
        console.error('Game loop error:', e)
        try {
          ctx.fillStyle = '#05051a'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.fillStyle = '#ff4444'
          ctx.font = '14px sans-serif'
          ctx.fillText('渲染错误: ' + (e as Error).message, 20, 30)
        } catch {}
      }
      animationId = requestAnimationFrame(gameLoop)
    }

    const drawRoundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + w - r, y)
      ctx.quadraticCurveTo(x + w, y, x + w, y + r)
      ctx.lineTo(x + w, y + h - r)
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
      ctx.lineTo(x + r, y + h)
      ctx.quadraticCurveTo(x, y + h, x, y + h - r)
      ctx.lineTo(x, y + r)
      ctx.quadraticCurveTo(x, y, x + r, y)
      ctx.closePath()
    }

    const render = (ctx: CanvasRenderingContext2D) => {
      const { width, height } = canvas
      ctx.fillStyle = '#05051a'
      ctx.fillRect(0, 0, width, height)

      const viewWidth = width / (TILE_SIZE * zoom)
      const viewHeight = height / (TILE_SIZE * zoom)
      const startX = Math.max(0, Math.floor(camera.x - viewWidth / 2))
      const startY = Math.max(0, Math.floor(camera.y - viewHeight / 2))
      const endX = Math.min(map.width, Math.ceil(camera.x + viewWidth / 2))
      const endY = Math.min(map.height, Math.ceil(camera.y + viewHeight / 2))

      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, 'rgba(20, 60, 100, 0.3)')
      gradient.addColorStop(1, 'rgba(5, 10, 30, 0.8)')

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const tile = map.tiles[y]?.[x]
          if (!tile) continue

          const screenX = (x - camera.x + viewWidth / 2) * TILE_SIZE * zoom
          const screenY = (y - camera.y + viewHeight / 2) * TILE_SIZE * zoom
          const size = TILE_SIZE * zoom

          if (tile.discovered) {
            ctx.fillStyle = getTerrainColor(tile.terrain, tile.depth)
            ctx.fillRect(screenX, screenY, size, size)

            if (tile.terrain === 'vent' && zoom > 0.8) {
              ctx.fillStyle = 'rgba(255, 150, 50, 0.5)'
              ctx.beginPath()
              ctx.arc(screenX + size / 2, screenY + size / 2, size / 3, 0, Math.PI * 2)
              ctx.fill()
            }

            tile.resources.forEach(res => {
              if (res.discovered && res.amount > 0) {
                ctx.fillStyle = getResourceColor(res.type)
                ctx.beginPath()
                ctx.arc(screenX + size / 2, screenY + size / 2, size / 4, 0, Math.PI * 2)
                ctx.fill()
              }
            })
          } else {
            ctx.fillStyle = '#0a0a1a'
            ctx.fillRect(screenX, screenY, size, size)
          }
        }
      }

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      baseModules.forEach(module => {
        const screenX = (module.position.x - camera.x + viewWidth / 2) * TILE_SIZE * zoom
        const screenY = (module.position.y - camera.y + viewHeight / 2) * TILE_SIZE * zoom
        const size = TILE_SIZE * zoom * 1.8

        ctx.fillStyle = MODULE_COLORS[module.type]
        drawRoundRect(ctx, screenX - size / 2, screenY - size / 2, size, size, 4 * zoom)
        ctx.fill()

        ctx.strokeStyle = '#ffffff44'
        ctx.lineWidth = 1
        ctx.stroke()

        const healthRatio = module.health / module.maxHealth
        ctx.fillStyle = healthRatio > 0.5 ? '#00ff00' : healthRatio > 0.25 ? '#ffff00' : '#ff0000'
        ctx.fillRect(screenX - size / 2, screenY + size / 2 + 2, size * healthRatio, 3)
      })

      submersibles.forEach(sub => {
        const screenX = (sub.position.x - camera.x + viewWidth / 2) * TILE_SIZE * zoom
        const screenY = (sub.position.y - camera.y + viewHeight / 2) * TILE_SIZE * zoom
        const size = TILE_SIZE * zoom * 1.2

        ctx.save()
        ctx.translate(screenX, screenY)

        ctx.fillStyle = SUBMERSIBLE_COLORS[sub.type]
        ctx.beginPath()
        ctx.ellipse(0, 0, size, size * 0.6, 0, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#87ceeb'
        ctx.beginPath()
        ctx.arc(size * 0.3, 0, size * 0.25, 0, Math.PI * 2)
        ctx.fill()

        if (sub.id === selectedSubmersible) {
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(0, 0, size * 1.3, 0, Math.PI * 2)
          ctx.stroke()
        }

        if (sub.status === 'exploring' || sub.status === 'returning') {
          ctx.fillStyle = '#ffff00'
          ctx.beginPath()
          ctx.arc(-size * 0.8, -size * 0.5, size * 0.15, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.restore()
      })

      if (selectedSubmersible) {
        const sub = submersibles.find(s => s.id === selectedSubmersible)
        if (sub?.targetPosition) {
          const startX = (sub.position.x - camera.x + viewWidth / 2) * TILE_SIZE * zoom
          const startY = (sub.position.y - camera.y + viewHeight / 2) * TILE_SIZE * zoom
          const endX = (sub.targetPosition.x - camera.x + viewWidth / 2) * TILE_SIZE * zoom
          const endY = (sub.targetPosition.y - camera.y + viewHeight / 2) * TILE_SIZE * zoom

          ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)'
          ctx.setLineDash([5, 5])
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(startX, startY)
          ctx.lineTo(endX, endY)
          ctx.stroke()
          ctx.setLineDash([])
        }
      }
    }

    animationId = requestAnimationFrame(gameLoop)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [map, camera, zoom, baseModules, submersibles, selectedSubmersible, buildMode, update])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 2) {
        isDragging.current = true
        lastMousePos.current = { x: e.clientX, y: e.clientY }
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging.current) {
        const dx = (e.clientX - lastMousePos.current.x) / (TILE_SIZE * zoom)
        const dy = (e.clientY - lastMousePos.current.y) / (TILE_SIZE * zoom)
        setCamera({ x: camera.x - dx, y: camera.y - dy })
        lastMousePos.current = { x: e.clientX, y: e.clientY }
      }
    }

    const handleMouseUp = () => {
      isDragging.current = false
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      setZoom(zoom * delta)
    }

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const clickY = e.clientY - rect.top
      const viewWidth = canvas.width / (TILE_SIZE * zoom)
      const viewHeight = canvas.height / (TILE_SIZE * zoom)
      const worldX = Math.floor(clickX / (TILE_SIZE * zoom) + camera.x - viewWidth / 2)
      const worldY = Math.floor(clickY / (TILE_SIZE * zoom) + camera.y - viewHeight / 2)

      if (buildMode) {
        buildModule(worldX, worldY)
      } else if (selectedSubmersible) {
        const sub = submersibles.find(s => s.id === selectedSubmersible)
        if (sub?.status === 'docked') {
          dispatchSubmersible(selectedSubmersible, { x: worldX, y: worldY })
        } else {
          selectSubmersible(undefined)
        }
      } else {
        const clickedSub = submersibles.find(s =>
          Math.abs(s.position.x - worldX) < 1 && Math.abs(s.position.y - worldY) < 1
        )
        if (clickedSub) {
          selectSubmersible(clickedSub.id)
        }
      }
    }

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      if (buildMode) {
        setBuildMode(null)
      }
    }

    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('mouseleave', handleMouseUp)
    canvas.addEventListener('wheel', handleWheel, { passive: false })
    canvas.addEventListener('click', handleClick)
    canvas.addEventListener('contextmenu', handleContextMenu)

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('mouseleave', handleMouseUp)
      canvas.removeEventListener('wheel', handleWheel)
      canvas.removeEventListener('click', handleClick)
      canvas.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [camera, zoom, buildMode, selectedSubmersible, submersibles, setCamera, setZoom, setBuildMode, buildModule, selectSubmersible, dispatchSubmersible])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setBuildMode(null)
        selectSubmersible(undefined)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setBuildMode, selectSubmersible])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', cursor: buildMode ? 'crosshair' : 'default' }}
      />
      {buildMode && (
        <div style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 100, 200, 0.9)',
          padding: '10px 20px',
          borderRadius: 8,
          color: 'white',
          fontSize: 14
        }}>
          建造模式: {buildMode} | 左键放置 | 右键或ESC取消
        </div>
      )}
      {selectedSubmersible && (
        <div style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(100, 100, 0, 0.9)',
          padding: '10px 20px',
          borderRadius: 8,
          color: 'white',
          fontSize: 14
        }}>
          已选中潜水器 | 点击地图派遣 | ESC取消
        </div>
      )}
    </div>
  )
}
