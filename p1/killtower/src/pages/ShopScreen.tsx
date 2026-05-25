import { motion } from 'framer-motion';
import { Coins, ShoppingBag, X } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { CardComponent } from '../components/ui/CardComponent';
import { getCardsByClass, createCardInstance } from '../game/data/cards';

export function ShopScreen() {
  const { setPhase, character, gold, addGold, addCardToDeck } = useGameStore();
  
  const shopCards = character 
    ? getCardsByClass(character.id)
        .filter(c => c.rarity !== 'basic')
        .sort(() => Math.random() - 0.5)
        .slice(0, 5)
        .map(card => {
          const instance = createCardInstance(card.id)!;
          return {
            card: {
              ...card,
              ...instance,
              id: instance.id
            },
            price: card.rarity === 'rare' ? 150 : card.rarity === 'uncommon' ? 75 : 50
          };
        })
    : [];

  const handleBuyCard = (item: { card: any, price: number }) => {
    if (gold >= item.price) {
      addGold(-item.price);
      addCardToDeck(item.card);
    }
  };

  const handleLeave = () => {
    setPhase('map');
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-amber-950 via-yellow-950 to-gray-950 flex flex-col">
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
        <div className="flex items-center gap-4">
          <ShoppingBag className="w-10 h-10 text-yellow-400" />
          <h1 className="text-4xl font-bold text-white">商店</h1>
        </div>
        <div className="flex items-center gap-2 bg-gray-900/80 rounded-lg px-4 py-2 border border-yellow-500/50">
          <Coins className="w-6 h-6 text-yellow-400" />
          <span className="text-2xl font-bold text-yellow-400">{gold}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-center gap-6 max-w-5xl px-8"
        >
          {shopCards.map((item, index) => (
            <motion.div
              key={item.card.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center gap-2"
            >
              <CardComponent card={item.card} size="normal" />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleBuyCard(item)}
                disabled={gold < item.price}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${
                  gold >= item.price
                    ? 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Coins className="w-5 h-5" />
                {item.price}
              </motion.button>
            </motion.div>
          ))}
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLeave}
          className="mt-12 flex items-center gap-2 px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold text-lg transition-all"
        >
          <X className="w-6 h-6" />
          离开商店
        </motion.button>
      </div>
    </div>
  );
}
