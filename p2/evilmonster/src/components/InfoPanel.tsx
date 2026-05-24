import { useEffect, useState } from 'react';
import { getEngine } from '../game/engine';
import { MONSTER_CONFIGS } from '../game/config/monsters';
import { ADVENTURER_CONFIGS } from '../game/config/adventurers';

export default function InfoPanel() {
  const engine = getEngine();
  const [, forceUpdate] = useState({});

  useEffect(() => {
    return engine.subscribe(() => forceUpdate({}));
  }, [engine]);

  const monsters = Array.from(engine.monsters.values());
  const adventurers = Array.from(engine.adventurers.values());

  return (
    <div className="w-72 bg-gray-900/95 border-l-2 border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-yellow-400 font-bold text-lg">📊 信息面板</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <div>
          <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
            <span>👹</span> 我的怪物 ({monsters.length})
          </h3>
          {monsters.length === 0 ? (
            <p className="text-gray-500 text-sm italic">还没有怪物，快去招募吧!</p>
          ) : (
            <div className="space-y-2">
              {monsters.map((monster) => {
                const config = MONSTER_CONFIGS[monster.monsterType];
                const healthPercent = (monster.health / monster.maxHealth) * 100;
                return (
                  <div
                    key={monster.id}
                    className="bg-gray-800 rounded p-2 border border-gray-700"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: config.color }}
                        />
                        <span className="text-white text-sm font-bold">
                          {config.name}
                        </span>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          monster.state === 'striking'
                            ? 'bg-gray-600 text-gray-300'
                            : monster.state === 'fighting'
                            ? 'bg-red-700 text-red-200'
                            : 'bg-green-700 text-green-200'
                        }`}
                      >
                        {monster.state === 'patrolling'
                          ? '巡逻中'
                          : monster.state === 'fighting'
                          ? '战斗中'
                          : monster.state === 'striking'
                          ? '罢工中!'
                          : '休息'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-8">HP</span>
                        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 transition-all"
                            style={{ width: `${healthPercent}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-12 text-right">
                          {Math.floor(monster.health)}/{monster.maxHealth}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-8">心情</span>
                        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              monster.mood > 50
                                ? 'bg-yellow-500'
                                : monster.mood > 25
                                ? 'bg-orange-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${monster.mood}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-12 text-right">
                          {Math.floor(monster.mood)}%
                        </span>
                      </div>
                    </div>
                    {monster.mood < 50 && (
                      <button
                        onClick={() => engine.feedMonster(monster.id)}
                        className="mt-2 w-full text-xs bg-yellow-700 hover:bg-yellow-600 text-white py-1 rounded transition-colors"
                      >
                        🍖 喂食 (10金币)
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
            <span>⚔</span> 入侵冒险者 ({adventurers.length})
          </h3>
          {adventurers.length === 0 ? (
            <p className="text-gray-500 text-sm italic">暂时安全...</p>
          ) : (
            <div className="space-y-2">
              {adventurers.map((adventurer) => {
                const config = ADVENTURER_CONFIGS[adventurer.adventurerClass];
                const healthPercent = (adventurer.health / adventurer.maxHealth) * 100;
                return (
                  <div
                    key={adventurer.id}
                    className="bg-gray-800 rounded p-2 border border-blue-900"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: config.color }}
                        />
                        <span className="text-white text-sm font-bold">
                          {config.name}
                        </span>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          adventurer.state === 'fleeing'
                            ? 'bg-yellow-700 text-yellow-200'
                            : adventurer.state === 'fighting'
                            ? 'bg-red-700 text-red-200'
                            : 'bg-blue-700 text-blue-200'
                        }`}
                      >
                        {adventurer.state === 'exploring'
                          ? '探索中'
                          : adventurer.state === 'fighting'
                          ? '战斗中'
                          : adventurer.state === 'fleeing'
                          ? '逃跑中!'
                          : '搜刮中'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-8">HP</span>
                      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500 transition-all"
                          style={{ width: `${healthPercent}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 w-12 text-right">
                        {Math.floor(adventurer.health)}/{adventurer.maxHealth}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-purple-400 font-bold mb-2">💡 游戏提示</h3>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• 使用⛏挖掘工具扩展地牢</li>
            <li>• 建造房间获得各种功能</li>
            <li>• 招募怪物守卫你的地牢</li>
            <li>• 在走廊布置陷阱消灭入侵者</li>
            <li>• 记得给怪物发工资，否则会罢工!</li>
            <li>• 战斗时可以释放法术辅助</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
