import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Upload, Settings, X } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { CHARACTERS } from '../game/data/characters';

export function MainMenu() {
  const { selectCharacter, startNewGame, character, loadGame } = useGameStore();
  const [showCharacterSelect, setShowCharacterSelect] = useState(false);
  const [hasSave, setHasSave] = useState(() => !!localStorage.getItem('killtower_save'));

  const handleStartGame = () => {
    if (character) {
      startNewGame();
    } else {
      setShowCharacterSelect(true);
    }
  };

  const handleSelectCharacter = (charId: string) => {
    selectCharacter(charId);
    setTimeout(() => {
      startNewGame();
    }, 300);
  };

  const handleContinue = () => {
    const success = loadGame();
    if (!success) {
      alert('没有找到存档！');
    }
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-purple-950 via-indigo-950 to-gray-950 flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aC0yVjBoMnYzNHptLTQgMEgydi0yaDMwdjJ6Ii8+PC9nPjwvZz48L3N2Zz4=')]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="relative z-10 text-center mb-16"
      >
        <h1 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 mb-4 drop-shadow-2xl">
          杀戮之塔
        </h1>
        <p className="text-xl text-gray-400 tracking-widest">KILL TOWER</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
        className="relative z-10 flex flex-col gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStartGame}
          className="flex items-center gap-4 px-12 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 rounded-lg text-white font-bold text-xl shadow-lg shadow-red-500/30 transition-all"
        >
          <Play className="w-8 h-8" />
          开始游戏
        </motion.button>

        {hasSave && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleContinue}
            className="flex items-center gap-4 px-12 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg text-white font-bold text-xl shadow-lg shadow-blue-500/30 transition-all"
          >
            <Upload className="w-8 h-8" />
            继续游戏
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-4 px-12 py-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold text-xl transition-all"
        >
          <Settings className="w-8 h-8" />
          设置
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="absolute bottom-8 text-gray-500 text-sm"
      >
        构建你的牌组，攀登杀戮之塔
      </motion.div>

      {showCharacterSelect && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-gray-900 rounded-2xl p-8 max-w-4xl w-full mx-4 border-2 border-gray-700"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white">选择职业</h2>
              <button
                onClick={() => setShowCharacterSelect(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {CHARACTERS.map(char => (
                <motion.div
                  key={char.id}
                  whileHover={{ scale: 1.05, y: -10 }}
                  onClick={() => handleSelectCharacter(char.id)}
                  className="cursor-pointer"
                >
                  <div
                    className="rounded-xl p-6 border-2 transition-all hover:border-opacity-100"
                    style={{ 
                      backgroundColor: `${char.color}20`,
                      borderColor: char.color,
                      borderWidth: '2px'
                    }}
                  >
                    <div className="text-6xl text-center mb-4">
                      {char.id === 'warrior' && '⚔️'}
                      {char.id === 'mage' && '🔮'}
                      {char.id === 'rogue' && '🗡️'}
                    </div>
                    <h3 className="text-xl font-bold text-white text-center mb-2">
                      {char.name}
                    </h3>
                    <p className="text-sm text-gray-400 text-center mb-4">
                      {char.description}
                    </p>
                    <div className="text-xs text-gray-500 text-center">
                      生命: {char.maxHp} | 金币: {char.startingGold}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
