import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Smile, Image, X, Reply } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { useChatStore } from '../store/useChatStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { compressImage } from '../utils/imageCompressor';

export function MessageInput() {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentUser = useChatStore((state) => state.currentUser);
  const currentChannel = useChatStore((state) => state.currentChannel);
  const replyingTo = useChatStore((state) => state.replyingTo);
  const setReplyingTo = useChatStore((state) => state.setReplyingTo);
  const addMessage = useChatStore((state) => state.addMessage);
  const { sendMessage, setTyping } = useWebSocket();

  const handleTyping = useCallback(() => {
    setTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
    }, 1000);
  }, [setTyping]);

  useEffect(() => {
    if (message) {
      handleTyping();
    }
  }, [message, handleTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentUser) return;

    const newMessage = {
      id: Math.random().toString(36).substr(2, 9),
      channelId: currentChannel,
      userId: currentUser.id,
      userName: currentUser.nickname,
      avatarColor: currentUser.avatarColor,
      content: message.trim(),
      type: 'text' as const,
      timestamp: Date.now(),
      status: 'sending' as const,
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            userName: replyingTo.userName,
            content: replyingTo.content,
          }
        : undefined,
    };

    addMessage(newMessage);
    sendMessage(newMessage);
    setMessage('');
    setReplyingTo(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    try {
      const base64 = await compressImage(file);
      const newMessage = {
        id: Math.random().toString(36).substr(2, 9),
        channelId: currentChannel,
        userId: currentUser.id,
        userName: currentUser.nickname,
        avatarColor: currentUser.avatarColor,
        content: base64,
        type: 'image' as const,
        timestamp: Date.now(),
        status: 'sending' as const,
      };

      addMessage(newMessage);
      sendMessage(newMessage);
    } catch (error) {
      console.error('Failed to upload image:', error);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file && currentUser) {
          try {
            const base64 = await compressImage(file);
            const newMessage = {
              id: Math.random().toString(36).substr(2, 9),
              channelId: currentChannel,
              userId: currentUser.id,
              userName: currentUser.nickname,
              avatarColor: currentUser.avatarColor,
              content: base64,
              type: 'image' as const,
              timestamp: Date.now(),
              status: 'sending' as const,
            };

            addMessage(newMessage);
            sendMessage(newMessage);
          } catch (error) {
            console.error('Failed to upload image:', error);
          }
        }
        break;
      }
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gradient-to-t from-white/50 to-transparent dark:from-gray-800/50">
      {replyingTo && (
        <div className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-between border border-blue-100 dark:border-blue-800/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Reply className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                回复 {replyingTo.userName}
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                {replyingTo.content}
              </p>
            </div>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onPaste={handlePaste}
            placeholder="输入消息... (Ctrl+V 粘贴图片)"
            className="w-full px-5 py-4 pr-12 rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all duration-300 text-base leading-relaxed"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            style={{ minHeight: '56px', maxHeight: '150px' }}
          />
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute right-3 bottom-3 p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-xl transition-all duration-200"
          >
            <Smile className="w-5 h-5" />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-14 right-0 z-20 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-3.5 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-2xl transition-all duration-200 group"
          title="上传图片"
        >
          <Image className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>

        <button
          type="submit"
          disabled={!message.trim()}
          className="p-3.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:hover:scale-100"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
