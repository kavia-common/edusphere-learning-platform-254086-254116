import React from 'react';
import { realtimeService } from '../services/realtimeService';
import { getLogger } from '../shared/utils/logger';
import { useFeatureFlag } from '../shared/featureFlags/featureFlags';
import { useAuth } from '../auth/AuthProvider';

/**
 * PUBLIC_INTERFACE
 * usePresence handles joining a Supabase Realtime presence channel and syncing remote users.
 *
 * @param {string} roomId - Room identifier to scope presence (e.g., course or lesson)
 * @param {object} [meta] - Additional metadata for local presence state, merged with user basics
 * @returns {{
 *  others: Array<{ id: string, meta: any }>,
 *  update: (partial: object) => void,
 *  channelName: string
 * }}
 */
export function usePresence(roomId, meta = {}) {
  const logger = React.useMemo(() => getLogger('usePresence'), []);
  const collabEnabled = useFeatureFlag('realtime_collab', false);
  const { user } = useAuth();

  const [others, setOthers] = React.useState([]);
  const channelName = React.useMemo(() => `presence:room:${roomId || 'default'}`, [roomId]);

  React.useEffect(() => {
    if (!collabEnabled) return;
    if (!roomId) return;
    // Anonymous users can still appear with ephemeral IDs
    const uid = user?.id || `anon_${Math.random().toString(36).slice(2)}`;
    const presenceState = {
      id: uid,
      email: user?.email || null,
      displayName: user?.user_metadata?.full_name || user?.email || 'Guest',
      avatarUrl: user?.user_metadata?.avatar_url || null,
      ...meta
    };

    const handleSync = (state) => {
      // state is a map of key -> [{ metas }]
      const list = [];
      try {
        Object.keys(state || {}).forEach((key) => {
          const entries = state[key] || [];
          for (const e of entries) {
            const m = e?.metas?.[0] || e; // shape varies, guard defensively
            list.push({ id: key, meta: m });
          }
        });
      } catch (err) {
        logger.warn('Presence state parse failed', { error: String(err) });
      }
      // Exclude ourselves with the same presence id
      const filtered = list.filter((p) => p.meta?.id !== uid);
      setOthers(filtered);
    };

    const { update, unsubscribe } = realtimeService.createPresence(channelName, presenceState, handleSync);

    logger.info('Presence joined', { channelName, roomId });

    return () => {
      try {
        unsubscribe();
      } catch (err) {
        logger.warn('Presence cleanup failed', { error: String(err) });
      }
      setOthers([]);
    };
  }, [collabEnabled, roomId, user?.id, user?.email, user?.user_metadata, logger, channelName, meta]);

  const update = React.useCallback((partial) => {
    try {
      if (!collabEnabled) return;
      realtimeService.getChannel(channelName); // ensure exists
      // update is safe even if channel not joined yet; presence hook wires it
      realtimeService.createPresence(channelName, {}, () => {}).update(partial);
    } catch (err) {
      // We avoid re-creating presence repeatedly; the update above is best-effort.
    }
  }, [collabEnabled, channelName]);

  return { others, update, channelName };
}
