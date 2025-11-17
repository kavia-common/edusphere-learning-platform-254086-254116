import React from 'react';
import { useLocation } from 'react-router-dom';
import { recordPageView, isAnalyticsEnabled } from '../services/analyticsService';
import { getLogger } from '../shared/utils/logger';

const logger = getLogger('usePageAnalytics');

// PUBLIC_INTERFACE
export function usePageAnalytics() {
  /** Hook that records a page_view event on route changes, respecting feature flags and sampling. */
  const location = useLocation();

  React.useEffect(() => {
    if (!isAnalyticsEnabled()) return;
    const path = location.pathname + (location.search || '');
    recordPageView(path).then((res) => {
      if (res?.skipped) {
        logger.debug('Page view skipped', { reason: res.reason });
      }
    }).catch((err) => {
      logger.debug('Page view error', { error: String(err) });
    });
  }, [location.key, location.pathname, location.search]);
}
