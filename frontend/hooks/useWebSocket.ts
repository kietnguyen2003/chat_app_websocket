import { useEffect, useRef, useState, useCallback } from 'react';
import { wsService, WSMessage, MessageHandler } from '../services/websocket';

interface UseWebSocketOptions {
  token: string | null;
  userId: string | null;
  conversationId?: string | null;
  onMessageReceived?: (message: WSMessage) => void;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  sendMessage: (message: string) => void;
  joinConversation: (conversationId: string) => void;
  error: string | null;
}

export const useWebSocket = ({
  token,
  userId,
  conversationId,
  onMessageReceived,
}: UseWebSocketOptions): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const hasInitialized = useRef(false);

  // Connect to WebSocket when token is available
  useEffect(() => {
    if (!token || !userId) {
      // If token or userId is removed, disconnect
      if (wsService.isConnected()) {
        wsService.disconnect();
        setIsConnected(false);
      }
      return;
    }

    // Prevent duplicate connections
    if (hasInitialized.current && wsService.isConnected()) {
      return;
    }

    hasInitialized.current = true;

    const connectWebSocket = async () => {
      try {
        await wsService.connect(token);
        setIsConnected(true);
        setError(null);
      } catch (err) {
        console.error('Failed to connect WebSocket:', err);
        setError('Failed to connect to chat server');
        setIsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      // Disconnect when component unmounts or token changes
      wsService.disconnect();
      setIsConnected(false);
      hasInitialized.current = false;
    };
  }, [token, userId]);

  // Register message handler
  useEffect(() => {
    if (!onMessageReceived) {
      return;
    }

    const handler: MessageHandler = (message) => {
      onMessageReceived(message);
    };

    // Register handler and store cleanup function
    cleanupRef.current = wsService.onMessage(handler);

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [onMessageReceived]);

  // Auto join conversation when conversationId changes
  useEffect(() => {
    if (conversationId && userId && isConnected) {
      wsService.joinConversation(conversationId, userId);
    }
  }, [conversationId, userId, isConnected]);

  // Send message function
  const sendMessage = useCallback((message: string) => {
    if (!conversationId || !userId) {
      console.warn('Cannot send message: missing conversationId or userId');
      return;
    }

    if (!wsService.isConnected()) {
      console.warn('Cannot send message: WebSocket not connected');
      setError('Not connected to chat server');
      return;
    }

    wsService.sendMessage(conversationId, userId, message);
  }, [conversationId, userId]);

  // Join conversation function
  const joinConversation = useCallback((convId: string) => {
    if (!userId) {
      console.warn('Cannot join conversation: missing userId');
      return;
    }

    if (!wsService.isConnected()) {
      console.warn('Cannot join conversation: WebSocket not connected');
      return;
    }

    wsService.joinConversation(convId, userId);
  }, [userId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  return {
    isConnected,
    sendMessage,
    joinConversation,
    error,
  };
};
