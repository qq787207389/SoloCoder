import { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

const events = [
  {
    id: 'mysteriousChest',
    title: '神秘宝箱',
    description: '你在路边发现了一个闪闪发光的宝箱。你要打开它吗？',
    choices: [
      { text: '打开宝箱', effect: 'gold' },
      { text: '离开', effect: 'nothing' }
    ]
  },
  {
    id: 'healingFountain',
    title: '治愈之泉',
    description: '你发现了一处散发着柔和光芒的泉水。泉水似乎有治愈的力量。',
    choices: [
      { text: '饮用泉水', effect: 'heal' },
      { text: '离开', effect: 'nothing' }
    ]
  },
  {
    id: 'wanderingMerchant',
    title: '流浪商人',
    description: '一个神秘的商人出现在你面前，他愿意用低价卖给你一些东西。',
    choices: [
      { text: '交易 (花费 50 金币)', effect: 'trade' },
      { text: '离开', effect: 'nothing' }
    ]
  }
];

export function EventScreen() {
  const { setPhase, heal, gold, addGold, addCardToDeck, character } = useGameStore();
  const [currentEvent] = useState(() => events[Math.floor(Math.random() * events.length)]);
  const [result, setResult] = useState<string | null>(null);

  const handleChoice = (effect: string) => {
    let message = '';
    
    switch (effect) {
      case 'gold':
        const goldGain = 30 + Math.floor(Math.random() * 40);
        addGold(goldGain);
        message = `你获得了 ${goldGain} 金币！`;
        break;
      case 'heal':
        const healAmount = 15 + Math.floor(Math.random() * 15);
        heal(healAmount);
        message = `你恢复了 ${healAmount} 点生命值！`;
        break;
      case 'trade':
        if (gold >= 50) {
          addGold(-50);
          message = '交易完成！';
        } else {
          message = '你没有足够的金币！';
        }
        break;
      default:
        message = '你选择继续前进。';
    }
    
    setResult(message);
  };

  const handleContinue = () => {
    setPhase('map');
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-gray-950 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900/90 rounded-2xl p-8 max-w-2xl w-full mx-4 border-2 border-purple-500/50 shadow-2xl"
      >
        <div className="flex items-center gap-4 mb-6">
          <HelpCircle className="w-12 h-12 text-purple-400" />
          <h1 className="text-3xl font-bold text-white">{currentEvent.title}</h1>
        </div>

        <p className="text-lg text-gray-300 mb-8 leading-relaxed">
          {currentEvent.description}
        </p>

        {!result ? (
          <div className="flex flex-col gap-4">
            {currentEvent.choices.map((choice, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 10 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleChoice(choice.effect)}
                className="w-full text-left px-6 py-4 bg-gradient-to-r from-purple-700/50 to-indigo-700/50 hover:from-purple-600/50 hover:to-indigo-600/50 rounded-xl text-white font-bold text-lg border border-purple-500/30 transition-all"
              >
                {choice.text}
              </motion.button>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="text-2xl text-yellow-400 font-bold mb-6">{result}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleContinue}
              className="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold text-lg transition-all"
            >
              继续
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
