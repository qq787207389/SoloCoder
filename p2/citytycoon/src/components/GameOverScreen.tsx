
import { useGame } from '../context/GameContext';

export function GameOverScreen() {
  const { state, dispatch } = useGame();

  if (!state.isGameOver) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
      <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full mx-4 text-center shadow-2xl border border-red-600">
        <div className="text-6xl mb-4">💥</div>
        <h1 className="text-3xl font-bold text-red-500 mb-4">游戏结束</h1>
        <p className="text-gray-300 mb-6">
          你的城市破产了！负债超过了可承受范围。
        </p>
        
        <div className="bg-gray-800 rounded-lg p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">运营天数</span>
            <span className="text-white font-mono">{state.date.day} 天</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">最高人口</span>
            <span className="text-white font-mono">{state.population} 人</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">最终负债</span>
            <span className="text-red-400 font-mono">¥{Math.abs(state.money)}</span>
          </div>
        </div>

        <button
          onClick={() => dispatch({ type: 'RESET_GAME' })}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          🔄 重新开始
        </button>
      </div>
    </div>
  );
}
