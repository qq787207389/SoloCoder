
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Zap, Weight, Shield, Heart, Target, Swords, ChevronRight } from 'lucide-react';
import { useGameStore, validateAssembly } from '../store/gameStore';
import { PART_TYPES, PART_TYPE_NAMES, PartType } from '../types';
import { getPartById, getPartsByType } from '../data/parts';
import Mech3DViewer from '../components/Mech3D';
import PartCard from '../components/PartCard';

export default function Workshop() {
  const {
    currentMech,
    setCurrentPage,
    equipPartToMech,
    unequipPartFromMech,
    selectedPartType,
    setSelectedPartType,
    saveGame,
    getAvailableParts,
    playerSave,
  } = useGameStore();

  const [showSaveToast, setShowSaveToast] = useState(false);

  const validation = useMemo(() => validateAssembly(currentMech), [currentMech]);

  const availableParts = useMemo(() => {
    const owned = getAvailableParts();

    const equippedParts = PART_TYPES
      .map((type) => currentMech.parts[type])
      .filter((p): p is NonNullable<typeof p> => p !== null);

    const allParts = [...equippedParts, ...owned];

    if (selectedPartType) {
      return allParts.filter((p) => p.type === selectedPartType);
    }
    return allParts;
  }, [selectedPartType, getAvailableParts, currentMech]);

  const handleSave = () => {
    saveGame();
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2000);
  };

  const handleStartBattle = () => {
    if (validation.valid) {
      setCurrentPage('battle');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      <div className="p-4 border-b border-cyan-500/30 bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage('menu')}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-2xl font-bold text-cyan-400" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              机甲车间
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {playerSave && (
              <div className="text-yellow-400 font-bold">
                💰 {playerSave.credits.toLocaleString()}
              </div>
            )}
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              保存
            </button>
            <button
              onClick={handleStartBattle}
              disabled={!validation.valid}
              className={`
                flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all
                ${validation.valid
                  ? 'bg-gradient-to-r from-pink-500 to-amber-500 text-white hover:shadow-lg hover:shadow-pink-500/30'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              <Swords className="w-4 h-4" />
              开始战斗
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-12 gap-4" style={{ height: 'calc(100vh - 80px)' }}>
        <div className="col-span-5 bg-gray-800/50 rounded-xl border border-cyan-500/20 overflow-hidden">
          <Mech3DViewer mech={currentMech} />
        </div>

        <div className="col-span-7 flex flex-col gap-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-cyan-500/20">
            <h2 className="text-lg font-bold text-white mb-3">机甲属性</h2>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <Heart className="w-4 h-4 text-red-400" />
                  生命
                </div>
                <div className="text-2xl font-bold text-red-400">{currentMech.maxHealth}</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <Shield className="w-4 h-4 text-blue-400" />
                  护甲
                </div>
                <div className="text-2xl font-bold text-blue-400">{currentMech.baseStats.armor || 0}</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  能量
                </div>
                <div className="text-2xl font-bold text-cyan-400">{currentMech.maxEnergy}</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <Weight className="w-4 h-4 text-yellow-400" />
                  重量
                </div>
                <div className={`text-2xl font-bold ${currentMech.totalWeight > 80 ? 'text-red-400' : 'text-yellow-400'}`}>
                  {currentMech.totalWeight}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-4">
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <Target className="w-4 h-4 text-green-400" />
                  精准
                </div>
                <div className="text-xl font-bold text-green-400">{currentMech.baseStats.accuracy || 0}%</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                  <Swords className="w-4 h-4 text-pink-400" />
                  伤害
                </div>
                <div className="text-xl font-bold text-pink-400">{currentMech.baseStats.damage || 0}</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-gray-400 text-sm mb-1">射程</div>
                <div className="text-xl font-bold text-orange-400">{currentMech.baseStats.range || 0}</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="text-gray-400 text-sm mb-1">机动</div>
                <div className="text-xl font-bold text-emerald-400">{currentMech.baseStats.mobility || 0}</div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {validation.errors.map((error, i) => (
                <div key={i} className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg">
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  {error}
                </div>
              ))}
              {validation.warnings.map((warning, i) => (
                <div key={i} className="flex items-center gap-2 text-yellow-400 text-sm bg-yellow-500/10 px-3 py-2 rounded-lg">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                  {warning}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4 border border-cyan-500/20 flex-1 overflow-hidden flex flex-col">
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedPartType(null)}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap
                  ${selectedPartType === null
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }
                `}
              >
                全部
              </button>
              {PART_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedPartType(type)}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap
                    ${selectedPartType === type
                      ? 'bg-cyan-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }
                  `}
                >
                  {PART_TYPE_NAMES[type]}
                  {currentMech.parts[type] && (
                    <span className="ml-2 text-xs bg-green-500/30 px-2 py-0.5 rounded">已装备</span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                {availableParts.map((part) => {
                  const isEquipped = currentMech.parts[part.type]?.id === part.id;
                  return (
                    <motion.div
                      key={`${isEquipped ? 'equipped' : 'inventory'}-${part.id}`}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <PartCard
                        part={part}
                        selected={isEquipped}
                        onClick={() => {
                          if (isEquipped) {
                            unequipPartFromMech(part.type);
                          } else {
                            equipPartToMech(part.id);
                          }
                        }}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showSaveToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            游戏已保存！
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
