import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Clock, Sparkles } from 'lucide-react';
import { CapsuleCard } from './CapsuleCard';
import { useCapsuleStore } from '../store/useCapsuleStore';
import { isUnlocked } from '../utils';

export const Plaza: React.FC = () => {
  const { capsules, setCurrentView, setSelectedCapsuleId } = useCapsuleStore();

  const publicCapsules = capsules.filter((c) => c.isPublic);
  const unlockedCapsules = publicCapsules.filter((c) => isUnlocked(c.unlockTime));
  const lockedCapsules = publicCapsules.filter((c) => !isUnlocked(c.unlockTime));

  const handleSelectCapsule = (id: string) => {
    setSelectedCapsuleId(id);
    setCurrentView('detail');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 pb-24"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-warm-800 mb-2 flex items-center justify-center gap-2">
            <Globe className="w-8 h-8" />
            时间胶囊广场
          </h1>
          <p className="text-warm-600">
            在这里，等待时光的礼物...
          </p>
        </motion.div>

        {unlockedCapsules.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-warm-700 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              已解锁 ({unlockedCapsules.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence>
                {unlockedCapsules.map((capsule) => (
                  <CapsuleCard
                    key={capsule.id}
                    capsule={capsule}
                    onSelect={() => handleSelectCapsule(capsule.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {lockedCapsules.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-warm-700 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              等待解锁 ({lockedCapsules.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence>
                {lockedCapsules.map((capsule) => (
                  <CapsuleCard
                    key={capsule.id}
                    capsule={capsule}
                    onSelect={() => handleSelectCapsule(capsule.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {publicCapsules.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🕐</div>
            <h3 className="text-xl font-bold text-warm-700 mb-2">
              广场还没有胶囊
            </h3>
            <p className="text-warm-500 mb-6">
              成为第一个埋下时间胶囊的人吧！
            </p>
            <button
              onClick={() => setCurrentView('create')}
              className="px-6 py-3 rounded-xl bg-warm-500 text-white font-medium hover:bg-warm-600 transition-colors"
            >
              创建胶囊
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
