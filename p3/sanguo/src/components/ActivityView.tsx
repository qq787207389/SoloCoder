import React, { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { Hero } from '../types'

const STAGES = [
  { id: 1, name: '第一关 · 前锋军', difficulty: '简单', hp: 10000, reward: { gold: 5000, jade: 50 } },
  { id: 2, name: '第二关 · 精锐军', difficulty: '普通', hp: 20000, reward: { gold: 10000, jade: 100 } },
  { id: 3, name: '第三关 · 吕布亲卫', difficulty: '困难', hp: 40000, reward: { gold: 20000, jade: 200 } },
  { id: 4, name: '第四关 · 董卓军', difficulty: '地狱', hp: 80000, reward: { gold: 40000, jade: 400 } },
  { id: 5, name: '最终关 · 战神吕布', difficulty: '传说', hp: 150000, reward: { gold: 100000, jade: 1000 } }
]

const RANKING_DATA = [
  { rank: 1, name: '天下无双', damage: 1250000, player: true },
  { rank: 2, name: '乱世枭雄', damage: 980000, player: false },
  { rank: 3, name: '卧龙先生', damage: 875000, player: false },
  { rank: 4, name: '江东小霸王', damage: 720000, player: false },
  { rank: 5, name: '武圣传人', damage: 650000, player: false }
]

export const ActivityView: React.FC = () => {
  const { setCurrentView, addCurrency } = useGameStore()
  const [currentStage, setCurrentStage] = useState(1)
  const [totalDamage, setTotalDamage] = useState(0)

  const simulateChallenge = (stage: typeof STAGES[0]) => {
    const damage = Math.floor(Math.random() * stage.hp * 0.8 + stage.hp * 0.2)
    setTotalDamage(prev => prev + damage)

    if (damage >= stage.hp) {
      addCurrency('gold', stage.reward.gold)
      addCurrency('jade', stage.reward.jade)
      alert(`🎉 挑战成功！\n造成伤害: ${damage.toLocaleString()}\n获得: 💰${stage.reward.gold} 💎${stage.reward.jade}`)
      if (currentStage < STAGES.length) {
        setCurrentStage(currentStage + 1)
      }
    } else {
      alert(`⚔️ 挑战失败！\n造成伤害: ${damage.toLocaleString()}/${stage.hp.toLocaleString()}\n继续努力！`)
    }
  }

  const boss: Hero = {
    id: 'lubu_boss',
    name: '吕布',
    rarity: 'UR',
    faction: 'qun',
    level: 99,
    star: 7,
    maxStar: 7,
    baseStats: { hp: 10000, atk: 1000, def: 500, spd: 150, critRate: 0.25, critDamage: 2 },
    growthStats: { hp: 100, atk: 10, def: 5, spd: 1.5, critRate: 0.0025, critDamage: 0.01 },
    skills: ['s1001'],
    fate: [],
    talentPoints: 0,
    talents: [],
    equipment: []
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '8px' }}>🔥 虎牢关 · 群雄讨伐董卓 🔥</h2>
        <p style={{ color: '#7f8c8d' }}>全服BOSS战活动 · 与全服玩家共同挑战战神吕布</p>
      </div>

      <div style={{ display: 'flex', gap: '30px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ marginBottom: '16px' }}>📋 关卡列表</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {STAGES.map(stage => {
              const isLocked = stage.id > currentStage
              const isCleared = stage.id < currentStage
              return (
                <div
                  key={stage.id}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: isLocked ? '#ecf0f1' : isCleared ? 'rgba(46, 204, 113, 0.1)' : 'white',
                    border: `2px solid ${isLocked ? '#bdc3c7' : isCleared ? '#2ecc71' : '#667eea'}`,
                    opacity: isLocked ? 0.6 : 1
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
                        {isCleared ? '✅ ' : isLocked ? '🔒 ' : '⚔️ '}
                        {stage.name}
                      </div>
                      <div style={{ fontSize: '14px', color: '#7f8c8d' }}>
                        难度: {stage.difficulty} | BOSS血量: {stage.hp.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '12px', color: '#f39c12', marginTop: '4px' }}>
                        奖励: 💰{stage.reward.gold.toLocaleString()} 💎{stage.reward.jade.toLocaleString()}
                      </div>
                    </div>
                    {!isLocked && (
                      <button
                        onClick={() => simulateChallenge(stage)}
                        style={{
                          padding: '10px 20px',
                          fontWeight: 'bold',
                          color: 'white',
                          background: isCleared ? '#2ecc71' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        {isCleared ? '再次挑战' : '挑战'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ width: '350px' }}>
          <h3 style={{ marginBottom: '16px' }}>🏆 伤害排行榜</h3>
          <div style={{ background: '#2c3e50', borderRadius: '12px', padding: '16px', color: 'white' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #34495e' }}>
              <div style={{ fontSize: '14px', color: '#95a5a6' }}>我的累计伤害</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f39c12' }}>{totalDamage.toLocaleString()}</div>
            </div>
            {RANKING_DATA.map((data, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: index < RANKING_DATA.length - 1 ? '1px solid #34495e' : 'none',
                  background: data.player ? 'rgba(243, 156, 18, 0.2)' : 'transparent',
                  margin: '0 -16px',
                  paddingLeft: '16px',
                  paddingRight: '16px',
                  borderRadius: index === 0 ? '8px 8px 0 0' : 0
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '20px',
                    color: data.rank === 1 ? '#f1c40f' : data.rank === 2 ? '#bdc3c7' : data.rank === 3 ? '#e67e22' : '#7f8c8d'
                  }}>
                    {data.rank === 1 ? '🥇' : data.rank === 2 ? '🥈' : data.rank === 3 ? '🥉' : `#${data.rank}`}
                  </span>
                  <span style={{ fontWeight: data.player ? 'bold' : 'normal' }}>{data.name}</span>
                </div>
                <span style={{ color: '#f39c12', fontWeight: 'bold' }}>{data.damage.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button
          onClick={() => setCurrentView('home')}
          style={{
            padding: '12px 32px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: 'white',
            background: '#7f8c8d',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          返回主页
        </button>
      </div>
    </div>
  )
}
