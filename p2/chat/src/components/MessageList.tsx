import { useEffect, useRef, useState } from 'react';
import { ChevronDown, MessageCircle } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import { MessageItem } from './MessageItem';
import { playNotificationSound } from '../utils/sound';

interface MessageListProps {
  searchKeyword?: string;
}

export function MessageList({ searchKeyword }: MessageListProps) {
  const messages = useChatStore((state) => state.messages);
  const currentUser = useChatStore((state) => state.currentUser);
  const currentChannel = useChatStore((state) => state.currentChannel);
  const hasUnreadMessage = useChatStore((state) => state.hasUnreadMessage);
  const setHasUnreadMessage = useChatStore((state) => state.setHasUnreadMessage);
  const onlineUsers = useChatStore((state) => state.onlineUsers);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const prevMessageCountRef = useRef(messages.length);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setHasUnreadMessage(false);
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsAtBottom(atBottom);
    if (atBottom) {
      setHasUnreadMessage(false);
    }
  };

  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.userId !== currentUser?.id) {
        playNotificationSound();
        if (!isAtBottom) {
          setHasUnreadMessage(true);
        }
      }

      if (isAtBottom) {
        scrollToBottom();
      }
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, currentUser, isAtBottom, setHasUnreadMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [currentChannel]);

  return (
    <div className="flex-1 overflow-hidden relative bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900/50 dark:to-gray-800">
      <div
        ref={containerRef}
        className="h-full overflow-y-auto scroll-smooth"
        onScroll={handleScroll}
      >
        <div className="py-6">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-10 h-10 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                开始聊天吧！
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                当前有 {onlineUsers.length} 人在线，发送第一条消息
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                isOwn={message.userId === currentUser?.id}
                searchKeyword={searchKeyword}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {hasUnreadMessage && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-6 right-6 bg-white dark:bg-gray-700 shadow-xl rounded-full p-3 flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 border border-gray-200 dark:border-gray-600 group"
        >
          <div className="relative">
            <ChevronDown className="w-5 h-5 text-blue-500 group-hover:animate-bounce" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping" />
          </div>
          <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
            新消息
          </span>
        </button>
      )}
    </div>
  );
}
