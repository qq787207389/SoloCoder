import { useState } from 'react'
import { LEVELS } from '@/data/levels'
import { useGameStore } from '@/store/gameStore'
import type { LevelData } from '@/types'

export function MainMenu() {
  const [showLevelSelect, setShowLevelSelect] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState<LevelData | null>(null)
  const { initializeGame, startGame } = useGameStore()

  const handleStartGame = () => {
    setShowLevelSelect(true)
  }

  const handleSelectLevel = (level: LevelData) => {
    setSelectedLevel(level)
  }

  const handleConfirmLevel = () => {
    if (selectedLevel) {
      initializeGame(selectedLevel)
      startGame()
    }
  }

  const handleBack = () => {
    setShowLevelSelect(false)
    setSelectedLevel(null)
  }

  if (showLevelSelect) {
    return (
      <div className="fixed inset-0 bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col items-center justify-center p-8">
        <div className="max-w-4xl w-full">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-white">选择关卡</h1>
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              返回
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LEVELS.map((level) => (
              <div
                key={level.id}
                onClick={() => handleSelectLevel(level)}
                className={`p-6 rounded-xl cursor-pointer transition-all transform hover:scale-105 ${
                  selectedLevel?.id === level.id
                    ? 'bg-blue-600 ring-4 ring-blue-400'
                    : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                <h3 className="text-xl font-bold text-white mb-2">{level.name}</h3>
                <p className="text-slate-300 text-sm mb-4">{level.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">
                    地图: {level.width}x{level.height}
                  </span>
                  <span className="text-slate-400">
                    敌人: {level.enemySpawns.length}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-600">
                  <p className="text-amber-400 text-sm">🎯 {level.objective}</p>
                </div>
              </div>
            ))}
          </div>

          {selectedLevel && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleConfirmLevel}
                className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white text-xl font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                开始任务 - {selectedLevel.name}
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center">
      <div className="text-center mb-12">
        <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-4">
          XCOM-LIKE
        </h1>
        <p className="text-2xl text-slate-400">城市废墟战术</p>
        <p className="text-slate-500 mt-2">回合制策略游戏</p>
      </div>

      <div className="flex flex-col gap-4 items-center">
        <button
          onClick={handleStartGame}
          className="px-12 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-2xl font-bold rounded-xl transition-all transform hover:scale-105 shadow-2xl"
        >
          开始游戏
        </button>

        <button
          className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white text-lg rounded-xl transition-colors"
        >
          设置
        </button>
      </div>

      <div className="absolute bottom-8 text-slate-500 text-sm">
        <div className="flex gap-8">
          <div className="text-center">
            <p className="text-2xl mb-1">🖱️</p>
            <p>左键选择/攻击</p>
          </div>
          <div className="text-center">
            <p className="text-2xl mb-1">🖱️</p>
            <p>右键拖动地图</p>
          </div>
          <div className="text-center">
            <p className="text-2xl mb-1">⚙️</p>
            <p>滚轮缩放</p>
          </div>
          <div className="text-center">
            <p className="text-2xl mb-1">ESC</p>
            <p>取消选择</p>
          </div>
        </div>
      </div>

      <div className="absolute top-8 right-8 text-slate-500 text-sm">
        <div className="bg-slate-800/50 p-4 rounded-lg backdrop-blur">
          <h3 className="font-bold text-slate-300 mb-2">职业简介</h3>
          <div className="space-y-1 text-xs">
            <p><span className="text-red-400">●</span> 突击兵 - 冲锋陷阵，移动后射击</p>
            <p><span className="text-cyan-400">●</span> 狙击手 - 远程精准打击</p>
            <p><span className="text-yellow-400">●</span> 医疗兵 - 治疗与复活队友</p>
            <p><span className="text-teal-400">●</span> 工兵 - 地雷与掩体修复</p>
          </div>
        </div>
      </div>
    </div>
  )
}
