import { useChatStore } from '../store/useChatStore';

export function TypingIndicator() {
  const typingUsers = useChatStore((state) => state.typingUsers);
  const onlineUsers = useChatStore((state) => state.onlineUsers);

  if (typingUsers.length === 0) return null;

  const typingUserNames = onlineUsers
    .filter((u) => typingUsers.includes(u.id))
    .map((u) => u.nickname);

  if (typingUserNames.length === 0) return null;

  return (
    <div className="px-6 py-2 bg-gradient-to-r from-transparent via-blue-50/50 to-transparent dark:via-blue-900/20">
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '0.8s' }} />
          <span className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms', animationDuration: '0.8s' }} />
          <span className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '0.8s' }} />
        </div>
        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
          {typingUserNames.join(', ')} 正在输入...
        </span>
      </div>
    </div>
  );
}
