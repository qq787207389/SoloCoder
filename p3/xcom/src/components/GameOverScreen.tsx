import { useGameStore } from '@/store/gameStore'

export function GameOverScreen() {
  const { phase, units, resetGame } = useGameStore()

  if (phase !== 'game_over' && phase !== 'victory') {
    return null
  }

  const isVictory = phase === 'victory'
  const playerUnits = units.filter((u) => u.team === 'player')
  const survivingUnits = playerUnits.filter((u) => u.stats.hp > 0)

  const handleRestart = () => {
    resetGame()
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className={`text-center p-12 rounded-2xl max-w-lg w-full ${
          isVictory
            ? 'bg-gradient-to-b from-green-900/90 to-slate-900/90 border-2 border-green-500'
            : 'bg-gradient-to-b from-red-900/90 to-slate-900/90 border-2 border-red-500'
        }`}
      >
        <div className="text-8xl mb-6">{isVictory ? '🏆' : '💀'}</div>

        <h1
          className={`text-5xl font-bold mb-4 ${
            isVictory ? 'text-green-400' : 'text-red-400'
          }`}
        >
          {isVictory ? '任务成功' : '任务失败'}
        </h1>

        <p className="text-slate-300 text-lg mb-8">
          {isVictory
            ? '你成功完成了任务，所有敌人已被消灭！'
            : '你的小队全军覆没，任务失败了...'}
        </p>

        <div className="bg-slate-800/50 rounded-xl p-6 mb-8">
          <h3 className="text-white font-bold text-lg mb-4">战斗统计</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-left">
              <span className="text-slate-400">初始单位</span>
              <p className="text-white text-xl font-bold">{playerUnits.length}</p>
            </div>
            <div className="text-left">
              <span className="text-slate-400">存活单位</span>
              <p
                className={`text-xl font-bold ${
                  survivingUnits.length > 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {survivingUnits.length}
              </p>
            </div>
            <div className="text-left">
              <span className="text-slate-400">总经验</span>
              <p className="text-amber-400 text-xl font-bold">
                {playerUnits.reduce((sum, u) => sum + u.exp, 0)}
              </p>
            </div>
            <div className="text-left">
              <span className="text-slate-400">最高等级</span>
              <p className="text-purple-400 text-xl font-bold">
                {Math.max(...playerUnits.map((u) => u.level))}
              </p>
            </div>
          </div>

          {survivingUnits.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-700">
              <h4 className="text-slate-400 text-sm mb-2">存活单位</h4>
              <div className="flex flex-wrap gap-2 justify-center">
                {survivingUnits.map((unit) => (
                  <div
                    key={unit.id}
                    className="px-3 py-1 bg-slate-700 rounded-lg text-sm"
                  >
                    <span className="text-white">{unit.name}</span>
                    <span className="text-slate-400 ml-1">Lv.{unit.level}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleRestart}
            className={`px-8 py-4 text-xl font-bold rounded-xl transition-all transform hover:scale-105 ${
              isVictory
                ? 'bg-green-600 hover:bg-green-500'
                : 'bg-red-600 hover:bg-red-500'
            } text-white`}
          >
            返回主菜单
          </button>
        </div>
      </div>
    </div>
  )
}
