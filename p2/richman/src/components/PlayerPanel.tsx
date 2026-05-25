import React, { useState } from 'react';
import { Player, GameState, Property } from '../types';

interface PlayerPanelProps {
  state: GameState;
}

export const PlayerPanel: React.FC<PlayerPanelProps> = ({ state }) => {
  const [expandedPlayers, setExpandedPlayers] = useState<Set<string>>(new Set());

  const toggleExpanded = (playerId: string) => {
    const newExpanded = new Set(expandedPlayers);
    if (newExpanded.has(playerId)) {
      newExpanded.delete(playerId);
    } else {
      newExpanded.add(playerId);
    }
    setExpandedPlayers(newExpanded);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 w-80">
      <h3 className="text-white text-lg font-bold mb-4">玩家信息</h3>
      <div className="space-y-3">
        {state.players.map((player: Player, index: number) => {
          const isExpanded = expandedPlayers.has(player.id);
          const ownedPropertyNames = player.ownedProperties
            .map(propId => {
              const cell = state.cells.find(c => c.id === propId);
              if (cell?.data?.type === 'property') {
                const prop = cell.data as Property;
                return `${cell.name}${prop.buildingLevel === 'landmark' ? '🏛️' : (prop.buildingLevel as number) > 0 ? `(${prop.buildingLevel}级)` : ''}`;
              }
              return cell?.name || propId;
            })
            .filter(Boolean);

          return (
            <div
              key={player.id}
              className={`p-3 rounded-lg transition-all ${
                index === state.currentPlayerIndex
                  ? 'bg-blue-600 ring-2 ring-yellow-400'
                  : 'bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: player.color }}
                />
                <span className="text-white font-semibold">
                  {player.name}
                  {player.isAI && ' (AI)'}
                </span>
                {index === state.currentPlayerIndex && (
                  <span className="text-yellow-400 text-xs ml-auto">当前回合</span>
                )}
              </div>
              <div className="text-sm text-gray-300 space-y-1">
                <div className="flex justify-between">
                  <span>资金:</span>
                  <span className={player.money >= 0 ? 'text-green-400' : 'text-red-400'}>
                    ¥{player.money}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>贷款:</span>
                  <span className="text-orange-400">¥{player.loans}</span>
                </div>
                <div className="flex justify-between">
                  <span>资产:</span>
                  <span>¥{player.money - player.loans}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>地皮:</span>
                  <button
                    onClick={() => toggleExpanded(player.id)}
                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <span>{player.ownedProperties.length} 块</span>
                    <span className="text-xs">{isExpanded ? '▲' : '▼'}</span>
                  </button>
                </div>
                
                {isExpanded && ownedPropertyNames.length > 0 && (
                  <div className="mt-2 pl-2 text-xs text-gray-400 border-l-2 border-gray-600 space-y-1">
                    {ownedPropertyNames.map((name, i) => (
                      <div key={i}>{name}</div>
                    ))}
                  </div>
                )}
                
                {isExpanded && ownedPropertyNames.length === 0 && (
                  <div className="mt-2 pl-2 text-xs text-gray-500 italic">
                    暂无地皮
                  </div>
                )}

                {player.isInJail && (
                  <div className="text-red-400 text-xs">
                    🔒 监禁中 (第 {player.jailTurns} 回合)
                  </div>
                )}
                {player.skillCooldown > 0 && (
                  <div className="text-gray-400 text-xs">
                    ⚡ 技能冷却: {player.skillCooldown} 回合
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
