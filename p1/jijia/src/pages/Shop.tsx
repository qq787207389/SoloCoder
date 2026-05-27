
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Coins } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { ALL_PARTS, getPartById } from '../data/parts';
import { Rarity, PartType, PART_TYPES, PART_TYPE_NAMES } from '../types';
import PartCard from '../components/PartCard';

type FilterRarity = Rarity | 'all';

export default function Shop() {
  const { setCurrentPage, playerSave, buyPart, sellPart } = useGameStore();
  const [selectedType, setSelectedType] = useState<PartType | null>(null);
  const [selectedRarity, setSelectedRarity] = useState<FilterRarity>('all');
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');

  const filteredParts = useMemo(() => {
    let parts = ALL_PARTS;

    if (selectedType) {
      parts = parts.filter((p) => p.type === selectedType);
    }

    if (selectedRarity !== 'all') {
      parts = parts.filter((p) => p.rarity === selectedRarity);
    }

    return parts;
  }, [selectedType, selectedRarity]);

  const ownedParts = useMemo(() => {
    if (!playerSave) return [];
    return playerSave.ownedParts
      .map((id) => getPartById(id))
      .filter((p): p is NonNullable<typeof p> => p !== undefined);
  }, [playerSave]);

  const handleBuy = (partId: string) => {
    buyPart(partId);
  };

  const handleSell = (partId: string) => {
    sellPart(partId);
  };

  const canAfford = (price: number) => {
    return playerSave ? playerSave.credits >= price : false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900">
      <div className="p-4 border-b border-emerald-500/30 bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage('menu')}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-2xl font-bold text-emerald-400" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              部件商店
            </h1>
          </div>
          <div className="flex items-center gap-2 text-yellow-400 font-bold text-xl">
            <Coins className="w-6 h-6" />
            {playerSave?.credits.toLocaleString() || 0}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('buy')}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all
              ${activeTab === 'buy'
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }
            `}
          >
            <ShoppingCart className="w-5 h-5" />
            购买
          </button>
          <button
            onClick={() => setActiveTab('sell')}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all
              ${activeTab === 'sell'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }
            `}
          >
            <Coins className="w-5 h-5" />
            出售
          </button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedType(null)}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap
              ${selectedType === null
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
              onClick={() => setSelectedType(type)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap
                ${selectedType === type
                  ? 'bg-cyan-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
              `}
            >
              {PART_TYPE_NAMES[type]}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          {(['all', 'common', 'uncommon', 'rare', 'epic', 'legendary'] as FilterRarity[]).map((rarity) => (
            <button
              key={rarity}
              onClick={() => setSelectedRarity(rarity)}
              className={`
                px-3 py-1 rounded text-sm font-medium transition-all
                ${selectedRarity === rarity
                  ? 'bg-cyan-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }
              `}
            >
              {rarity === 'all' ? '全部稀有度' : rarity.charAt(0).toUpperCase() + rarity.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'buy' ? (
          <div className="grid grid-cols-4 gap-4">
            {filteredParts.map((part) => (
              <motion.div
                key={part.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div onClick={() => canAfford(part.price) && handleBuy(part.id)}>
                  <PartCard
                    part={part}
                    showPrice
                    disabled={!canAfford(part.price)}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div>
            {ownedParts.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                没有可出售的部件
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {ownedParts.map((part) => (
                  <motion.div
                    key={part.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div onClick={() => handleSell(part.id)}>
                      <PartCard part={part} showSellPrice />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
