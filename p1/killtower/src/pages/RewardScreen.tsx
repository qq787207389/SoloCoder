import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coins, SkipForward, Sparkles } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { CardComponent } from '../components/ui/CardComponent';
import { getCardsByClass, createCardInstance } from '../game/data/cards';

export function RewardScreen() {
  const { setPhase, character, addCardToDeck, gold } = useGameStore();
  const [cardRewards, setCardRewards] = useState<any[]>([]);
  const [goldReward] = useState(() => 15 + Math.floor(Math.random() * 15));

  useEffect(() => {
    if (character) {
      const classCards = getCardsByClass(character.id).filter(c => c.rarity !== 'basic');
      const shuffled = [...classCards].sort(() => Math.random() - 0.5);
      const rewards = shuffled.slice(0, 3).map(card => {
        const instance = createCardInstance(card.id)!;
        return {
          ...card,
          ...instance,
          id: instance.id
        };
      });
      setCardRewards(rewards);
    }
  }, [character]);

  const handleSelectCard = (card: any) => {
    addCardToDeck(card);
    setPhase('map');
  };

  const handleSkip = () => {
    setPhase('map');
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-purple-950 via-indigo-950 to-gray-950 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <Sparkles className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h1 className="text-5xl font-bold text-white mb-2">战斗胜利！</h1>
        <p className="text-gray-400">选择一张卡牌加入你的牌组</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-3 mb-8 bg-yellow-500/20 px-6 py-3 rounded-xl border border-yellow-500/50"
      >
        <Coins className="w-8 h-8 text-yellow-400" />
        <span className="text-2xl font-bold text-yellow-400">+{goldReward} 金币</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex gap-8 mb-12"
      >
        {cardRewards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            whileHover={{ scale: 1.1, y: -10 }}
            className="cursor-pointer"
            onClick={() => handleSelectCard(card)}
          >
            <CardComponent card={card} size="large" />
          </motion.div>
        ))}
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSkip}
        className="flex items-center gap-2 px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold text-lg transition-all"
      >
        <SkipForward className="w-6 h-6" />
        跳过
      </motion.button>
    </div>
  );
}
