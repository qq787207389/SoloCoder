import React, { useEffect, useRef } from 'react';
import { GameState } from '../types';

interface GameLogProps {
  state: GameState;
}

export const GameLog: React.FC<GameLogProps> = ({ state }) => {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [state.log]);

  return (
    <div className="bg-gray-800 rounded-lg p-4 w-80">
      <h3 className="text-white text-lg font-bold mb-4">📜 游戏日志</h3>
      <div
        ref={logRef}
        className="h-48 overflow-y-auto space-y-1 text-sm"
      >
        {state.log.map((entry, index) => (
          <div
            key={index}
            className={`text-gray-300 ${
              index === state.log.length - 1 ? 'text-yellow-400' : ''
            }`}
          >
            {entry}
          </div>
        ))}
      </div>
    </div>
  );
};
