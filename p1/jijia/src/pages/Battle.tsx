
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Swords, Move, Crosshair, SkipForward, Heart, Zap, Shield, Trophy, Skull } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { createBattleState, moveUnit, performAttack, endTurn, getHighlightedTilesForAction } from '../utils/battle';
import { executeAITurn, createEnemyMech } from '../utils/ai';
import { hexEquals } from '../utils/hexGrid';
import { createStarterMech, equipPart } from '../utils/assembly';
import { getPartById } from '../data/parts';
import HexGrid from '../components/HexGrid';
import { HexCoord, BattleState } from '../types';

export default function Battle() {
  const { currentMech, setCurrentPage, addBattleResult } = useGameStore();
  const [battleState, setBattleState] = useState<BattleState | null>(null);
  const [selectedAction, setSelectedAction] = useState<'move' | 'attack' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [enemyMech, setEnemyMech] = useState<any>(null);

  useEffect(() => {
    const enemyConfig = createEnemyMech();
    setEnemyMech(enemyConfig);

    let enemy = createStarterMech();
    enemy.name = enemyConfig.name;

    const partIds = [
      enemyConfig.mech.head,
      enemyConfig.mech.torso,
      enemyConfig.mech.leftArm,
      enemyConfig.mech.rightArm,
      enemyConfig.mech.legs,
      enemyConfig.mech.core,
    ];

    for (const partId of partIds) {
      const part = getPartById(partId);
      if (part) {
        enemy = equipPart(enemy, part);
      }
    }

    const state = createBattleState(currentMech, enemy);
    setBattleState(state);
  }, [currentMech]);

  useEffect(() => {
    if (battleState?.phase === 'enemyTurn' && !isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        const newState = executeAITurn(battleState);
        setBattleState(newState);
        setIsAnimating(false);

        if (newState.phase === 'victory' || newState.phase === 'defeat') {
          addBattleResult({
            id: Date.now().toString(),
            opponent: enemyMech?.name || '未知',
            opponentName: enemyMech?.name || '未知',
            won: newState.phase === 'victory',
            creditsEarned: newState.phase === 'victory' ? 1000 : 200,
            date: new Date().toISOString(),
            damageReceived: currentMech.maxHealth - currentMech.currentHealth,
          });
        }
      }, 1000);
    }
  }, [battleState?.phase, isAnimating]);

  const highlightedTiles = useMemo(() => {
    if (!battleState || !selectedAction) return [];
    return getHighlightedTilesForAction(battleState, selectedAction);
  }, [battleState, selectedAction]);

  const handleTileClick = useCallback((coord: HexCoord) => {
    if (!battleState || battleState.phase !== 'playerTurn' || isAnimating) return;

    if (selectedAction === 'move') {
      const isInRange = highlightedTiles.some((h) => hexEquals(h, coord));
      if (isInRange) {
        const result = moveUnit(battleState, 'player', coord);
        if (result.success) {
          setBattleState(result.state);
          setSelectedAction(null);
        }
      }
    } else if (selectedAction === 'attack') {
      const isInRange = highlightedTiles.some((h) => hexEquals(h, coord));
      if (isInRange && hexEquals(coord, battleState.enemyUnit.position)) {
        const result = performAttack(battleState, 'player');
        if (result.success) {
          setBattleState(result.state);
          setSelectedAction(null);
        }
      }
    }
  }, [battleState, selectedAction, isAnimating, highlightedTiles]);

  const handleEndTurn = () => {
    if (!battleState || battleState.phase !== 'playerTurn' || isAnimating) return;
    setBattleState(endTurn(battleState));
    setSelectedAction(null);
  };

  const handleReturn = () => {
    setCurrentPage('workshop');
  };

  if (!battleState) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">加载战斗中...</div>
      </div>
    );
  }

  const isBattleOver = battleState.phase === 'victory' || battleState.phase === 'defeat';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      <div className="p-4 border-b border-pink-500/30 bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleReturn}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-2xl font-bold text-pink-400" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              战斗 - 回合 {battleState.turn}
            </h1>
          </div>
          <div className="text-lg font-bold text-white">
            {battleState.phase === 'playerTurn' && '🎮 你的回合'}
            {battleState.phase === 'enemyTurn' && '🤖 敌方回合'}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isBattleOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-gray-800 rounded-2xl p-8 text-center border-2 border-cyan-500/50"
            >
              {battleState.phase === 'victory' ? (
                <>
                  <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-4" />
                  <h2 className="text-4xl font-black text-yellow-400 mb-4">胜利！</h2>
                  <p className="text-xl text-white mb-2">获得奖金: 💰 1,000</p>
                </>
              ) : (
                <>
                  <Skull className="w-24 h-24 text-red-400 mx-auto mb-4" />
                  <h2 className="text-4xl font-black text-red-400 mb-4">战败</h2>
                  <p className="text-xl text-white mb-2">获得安慰奖: 💰 200</p>
                </>
              )}
              <button
                onClick={handleReturn}
                className="mt-6 px-8 py-3 bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-bold rounded-lg"
              >
                返回车间
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-12 gap-4">
        <div className="col-span-3 space-y-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-cyan-500/30">
            <h3 className="text-lg font-bold text-cyan-400 mb-3">我方机甲</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="flex items-center gap-1 text-gray-400">
                    <Heart className="w-4 h-4 text-red-400" /> 生命
                  </span>
                  <span className="text-white">
                    {battleState.playerUnit.mech.currentHealth}/{battleState.playerUnit.mech.maxHealth}
                  </span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-red-500 to-red-400"
                    initial={false}
                    animate={{ width: `${(battleState.playerUnit.mech.currentHealth / battleState.playerUnit.mech.maxHealth) * 100}%` }}
                  />
                </div>
              </div>

              {battleState.playerUnit.mech.maxShield > 0 && (
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-1 text-gray-400">
                      <Shield className="w-4 h-4 text-blue-400" /> 护盾
                    </span>
                    <span className="text-white">
                      {battleState.playerUnit.mech.currentShield}/{battleState.playerUnit.mech.maxShield}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                      initial={false}
                      animate={{ width: `${(battleState.playerUnit.mech.currentShield / battleState.playerUnit.mech.maxShield) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="flex items-center gap-1 text-gray-400">
                    <Zap className="w-4 h-4 text-yellow-400" /> 能量
                  </span>
                  <span className="text-white">
                    {battleState.playerUnit.mech.currentEnergy}/{battleState.playerUnit.mech.maxEnergy}
                  </span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-yellow-500 to-amber-400"
                    initial={false}
                    animate={{ width: `${(battleState.playerUnit.mech.currentEnergy / battleState.playerUnit.mech.maxEnergy) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-700">
                <div className={`flex-1 text-center py-2 rounded-lg ${battleState.playerUnit.hasMoved ? 'bg-gray-700 text-gray-500' : 'bg-green-500/20 text-green-400'}`}>
                  {battleState.playerUnit.hasMoved ? '已移动' : '可移动'}
                </div>
                <div className={`flex-1 text-center py-2 rounded-lg ${battleState.playerUnit.hasAttacked ? 'bg-gray-700 text-gray-500' : 'bg-red-500/20 text-red-400'}`}>
                  {battleState.playerUnit.hasAttacked ? '已攻击' : '可攻击'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/30">
            <h3 className="text-sm font-bold text-gray-400 mb-2">战斗日志</h3>
            <div className="h-40 overflow-y-auto space-y-1 text-xs">
              {battleState.logs.slice(-10).map((log) => (
                <div
                  key={log.id}
                  className={`
                    p-2 rounded
                    ${log.type === 'attack' ? 'bg-red-500/10 text-red-300' : ''}
                    ${log.type === 'move' ? 'bg-cyan-500/10 text-cyan-300' : ''}
                    ${log.type === 'damage' ? 'bg-orange-500/10 text-orange-300' : ''}
                  `}
                >
                  {log.message}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-6">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-600/30">
            <HexGrid
              grid={battleState.grid}
              highlightedTiles={highlightedTiles}
              playerPosition={battleState.playerUnit.position}
              enemyPosition={battleState.enemyUnit.position}
              onTileClick={handleTileClick}
              selectedAction={selectedAction}
            />
          </div>

          {!isBattleOver && battleState.phase === 'playerTurn' && (
            <div className="mt-4 flex justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedAction(selectedAction === 'move' ? null : 'move')}
                disabled={battleState.playerUnit.hasMoved}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all
                  ${selectedAction === 'move'
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                    : battleState.playerUnit.hasMoved
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                  }
                `}
              >
                <Move className="w-5 h-5" />
                移动
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedAction(selectedAction === 'attack' ? null : 'attack')}
                disabled={battleState.playerUnit.hasAttacked}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all
                  ${selectedAction === 'attack'
                    ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/30'
                    : battleState.playerUnit.hasAttacked
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                  }
                `}
              >
                <Crosshair className="w-5 h-5" />
                攻击
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEndTurn}
                className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold transition-all"
              >
                <SkipForward className="w-5 h-5" />
                结束回合
              </motion.button>
            </div>
          )}
        </div>

        <div className="col-span-3">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-pink-500/30">
            <h3 className="text-lg font-bold text-pink-400 mb-3">敌方: {enemyMech?.name}</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="flex items-center gap-1 text-gray-400">
                    <Heart className="w-4 h-4 text-red-400" /> 生命
                  </span>
                  <span className="text-white">
                    {battleState.enemyUnit.mech.currentHealth}/{battleState.enemyUnit.mech.maxHealth}
                  </span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-pink-500 to-red-500"
                    initial={false}
                    animate={{ width: `${(battleState.enemyUnit.mech.currentHealth / battleState.enemyUnit.mech.maxHealth) * 100}%` }}
                  />
                </div>
              </div>

              {battleState.enemyUnit.mech.maxShield > 0 && (
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-1 text-gray-400">
                      <Shield className="w-4 h-4 text-blue-400" /> 护盾
                    </span>
                    <span className="text-white">
                      {battleState.enemyUnit.mech.currentShield}/{battleState.enemyUnit.mech.maxShield}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-400"
                      initial={false}
                      animate={{ width: `${(battleState.enemyUnit.mech.currentShield / battleState.enemyUnit.mech.maxShield) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-700 text-sm">
                <div className="text-gray-400">伤害:</div>
                <div className="text-red-400 font-bold">{battleState.enemyUnit.mech.baseStats.damage || 0}</div>
                <div className="text-gray-400">射程:</div>
                <div className="text-orange-400 font-bold">{battleState.enemyUnit.mech.baseStats.range || 0}</div>
                <div className="text-gray-400">精准:</div>
                <div className="text-green-400 font-bold">{battleState.enemyUnit.mech.baseStats.accuracy || 0}%</div>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-gray-800/50 rounded-xl p-4 border border-gray-600/30">
            <h3 className="text-sm font-bold text-gray-400 mb-2">地形图例</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#1a1a2e' }} />
                <span className="text-gray-300">普通地形</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#2d4a3e' }} />
                <span className="text-gray-300">掩体 (闪避+20%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4a3d2d' }} />
                <span className="text-gray-300">高地 (命中+15%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#4a2d2d' }} />
                <span className="text-gray-300">爆炸物</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: '#1a1a2a' }} />
                <span className="text-gray-300">障碍物 (不可通过)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
