import { Users, Circle } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import { Avatar } from './Avatar';

export function UserList() {
  const onlineUsers = useChatStore((state) => state.onlineUsers);
  const currentUser = useChatStore((state) => state.currentUser);

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Users className="w-4 h-4" />
        在线用户
        <span className="ml-auto bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold">
          {onlineUsers.length}
        </span>
      </h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {onlineUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors group"
          >
            <div className="relative">
              <Avatar color={user.avatarColor} name={user.nickname} size="sm" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate block">
                {user.nickname}
                {user.id === currentUser?.id && (
                  <span className="ml-1.5 text-xs text-blue-500 bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded">
                    你
                  </span>
                )}
              </span>
            </div>
            <Circle className="w-2 h-2 text-green-500 fill-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>
    </div>
  );
}
