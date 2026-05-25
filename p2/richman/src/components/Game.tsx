import React, { useState, useEffect, useCallback } from 'react';
import { GameState } from '../types';
import { createInitialState, rollDice, movePlayer, triggerCellEffect, buyProperty, buildHouse, mortgageProperty, unmortgageProperty, takeLoan, repayLoan, buyStock, sellStock, useSkill, endTurn, getCurrentPlayer } from '../game/gameLogic';
import { aiTurn } from '../game/aiPlayer';
import { GameBoard } from './GameBoard';
import { PlayerPanel } from './PlayerPanel';
import { ActionPanel } from './ActionPanel';
import { GameLog } from './GameLog';

interface GameProps {
  playerNames: string[];
  aiCount: number;
}

export const Game: React.FC<GameProps> = ({ playerNames, aiCount }) => {
  const [state, setState] = useState<GameState>(() => createInitialState(playerNames, aiCount));
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const checkGameEnd = () => {
      if (state.players.length <= 1) {
        setState(prev => ({ ...prev, phase: 'ended' }));
      }
    };
    checkGameEnd();
  }, [state.players.length]);

  useEffect(() => {
    const player = getCurrentPlayer(state);
    if (player?.isAI && !isProcessing && state.phase !== 'ended') {
      setIsProcessing(true);
      aiTurn(state).then(newState => {
        setState(newState);
        setIsProcessing(false);
      });
    }
  }, [state.currentPlayerIndex, state.phase]);

  const handleRollDice = useCallback(() => {
    const player = getCurrentPlayer(state);
    if (!player || player.isAI || state.phase !== 'waiting') return;

    const dice = rollDice();
    setState(prev => ({ ...prev, dice, phase: 'rolling' }));

    setTimeout(() => {
      setState(prev => {
        const newState = movePlayer(prev, player.id, dice[0] + dice[1]);
        return { ...newState, phase: 'moving' };
      });

      setTimeout(() => {
        setState(prev => {
          const newState = triggerCellEffect(prev, player.id);
          return { ...newState, phase: 'triggering' };
        });
      }, 500);
    }, 300);
  }, [state]);

  const handleBuyProperty = useCallback(() => {
    const player = getCurrentPlayer(state);
    if (!player || !state.selectedCell) return;

    setState(prev => buyProperty(prev, player.id, state.selectedCell!));
  }, [state.selectedCell]);

  const handleBuildHouse = useCallback(() => {
    const player = getCurrentPlayer(state);
    if (!player || !state.selectedCell) return;

    setState(prev => buildHouse(prev, player.id, state.selectedCell!));
  }, [state.selectedCell]);

  const handleMortgage = useCallback(() => {
    const player = getCurrentPlayer(state);
    if (!player || !state.selectedCell) return;

    setState(prev => mortgageProperty(prev, player.id, state.selectedCell!));
  }, [state.selectedCell]);

  const handleUnmortgage = useCallback(() => {
    const player = getCurrentPlayer(state);
    if (!player || !state.selectedCell) return;

    setState(prev => unmortgageProperty(prev, player.id, state.selectedCell!));
  }, [state.selectedCell]);

  const handleUseSkill = useCallback(() => {
    const player = getCurrentPlayer(state);
    if (!player) return;

    setState(prev => useSkill(prev, player.id));
  }, []);

  const handleEndTurn = useCallback(() => {
    setState(prev => endTurn(prev));
  }, []);

  const handleBuyStock = useCallback((propertyId: string, quantity: number) => {
    const player = getCurrentPlayer(state);
    if (!player) return;

    setState(prev => buyStock(prev, player.id, propertyId, quantity));
  }, []);

  const handleSellStock = useCallback((propertyId: string, quantity: number) => {
    const player = getCurrentPlayer(state);
    if (!player) return;

    setState(prev => sellStock(prev, player.id, propertyId, quantity));
  }, []);

  const handleTakeLoan = useCallback((amount: number) => {
    const player = getCurrentPlayer(state);
    if (!player) return;

    setState(prev => takeLoan(prev, player.id, amount));
  }, []);

  const handleRepayLoan = useCallback((amount: number) => {
    const player = getCurrentPlayer(state);
    if (!player) return;

    setState(prev => repayLoan(prev, player.id, amount));
  }, []);

  const handleCellClick = useCallback((cellId: string) => {
    const player = getCurrentPlayer(state);
    if (!player || player.isAI) return;

    setState(prev => ({ ...prev, selectedCell: cellId }));
  }, [state]);

  if (state.phase === 'ended') {
    const winner = state.players[0];
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <h1 className="text-4xl font-bold text-yellow-400 mb-4">🎉 游戏结束!</h1>
          <p className="text-white text-xl mb-2">获胜者:</p>
          <p className="text-3xl font-bold text-green-400">{winner?.name}</p>
          <p className="text-gray-300 mt-4">最终资产: ¥{winner?.money}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4">
      <div className="flex flex-col items-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          🎲 大富翁游戏
        </h1>
        
        <div className="flex gap-4">
          <PlayerPanel state={state} />
          
          <div className="flex flex-col items-center">
            <GameBoard state={state} onCellClick={handleCellClick} />
            
            {isProcessing && (
              <div className="mt-4 text-yellow-400 flex items-center gap-2">
                <div className="animate-spin w-6 h-6 border-4 border-yellow-400 border-t-transparent rounded-full"></div>
                <span>AI 思考中...</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-4">
            <ActionPanel
              state={state}
              onRollDice={handleRollDice}
              onBuyProperty={handleBuyProperty}
              onBuildHouse={handleBuildHouse}
              onMortgage={handleMortgage}
              onUnmortgage={handleUnmortgage}
              onUseSkill={handleUseSkill}
              onEndTurn={handleEndTurn}
              onBuyStock={handleBuyStock}
              onSellStock={handleSellStock}
              onTakeLoan={handleTakeLoan}
              onRepayLoan={handleRepayLoan}
            />
            <GameLog state={state} />
          </div>
        </div>
      </div>
    </div>
  );
};
