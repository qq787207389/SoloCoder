import { useEffect, useRef, useCallback } from 'react';
import type { User, Message } from '../types';
import { mockServer } from '../mocks/mockWebSocket';
import { useChatStore } from '../store/useChatStore';

export function useWebSocket() {
  const clientId = useRef(Math.random().toString(36).substr(2, 9));
  const { addMessage, updateMessageStatus, setTypingUsers, setOnlineUsers, currentUser, currentChannel } = useChatStore();

  const handleMessage = useCallback((data: string) => {
    const event = JSON.parse(data);
    
    switch (event.type) {
      case 'USER_JOIN': {
        const systemMessage: Message = {
          id: Math.random().toString(36).substr(2, 9),
          channelId: currentChannel,
          userId: 'system',
          userName: '系统',
          avatarColor: '#6B7280',
          content: `${event.payload.user.nickname} 加入了频道`,
          type: 'system',
          timestamp: Date.now(),
          status: 'sent',
        };
        addMessage(systemMessage);
        break;
      }
      
      case 'USER_LEAVE': {
        const systemMessage: Message = {
          id: Math.random().toString(36).substr(2, 9),
          channelId: currentChannel,
          userId: 'system',
          userName: '系统',
          avatarColor: '#6B7280',
          content: `${event.payload.user.nickname} 离开了频道`,
          type: 'system',
          timestamp: Date.now(),
          status: 'sent',
        };
        addMessage(systemMessage);
        break;
      }
      
      case 'NEW_MESSAGE':
        addMessage(event.payload.message);
        break;
      
      case 'MESSAGE_CONFIRM':
        updateMessageStatus(event.payload.messageId, 'sent');
        break;
      
      case 'TYPING_UPDATE':
        setTypingUsers(
          event.payload.isTyping
            ? [event.payload.userId]
            : []
        );
        break;
      
      case 'USER_LIST':
        setOnlineUsers(event.payload.users);
        break;
    }
  }, [addMessage, updateMessageStatus, setTypingUsers, setOnlineUsers, currentChannel]);

  const connect = useCallback((user: User) => {
    mockServer.connect(clientId.current, user, handleMessage);
  }, [handleMessage]);

  const disconnect = useCallback(() => {
    mockServer.disconnect(clientId.current);
  }, []);

  const joinChannel = useCallback((channelId: string) => {
    mockServer.joinChannel(clientId.current, channelId);
  }, []);

  const sendMessage = useCallback((message: Message) => {
    mockServer.sendMessage(clientId.current, message);
  }, []);

  const setTyping = useCallback((isTyping: boolean) => {
    mockServer.setTyping(clientId.current, isTyping);
  }, []);

  useEffect(() => {
    return () => {
      if (currentUser) {
        disconnect();
      }
    };
  }, [currentUser, disconnect]);

  return {
    connect,
    disconnect,
    joinChannel,
    sendMessage,
    setTyping,
  };
}
