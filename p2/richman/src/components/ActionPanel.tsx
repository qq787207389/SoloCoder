import React from 'react';
import { GameState } from '../types';
import { MAX_LOAN, LOAN_INTEREST } from '../constants';
import { getCurrentPlayer } from '../game/gameLogic';

interface ActionPanelProps {
  state: GameState;
  onRollDice: () => void;
  onBuyProperty: () => void;
  onBuildHouse: () => void;
  onMortgage: () => void;
  onUnmortgage: () => void;
  onUseSkill: () => void;
  onEndTurn: () => void;
  onBuyStock: (propertyId: string, quantity: number) => void;
  onSellStock: (propertyId: string, quantity: number) => void;
  onTakeLoan: (amount: number) => void;
  onRepayLoan: (amount: number) => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
  state,
  onRollDice,
  onBuyProperty,
  onBuildHouse,
  onMortgage,
  onUnmortgage,
  onUseSkill,
  onEndTurn,
  onBuyStock,
  onSellStock,
  onTakeLoan,
  onRepayLoan,
}) => {
  const player = getCurrentPlayer(state);
  if (!player) return null;

  const selectedCell = state.cells.find(c => c.id === state.selectedCell);
  const currentCell = state.cells[player.position];
  
  // 只有当选择的格子是当前位置的地皮且可以购买时才能购买
  const canBuy = state.pendingAction === 'buy' 
    && selectedCell?.data 
    && !selectedCell.data.ownerId
    && selectedCell.id === currentCell?.id
    && selectedCell.data.type === 'property';
    
  const canBuild = state.pendingAction === 'build' && selectedCell?.data?.ownerId === player.id;
  const ownedCell = selectedCell?.data?.ownerId === player.id;
  const isMortgaged = selectedCell?.data?.isMortgaged;

  return (
    <div className="bg-gray-800 rounded-lg p-4 w-80">
      <h3 className="text-white text-lg font-bold mb-4">操作面板</h3>
      
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <span className="text-gray-300">回合:</span>
          <span className="text-white font-bold">{state.turn}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-300">阶段:</span>
          <span className="text-yellow-400">
            {state.phase === 'waiting' && '等待掷骰'}
            {state.phase === 'rolling' && '掷骰中'}
            {state.phase === 'moving' && '移动中'}
            {state.phase === 'triggering' && '触发效果'}
            {state.phase === 'action' && '行动中'}
            {state.phase === 'ended' && '游戏结束'}
          </span>
        </div>
        {state.dice.length > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-gray-300">骰子:</span>
            {state.dice.map((die, i) => (
              <span key={i} className="bg-white text-black px-2 py-1 rounded font-bold">
                {die}
              </span>
            ))}
            <span className="text-white">= {state.dice.reduce((a, b) => a + b, 0)}</span>
          </div>
        )}
      </div>

      <div className="space-y-3 mb-6">
        {!player.isAI && state.phase === 'waiting' && (
          <button
            onClick={onRollDice}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 px-4 rounded-lg font-bold hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105"
          >
            🎲 掷骰子
          </button>
        )}
        
        {canBuy && selectedCell?.data && (
          <button
            onClick={onBuyProperty}
            disabled={player.money < selectedCell.data.price}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-lg font-bold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🏠 购买 {selectedCell.name} (¥{selectedCell.data.price})
          </button>
        )}
        
        {canBuild && selectedCell?.data?.type === 'property' && (
          <button
            onClick={onBuildHouse}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 px-4 rounded-lg font-bold hover:from-blue-600 hover:to-indigo-600 transition-all"
          >
            🏗️ 加盖房屋
          </button>
        )}
        
        {ownedCell && !isMortgaged && (
          <button
            onClick={onMortgage}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 rounded-lg font-bold hover:from-orange-600 hover:to-red-600 transition-all"
          >
            🔄 抵押
          </button>
        )}
        
        {ownedCell && isMortgaged && (
          <button
            onClick={onUnmortgage}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 px-4 rounded-lg font-bold hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            🔓 赎回 (¥{Math.floor(selectedCell.data!.mortgageValue * (1 + LOAN_INTEREST))})
          </button>
        )}
        
        {player.skillCooldown === 0 && !player.isAI && (
          <button
            onClick={onUseSkill}
            className="w-full bg-gradient-to-r from-purple-500 to-violet-500 text-white py-2 px-4 rounded-lg font-bold hover:from-purple-600 hover:to-violet-600 transition-all"
          >
            ⚡ 使用技能: {player.character.skillName}
          </button>
        )}
        
        {state.phase !== 'waiting' && !player.isAI && (
          <button
            onClick={onEndTurn}
            className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-2 px-4 rounded-lg font-bold hover:from-gray-700 hover:to-gray-800 transition-all"
          >
            ⏭️ 结束回合
          </button>
        )}
      </div>

      <div className="mb-6">
        <h4 className="text-white font-semibold mb-2">🏦 银行</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onTakeLoan(500)}
            disabled={player.loans >= MAX_LOAN}
            className="bg-blue-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            贷款 ¥500
          </button>
          <button
            onClick={() => onRepayLoan(200)}
            disabled={player.money < 200 || player.loans < 200}
            className="bg-green-600 text-white py-2 px-3 rounded-lg text-sm hover:bg-green-700 transition-all disabled:opacity-50"
          >
            还款 ¥200
          </button>
        </div>
        <div className="text-xs text-gray-400 mt-2">
          利息: {Math.round(LOAN_INTEREST * 100)}% | 最大贷款: ¥{MAX_LOAN}
        </div>
      </div>

      <div>
        <h4 className="text-white font-semibold mb-2">📈 股票市场</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {Object.entries(state.stocks).slice(0, 5).map(([propertyId, stock]) => {
            const cell = state.cells.find(c => c.id === propertyId);
            const playerStocks = player.stocks[propertyId] || 0;
            const priceChange = stock.priceHistory.length > 1
              ? ((stock.currentPrice - stock.priceHistory[stock.priceHistory.length - 2]) / stock.priceHistory[stock.priceHistory.length - 2] * 100).toFixed(1)
              : '0';
            const isUp = parseFloat(priceChange) >= 0;
            
            return (
              <div key={propertyId} className="bg-gray-700 rounded p-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white">{cell?.name}</span>
                  <span className={isUp ? 'text-green-400' : 'text-red-400'}>
                    {isUp ? '↑' : '↓'} {Math.abs(parseFloat(priceChange))}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">¥{stock.currentPrice}</span>
                  <span className="text-yellow-400">持有: {playerStocks}</span>
                </div>
                <div className="flex gap-1 mt-1">
                  <button
                    onClick={() => onBuyStock(propertyId, 1)}
                    disabled={player.money < stock.currentPrice}
                    className="flex-1 bg-green-600 text-white py-1 px-2 rounded text-xs hover:bg-green-700 transition-all disabled:opacity-50"
                  >
                    买入
                  </button>
                  <button
                    onClick={() => onSellStock(propertyId, 1)}
                    disabled={playerStocks === 0}
                    className="flex-1 bg-red-600 text-white py-1 px-2 rounded text-xs hover:bg-red-700 transition-all disabled:opacity-50"
                  >
                    卖出
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
