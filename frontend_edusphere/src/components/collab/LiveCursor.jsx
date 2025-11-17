import React from 'react';
import { realtimeService } from '../../services/realtimeService';
import { usePresence } from '../../hooks/usePresence';
import { useFeatureFlag } from '../../shared/featureFlags/featureFlags';
import { useAuth } from '../../auth/AuthProvider';

/**
 * PUBLIC_INTERFACE
 * LiveCursor shows other users' cursors in a container and broadcasts local cursor position.
 *
 * @param {{ roomId: string, containerRef?: React.RefObject<HTMLElement> }} props
 */
export function LiveCursor({ roomId, containerRef }) {
  const enabled = useFeatureFlag('realtime_collab', false);
  const { channelName, others } = usePresence(roomId);
  const { user } = useAuth();
  const [positions, setPositions] = React.useState({}); // id -> { x, y, name, ts }

  React.useEffect(() => {
    if (!enabled || !channelName) return;
    const channel = realtimeService.getChannel(channelName);

    const handler = (payload) => {
      const { id, name, x, y, ts } = payload || {};
      if (!id || typeof x !== 'number' || typeof y !== 'number') return;
      setPositions((prev) => ({ ...prev, [id]: { x, y, name, ts } }));
    };

    channel.on('broadcast', { event: 'cursor' }, ({ payload }) => handler(payload));
    if (channel.state !== 'joined' && channel.state !== 'joining') {
      channel.subscribe();
    }

    const cleanup = setInterval(() => {
      const now = Date.now();
      setPositions((prev) => {
        const next = { ...prev };
        for (const [k, v] of Object.entries(next)) {
          if (!v || (now - (v.ts || now)) > 4000) delete next[k];
        }
        return next;
      });
    }, 1000);

    return () => {
      try {
        clearInterval(cleanup);
        channel.unsubscribe();
      } catch {
        // ignore
      }
    };
  }, [enabled, channelName]);

  React.useEffect(() => {
    if (!enabled) return;
    const el = containerRef?.current || document.body;

    // throttle to about every 60ms
    let last = 0;
    const onMove = (e) => {
      const now = Date.now();
      if (now - last < 60) return;
      last = now;

      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const name = user?.user_metadata?.full_name || user?.email || 'You';
      realtimeService.sendBroadcast(channelName, 'cursor', {
        id: user?.id || 'anon',
        name,
        x: Math.max(0, Math.min(rect.width, x)),
        y: Math.max(0, Math.min(rect.height, y)),
        ts: now
      });
    };

    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, [enabled, channelName, containerRef, user?.id, user?.email, user?.user_metadata]);

  if (!enabled) return null;

  // Render other users' cursors within container
  const container = containerRef?.current;
  const width = container?.clientWidth || 0;
  const height = container?.clientHeight || 0;

  return (
    <div aria-hidden="true">
      {others.map((o) => {
        const pos = positions[o.meta?.id];
        if (!pos) return null;
        const x = Math.max(0, Math.min(width || Infinity, pos.x));
        const y = Math.max(0, Math.min(height || Infinity, pos.y));
        return (
          <div key={o.meta?.id}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--color-primary)',
              boxShadow: '0 0 0 2px rgba(37,99,235,0.25)'
            }} />
            <span style={{
              fontSize: 11,
              background: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(37,99,235,0.25)',
              borderRadius: 6,
              padding: '2px 6px'
            }}>
              {o.meta?.displayName || pos.name || 'User'}
            </span>
          </div>
        );
      })}
    </div>
  );
}
