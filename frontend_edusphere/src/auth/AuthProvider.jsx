import React from 'react';
import { supabase } from '../lib/supabaseClient';
import { getLogger } from '../shared/utils/logger';

const logger = getLogger('AuthProvider');

const AuthContext = React.createContext(null);

/**
 * PUBLIC_INTERFACE
 * AuthProvider provides current session and user along with auth helpers.
 * It listens to Supabase auth state changes and updates context accordingly.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = React.useState(null);
  const [initializing, setInitializing] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    // Get initial session
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        logger.error('getSession failed', { error: String(error) });
      }
      if (!mounted) return;
      setSession(data?.session ?? null);
      setInitializing(false);
    });

    // Subscribe to changes
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      logger.info('Auth state change', { event });
      setSession(s);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const value = React.useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      initializing
    }),
    [session, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook to access session, user and initializing status from AuthProvider. */
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
