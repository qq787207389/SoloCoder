import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import { ChannelList } from './ChannelList';
import { UserList } from './UserList';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { TypingIndicator } from './TypingIndicator';
import { MobileDrawer } from './MobileDrawer';
import type { Message } from '../types';
import { initDB } from '../utils/db';

export function ChatRoom() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const currentChannel = useChatStore((state) => state.currentChannel);
  const loadChannelMessages = useChatStore((state) => state.loadChannelMessages);
  const currentUser = useChatStore((state) => state.currentUser);

  useEffect(() => {
    initDB();
  }, []);

  useEffect(() => {
    loadChannelMessages(currentChannel);
  }, [currentChannel, loadChannelMessages]);

  const handleSearch = (keyword: string, _results: Message[]) => {
    setSearchKeyword(keyword);
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* 侧边栏 */}
      <aside className="hidden lg:flex lg:w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col shadow-xl">
        {/* Logo 区域 */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                轻聊
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                欢迎回来，{currentUser?.nickname}
              </p>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ChannelList />
          <UserList />
        </div>
      </aside>

      {/* 主聊天区域 */}
      <main className="flex-1 flex flex-col min-w-0">
        <ChatHeader
          onMenuClick={() => setIsDrawerOpen(true)}
          onSearch={handleSearch}
        />
        <MessageList searchKeyword={searchKeyword} />
        <TypingIndicator />
        <MessageInput />
      </main>

      {/* 移动端抽屉 */}
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}
