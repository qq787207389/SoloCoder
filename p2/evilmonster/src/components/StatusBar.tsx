import { useEffect, useState } from 'react';
import { getEngine } from '../game/engine';

export default function StatusBar() {
  const engine = getEngine();
  const [, forceUpdate] = useState({});

  useEffect(() => {
    return engine.subscribe(() => forceUpdate({}));
  }, [engine]);

  const { gameState } = engine;
  const heartPercent = (gameState.heartHealth / gameState.maxHeartHealth) * 100;
  const manaPercent = (gameState.mana / gameState.maxMana) * 100;

  return (
    <div className="h-12 bg-gradient-to-r from-gray-900 to-gray-800 border-b-2 border-yellow-700 flex items-center justify-between px-6">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-xl">💰</span>
          <span className="text-yellow-300 font-bold text-lg">{gameState.gold}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-purple-400 text-xl">💀</span>
          <span className="text-purple-300 font-bold text-lg">恐惧: {gameState.fear}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-red-400 text-xl">♥</span>
          <div className="w-32 h-4 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-red-400 transition-all"
              style={{ width: `${heartPercent}%` }}
            />
          </div>
          <span className="text-red-300 text-sm">{gameState.heartHealth}/{gameState.maxHeartHealth}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-blue-400 text-xl">✦</span>
          <div className="w-24 h-4 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all"
              style={{ width: `${manaPercent}%` }}
            />
          </div>
          <span className="text-blue-300 text-sm">{Math.floor(gameState.mana)}/{gameState.maxMana}</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-orange-400 text-xl">⚔</span>
          <span className="text-orange-300 font-bold">波次 {gameState.wave}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-cyan-400 text-xl">⏱</span>
          <span className="text-cyan-300 font-bold">
            {gameState.mode === 'combat' ? '战斗中!' : '下一波: ' + Math.ceil(gameState.waveTimer) + 's'}
          </span>
        </div>

        <div
          className={`px-3 py-1 rounded font-bold text-sm ${
            gameState.mode === 'combat'
              ? 'bg-red-800 text-red-200'
              : 'bg-green-800 text-green-200'
          }`}
        >
          {gameState.mode === 'combat' ? '战斗模式' : '经营模式'}
        </div>

        <button
          onClick={() => (gameState.isPaused = !gameState.isPaused)}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
        >
          {gameState.isPaused ? '▶ 继续' : '⏸ 暂停'}
        </button>
      </div>
    </div>
  );
}
