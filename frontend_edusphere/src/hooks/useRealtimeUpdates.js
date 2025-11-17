import React from 'react';
import { realtimeService } from '../services/realtimeService';
import { getLogger } from '../shared/utils/logger';
import { useFeatureFlag } from '../shared/featureFlags/featureFlags';

/**
 * PUBLIC_INTERFACE
 * useRealtimeUpdates subscribes to Postgres changes for the specified table/filter and returns incoming payloads.
 *
 * @param {{ event?: 'INSERT'|'UPDATE'|'DELETE'|'*', schema?: string, table: string, filter?: string }} options
 * @returns {{ events: any[], lastEvent: any, clear: ()=>void }}
 */
export function useRealtimeUpdates(options) {
  const logger = React.useMemo(() => getLogger('useRealtimeUpdates'), []);
  const enabled = useFeatureFlag('realtime_collab', false);

  const [events, setEvents] = React.useState([]);
  const [lastEvent, setLastEvent] = React.useState(null);

  React.useEffect(() => {
    if (!enabled) return;
    if (!options?.table) return;

    const opts = {
      event: options.event || '*',
      schema: options.schema || 'public',
      table: options.table,
      filter: options.filter || undefined
    };

    const unsubscribe = realtimeService.onPostgresChanges(opts, (payload) => {
      setLastEvent(payload);
      setEvents((prev) => {
        const next = prev.concat(payload);
        // Avoid unbounded growth; keep last 100
        if (next.length > 100) return next.slice(-100);
        return next;
      });
    });

    logger.info('Subscribed to realtime updates', { table: opts.table, event: opts.event, schema: opts.schema, filter: opts.filter });

    return () => {
      try {
        unsubscribe?.();
      } catch (err) {
        logger.warn('Realtime unsubscribe failed', { error: String(err) });
      }
      setLastEvent(null);
    };
  }, [enabled, options?.event, options?.schema, options?.table, options?.filter, logger]);

  const clear = React.useCallback(() => setEvents([]), []);

  return { events, lastEvent, clear };
}
