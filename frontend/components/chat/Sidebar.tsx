import React from 'react';
import { Conversation, User } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import UserSearch from './UserSearch';

interface SidebarProps {
  conversations: Conversation[];
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string | null;
  onNewConversation: (user: User) => void;
  loading: boolean;
  onToggleSidebar: () => void;
  onlineUsers: Set<string>;
  unreadConversations: Set<string>;
}

const Sidebar: React.FC<SidebarProps> = ({ conversations, onSelectConversation, selectedConversationId, onNewConversation, loading, onToggleSidebar, onlineUsers, unreadConversations }) => {
  const { user, logout } = useAuth();

  // Helper function to check if conversation partner is online
  const isConversationOnline = (conversation: Conversation): boolean => {
    const partner = conversation.participants.find(p => p.user_id !== user?.user_id);
    return partner ? onlineUsers.has(partner.user_id) : false;
  };

  // Debug: log unread conversations
  console.log('🔍 Sidebar unreadConversations:', Array.from(unreadConversations));

  return (
    <div className="w-1/3 xl:w-1/4 bg-gradient-to-b from-gray-900 to-gray-950 flex flex-col border-r border-gray-700/50">
      <div className="p-4 border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="text-gray-400 hover:text-white transition-colors duration-200"
            aria-label="Hide sidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold text-white truncate">{user?.name}</h1>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-400">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 border-b border-gray-700">
        <UserSearch onUserFound={onNewConversation} />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-3">
            <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm text-gray-400">Loading chats...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-gray-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm text-gray-400 mb-2">No conversations yet</p>
            <p className="text-xs text-gray-500">Search for a user above to start chatting</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-800/50">
            {conversations.map((conv) => (
              <li
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-800/50 relative ${
                  selectedConversationId === conv.id
                    ? 'bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border-l-4 border-indigo-500'
                    : unreadConversations.has(conv.id)
                    ? 'bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-l-4 border-yellow-500 animate-pulse'
                    : 'border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg flex-shrink-0">
                      {conv.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    {/* Online/Offline indicator */}
                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-gray-900 ${
                      isConversationOnline(conv) ? 'bg-green-500' : 'bg-gray-500'
                    }`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-white truncate">{conv.name}</span>
                      {conv.last_message && (
                        <span className="text-xs text-gray-500 ml-2">
                          {new Date(conv.last_message.created_at * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 truncate">
                      {conv.last_message ? conv.last_message.message : 'No messages yet'}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Logout button at bottom */}
      <div className="p-4 border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 text-gray-400 hover:text-red-400 transition-colors duration-200 px-4 py-2.5 hover:bg-gray-800 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
