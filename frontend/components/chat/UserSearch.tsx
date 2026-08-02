
import React, { useState } from 'react';
import * as api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { User } from '../../types';

interface UserSearchProps {
  onUserFound: (user: User) => void;
}

const UserSearch: React.FC<UserSearchProps> = ({ onUserFound }) => {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const { accessToken, user: currentUser } = useAuth();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !phone.trim()) return;

    // Kiểm tra không phải SĐT của chính mình
    if (currentUser?.phone && phone.trim() === currentUser.phone.trim()) {
      setError("You cannot search for yourself");
      return;
    }

    setLoading(true);
    setError(null);
    setFoundUser(null);
    try {
      const user = await api.findUserByPhone(phone, accessToken);

      // Double check: Nếu backend vẫn trả về chính mình (case edge)
      if (user.phone === currentUser?.phone) {
        setError("You cannot start a conversation with yourself");
        return;
      }

      setFoundUser(user);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartConversation = () => {
    if (foundUser) {
      onUserFound(foundUser);
      setFoundUser(null);
      setPhone('');
    }
  };

  // Check if current input matches user's own phone
  const isOwnPhone = currentUser?.phone && phone.trim() === currentUser.phone.trim();

  return (
    <div className="search-panel">
      <form onSubmit={handleSearch} className="sidebar-search-wrap">
        <svg className="icon-sm sidebar-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Search....."
          className="sidebar-search-input"
          disabled={loading}
        />
      </form>

      {error && (
        <div className="form-alert form-alert-error" style={{ marginTop: 10 }}>
          <span>{error}</span>
        </div>
      )}

      {foundUser && (
        <div className="attachment-card" style={{ marginTop: 10, cursor: 'pointer' }} onClick={handleStartConversation}>
          <div className="conversation-avatar" style={{ width: 34, height: 34, fontSize: '0.85rem' }}>
            {foundUser.name?.[0]?.toUpperCase() || foundUser.username?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="conversation-name" style={{ margin: 0 }}>{foundUser.username}</p>
            <span className="conversation-time">{foundUser.phone}</span>
          </div>
          <button onClick={handleStartConversation} className="attachment-download-btn" title="Open chat">
            <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserSearch;
