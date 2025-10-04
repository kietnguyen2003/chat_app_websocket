import { API_BASE_URL } from '../constants';

export type WSMessageType = 'join_conversation' | 'join_success' | 'new_message' | 'message_received' | 'user_online' | 'user_offline' | 'new_conversation';

export interface WSMessage {
  type: WSMessageType;
  conversation_id: string;
  sender_id: string;
  message: string;
  created_at: number;
}

export type MessageHandler = (message: WSMessage) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private token: string | null = null;
  private isConnecting = false;

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        ('WebSocket already connected');
        resolve();
        return;
      }

      if (this.isConnecting) {
        ('WebSocket connection already in progress');
        return;
      }

      this.isConnecting = true;
      this.token = token;

      // Convert http://localhost:8080 to ws://localhost:8080
      // Backend uses query param token for WebSocket auth (middleware line 21)
      const wsUrl = API_BASE_URL.replace(/^http/, 'ws') + `/ws?token=${token}`;


      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected successfully');
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            console.log('Raw WebSocket message received:', event.data);

            // Try to parse as JSON first
            let message: WSMessage;
            try {
              const parsed = JSON.parse(event.data);

              // Check if it's a nested JSON (message field contains stringified JSON)
              if (parsed.message && typeof parsed.message === 'string') {
                try {
                  const nestedMsg = JSON.parse(parsed.message);
                  // If successful, use the nested message
                  message = nestedMsg;
                  console.log('Parsed nested JSON message:', message);
                } catch {
                  // Not nested JSON, use as is
                  message = parsed;
                }
              } else {
                message = parsed;
              }
            } catch {
              // If not JSON, backend sent plain text - construct message object
              console.log('Received plain text message, constructing object');
              message = {
                type: 'message_received',
                conversation_id: '', // Will be set by context
                sender_id: '', // Unknown sender
                message: event.data,
                created_at: Math.floor(Date.now() / 1000),
              };
            }

            console.log('Final parsed message:', message);

            // Notify all registered handlers
            this.messageHandlers.forEach(handler => handler(message));
          } catch (error) {
            console.error('Failed to handle WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };

        this.ws.onclose = (event) => {
          this.isConnecting = false;
          this.ws = null;

          // Auto reconnect if not closed intentionally
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            (`Reconnecting... Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);

            setTimeout(() => {
              if (this.token) {
                this.connect(this.token);
              }
            }, this.reconnectDelay);
          }
        };
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      ('Disconnecting WebSocket');
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
      this.token = null;
      this.isConnecting = false;
    }
  }

  joinConversation(conversationId: string, userId: string): void {
    console.log('=== wsService.joinConversation called ===');
    console.log('WebSocket state:', this.ws?.readyState);
    console.log('conversationId:', conversationId);
    console.log('userId:', userId);

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected. Cannot join conversation. State:', this.ws?.readyState);
      return;
    }

    const message: Partial<WSMessage> = {
      type: 'join_conversation',
      conversation_id: conversationId,
      sender_id: userId,
      message: '',
      created_at: Math.floor(Date.now() / 1000),
    };

    console.log('Sending join_conversation message:', JSON.stringify(message));
    this.ws.send(JSON.stringify(message));
    console.log('join_conversation message sent');
  }

  sendMessage(conversationId: string, senderId: string, messageText: string): void {
    console.log('=== wsService.sendMessage called ===');
    console.log('WebSocket state:', this.ws?.readyState);
    console.log('conversationId:', conversationId);
    console.log('senderId:', senderId);
    console.log('messageText:', messageText);

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected. Cannot send message. State:', this.ws?.readyState);
      return;
    }

    const message: WSMessage = {
      type: 'new_message',
      conversation_id: conversationId,
      sender_id: senderId,
      message: messageText,
      created_at: Math.floor(Date.now() / 1000),
    };

    console.log('Sending WebSocket message:', JSON.stringify(message));
    this.ws.send(JSON.stringify(message));
    console.log('WebSocket message sent');
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);

    // Return cleanup function
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const wsService = new WebSocketService();
