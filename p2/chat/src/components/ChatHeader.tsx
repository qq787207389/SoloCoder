import { Sun, Moon, Menu, Users } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import { CHANNELS } from '../types';
import { SearchBar } from './SearchBar';
import type { Message } from '../types';

interface ChatHeaderProps {
  onMenuClick: () => void;
  onSearch: (keyword: string, results: Message[]) => void;
}

const channelIcons: Record<string, string> = {
  lobby: '🏠',
  tech: '💻',
  casual: '☕',
};

export function ChatHeader({ onMenuClick, onSearch }: ChatHeaderProps) {
  const currentChannel = useChatStore((state) => state.currentChannel);
  const isDarkMode = useChatStore((state) => state.isDarkMode);
  const toggleDarkMode = useChatStore((state) => state.toggleDarkMode);
  const onlineUsers = useChatStore((state) => state.onlineUsers);

  const channel = CHANNELS.find((c) => c.id === currentChannel);

  return (
    <div className="h-16 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-lg">{channelIcons[currentChannel] || '💬'}</span>
          </div>
          <div>
            <h2 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
              {channel?.name}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {onlineUsers.length} 人在线 · {channel?.description}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <SearchBar onSearch={onSearch} />
        <button
          onClick={toggleDarkMode}
          className="p-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 group"
          title={isDarkMode ? '切换到亮色模式' : '切换到暗色模式'}
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 group-hover:text-yellow-500 transition-colors" />
          ) : (
            <Moon className="w-5 h-5 group-hover:text-blue-500 transition-colors" />
          )}
        </button>
      </div>
    </div>
  );
}
