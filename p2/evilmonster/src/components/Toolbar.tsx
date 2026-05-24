import { useEffect, useState } from 'react';
import { getEngine } from '../game/engine';
import { ToolType, RoomType, MonsterType, TrapType } from '../types/game';
import { ROOM_CONFIGS } from '../game/config/rooms';
import { MONSTER_CONFIGS } from '../game/config/monsters';
import { TRAP_CONFIGS } from '../game/config/traps';

export default function Toolbar() {
  const engine = getEngine();
  const [, forceUpdate] = useState({});
  const [activeTab, setActiveTab] = useState<'dig' | 'room' | 'monster' | 'trap'>('dig');

  useEffect(() => {
    return engine.subscribe(() => forceUpdate({}));
  }, [engine]);

  const { gameState } = engine;

  const selectTool = (tool: ToolType) => {
    gameState.selectedTool = tool;
    gameState.selectedRoomType = null;
    gameState.selectedMonsterType = null;
    gameState.selectedTrapType = null;
  };

  const selectRoom = (roomType: RoomType) => {
    gameState.selectedTool = 'room';
    gameState.selectedRoomType = roomType;
    setActiveTab('room');
  };

  const selectMonster = (monsterType: MonsterType) => {
    gameState.selectedTool = 'monster';
    gameState.selectedMonsterType = monsterType;
    setActiveTab('monster');
  };

  const selectTrap = (trapType: TrapType) => {
    gameState.selectedTool = 'trap';
    gameState.selectedTrapType = trapType;
    setActiveTab('trap');
  };

  const payAllSalary = () => {
    engine.paySalary();
  };

  const isToolSelected = (tool: ToolType) => gameState.selectedTool === tool;
  const isRoomSelected = (roomType: RoomType) => gameState.selectedRoomType === roomType;
  const isMonsterSelected = (monsterType: MonsterType) => gameState.selectedMonsterType === monsterType;
  const isTrapSelected = (trapType: TrapType) => gameState.selectedTrapType === trapType;

  return (
    <div className="w-64 bg-gray-900/95 border-r-2 border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-yellow-400 font-bold text-lg mb-3">🔨 建造工具</h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              selectTool('dig');
              setActiveTab('dig');
            }}
            className={`p-2 rounded text-sm font-bold transition-all ${
              isToolSelected('dig')
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            ⛏ 挖掘
          </button>
          <button
            onClick={() => {
              selectTool(null);
              setActiveTab('dig');
            }}
            className={`p-2 rounded text-sm font-bold transition-all ${
              !gameState.selectedTool
                ? 'bg-gray-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            👆 选择
          </button>
        </div>
      </div>

      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('room')}
          className={`flex-1 py-2 text-sm font-bold transition-colors ${
            activeTab === 'room'
              ? 'bg-orange-800 text-orange-200'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          🏠 房间
        </button>
        <button
          onClick={() => setActiveTab('monster')}
          className={`flex-1 py-2 text-sm font-bold transition-colors ${
            activeTab === 'monster'
              ? 'bg-red-800 text-red-200'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          👹 怪物
        </button>
        <button
          onClick={() => setActiveTab('trap')}
          className={`flex-1 py-2 text-sm font-bold transition-colors ${
            activeTab === 'trap'
              ? 'bg-purple-800 text-purple-200'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          ⚡ 陷阱
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'room' && (
          <div className="space-y-2">
            {(Object.entries(ROOM_CONFIGS) as [RoomType, typeof ROOM_CONFIGS[RoomType]][]).map(
              ([type, config]) => (
                <button
                  key={type}
                  onClick={() => selectRoom(type)}
                  disabled={gameState.gold < config.cost}
                  className={`w-full p-3 rounded text-left transition-all ${
                    isRoomSelected(type)
                      ? 'ring-2 ring-yellow-400 bg-gray-700'
                      : 'bg-gray-800 hover:bg-gray-700'
                  } ${gameState.gold < config.cost ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold" style={{ color: config.color }}>
                      {config.name}
                    </span>
                    <span className="text-yellow-400 text-sm">💰{config.cost}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {config.width}x{config.height} · {config.description}
                  </div>
                </button>
              )
            )}
          </div>
        )}

        {activeTab === 'monster' && (
          <div className="space-y-2">
            {(Object.entries(MONSTER_CONFIGS) as [MonsterType, typeof MONSTER_CONFIGS[MonsterType]][]).map(
              ([type, config]) => {
                const isUnlocked = engine.getAvailableMonsterTypes().includes(type);
                return (
                  <button
                    key={type}
                    onClick={() => isUnlocked && selectMonster(type)}
                    disabled={!isUnlocked || gameState.gold < config.cost}
                    className={`w-full p-3 rounded text-left transition-all ${
                      isMonsterSelected(type)
                        ? 'ring-2 ring-yellow-400 bg-gray-700'
                        : 'bg-gray-800 hover:bg-gray-700'
                  } ${
                    !isUnlocked || gameState.gold < config.cost
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: config.color }}
                        />
                        <span className="font-bold text-white">
                          {config.name}
                          {!isUnlocked && (
                            <span className="text-xs text-gray-500 ml-1">🔒</span>
                          )}
                        </span>
                      </div>
                      <span className="text-yellow-400 text-sm">💰{config.cost}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      ❤{config.maxHealth} ⚔{config.attack} 🏃{config.speed}
                    </div>
                    {!isUnlocked && (
                      <div className="text-xs text-purple-400 mt-1">
                        需要建造孵化室解锁
                      </div>
                    )}
                  </button>
                );
              }
            )}

            <div className="mt-4 pt-4 border-t border-gray-700">
              <button
                onClick={payAllSalary}
                className="w-full p-2 bg-green-800 hover:bg-green-700 text-white rounded font-bold text-sm transition-colors"
              >
                💰 发放工资 (全部怪物)
              </button>
              <p className="text-xs text-gray-500 mt-1 text-center">
                怪物心情不好会罢工哦!
              </p>
            </div>
          </div>
        )}

        {activeTab === 'trap' && (
          <div className="space-y-2">
            {(Object.entries(TRAP_CONFIGS) as [TrapType, typeof TRAP_CONFIGS[TrapType]][]).map(
              ([type, config]) => (
                <button
                  key={type}
                  onClick={() => selectTrap(type)}
                  disabled={gameState.gold < config.cost}
                  className={`w-full p-3 rounded text-left transition-all ${
                    isTrapSelected(type)
                      ? 'ring-2 ring-yellow-400 bg-gray-700'
                      : 'bg-gray-800 hover:bg-gray-700'
                  } ${gameState.gold < config.cost ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold" style={{ color: config.color }}>
                      {config.name}
                    </span>
                    <span className="text-yellow-400 text-sm">💰{config.cost}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    伤害: {config.damage} | 冷却: {config.cooldown}s
                  </div>
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
