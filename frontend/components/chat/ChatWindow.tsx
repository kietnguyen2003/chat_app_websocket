import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Conversation, Message, WSMessage } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useWebSocket } from '../../hooks/useWebSocket';
import { wsService } from '../../services/websocket';
import * as api from '../../services/api';

interface ChatWindowProps {
  conversation: Conversation | null;
  isSidebarVisible: boolean;
  onToggleSidebar: () => void;
  onlineUsers: Set<string>;
  isConnected: boolean;
  wsSendMessage: (message: string) => void;
  joinConversation: (conversationId: string) => void;
  wsError: string | null;
  onNewMessage?: (wsMessage: WSMessage) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  isSidebarVisible,
  onToggleSidebar,
  onlineUsers,
  isConnected,
  wsSendMessage: _wsSendMessage,
  joinConversation: _joinConversation,
  wsError
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, accessToken } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen for WebSocket messages
  useEffect(() => {
    const handleWSMessage = (wsMessage: WSMessage) => {
      console.log('ChatWindow received WebSocket message:', wsMessage);

      // Only handle messages for current conversation
      if (wsMessage.type === 'new_message' && wsMessage.conversation_id === conversation?.id) {
        console.log('Adding message to conversation:', wsMessage);
        const newMsg: Message = {
          sender_id: wsMessage.sender_id,
          message: wsMessage.message,
          created_at: wsMessage.created_at,
        };

        // Avoid duplicate if it's from current user (optimistic update already added)
        setMessages(prev => {
          // Check if message already exists (by timestamp and content)
          const isDuplicate = prev.some(msg =>
            msg.sender_id === newMsg.sender_id &&
            msg.message === newMsg.message &&
            Math.abs(msg.created_at - newMsg.created_at) < 2 // Within 2 seconds
          );

          if (isDuplicate) {
            console.log('Duplicate message detected, skipping');
            return prev;
          }

          return [...prev, newMsg];
        });
      }
    };

    // Register message handler
    const cleanup = wsService.onMessage(handleWSMessage);

    return cleanup;
  }, [conversation?.id]);

  // Join conversation when it changes
  useEffect(() => {
    console.log('🔄 Join conversation effect triggered:', {
      conversationId: conversation?.id,
      userId: user?.user_id,
      isConnected,
      shouldJoin: !!(conversation?.id && user?.user_id && isConnected)
    });

    if (!conversation?.id || !user?.user_id) {
      console.log('⚠️ Missing conversation or user, skipping join');
      return;
    }

    // Join immediately if already connected
    if (isConnected) {
      console.log('✅ Joining conversation (already connected):', conversation.id, 'for user:', user.user_id);
      wsService.joinConversation(conversation.id, user.user_id);
      return;
    }

    // Wait for connection with retry
    console.log('⏳ WebSocket not connected yet, will retry...');
    const checkInterval = setInterval(() => {
      if (wsService.isConnected()) {
        console.log('✅ Joining conversation (after waiting):', conversation.id, 'for user:', user.user_id);
        wsService.joinConversation(conversation.id, user.user_id);
        clearInterval(checkInterval);
      }
    }, 500);

    // Cleanup after 10 seconds
    const timeout = setTimeout(() => {
      clearInterval(checkInterval);
      console.log('⚠️ Timeout waiting for WebSocket connection');
    }, 10000);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeout);
    };
  }, [conversation?.id, user?.user_id, isConnected]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const fetchMessages = useCallback(async () => {
    if (!conversation || !accessToken) return;
    setLoading(true);
    try {
      const data = await api.getMessages(conversation.id, accessToken);
      if (data?.messages) {
        setMessages(data.messages.sort((a, b) => a.created_at - b.created_at));
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [conversation, accessToken]);


  useEffect(() => {
    fetchMessages();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.id]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversation || !accessToken || !user) return;

    console.log('=== SEND MESSAGE DEBUG ===');
    console.log('isConnected:', isConnected);
    console.log('conversation.id:', conversation.id);
    console.log('user.user_id:', user.user_id);
    console.log('message:', newMessage);

    try {
      // Use WebSocket if connected, otherwise fallback to HTTP API
      if (isConnected) {
        console.log('Sending via WebSocket...');
        // Call wsService directly instead of using wsSendMessage from props
        wsService.sendMessage(conversation.id, user.user_id, newMessage);

        // Add the message to local state immediately (optimistic update)
        const optimisticMessage: Message = {
          sender_id: user.user_id,
          message: newMessage,
          created_at: Math.floor(Date.now() / 1000),
        };
        console.log('Adding optimistic message to UI:', optimisticMessage);
        setMessages(prev => [...prev, optimisticMessage]);
      } else {
        console.log('WebSocket not connected, using HTTP API fallback...');
        await api.sendMessage(conversation.id, newMessage, accessToken);
        // Refetch messages to see the new one
        fetchMessages();
      }

      setNewMessage('');
      console.log('Message sent successfully');
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };
  
  const containerClasses = isSidebarVisible
    ? "chat-window"
    : "chat-window chat-window-expanded";


  if (!conversation) {
    return (
      <section className="chat-window-card">
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg className="icon-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="empty-state-title">Select a Conversation</h2>
          <p className="empty-state-text">
            Choose a contact from the left list to start messaging in real-time.
          </p>
        </div>
      </section>
    );
  }

  const conversationPartner = conversation.participants.find(p => p.user_id !== user?.user_id);
  const isPeerOnline = conversationPartner ? onlineUsers.has(conversationPartner.user_id) : false;

  return (
    <section className="chat-window-card">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-user">
          {!isSidebarVisible && (
            <button onClick={onToggleSidebar} className="action-button" aria-label="Show sidebar">
              <svg className="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          <div className="conversation-avatar-wrap">
            <div className="chat-header-avatar">
              {conversationPartner?.name?.[0]?.toUpperCase() || conversation?.name?.[0]?.toUpperCase() || 'C'}
            </div>
            <span className={`presence-dot ${isPeerOnline ? 'presence-online' : ''}`}></span>
          </div>

          <div className="chat-header-meta">
            <h2 className="chat-header-name">{conversationPartner?.name || conversation.name}</h2>
            <span className="chat-header-status">
              {isPeerOnline ? 'Active Now' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="chat-header-actions">
          <button className="action-button" title="Search in conversation">
            <svg className="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button className="action-button" title="Settings">
            <svg className="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Message Thread */}
      <div className="message-thread">
        {loading ? (
          <div className="empty-state">
            <svg className="spinner" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="empty-state-text" style={{ marginTop: 12 }}>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg className="icon-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="empty-state-title">No messages yet</h3>
            <p className="empty-state-text">Send the first message to start the conversation.</p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => {
              const isOwn = msg.sender_id === user?.user_id;

              return (
                <div
                  key={index}
                  className={`message-row ${isOwn ? 'message-row-own' : 'message-row-peer'} animate-fade-in`}
                >
                  <div className={`message-avatar ${isOwn ? 'own-avatar' : 'peer-avatar'}`}>
                    {isOwn
                      ? user?.name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'
                      : conversationPartner?.name?.[0]?.toUpperCase() || 'C'}
                  </div>

                  <div className="message-body-wrap">
                    <div className={`message-bubble ${isOwn ? 'message-bubble-own' : 'message-bubble-peer'}`}>
                      <p className="message-text">{msg.message}</p>
                    </div>

                    <span className="message-time">
                      {new Date(msg.created_at * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Composer */}
      <div className="chat-composer-wrap">
        <form onSubmit={handleSendMessage} className="chat-composer">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message"
            className="chat-input"
          />

          <div className="composer-actions">
            <button type="button" className="composer-icon-btn" title="Emoji">
              <svg className="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button type="button" className="composer-icon-btn" title="Attachment">
              <svg className="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>

            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="send-button"
            >
              <span>Send</span>
              <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ChatWindow;
