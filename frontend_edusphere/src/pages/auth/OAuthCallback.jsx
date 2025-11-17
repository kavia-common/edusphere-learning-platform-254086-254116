import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { getLogger } from '../../shared/utils/logger';

const logger = getLogger('OAuthCallback');

/**
 * PUBLIC_INTERFACE
 * Handles OAuth or magic link callbacks from Supabase and redirects to home.
 */
export function OAuthCallback() {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = React.useState('Finalizing sign-in...');

  React.useEffect(() => {
    let cancelled = false;

    async function finish() {
      try {
        // If password recovery flow, the session may be present and we should prompt to update password in a future step.
        // For now, we simply navigate to home.
        const token = search.get('access_token');
        const type = search.get('type');
        logger.info('Callback received', { hasToken: !!token, type });

        // Supabase JS v2 handles detecting session in URL automatically if detectSessionInUrl is true.
        // We can still call getSession to ensure context updates.
        await supabase.auth.getSession();
        if (!cancelled) {
          setMessage('Signed in. Redirecting...');
          setTimeout(() => navigate('/', { replace: true }), 800);
        }
      } catch (err) {
        logger.warn('Callback handling failed', { error: String(err) });
        if (!cancelled) setMessage('Could not complete sign-in. Please try again.');
      }
    }
    finish();

    return () => {
      cancelled = true;
    };
  }, [navigate, search]);

  return <div aria-live="polite">{message}</div>;
}
