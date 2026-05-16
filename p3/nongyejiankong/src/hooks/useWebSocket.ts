import { useEffect, useRef, useCallback } from 'react';
import { WS_CONFIG } from '../utils/constants';

interface UseWebSocketOptions {
  onMessage?: (data: any) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const heartbeatTimerRef = useRef<number | null>(null);
  const heartbeatTimeoutRef = useRef<number | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);

  const sendHeartbeat = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'heartbeat' }));
      
      heartbeatTimeoutRef.current = window.setTimeout(() => {
        console.warn('Heartbeat timeout, reconnecting...');
        wsRef.current?.close();
      }, WS_CONFIG.heartbeatTimeout);
    }
  }, []);

  const startHeartbeat = useCallback(() => {
    stopHeartbeat();
    heartbeatTimerRef.current = window.setInterval(sendHeartbeat, WS_CONFIG.heartbeatInterval);
  }, [sendHeartbeat]);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(WS_CONFIG.url);

      ws.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttemptsRef.current = 0;
        startHeartbeat();
        options.onOpen?.();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'heartbeat_ack') {
            if (heartbeatTimeoutRef.current) {
              clearTimeout(heartbeatTimeoutRef.current);
              heartbeatTimeoutRef.current = null;
            }
            return;
          }
          
          options.onMessage?.(data);
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        stopHeartbeat();
        options.onClose?.();
        
        if (reconnectAttemptsRef.current < WS_CONFIG.maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`Reconnecting... Attempt ${reconnectAttemptsRef.current}`);
          reconnectTimerRef.current = window.setTimeout(connect, WS_CONFIG.reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        options.onError?.(error);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [options, startHeartbeat, stopHeartbeat]);

  const disconnect = useCallback(() => {
    stopHeartbeat();
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, [stopHeartbeat]);

  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket is not connected, cannot send message');
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { send, disconnect, reconnect: connect };
};
