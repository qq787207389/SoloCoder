export interface User {
  id: string;
  nickname: string;
  avatarColor: string;
  isTyping?: boolean;
}

export interface Message {
  id: string;
  channelId: string;
  userId: string;
  userName: string;
  avatarColor: string;
  content: string;
  type: 'text' | 'image' | 'system';
  timestamp: number;
  status: 'sending' | 'sent';
  replyTo?: {
    id: string;
    userName: string;
    content: string;
  };
}

export interface Channel {
  id: string;
  name: string;
  description: string;
}

export const CHANNELS: Channel[] = [
  { id: 'lobby', name: '大厅', description: '欢迎来到轻聊！' },
  { id: 'tech', name: '技术交流', description: '讨论各种技术话题' },
  { id: 'casual', name: '闲聊', description: '放松聊天的地方' },
];
