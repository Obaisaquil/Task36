import { useState } from 'react';
import { ShieldCheck, LogOut, LockKeyhole, UserRound, ArrowRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function App() {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(() => localStorage.getItem('jwtToken') || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [protectedData, setProtectedData] = useState(null);
  const [loading, setLoading] = useState(false);

  const clearFeedback = () => {
    setMessage('');
    setError('');
  };

  const handleAuth = async (event) => {
    event.preventDefault();
    clearFeedback();
    setProtectedData(null);
    setLoading(true);

    try {
      const endpoint = mode === 'register' ? '/register' : '/login';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Request failed');

      if (mode === 'register') {
        setMessage(data.message);
        setMode('login');
        setPassword('');
      } else {
        localStorage.setItem('jwtToken', data.token);
        setToken(data.token);
        setUsername(data.username);
        setPassword('');
        setMessage(data.message);
      }
    } catch (err) {
      setError(err.message || 'Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  const accessProtectedRoute = async () => {
    clearFeedback();
    setProtectedData(null);
    setLoading(true);

    try {
      const savedToken = localStorage.getItem('jwtToken');
      const response = await fetch(`${API_URL}/protected`, {
        headers: { Authorization: `Bearer ${savedToken}` }
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Access denied');
      setProtectedData(data);
    } catch (err) {
      setError(err.message || 'Could not access protected route.');
      if (err.message.toLowerCase().includes('token')) {
        localStorage.removeItem('jwtToken');
        setToken('');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    setToken('');
    setProtectedData(null);
    setMessage('You have been logged out.');
    setError('');
    setMode('login');
  };

  return (
    <main className="app">
      <section className="auth-card">
        <div className="brand-icon"><ShieldCheck size={27} /></div>
        <p className="eyebrow">SECURE ACCESS</p>
        <h1>{token ? 'You’re signed in' : 'Welcome'}</h1>
        <p className="subtitle">
          {token ? 'Your account is ready. Access your protected area below.' :
            'Create an account or sign in to continue.'}
        </p>

        {!token ? (
          <>
            <div className="tabs" role="tablist" aria-label="Authentication">
              <button className={mode === 'login' ? 'tab active' : 'tab'}
                onClick={() => { setMode('login'); clearFeedback(); }} type="button">
                Login
              </button>
              <button className={mode === 'register' ? 'tab active' : 'tab'}
                onClick={() => { setMode('register'); clearFeedback(); }} type="button">
                Register
              </button>
            </div>

            <form onSubmit={handleAuth}>
              <label htmlFor="username">Username</label>
              <div className="input-wrap">
                <UserRound size={17} />
                <input id="username" type="text" autoComplete="username"
                  placeholder="Enter your username" value={username}
                  onChange={(e) => setUsername(e.target.value)} required minLength={3} />
              </div>

              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <LockKeyhole size={17} />
                <input id="password" type="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  placeholder="Enter your password" value={password}
                  onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>

              {error && <p className="feedback error" role="alert">{error}</p>}
              {message && <p className="feedback success" role="status">{message}</p>}

              <button className="primary-button" type="submit" disabled={loading}>
                {loading ? 'Please wait...' : mode === 'register' ? 'Create account' : 'Sign in'}
                {!loading && <ArrowRight size={17} />}
              </button>
            </form>
            <p className="switch-copy">
              {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
              <button type="button" onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                clearFeedback();
              }}>
                {mode === 'login' ? 'Create an account' : 'Sign in'}
              </button>
            </p>
          </>
        ) : (
          <div className="signed-in">
            <div className="user-pill"><span className="status-dot" /> Authenticated session</div>
            <button className="primary-button" type="button"
              onClick={accessProtectedRoute} disabled={loading}>
              {loading ? 'Checking...' : 'Access protected route'}
              <ArrowRight size={17} />
            </button>
            {error && <p className="feedback error" role="alert">{error}</p>}
            {protectedData && (
              <div className="protected-result">
                <div className="result-heading"><ShieldCheck size={19} /> Protected content</div>
                <p>{protectedData.message}</p>
                <small>Username: {protectedData.user.username}</small>
              </div>
            )}
            {message && <p className="feedback success">{message}</p>}
            <button className="logout-button" type="button" onClick={logout}>
              <LogOut size={16} /> Log out
            </button>
          </div>
        )}
        <div className="card-footer"><LockKeyhole size={13} /> Protected with JSON Web Tokens</div>
      </section>
      <p className="page-note">JWT Authentication · Express + React</p>
    </main>
  );
}
