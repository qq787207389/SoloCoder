import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  User,
  Clock,
  Lock,
  Play,
  Pause,
  Send,
  Image as ImageIcon,
  Volume2,
} from 'lucide-react';
import { useCapsuleStore } from '../store/useCapsuleStore';
import { useCountdown } from '../hooks/useCountdown';
import { formatTimeRemaining, formatDate, isUnlocked } from '../utils';

export const CapsuleDetail: React.FC = () => {
  const {
    capsules,
    selectedCapsuleId,
    setCurrentView,
    setSelectedCapsuleId,
    currentUser,
    addLike,
    removeLike,
    addComment,
    markAsRead,
    verifyPassword,
  } = useCapsuleStore();

  const capsule = capsules.find((c) => c.id === selectedCapsuleId);
  const { timeRemaining } = useCountdown(capsule?.unlockTime || 0);

  const [passwordInput, setPasswordInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const canView = capsule
    ? capsule.isPublic || isVerified
    : false;

  const unlocked = capsule ? isUnlocked(capsule.unlockTime) : false;

  React.useEffect(() => {
    if (capsule && unlocked && canView) {
      markAsRead(capsule.id);
    }
  }, [capsule, unlocked, canView, markAsRead]);

  const handleBack = () => {
    setSelectedCapsuleId(null);
    setCurrentView('plaza');
  };

  const handleVerifyPassword = () => {
    if (capsule && verifyPassword(capsule.id, passwordInput)) {
      setIsVerified(true);
    } else {
      alert('密码错误');
    }
  };

  const handleLike = () => {
    if (!currentUser) {
      alert('请先设置昵称');
      return;
    }
    if (capsule) {
      if (capsule.likes.includes(currentUser)) {
        removeLike(capsule.id, currentUser);
      } else {
        addLike(capsule.id, currentUser);
      }
    }
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('请先设置昵称');
      return;
    }
    if (!commentText.trim()) return;

    if (capsule) {
      addComment(capsule.id, {
        authorName: currentUser,
        content: commentText.trim(),
      });
      setCommentText('');
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (!capsule) {
    return (
      <div className="p-4 text-center">
        <p className="text-warm-600">胶囊不存在</p>
        <button
          onClick={handleBack}
          className="mt-4 px-4 py-2 rounded-lg bg-warm-500 text-white"
        >
          返回
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="min-h-screen p-4 pb-24"
    >
      <div className="max-w-3xl mx-auto">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-warm-600 hover:text-warm-800 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回广场
        </button>

        <div className="glass rounded-2xl overflow-hidden shadow-xl">
          <div className="h-48 bg-gradient-to-br from-warm-300 to-warm-500 flex items-center justify-center relative">
            {unlocked ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="text-center"
              >
                <span className="text-6xl">✨</span>
                <p className="text-white text-lg font-bold mt-2">已解锁</p>
              </motion.div>
            ) : (
              <div className="text-center">
                <Lock className="w-16 h-16 text-white/80 mx-auto mb-2" />
                <p className="text-white font-bold">🔒 封存中</p>
                <p className="text-white/90 text-2xl font-bold mt-2">
                  {formatTimeRemaining(timeRemaining)}
                </p>
              </div>
            )}
          </div>

          <div className="p-6">
            <h1 className="text-2xl font-bold text-warm-800 mb-4">
              {capsule.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-warm-500 text-sm mb-6">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{capsule.authorName}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>解锁时间: {formatDate(capsule.unlockTime)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  capsule.isPublic
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {capsule.isPublic ? '公开' : '私密'}
                </span>
              </div>
            </div>

            {!capsule.isPublic && !isVerified ? (
              <div className="py-8">
                <p className="text-warm-600 mb-4 text-center">
                  这是一个私密胶囊，请输入提取密码
                </p>
                <div className="flex gap-2 max-w-md mx-auto">
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="输入密码"
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-warm-200 bg-white/50 focus:border-warm-400 focus:outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyPassword()}
                  />
                  <button
                    onClick={handleVerifyPassword}
                    className="px-6 py-3 rounded-xl bg-warm-500 text-white font-medium hover:bg-warm-600 transition-colors"
                  >
                    解锁
                  </button>
                </div>
              </div>
            ) : !unlocked ? (
              <div className="py-12 text-center">
                <div className="text-6xl mb-4 animate-float">⏳</div>
                <p className="text-warm-600 text-lg">
                  这个胶囊还在封存中，请耐心等待...
                </p>
                <p className="text-warm-500 mt-2">
                  它会在 {formatDate(capsule.unlockTime)} 与你相见
                </p>
              </div>
            ) : (
              <>
                {capsule.content && (
                  <div className="mb-6">
                    <div className="markdown-content text-warm-700">
                      <ReactMarkdown>{capsule.content}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {capsule.images.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-warm-700 mb-3 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      图片 ({capsule.images.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {capsule.images.map((img, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => setSelectedImage(img)}
                          className="cursor-pointer rounded-lg overflow-hidden shadow-md"
                        >
                          <img
                            src={img}
                            alt=""
                            className="w-full h-32 object-cover"
                          />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {capsule.audio && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-warm-700 mb-3 flex items-center gap-2">
                      <Volume2 className="w-5 h-5" />
                      语音留言
                    </h3>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-warm-50 border border-warm-200">
                      <button
                        onClick={togglePlay}
                        className="p-3 rounded-full bg-warm-500 text-white hover:bg-warm-600 transition-colors"
                      >
                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                      </button>
                      <audio
                        ref={audioRef}
                        src={capsule.audio}
                        onEnded={() => setIsPlaying(false)}
                        controls
                        className="flex-1"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-6 py-4 border-t border-b border-warm-200/50">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 transition-colors ${
                      capsule.likes.includes(currentUser || '')
                        ? 'text-red-500'
                        : 'text-warm-500 hover:text-red-500'
                    }`}
                  >
                    <Heart
                      className={`w-6 h-6 ${
                        capsule.likes.includes(currentUser || '') ? 'fill-current' : ''
                      }`}
                    />
                    <span className="font-medium">{capsule.likes.length}</span>
                  </button>
                  <div className="flex items-center gap-2 text-warm-500">
                    <MessageCircle className="w-6 h-6" />
                    <span className="font-medium">{capsule.comments.length}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-bold text-warm-700 mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    留言 ({capsule.comments.length})
                  </h3>

                  <form onSubmit={handleSubmitComment} className="mb-6">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="写下你的留言..."
                        className="flex-1 px-4 py-3 rounded-xl border-2 border-warm-200 bg-white/50 focus:border-warm-400 focus:outline-none text-warm-800 placeholder-warm-400"
                      />
                      <button
                        type="submit"
                        disabled={!commentText.trim()}
                        className="px-4 py-3 rounded-xl bg-warm-500 text-white hover:bg-warm-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </form>

                  <div className="space-y-4">
                    <AnimatePresence>
                      {capsule.comments.length === 0 ? (
                        <p className="text-center text-warm-400 py-4">
                          还没有留言，来抢沙发吧～
                        </p>
                      ) : (
                        capsule.comments.map((comment) => (
                          <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 rounded-xl bg-white/50 border border-warm-100"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-full bg-warm-200 flex items-center justify-center">
                                <User className="w-4 h-4 text-warm-600" />
                              </div>
                              <span className="font-medium text-warm-700">
                                {comment.authorName}
                              </span>
                              <span className="text-xs text-warm-400 ml-auto">
                                {formatDate(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-warm-600 pl-10">
                              {comment.content}
                            </p>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <AnimatePresence>
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            >
              <motion.img
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                src={selectedImage}
                alt=""
                className="max-w-full max-h-full rounded-lg"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
