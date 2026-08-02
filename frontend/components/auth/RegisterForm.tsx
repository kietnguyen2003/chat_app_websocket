import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import * as api from '../../services/api';

const RegisterForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { setAuthData } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api.register(username, email, password, phone, name);
      setAuthData(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor="name-register">Display Name</label>
        <input
          id="name-register"
          name="name"
          type="text"
          required
          className="form-input"
          placeholder="How should your profile appear?"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="username-register">Username</label>
        <input
          id="username-register"
          name="username"
          type="text"
          required
          className="form-input"
          placeholder="Choose a username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="email-address">Email</label>
        <input
          id="email-address"
          name="email"
          type="email"
          required
          className="form-input"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="phone-number">Phone</label>
        <input
          id="phone-number"
          name="phone"
          type="tel"
          required
          className="form-input"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="password-register">Password</label>
        <input
          id="password-register"
          name="password"
          type="password"
          required
          className="form-input"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && (
        <div className="form-alert form-alert-error">
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="auth-primary-btn"
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
};

export default RegisterForm;
