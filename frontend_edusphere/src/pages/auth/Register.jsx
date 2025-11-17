import React from 'react';
import { Link } from 'react-router-dom';
import { signUpWithPassword } from '../../auth/authService';
import { getLogger } from '../../shared/utils/logger';

const logger = getLogger('Register');

/**
 * PUBLIC_INTERFACE
 * Register page for email/password sign up.
 */
export function Register() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !password || !confirm) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    try {
      setBusy(true);
      await signUpWithPassword({ email: email.trim(), password });
      setMessage('Registration successful. Please check your email to verify your account.');
    } catch (err) {
      logger.warn('Register failed', { error: String(err) });
      setError('Could not register. The email may already be in use.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1>Create account</h1>
      <form onSubmit={onSubmit} noValidate>
        <div style={{ display: 'grid', gap: '0.75rem', maxWidth: 420 }}>
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)' }}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)' }}
            />
          </label>
          <label>
            Confirm password
            <input
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)' }}
            />
          </label>

          {error && <div role="alert" style={{ color: 'var(--color-error)' }}>{error}</div>}
          {message && <div role="status" style={{ color: 'var(--color-primary)' }}>{message}</div>}

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" type="submit" disabled={busy} aria-busy={busy}>
              {busy ? 'Creating...' : 'Create account'}
            </button>
            <Link className="btn btn-ghost" to="/login">Back to sign in</Link>
            <Link className="btn btn-ghost" to="/signup">Go to Signup</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
