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
  isSidebarVisible?: boolean;
}

const avatarGradients = [
  'conversation-avatar-alt-1',
  'conversation-avatar-alt-2',
  'conversation-avatar-alt-3',
  'conversation-avatar-alt-4',
];

const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  onSelectConversation,
  selectedConversationId,
  onNewConversation,
  loading,
  onlineUsers,
  unreadConversations,
  isSidebarVisible = true
}) => {
  const { user, logout } = useAuth();

  const isConversationOnline = (conversation: Conversation): boolean => {
    const partner = conversation.participants.find(p => p.user_id !== user?.user_id);
    return partner ? onlineUsers.has(partner.user_id) : false;
  };

  return (
    <aside className={`chat-sidebar-card ${!isSidebarVisible ? 'hidden-mobile' : ''}`}>
      {/* Search & Add contact section */}
      <div className="sidebar-search-area">
        <UserSearch onUserFound={onNewConversation} />
      </div>

      {/* Conversation List */}
      <div className="conversation-list">
        {loading ? (
          <div className="empty-state">
            <svg className="spinner" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="empty-state-text" style={{ marginTop: 12 }}>Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <svg className="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="empty-state-title">No conversations</h3>
            <p className="empty-state-text">Search by phone above to open your first chat.</p>
          </div>
        ) : (
          conversations.map((conv, idx) => {
            const isOnline = isConversationOnline(conv);
            const isSelected = selectedConversationId === conv.id;
            const hasUnread = unreadConversations.has(conv.id);
            const gradClass = avatarGradients[idx % avatarGradients.length];

            return (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className={`conversation-card ${
                  isSelected
                    ? 'conversation-card-active'
                    : hasUnread
                    ? 'conversation-card-unread'
                    : ''
                }`}
              >
                <div className="conversation-avatar-wrap">
                  <div className={`conversation-avatar ${gradClass}`}>
                    {conv.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span className={`presence-dot ${isOnline ? 'presence-online' : ''}`}></span>
                </div>

                <div className="conversation-info">
                  <div className="conversation-top-row">
                    <span className="conversation-name">{conv.name}</span>
                    {conv.last_message && (
                      <span className="conversation-time">
                        {new Date(conv.last_message.created_at * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <div className="conversation-bottom-row">
                    <p className="conversation-preview">
                      {conv.last_message ? conv.last_message.message : 'No messages yet'}
                    </p>
                    {hasUnread && !isSelected && (
                      <span className="unread-badge">New</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Footer with Logout */}
      <div className="sidebar-footer">
        <button onClick={logout} className="logout-btn">
          <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
