import { X, MessageCircle } from 'lucide-react';
import { ChannelList } from './ChannelList';
import { UserList } from './UserList';
import { useChatStore } from '../store/useChatStore';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const currentUser = useChatStore((state) => state.currentUser);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-800 z-50 lg:hidden flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
        {/* 头部 */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  轻聊
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {currentUser?.nickname}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto">
          <ChannelList />
          <UserList />
        </div>
      </div>
    </>
  );
}
