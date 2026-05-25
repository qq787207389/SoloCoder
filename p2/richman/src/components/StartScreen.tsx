import React, { useState } from 'react';
import { CHARACTERS } from '../constants';

interface StartScreenProps {
  onStartGame: (playerNames: string[], aiCount: number) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStartGame }) => {
  const [playerNames, setPlayerNames] = useState<string[]>(['玩家1']);
  const [aiCount, setAiCount] = useState(2);

  const addPlayer = () => {
    if (playerNames.length < 4) {
      setPlayerNames([...playerNames, `玩家${playerNames.length + 1}`]);
    }
  };

  const removePlayer = (index: number) => {
    if (playerNames.length > 1) {
      setPlayerNames(playerNames.filter((_, i) => i !== index));
    }
  };

  const handleStart = () => {
    onStartGame(playerNames, aiCount);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <div className="bg-gray-800 rounded-xl p-8 w-full max-w-2xl">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          🎲 大富翁游戏
        </h1>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">玩家设置</h2>
            <div className="space-y-2">
              {playerNames.map((name, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      const newNames = [...playerNames];
                      newNames[index] = e.target.value;
                      setPlayerNames(newNames);
                    }}
                    className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`玩家 ${index + 1}`}
                  />
                  <button
                    onClick={() => removePlayer(index)}
                    disabled={playerNames.length <= 1}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all disabled:opacity-50"
                  >
                    -
                  </button>
                </div>
              ))}
              <button
                onClick={addPlayer}
                disabled={playerNames.length >= 4}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
              >
                + 添加玩家
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">AI 对手数量</h2>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setAiCount(Math.max(0, aiCount - 1))}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-all"
              >
                -
              </button>
              <span className="text-white text-xl font-bold w-12 text-center">{aiCount}</span>
              <button
                onClick={() => setAiCount(Math.min(4, aiCount + 1))}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-all"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-4">角色介绍</h2>
            <div className="grid grid-cols-2 gap-3">
              {CHARACTERS.map((character) => (
                <div key={character.id} className="bg-gray-700 rounded-lg p-3">
                  <h3 className="text-yellow-400 font-semibold">{character.name}</h3>
                  <p className="text-gray-400 text-sm">{character.description}</p>
                  <p className="text-green-400 text-sm mt-1">
                    ⚡ {character.skillName}: {character.skillDescription}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 px-6 rounded-lg font-bold text-xl hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105"
          >
            🎮 开始游戏
          </button>
        </div>

        <div className="mt-8 text-gray-400 text-sm">
          <h3 className="font-semibold mb-2">游戏规则</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>每位玩家开局拥有 ¥1500 资金</li>
            <li>经过起点可获得 ¥200 工资</li>
            <li>购买同色组所有地皮后可建造房屋</li>
            <li>房屋可升级至4级，之后可升级为地标</li>
            <li>股票系统：可购买地皮股票获取分红</li>
            <li>银行提供贷款服务，利息10%</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
