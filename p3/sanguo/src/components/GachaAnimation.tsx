import React, { useState, useEffect, useCallback } from 'react'
import { Hero } from '../types'

interface GachaAnimationProps {
  results: { hero: Hero; isNew: boolean }[]
  onClose: () => void
}

const RARITY_COLORS: Record<string, string> = {
  N: '#7f8c8d',
  R: '#3498db',
  SR: '#9b59b6',
  SSR: '#f39c12',
  UR: '#e74c3c'
}

export const GachaAnimation: React.FC<GachaAnimationProps> = ({ results, onClose }) => {
  const [revealedCount, setRevealedCount] = useState(0)
  const [allRevealed, setAllRevealed] = useState(false)

  useEffect(() => {
    if (results.length === 0) return

    setRevealedCount(0)
    setAllRevealed(false)

    let current = 0
    const timers: NodeJS.Timeout[] = []

    const startReveal = () => {
      if (current < results.length) {
        timers.push(setTimeout(() => {
          current++
          setRevealedCount(current)
          startReveal()
        }, 400))
      } else {
        timers.push(setTimeout(() => setAllRevealed(true), 300))
      }
    }

    timers.push(setTimeout(startReveal, 200))

    return () => {
      timers.forEach(t => clearTimeout(t))
    }
  }, [results])

  if (results.length === 0) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.9)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
    >
      <h2 style={{ color: 'white', marginBottom: '30px', fontSize: '28px' }}>🎉 招募结果 🎉</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: results.length <= 5 ? `repeat(${results.length}, 1fr)` : 'repeat(5, 1fr)',
          gap: '16px',
          maxWidth: '900px'
        }}
      >
        {results.map((result, index) => {
          const isRevealed = index < revealedCount
          return (
            <div
              key={index}
              style={{
                width: '120px',
                height: '160px',
                perspective: '1000px',
                cursor: 'pointer'
              }}
              onClick={() => {
                if (!isRevealed) {
                  setRevealedCount(index + 1)
                }
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.6s',
                  transform: isRevealed ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                  }}
                >
                  ?
                </div>
                <div
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: `linear-gradient(135deg, ${RARITY_COLORS[result.hero?.rarity] || RARITY_COLORS.R} 0%, #2c3e50 100%)`,
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 8px 32px ${RARITY_COLORS[result.hero?.rarity] || RARITY_COLORS.R}40`
                  }}
                >
                  <div style={{ fontSize: '40px', color: 'white', marginBottom: '8px' }}>
                    {result.hero?.name?.charAt(0) || '?'}
                  </div>
                  <div style={{ color: 'white', fontWeight: 'bold', marginBottom: '4px' }}>
                    {result.hero?.name || '未知武将'}
                  </div>
                  <div
                    style={{
                      background: RARITY_COLORS[result.hero?.rarity] || RARITY_COLORS.R,
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  >
                    {result.hero?.rarity || 'R'}
                  </div>
                  {result.isNew && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        background: '#e74c3c',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        animation: 'pulse 1s infinite'
                      }}
                    >
                      NEW!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {allRevealed && (
        <button
          onClick={onClose}
          style={{
            marginTop: '40px',
            padding: '16px 48px',
            fontSize: '18px',
            fontWeight: 'bold',
            color: 'white',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '30px',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.5)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          确定
        </button>
      )}
    </div>
  )
}
