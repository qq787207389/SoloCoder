import type { User, Message } from '../types';
import { CHANNELS } from '../types';

interface ServerEvent {
  type: string;
  payload: any;
}

class MockWebSocketServer {
  private clients: Map<string, { channelId: string; user: User; send: (data: string) => void }> = new Map();
  private messageHistory: Map<string, Message[]> = new Map();

  constructor() {
    CHANNELS.forEach(channel => {
      this.messageHistory.set(channel.id, []);
    });
  }

  connect(clientId: string, user: User, send: (data: string) => void) {
    this.clients.set(clientId, { channelId: 'lobby', user, send });
    this.broadcastToChannel('lobby', {
      type: 'USER_JOIN',
      payload: { user },
    });
    this.broadcastUserList('lobby');
  }

  disconnect(clientId: string) {
    const client = this.clients.get(clientId);
    if (client) {
      this.broadcastToChannel(client.channelId, {
        type: 'USER_LEAVE',
        payload: { user: client.user },
      });
      this.clients.delete(clientId);
      this.broadcastUserList(client.channelId);
    }
  }

  joinChannel(clientId: string, channelId: string) {
    const client = this.clients.get(clientId);
    if (client) {
      this.broadcastToChannel(client.channelId, {
        type: 'USER_LEAVE',
        payload: { user: client.user },
      });
      this.broadcastUserList(client.channelId);

      client.channelId = channelId;
      this.clients.set(clientId, client);

      this.broadcastToChannel(channelId, {
        type: 'USER_JOIN',
        payload: { user: client.user },
      });
      this.broadcastUserList(channelId);
    }
  }

  sendMessage(clientId: string, message: Message) {
    const client = this.clients.get(clientId);
    if (client) {
      this.broadcastToChannel(client.channelId, {
        type: 'NEW_MESSAGE',
        payload: { message },
      });

      setTimeout(() => {
        this.broadcastToChannel(client.channelId, {
          type: 'MESSAGE_CONFIRM',
          payload: { messageId: message.id },
        });
      }, 300);
    }
  }

  setTyping(clientId: string, isTyping: boolean) {
    const client = this.clients.get(clientId);
    if (client) {
      this.broadcastToChannel(client.channelId, {
        type: 'TYPING_UPDATE',
        payload: { userId: client.user.id, isTyping },
      });
    }
  }

  private broadcastToChannel(channelId: string, event: ServerEvent) {
    const data = JSON.stringify(event);
    this.clients.forEach((client) => {
      if (client.channelId === channelId) {
        client.send(data);
      }
    });
  }

  private broadcastUserList(channelId: string) {
    const users = Array.from(this.clients.values())
      .filter(c => c.channelId === channelId)
      .map(c => c.user);
    
    this.broadcastToChannel(channelId, {
      type: 'USER_LIST',
      payload: { users },
    });
  }
}

export const mockServer = new MockWebSocketServer();
