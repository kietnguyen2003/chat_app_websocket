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
  wsSendMessage,
  joinConversation,
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
          messeage: wsMessage.messeage,
          created_at: wsMessage.created_at,
        };

        // Avoid duplicate if it's from current user (optimistic update already added)
        setMessages(prev => {
          // Check if message already exists (by timestamp and content)
          const isDuplicate = prev.some(msg =>
            msg.sender_id === newMsg.sender_id &&
            msg.messeage === newMsg.messeage &&
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
      if (data?.messeages) {
        setMessages(data.messeages.sort((a, b) => a.created_at - b.created_at));
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
  }, [conversation]);
  
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
          messeage: newMessage,
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
    ? "w-2/3 xl:w-3/4 flex flex-col bg-gray-800"
    : "w-full flex flex-col bg-gray-800";


  if (!conversation) {
    const placeholderContainerClasses = `${containerClasses.replace('flex-col', 'items-center justify-center')} relative`;
    return (
      <div className={placeholderContainerClasses}>
         {!isSidebarVisible && (
            <button onClick={onToggleSidebar} className="absolute top-5 left-4 text-gray-400 hover:text-white" aria-label="Show sidebar">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
         )}
        <p className="text-gray-400">Select a conversation to start chatting</p>
      </div>
    );
  }

  const conversationPartner = conversation.participants.find(p => p.user_id !== user?.user_id);


  return (
    <div className={containerClasses}>
      <div className="p-4 border-b border-gray-700/50 bg-gradient-to-r from-gray-900 to-gray-900/80 backdrop-blur-sm flex items-center space-x-4">
        {!isSidebarVisible && (
          <button
            onClick={onToggleSidebar}
            className="text-gray-400 hover:text-white transition-colors duration-200"
            aria-label="Show sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div className="flex items-center justify-between flex-1">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg">
              {conversationPartner?.name?.[0]?.toUpperCase() || 'C'}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{conversationPartner?.name || 'Chat'}</h2>
              <div className="flex items-center space-x-1">
                {conversationPartner && onlineUsers.has(conversationPartner.user_id) ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-400">Active now</span>
                  </>
                ) : (
                  <span className="text-xs text-gray-500">Offline</span>
                )}
              </div>
            </div>
          </div>

          {/* WebSocket status indicator */}
          <div className="flex items-center space-x-2">
            {wsError && (
              <span className="text-xs text-red-400">{wsError}</span>
            )}
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${isConnected ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-500'}`}></div>
              <span className={`text-xs ${isConnected ? 'text-green-400' : 'text-gray-400'}`}>
                {isConnected ? 'Real-time' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-gray-800 to-gray-900 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-3">
            <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm text-gray-400">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-400 mb-2">No messages yet</p>
            <p className="text-sm text-gray-500">Send a message to start the conversation</p>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender_id === user?.user_id ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}>
                <div className={`max-w-md lg:max-w-lg xl:max-w-xl p-3 rounded-2xl shadow-lg ${
                  msg.sender_id === user?.user_id
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
                    : 'bg-gray-700/80 backdrop-blur-sm text-white border border-gray-600/50'
                }`}>
                  <p className="break-words">{msg.messeage}</p>
                  <span className="text-xs opacity-70 block text-right mt-1">
                    {new Date(msg.created_at * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="p-4 bg-gradient-to-r from-gray-900 to-gray-900/80 border-t border-gray-700/50">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-700/50 border border-gray-600 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full px-6 py-3 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
