import { create } from 'zustand';
import type { User, Message } from '../types';
import { getMessagesByChannel, saveMessage } from '../utils/db';

interface ChatState {
  currentUser: User | null;
  currentChannel: string;
  onlineUsers: User[];
  messages: Message[];
  isDarkMode: boolean;
  typingUsers: string[];
  hasUnreadMessage: boolean;
  replyingTo: Message | null;
  
  setCurrentUser: (user: User) => void;
  setCurrentChannel: (channelId: string) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  updateMessageStatus: (messageId: string, status: 'sent') => void;
  toggleDarkMode: () => void;
  setTypingUsers: (users: string[]) => void;
  setHasUnreadMessage: (has: boolean) => void;
  setReplyingTo: (message: Message | null) => void;
  loadChannelMessages: (channelId: string) => Promise<void>;
  setOnlineUsers: (users: User[]) => void;
}

const AVATAR_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#14B8A6', '#3B82F6', '#8B5CF6', '#EC4899'
];

export function getRandomAvatarColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

export const useChatStore = create<ChatState>((set, get) => ({
  currentUser: null,
  currentChannel: 'lobby',
  onlineUsers: [],
  messages: [],
  isDarkMode: localStorage.getItem('darkMode') === 'true',
  typingUsers: [],
  hasUnreadMessage: false,
  replyingTo: null,

  setCurrentUser: (user) => set({ currentUser: user }),
  
  setCurrentChannel: async (channelId) => {
    set({ currentChannel: channelId, hasUnreadMessage: false });
    await get().loadChannelMessages(channelId);
  },
  
  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
    saveMessage(message);
  },
  
  setMessages: (messages) => set({ messages }),
  
  updateMessageStatus: (messageId, status) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, status } : msg
      ),
    }));
  },
  
  toggleDarkMode: () => {
    set((state) => {
      const newMode = !state.isDarkMode;
      localStorage.setItem('darkMode', String(newMode));
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return { isDarkMode: newMode };
    });
  },
  
  setTypingUsers: (users) => set({ typingUsers: users }),
  
  setHasUnreadMessage: (has) => set({ hasUnreadMessage: has }),
  
  setReplyingTo: (message) => set({ replyingTo: message }),
  
  loadChannelMessages: async (channelId) => {
    const messages = await getMessagesByChannel(channelId);
    set({ messages });
  },
  
  setOnlineUsers: (users) => set({ onlineUsers: users }),
}));
