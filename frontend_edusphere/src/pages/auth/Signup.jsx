import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUpWithPassword } from '../../auth/authService';
import { getLogger } from '../../shared/utils/logger';
import { getCurrentUserRole, getRoleLabel } from '../../auth/roleService';
import { supabase } from '../../lib/supabaseClient';
import { ROUTES } from '../../utils/routes';

const logger = getLogger('Signup');

/**
 * PUBLIC_INTERFACE
 * Signup page with email/password, integrates Supabase sign-up,
 * and displays resolved user role based on metadata/profiles with safe fallback.
 */
export function Signup() {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const [role, setRole] = React.useState(null);

  const navigate = useNavigate();

  // Resolve role on mount if already logged in
  React.useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          const r = await getCurrentUserRole();
          if (mounted) setRole(r);
        }
      } catch (e) {
        logger.info('Role resolution on mount skipped', { error: String(e) });
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, []);

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError('Email and password are required.');
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      setBusy(true);
      // Optionally set initial role via metadata if needed; omitted to let backend decide.
      await signUpWithPassword({ email: trimmedEmail, password });
      setMessage('Signup successful. Please check your email to verify your account.');

      // Attempt role resolution post-signup; may still be unauthenticated until email verified.
      try {
        const r = await getCurrentUserRole();
        setRole(r);
      } catch (err) {
        logger.info('Post-signup role resolution failed; defaulting', { error: String(err) });
      }
    } catch (err) {
      logger.warn('Signup failed', { error: String(err) });
      const supaMsg = err?.message || '';
      // Surface a friendly message
      setError(supaMsg || 'Could not sign up. The email may already be in use or invalid.');
    } finally {
      setBusy(false);
    }
  };

  const roleLabel = role ? getRoleLabel(role) : null;

  return (
    <div
      style={{
        maxWidth: 520,
        margin: '0 auto',
        background: 'linear-gradient(to bottom right, rgba(37,99,235,0.04), rgba(249,250,251,1))',
        padding: '1.25rem',
        borderRadius: 16,
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
      }}
    >
      <h1 style={{ marginBottom: '0.75rem' }}>Create your account</h1>
      <p style={{ marginTop: 0, marginBottom: '1rem', color: '#374151' }}>
        Sign up with your email and password.
      </p>

      {roleLabel && (
        <div
          role="status"
          aria-live="polite"
          style={{
            background: '#ffffff',
            border: '1px solid rgba(0,0,0,0.06)',
            borderRadius: 12,
            padding: '0.75rem',
            marginBottom: '1rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          }}
        >
          You are signed in as: <strong>{roleLabel}</strong>
        </div>
      )}

      <form onSubmit={onSubmit} noValidate>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontWeight: 600 }}>Email</span>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!error && (!email || !isValidEmail(email))}
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                borderRadius: 10,
                border: '1px solid rgba(0,0,0,0.1)',
                background: '#fff',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)',
                outline: 'none',
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontWeight: 600 }}>Password</span>
            <input
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!error && password.length < 6}
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                borderRadius: 10,
                border: '1px solid rgba(0,0,0,0.1)',
                background: '#fff',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)',
                outline: 'none',
              }}
            />
          </label>

          {error && (
            <div role="alert" style={{ color: '#EF4444' }}>
              {error}
            </div>
          )}
          {message && (
            <div role="status" style={{ color: '#2563EB' }}>
              {message}
            </div>
          )}

          <button
            className="btn btn-primary"
            type="submit"
            disabled={busy}
            aria-busy={busy}
            style={{
              padding: '0.6rem 0.9rem',
              borderRadius: 10,
              border: 'none',
              background: '#2563EB',
              color: '#fff',
              fontWeight: 600,
              boxShadow: '0 6px 18px rgba(37,99,235,0.25)',
              cursor: busy ? 'not-allowed' : 'pointer',
            }}
          >
            {busy ? 'Signing up...' : 'Sign up'}
          </button>

          <div style={{ fontSize: 13, opacity: 0.9 }}>
            Already have an account? <Link to={ROUTES.LOGIN}>Sign in</Link>
          </div>
        </div>
      </form>

      {/* 
        TODO: Once roles backend/table exists, consider redirecting based on role after verification,
        or showing a richer onboarding flow here.
      */}
    </div>
  );
}

export default Signup;
