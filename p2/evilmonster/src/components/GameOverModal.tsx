import { useEffect, useState } from 'react';
import { getEngine } from '../game/engine';

export default function GameOverModal() {
  const engine = getEngine();
  const [, forceUpdate] = useState({});

  useEffect(() => {
    return engine.subscribe(() => forceUpdate({}));
  }, [engine]);

  const { gameState } = engine;

  if (!gameState.gameOver) return null;

  const handleRestart = () => {
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 border-4 border-red-700 rounded-xl p-8 max-w-md text-center">
        <h2 className="text-4xl font-bold text-red-500 mb-4">💀 游戏结束</h2>
        <p className="text-gray-300 mb-6">
          你的领主之心被摧毁了...
        </p>

        <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <p className="text-gray-400 text-sm">存活波次</p>
              <p className="text-2xl font-bold text-yellow-400">{gameState.wave}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">获得恐惧值</p>
              <p className="text-2xl font-bold text-purple-400">{gameState.fear}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">最终金币</p>
              <p className="text-2xl font-bold text-yellow-400">{gameState.gold}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">怪物数量</p>
              <p className="text-2xl font-bold text-red-400">{engine.monsters.size}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-lg transition-all transform hover:scale-105"
        >
          🔄 重新开始
        </button>
      </div>
    </div>
  );
}
