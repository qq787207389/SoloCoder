import { Check, CheckCheck, Reply, Copy } from 'lucide-react';
import type { Message } from '../types';
import { Avatar } from './Avatar';
import { useChatStore } from '../store/useChatStore';
import { useState } from 'react';

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  searchKeyword?: string;
  messageRef?: (el: HTMLDivElement | null) => void;
}

export function MessageItem({ message, isOwn, searchKeyword, messageRef }: MessageItemProps) {
  const setReplyingTo = useChatStore((state) => state.setReplyingTo);
  const [showActions, setShowActions] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const highlightKeyword = (text: string) => {
    if (!searchKeyword) return text;
    const regex = new RegExp(`(${searchKeyword})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      part.toLowerCase() === searchKeyword.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-700 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-6">
        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 px-4 py-2 rounded-full border border-blue-200/50 dark:border-blue-700/30">
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
            {message.content}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={messageRef}
      className={`flex gap-3 px-4 py-3 group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors duration-200 ${
        isOwn ? 'flex-row-reverse' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <Avatar color={message.avatarColor} name={message.userName} />

      <div className={`flex-1 min-w-0 ${isOwn ? 'text-right' : ''}`}>
        <div className={`flex items-center gap-2 mb-1.5 ${isOwn ? 'justify-end flex-row-reverse' : ''}`}>
          <span className="font-semibold text-sm text-gray-800 dark:text-white">
            {message.userName}
          </span>
          <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
        </div>

        {message.replyTo && (
          <div
            className={`mb-2 p-3 bg-gray-100 dark:bg-gray-700/70 rounded-2xl text-sm text-gray-600 dark:text-gray-300 border-l-4 border-blue-500 max-w-md ${
              isOwn ? 'text-right ml-auto' : 'text-left'
            }`}
          >
            <div className="font-semibold text-xs text-blue-500 mb-0.5">
              回复 {message.replyTo.userName}
            </div>
            <div className="truncate opacity-80">{message.replyTo.content}</div>
          </div>
        )}

        <div className={`inline-block max-w-[80%] ${isOwn ? 'text-left' : ''}`}>
          {message.type === 'image' ? (
            <div className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <img
                src={message.content}
                alt="上传的图片"
                className="max-w-sm max-h-72 object-contain"
              />
            </div>
          ) : (
            <div
              className={`px-4 py-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 ${
                isOwn
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-md'
                  : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-tl-md border border-gray-100 dark:border-gray-600'
              }`}
            >
              <p className="break-words leading-relaxed">
                {highlightKeyword(message.content)}
              </p>
            </div>
          )}

          <div className={`flex items-center gap-1 mt-1.5 ${isOwn ? 'justify-end' : ''}`}>
            {message.status === 'sending' && (
              <Check className="w-3.5 h-3.5 text-gray-400 animate-pulse" />
            )}
            {message.status === 'sent' && (
              <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
            )}

            <div
              className={`flex items-center gap-0.5 transition-all duration-200 ${
                showActions ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <button
                onClick={() => setReplyingTo(message)}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                title="回复"
              >
                <Reply className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
              </button>
              <button
                onClick={handleCopy}
                className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                title="复制"
              >
                <Copy
                  className={`w-3.5 h-3.5 ${
                    copied
                      ? 'text-green-500'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
