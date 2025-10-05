import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
import { Conversation, User, WSMessage } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useWebSocket } from '../../hooks/useWebSocket';
import * as api from '../../services/api';

const ChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [unreadConversations, setUnreadConversations] = useState<Set<string>>(new Set());
  const { accessToken, user } = useAuth();

  const fetchConversations = useCallback(async () => {
    if (!accessToken || !user?.user_id || !user?.username) return;
    try {
      setLoading(true);
      // Truyền user_id và username để filter conversation partner
      const fetchedConversations = await api.getConversations(accessToken, user.user_id, user.username);

      // Sort theo last_message time (newest first)
      const sortedConversations = fetchedConversations.sort((a, b) => {
        const timeA = a.last_message?.created_at || 0;
        const timeB = b.last_message?.created_at || 0;
        return timeB - timeA;
      });

      setConversations(sortedConversations);

      // Lưu vào localStorage để backup
      if (user?.user_id && sortedConversations.length > 0) {
        localStorage.setItem(`conversations_${user.user_id}`, JSON.stringify(sortedConversations));
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
      // Fallback: Load từ localStorage nếu API fail
      const storedConvs = localStorage.getItem(`conversations_${user?.user_id}`);
      if (storedConvs) {
        try {
          setConversations(JSON.parse(storedConvs));
        } catch (e) {
          console.error("Failed to parse stored conversations", e);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [accessToken, user?.user_id, user?.username]);

  // WebSocket integration at ChatPage level
  const handleMessageReceived = useCallback((wsMessage: WSMessage) => {
    console.log('Received WebSocket message:', wsMessage);

    // Handle user online/offline status
    if (wsMessage.type === 'user_online') {

      // Skip if it's our own online event
      if (wsMessage.sender_id === user?.user_id) {
        return;
      }

      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.add(wsMessage.sender_id);
        return newSet;
      });
      return;
    }

    if (wsMessage.type === 'user_offline') {

      // Skip if it's our own offline event
      if (wsMessage.sender_id === user?.user_id) {
        return;
      }

      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(wsMessage.sender_id);
        return newSet;
      });
      return;
    }

    // Handle new conversation
    if (wsMessage.type === 'new_conversation') {
      console.log('New conversation received:', wsMessage.conversation_id);
      // Refresh conversations list to show the new conversation
      fetchConversations();
      // Show notification
      alert(`New conversation from user ${wsMessage.sender_id}`);
      return;
    }

    // Handle new message - pass to ChatWindow via state
    if (wsMessage.type === 'new_message') {
      console.log('New message received via WebSocket:', wsMessage);
      console.log('Current conversation ID:', selectedConversation?.id);
      console.log('Message from user:', wsMessage.sender_id);
      console.log('My user ID:', user?.user_id);

      // If message is NOT from current conversation AND not from myself, mark as unread
      const isFromOtherConversation = wsMessage.conversation_id !== selectedConversation?.id;
      const isFromOtherUser = wsMessage.sender_id !== user?.user_id;

      console.log('Is from other conversation?', isFromOtherConversation);
      console.log('Is from other user?', isFromOtherUser);

      if (isFromOtherConversation && isFromOtherUser) {
        console.log('📬 Marking conversation as unread:', wsMessage.conversation_id);
        setUnreadConversations(prev => {
          const newSet = new Set(prev);
          newSet.add(wsMessage.conversation_id);
          console.log('Unread conversations after update:', Array.from(newSet));
          return newSet;
        });
      } else {
        console.log('⏭️ Skipping unread mark - either same conversation or own message');
      }

      // Update last_message in conversations list
      setConversations(prev => {
        // Find if conversation exists
        const convIndex = prev.findIndex(c => c.id === wsMessage.conversation_id);
        if (convIndex === -1) return prev;

        // Create new array with updated conversation
        const updated = [...prev];
        updated[convIndex] = {
          ...updated[convIndex],
          last_message: {
            sender_id: wsMessage.sender_id,
            message: wsMessage.message,
            created_at: wsMessage.created_at,
          }
        };

        // Re-sort by last_message time
        updated.sort((a, b) => {
          const timeA = a.last_message?.created_at || 0;
          const timeB = b.last_message?.created_at || 0;
          return timeB - timeA;
        });

        return updated;
      });

      // ChatWindow will handle this via its own message handler
    }
  }, [user?.user_id, fetchConversations, selectedConversation?.id]);

  const { isConnected, sendMessage: wsSendMessage, joinConversation, error: wsError } = useWebSocket({
    token: accessToken,
    userId: user?.user_id || null,
    conversationId: null, // Don't auto-join here
    onMessageReceived: handleMessageReceived,
  });

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (user?.user_id && conversations.length > 0) {
      localStorage.setItem(`conversations_${user.user_id}`, JSON.stringify(conversations));
    }
  }, [conversations, user?.user_id]);

  // Load current_chat from localStorage on mount
  useEffect(() => {
    if (user?.user_id && conversations.length > 0) {
      const savedCurrentChat = localStorage.getItem(`current_chat_${user.user_id}`);
      if (savedCurrentChat) {
        try {
          const savedConversation: Conversation = JSON.parse(savedCurrentChat);
          // Verify conversation vẫn tồn tại trong list
          const exists = conversations.find(c => c.id === savedConversation.id);
          if (exists) {
            setSelectedConversation(exists);
          } else {
            // Conversation không còn tồn tại, xóa khỏi localStorage
            localStorage.removeItem(`current_chat_${user.user_id}`);
          }
        } catch (e) {
          console.error("Failed to parse saved conversation", e);
          localStorage.removeItem(`current_chat_${user.user_id}`);
        }
      }
    }
  }, [conversations, user?.user_id]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);

    // Clear unread status when opening conversation
    setUnreadConversations(prev => {
      const newSet = new Set(prev);
      newSet.delete(conversation.id);
      return newSet;
    });

    // Save to localStorage
    if (user?.user_id) {
      localStorage.setItem(`current_chat_${user.user_id}`, JSON.stringify(conversation));
    }

    // Auto-hide sidebar on mobile when conversation is selected
    if (window.innerWidth < 768) {
      setIsSidebarVisible(false);
    }
  };

  const handleNewConversation = async (friend: User) => {
     if (!accessToken || !friend.phone) return;
     try {
       const newConvData = await api.createConversation(friend.phone, accessToken);
       const newConversation: Conversation = {
         id: newConvData.id,
         participants: [user!, friend],
         name: friend.username
       };
       setConversations(prev => [newConversation, ...prev]);
       setSelectedConversation(newConversation);

       // Save to localStorage
       if (user?.user_id) {
         localStorage.setItem(`current_chat_${user.user_id}`, JSON.stringify(newConversation));
       }

       if (!isSidebarVisible) setIsSidebarVisible(true);
     } catch (error) {
       console.error("Failed to create conversation:", error);
     }
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(prev => !prev);
  };

  return (
    <div className="flex h-screen w-screen bg-gray-800 text-white">
      {isSidebarVisible && (
        <Sidebar
          conversations={conversations}
          onSelectConversation={handleSelectConversation}
          selectedConversationId={selectedConversation?.id}
          onNewConversation={handleNewConversation}
          loading={loading}
          onToggleSidebar={toggleSidebar}
          onlineUsers={onlineUsers}
          unreadConversations={unreadConversations}
        />
      )}
      <ChatWindow
        conversation={selectedConversation}
        isSidebarVisible={isSidebarVisible}
        onToggleSidebar={toggleSidebar}
        onlineUsers={onlineUsers}
        isConnected={isConnected}
        wsSendMessage={wsSendMessage}
        joinConversation={joinConversation}
        wsError={wsError}
      />
    </div>
  );
};

export default ChatPage;
