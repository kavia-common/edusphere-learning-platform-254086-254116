import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signInWithPassword, sendMagicLink } from '../../auth/authService';
import { getLogger } from '../../shared/utils/logger';

const logger = getLogger('Login');

/**
 * PUBLIC_INTERFACE
 * Login page with email/password and optional magic link.
 */
export function Login() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    try {
      setBusy(true);
      await signInWithPassword({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err) {
      logger.warn('Login failed', { error: String(err) });
      setError('Invalid credentials or sign-in error.');
    } finally {
      setBusy(false);
    }
  };

  const onMagic = async () => {
    setError('');
    setMessage('');
    if (!email) {
      setError('Enter your email to receive a magic link.');
      return;
    }
    try {
      setBusy(true);
      await sendMagicLink(email.trim());
      setMessage('Magic link sent. Please check your inbox.');
    } catch (err) {
      logger.warn('Magic link failed', { error: String(err) });
      setError('Could not send magic link.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1>Sign in</h1>
      <form onSubmit={onSubmit} aria-describedby="login-help" noValidate>
        <div style={{ display: 'grid', gap: '0.75rem', maxWidth: 420 }}>
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!error && !email}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)' }}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!error && !password}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)' }}
            />
          </label>

          {error && (
            <div role="alert" style={{ color: 'var(--color-error)' }}>
              {error}
            </div>
          )}
          {message && (
            <div role="status" style={{ color: 'var(--color-primary)' }}>
              {message}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" type="submit" disabled={busy} aria-busy={busy}>
              {busy ? 'Signing in...' : 'Sign in'}
            </button>
            <button className="btn btn-ghost" type="button" onClick={onMagic} disabled={busy}>
              Send magic link
            </button>
          </div>

          <div id="login-help" style={{ fontSize: 12, opacity: 0.8 }}>
            <Link to="/forgot-password">Forgot password?</Link> · New here?{' '}
            <Link to="/register">Create an account</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
