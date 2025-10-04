
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AuthenticatedUser, User } from '../types';
import * as api from '../services/api';
import { wsService } from '../services/websocket';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  setAuthData: (data: AuthenticatedUser) => void;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('accessToken');
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setAccessToken(storedToken);
      }
    } catch (error) {
      console.error("Failed to parse auth data from localStorage", error);
      localStorage.clear();
    }
  }, []);

  const setAuthData = useCallback((data: AuthenticatedUser) => {
    setUser(data.user);
    setAccessToken(data.token.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('accessToken', data.token.access_token);
    localStorage.setItem('refreshToken', data.token.refresh_token);
  }, []);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (user?.user_id && refreshToken) {
        await api.logout(user.user_id, refreshToken);
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Disconnect WebSocket before clearing state
      wsService.disconnect();

      // Clear all user-specific data
      if (user?.user_id) {
        localStorage.removeItem(`conversations_${user.user_id}`);
        localStorage.removeItem(`current_chat_${user.user_id}`);
      }
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }, [user]);

  const refreshAccessToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!user?.user_id || !refreshToken) {
        throw new Error('No refresh token available');
      }

      const newAuthData = await api.refreshToken(user.user_id, refreshToken);

      // Giữ lại username hiện tại vì backend không trả về
      const updatedUser = {
        ...newAuthData.user,
        username: user.username,
        phone: user.phone
      };

      setUser(updatedUser);
      setAccessToken(newAuthData.token.access_token);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('accessToken', newAuthData.token.access_token);
      localStorage.setItem('refreshToken', newAuthData.token.refresh_token);
    } catch (error) {
      console.error("Refresh token error:", error);
      // Nếu refresh token thất bại, đăng xuất người dùng
      await logout();
      throw error;
    }
  }, [user, logout]);

  return (
    <AuthContext.Provider value={{ user, accessToken, setAuthData, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};
