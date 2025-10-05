
import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => setIsLogin(!isLogin);

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full overflow-hidden shadow-lg">
          <img src="/assets/image.png" alt="Logo" className="w-full h-full object-cover" />
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
