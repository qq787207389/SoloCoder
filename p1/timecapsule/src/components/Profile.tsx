import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Clock, CheckCircle, Trash2, Eye, Lock, Unlock, Edit } from 'lucide-react';
import { useCapsuleStore } from '../store/useCapsuleStore';
import { formatDate, isUnlocked, formatTimeRemaining } from '../utils';
import { useCountdown } from '../hooks/useCountdown';

export const Profile: React.FC = () => {
  const {
    capsules,
    currentUser,
    setCurrentUser,
    setCurrentView,
    setSelectedCapsuleId,
    deleteCapsule,
  } = useCapsuleStore();

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(currentUser);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const myCapsules = currentUser
    ? capsules.filter((c) => c.authorName === currentUser)
    : [];

  const unlockedCapsules = myCapsules.filter((c) => isUnlocked(c.unlockTime));
  const lockedCapsules = myCapsules.filter((c) => !isUnlocked(c.unlockTime));
  const readCapsules = unlockedCapsules.filter((c) => c.isRead);

  const handleSaveName = () => {
    if (newName.trim()) {
      setCurrentUser(newName.trim());
      setIsEditingName(false);
    }
  };

  const handleViewCapsule = (id: string) => {
    setSelectedCapsuleId(id);
    setCurrentView('detail');
  };

  const handleDeleteCapsule = (id: string) => {
    deleteCapsule(id);
    setShowDeleteConfirm(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="p-4 pb-24"
    >
      <div className="max-w-4xl mx-auto">
        <div className="glass rounded-2xl p-6 mb-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-warm-300 to-warm-500 flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              {isEditingName ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="px-3 py-2 rounded-lg border-2 border-warm-200 bg-white/50 focus:border-warm-400 focus:outline-none text-warm-800"
                    placeholder="输入昵称"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  />
                  <button
                    onClick={handleSaveName}
                    className="px-4 py-2 rounded-lg bg-warm-500 text-white hover:bg-warm-600 transition-colors"
                  >
                    保存
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-warm-800">
                    {currentUser || '匿名用户'}
                  </h2>
                  <button
                    onClick={() => {
                      setNewName(currentUser);
                      setIsEditingName(true);
                    }}
                    className="p-1 rounded-lg hover:bg-warm-100 text-warm-500 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              )}
              {!currentUser && (
                <p className="text-warm-500 text-sm mt-1">
                  设置昵称后才能创建胶囊和互动
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-warm-200/50">
            <div className="text-center">
              <div className="text-3xl font-bold text-warm-700">
                {myCapsules.length}
              </div>
              <div className="text-sm text-warm-500">总胶囊</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-warm-700">
                {unlockedCapsules.length}
              </div>
              <div className="text-sm text-warm-500">已解锁</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-warm-700">
                {readCapsules.length}
              </div>
              <div className="text-sm text-warm-500">已阅读</div>
            </div>
          </div>
        </div>

        {myCapsules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-12 text-center"
          >
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-warm-700 mb-2">
              还没有胶囊
            </h3>
            <p className="text-warm-500 mb-6">
              埋下你的第一个时间胶囊吧！
            </p>
            <button
              onClick={() => setCurrentView('create')}
              className="px-6 py-3 rounded-xl bg-warm-500 text-white font-medium hover:bg-warm-600 transition-colors"
            >
              创建胶囊
            </button>
          </motion.div>
        ) : (
          <>
            {unlockedCapsules.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-warm-700 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  已解锁 ({unlockedCapsules.length})
                </h3>
                <div className="space-y-3">
                  <AnimatePresence>
                    {unlockedCapsules.map((capsule) => (
                      <CapsuleListItem
                        key={capsule.id}
                        capsule={capsule}
                        onView={() => handleViewCapsule(capsule.id)}
                        onDelete={() => setShowDeleteConfirm(capsule.id)}
                        isRead={capsule.isRead}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {lockedCapsules.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-warm-700 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  封存中 ({lockedCapsules.length})
                </h3>
                <div className="space-y-3">
                  <AnimatePresence>
                    {lockedCapsules.map((capsule) => (
                      <CapsuleListItem
                        key={capsule.id}
                        capsule={capsule}
                        onView={() => handleViewCapsule(capsule.id)}
                        onDelete={() => setShowDeleteConfirm(capsule.id)}
                        isLocked
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </>
        )}

        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="glass rounded-2xl p-6 max-w-sm w-full"
              >
                <h3 className="text-xl font-bold text-warm-800 mb-2">
                  确认删除
                </h3>
                <p className="text-warm-600 mb-6">
                  删除后无法恢复，确定要删除这个胶囊吗？
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 py-3 rounded-xl border-2 border-warm-200 text-warm-600 font-medium hover:bg-warm-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => handleDeleteCapsule(showDeleteConfirm)}
                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                  >
                    删除
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

interface CapsuleListItemProps {
  capsule: any;
  onView: () => void;
  onDelete: () => void;
  isRead?: boolean;
  isLocked?: boolean;
}

const CapsuleListItem: React.FC<CapsuleListItemProps> = ({
  capsule,
  onView,
  onDelete,
  isRead = false,
  isLocked = false,
}) => {
  const { timeRemaining } = useCountdown(capsule.unlockTime);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="glass rounded-xl p-4 flex items-center gap-4"
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center ${
          isLocked
            ? 'bg-warm-200'
            : 'bg-gradient-to-br from-warm-300 to-warm-500'
        }`}
      >
        {isLocked ? (
          <Lock className="w-6 h-6 text-warm-600" />
        ) : (
          <Unlock className="w-6 h-6 text-white" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-warm-800 truncate">
            {capsule.title}
          </h4>
          {!isLocked && !isRead && (
            <span className="px-2 py-0.5 rounded-full bg-warm-500 text-white text-xs">
              新
            </span>
          )}
        </div>
        <div className="text-sm text-warm-500">
          {isLocked ? (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTimeRemaining(timeRemaining)}
            </span>
          ) : (
            <span>解锁于 {formatDate(capsule.unlockTime)}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onView}
          className="p-2 rounded-lg hover:bg-warm-100 text-warm-500 transition-colors"
          title="查看"
        >
          <Eye className="w-5 h-5" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-500 transition-colors"
          title="删除"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};
