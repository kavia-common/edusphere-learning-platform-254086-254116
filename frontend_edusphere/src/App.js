import React from 'react';
import './App.css';
import { useUIStore } from './state/uiStore';
import { getLogger } from './shared/utils/logger';
import { usePageAnalytics } from './hooks/usePageAnalytics';
import { useFeatureFlag } from './shared/featureFlags/featureFlags';
import { useToast } from './components/feedback/useToast';
import { isSupabaseEnabled } from './config/env';
import { AppRoutes } from './routes';
import { Breadcrumbs } from './components/layout/Breadcrumbs';

// Keep logger
const logger = getLogger('App');

// PUBLIC_INTERFACE
function App() {
  /** Root application with routes and layout. */
  const theme = useUIStore(s => s.theme);
  const setTheme = useUIStore(s => s.setTheme);
  const experiments = useFeatureFlag('experiments');

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    logger.info('Theme applied', { theme });
  }, [theme]);

  // Notify about Supabase configuration issues without breaking preview
  const { warning } = useToast();
  React.useEffect(() => {
    try {
      if (!isSupabaseEnabled()) {
        warning('Limited functionality: Supabase not configured', 'Some features (auth, realtime, data) are disabled. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY.');
      }
    } catch {
      // ignore toast errors in test env
    }
  }, []);

  // Track page views on route transitions
  usePageAnalytics();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <>
      <Breadcrumbs />
      <AppRoutes onToggleTheme={toggleTheme} theme={theme} aboutProps={{ experiments }} />
    </>
  );
}

export default App;
