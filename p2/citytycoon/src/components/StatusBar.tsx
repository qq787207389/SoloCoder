
import { useGame } from '../context/GameContext';

export function StatusBar() {
  const { state, dispatch } = useGame();

  const formatMoney = (money: number) => {
    if (money >= 1000000) return `¥${(money / 1000000).toFixed(1)}M`;
    if (money >= 1000) return `¥${(money / 1000).toFixed(0)}K`;
    return `¥${money}`;
  };

  const formatTime = () => {
    const { day, hour, minute } = state.date;
    return `第${day}天 ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const getSatisfactionColor = (sat: number) => {
    if (sat >= 70) return 'text-green-400';
    if (sat >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 h-14 bg-gray-900 bg-opacity-95 flex items-center px-4 gap-6 z-10">
      <div className="flex items-center gap-2">
        <span className="text-2xl">💰</span>
        <div className="flex flex-col">
          <span className={`font-mono font-bold ${state.money >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {formatMoney(state.money)}
          </span>
          <span className="text-xs text-gray-400">资金</span>
        </div>
      </div>

      <div className="h-8 w-px bg-gray-700" />

      <div className="flex items-center gap-2">
        <span className="text-2xl">👥</span>
        <div className="flex flex-col">
          <span className="font-mono font-bold text-blue-400">{state.population}</span>
          <span className="text-xs text-gray-400">人口</span>
        </div>
      </div>

      <div className="h-8 w-px bg-gray-700" />

      <div className="flex items-center gap-2">
        <span className="text-2xl">😊</span>
        <div className="flex flex-col">
          <span className={`font-mono font-bold ${getSatisfactionColor(state.averageSatisfaction)}`}>
            {Math.round(state.averageSatisfaction)}%
          </span>
          <span className="text-xs text-gray-400">满意度</span>
        </div>
      </div>

      <div className="h-8 w-px bg-gray-700" />

      <div className="flex items-center gap-2">
        <span className="text-2xl">🕐</span>
        <div className="flex flex-col">
          <span className="font-mono font-bold text-white">{formatTime()}</span>
          <span className="text-xs text-gray-400">游戏时间</span>
        </div>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <button
          onClick={() => dispatch({ type: 'SET_PAUSED', payload: !state.isPaused })}
          className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center transition-colors"
        >
          {state.isPaused ? '▶' : '⏸'}
        </button>
        
        <div className="flex items-center gap-1">
          {[1, 2, 3].map(speed => (
            <button
              key={speed}
              onClick={() => dispatch({ type: 'SET_SPEED', payload: speed })}
              className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold transition-colors ${
                state.speed === speed
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
