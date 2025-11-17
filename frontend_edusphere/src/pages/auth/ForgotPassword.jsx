import React from 'react';
import { Link } from 'react-router-dom';
import { sendResetPasswordEmail } from '../../auth/authService';
import { getLogger } from '../../shared/utils/logger';

const logger = getLogger('ForgotPassword');

/**
 * PUBLIC_INTERFACE
 * Forgot password page to trigger reset email.
 */
export function ForgotPassword() {
  const [email, setEmail] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email) {
      setError('Email is required.');
      return;
    }
    try {
      setBusy(true);
      await sendResetPasswordEmail(email.trim());
      setMessage('If the email exists, a reset link has been sent.');
    } catch (err) {
      logger.warn('Reset email failed', { error: String(err) });
      setError('Unable to send reset email.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1>Reset your password</h1>
      <form onSubmit={onSubmit} noValidate>
        <div style={{ display: 'grid', gap: '0.75rem', maxWidth: 420 }}>
          <label>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)' }}
            />
          </label>
          {error && <div role="alert" style={{ color: 'var(--color-error)' }}>{error}</div>}
          {message && <div role="status" style={{ color: 'var(--color-primary)' }}>{message}</div>}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" type="submit" disabled={busy} aria-busy={busy}>
              {busy ? 'Sending...' : 'Send reset email'}
            </button>
            <Link className="btn btn-ghost" to="/login">Back to sign in</Link>
          </div>
        </div>
      </form>
    </div>
  );
}
