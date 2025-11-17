import React from 'react';
import { useUIStore } from '../state/uiStore';
import { getLogger } from '../shared/utils/logger';

/**
 * ThemeProvider syncs the active UI theme to the document root.
 * It reads and persists preference via Zustand store.
 */
export function ThemeProvider({ children }) {
  const logger = React.useMemo(() => getLogger('ThemeProvider'), []);
  const theme = useUIStore(s => s.theme);
  const initialize = useUIStore(s => s.initializeTheme);

  React.useEffect(() => {
    initialize(); // sets theme from prefers-color-scheme or persisted value
  }, [initialize]);

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    logger.debug('Applied theme', { theme });
  }, [theme, logger]);

  return <>{children}</>;
}
