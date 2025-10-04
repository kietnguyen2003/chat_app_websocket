
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
    <div>
      <form onSubmit={handleSearch} className="flex space-x-2">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className={`h-5 w-5 ${isOwnPhone ? 'text-red-500' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Find user by phone..."
            className={`w-full pl-10 pr-3 py-2.5 bg-gray-800/50 border rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${
              isOwnPhone
                ? 'border-red-600 focus:ring-red-500'
                : 'border-gray-600 focus:ring-indigo-500'
            }`}
            disabled={loading}
          />
          {isOwnPhone && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !phone.trim()}
          className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </button>
      </form>

      {error && (
        <div className="flex items-center space-x-2 mt-3 text-xs text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
          <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {foundUser && (
        <div className="mt-3 p-3 bg-gradient-to-r from-gray-800 to-gray-800/50 rounded-lg border border-gray-700 animate-fade-in shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg flex-shrink-0">
                {foundUser.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white truncate">{foundUser.username}</p>
                <p className="text-xs text-gray-400 truncate">{foundUser.phone}</p>
              </div>
            </div>
            <button
              onClick={handleStartConversation}
              className="px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex-shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple fade-in animation for the search result
const styles = document.createElement('style');
styles.innerHTML = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.3s ease-out forwards;
  }
`;
document.head.appendChild(styles);


export default UserSearch;
