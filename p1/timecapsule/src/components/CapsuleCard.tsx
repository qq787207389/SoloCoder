import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Heart, MessageCircle, Clock, User } from 'lucide-react';
import { useCountdown } from '../hooks/useCountdown';
import { formatTimeRemaining, formatDate } from '../utils';
import { useCapsuleStore } from '../store/useCapsuleStore';

interface Comment {
  id: string;
  authorName: string;
  content: string;
  createdAt: number;
}

interface Capsule {
  id: string;
  title: string;
  content: string;
  images: string[];
  audio: string | null;
  audioDuration?: number;
  unlockTime: number;
  isPublic: boolean;
  password?: string;
  authorName: string;
  createdAt: number;
  likes: string[];
  comments: Comment[];
  isRead: boolean;
}

interface CapsuleCardProps {
  capsule: Capsule;
  onSelect: () => void;
}

export const CapsuleCard: React.FC<CapsuleCardProps> = ({ capsule, onSelect }) => {
  const { timeRemaining, isUnlocked } = useCountdown(capsule.unlockTime);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const hasUnlockedRef = React.useRef(false);
  const { currentUser, addLike, removeLike } = useCapsuleStore();

  React.useEffect(() => {
    if (isUnlocked && !hasUnlockedRef.current) {
      hasUnlockedRef.current = true;
      setIsUnlocking(true);
      const timer = setTimeout(() => {
        setIsUnlocking(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isUnlocked]);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      alert('请先设置昵称');
      return;
    }
    if (capsule.likes.includes(currentUser)) {
      removeLike(capsule.id, currentUser);
    } else {
      addLike(capsule.id, currentUser);
    }
  };

  const isLocked = !isUnlocked && !hasUnlockedRef.current;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      onClick={onSelect}
      className={`glass rounded-2xl overflow-hidden cursor-pointer transition-all ${
        isUnlocking ? 'glow-effect' : ''
      }`}
    >
      <div className="relative">
        <div className="h-32 bg-gradient-to-br from-warm-300 to-warm-500 flex items-center justify-center">
          {isLocked ? (
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-center"
            >
              <Lock className="w-12 h-12 text-white/80 mx-auto mb-2" />
              <p className="text-white/90 text-sm font-medium">🔒 封存中</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="text-center"
            >
              <span className="text-4xl">✨</span>
              <p className="text-white/90 text-sm font-medium mt-2">已解锁</p>
            </motion.div>
          )}
        </div>

        {isLocked && (
          <div className="absolute top-3 right-3 glass-dark px-3 py-1 rounded-full">
            <span className="text-white text-xs font-medium">
              {capsule.isPublic ? '公开' : '私密'}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3
          className={`font-bold text-lg mb-2 transition-all ${
            isLocked ? 'capsule-locked' : isUnlocking ? 'capsule-unlocking' : 'text-warm-800'
          }`}
        >
          {capsule.title}
        </h3>

        {isLocked ? (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-warm-600 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-sm">解锁倒计时</span>
            </div>
            <motion.div
              key={timeRemaining}
              initial={{ opacity: 0.5, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold text-warm-700"
            >
              {formatTimeRemaining(timeRemaining)}
            </motion.div>
            <div className="text-xs text-warm-500 mt-1">
              解锁时间: {formatDate(capsule.unlockTime)}
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <p
              className={`text-warm-600 text-sm line-clamp-2 ${
                isUnlocking ? 'capsule-unlocking' : ''
              }`}
            >
              {capsule.content.substring(0, 100)}...
            </p>
            {capsule.images.length > 0 && (
              <div className="flex gap-1 mt-2">
                {capsule.images.slice(0, 3).map((_, i) => (
                  <div
                    key={i}
                    className="w-12 h-12 rounded-lg bg-warm-200 flex items-center justify-center"
                  >
                    <span className="text-xl">🖼️</span>
                  </div>
                ))}
                {capsule.images.length > 3 && (
                  <div className="w-12 h-12 rounded-lg bg-warm-200 flex items-center justify-center text-warm-600 text-sm">
                    +{capsule.images.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-warm-200/50">
          <div className="flex items-center gap-1 text-warm-500 text-sm">
            <User className="w-4 h-4" />
            <span>{capsule.authorName}</span>
          </div>

          {!isLocked && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 transition-colors ${
                  capsule.likes.includes(currentUser || '')
                    ? 'text-red-500'
                    : 'text-warm-500 hover:text-red-500'
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${
                    capsule.likes.includes(currentUser || '') ? 'fill-current' : ''
                  }`}
                />
                <span className="text-sm">{capsule.likes.length}</span>
              </button>
              <div className="flex items-center gap-1 text-warm-500">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">{capsule.comments.length}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
