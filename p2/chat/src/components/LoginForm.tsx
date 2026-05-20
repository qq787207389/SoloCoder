import { useState } from 'react';
import { MessageCircle, Sparkles, Users, Zap } from 'lucide-react';
import { useChatStore, getRandomAvatarColor } from '../store/useChatStore';
import { useWebSocket } from '../hooks/useWebSocket';

export function LoginForm() {
  const [nickname, setNickname] = useState('');
  const setCurrentUser = useChatStore((state) => state.setCurrentUser);
  const { connect } = useWebSocket();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      const user = {
        id: Math.random().toString(36).substr(2, 9),
        nickname: nickname.trim(),
        avatarColor: getRandomAvatarColor(),
      };
      setCurrentUser(user);
      connect(user);
    }
  };

  const features = [
    { icon: <MessageCircle className="w-5 h-5" />, text: '实时消息' },
    { icon: <Users className="w-5 h-5" />, text: '多频道聊天' },
    { icon: <Zap className="w-5 h-5" />, text: '秒速响应' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 p-4 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20 dark:border-gray-700/50">
        {/* Logo区域 */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            轻聊
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-center">
            简单、快速、实时的聊天体验
          </p>
        </div>

        {/* 特性标签 */}
        <div className="flex justify-center gap-4 mb-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700/50 rounded-full text-xs text-gray-600 dark:text-gray-300"
            >
              <span className="text-blue-500">{feature.icon}</span>
              <span>{feature.text}</span>
            </div>
          ))}
        </div>

        {/* 登录表单 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              输入昵称，开始聊天
            </label>
            <div className="relative">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="你的昵称..."
                className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-lg"
                maxLength={20}
                autoFocus
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={!nickname.trim()}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-lg"
          >
            加入聊天室 ✨
          </button>
        </form>

        {/* 底部提示 */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
          无需注册 · 即时加入 · 完全免费
        </p>
      </div>
    </div>
  );
}
