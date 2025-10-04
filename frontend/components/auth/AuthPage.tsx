
import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => setIsLogin(!isLogin);

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">
          {isLogin ? 'Welcome Back' : 'Join Us'}
        </h2>
        <p className="text-gray-400 text-sm">
          {isLogin ? 'Sign in to continue to your chats' : 'Create an account to get started'}
        </p>
      </div>

      <div className="transition-all duration-300 ease-in-out">
        {isLogin ? <LoginForm /> : <RegisterForm />}
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 text-gray-500 bg-gradient-to-br from-gray-800 to-gray-900">
            {isLogin ? "New here?" : "Already a member?"}
          </span>
        </div>
      </div>

      <button
        onClick={toggleForm}
        className="w-full py-2.5 text-sm font-medium text-indigo-400 hover:text-indigo-300 border border-gray-700 hover:border-indigo-500 rounded-lg transition-all duration-200 hover:bg-gray-800/50"
      >
        {isLogin ? 'Create an account' : 'Sign in instead'}
      </button>
    </div>
  );
};

export default AuthPage;
