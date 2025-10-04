
import React from 'react';
import { useAuth } from './hooks/useAuth';
import AuthPage from './components/auth/AuthPage';
import ChatPage from './components/chat/ChatPage';

const App: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="h-screen w-screen flex items-center justify-center font-sans">
      {user ? <ChatPage /> : <AuthPage />}
    </div>
  );
};

export default App;
