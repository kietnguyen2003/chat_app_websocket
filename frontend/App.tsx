import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import AuthPage from './components/auth/AuthPage';
import ChatPage from './components/chat/ChatPage';
import LandingPage from './components/landing/LandingPage';
import './index.css';

const App: React.FC = () => {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (user) {
    return <ChatPage />;
  }

  if (showAuth) {
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowAuth(false)}
          className="back-landing-btn"
        >
          <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Home</span>
        </button>
        <AuthPage />
      </div>
    );
  }

  return <LandingPage onLaunchApp={() => setShowAuth(true)} />;
};

export default App;
