import React from 'react';
import { realtimeService } from '../../services/realtimeService';
import { usePresence } from '../../hooks/usePresence';
import { useFeatureFlag } from '../../shared/featureFlags/featureFlags';
import { useAuth } from '../../auth/AuthProvider';

/**
 * PUBLIC_INTERFACE
 * TypingIndicator broadcasts local typing events and displays "X is typing..." for others in the room.
 *
 * @param {{ roomId: string, inputSelector?: string, timeoutMs?: number }} props
 */
export function TypingIndicator({ roomId, inputSelector, timeoutMs = 2000 }) {
  const enabled = useFeatureFlag('realtime_collab', false);
  const { user } = useAuth();
  const { channelName, others } = usePresence(roomId);
  const [typingUsers, setTypingUsers] = React.useState({}); // id -> { name, until }

  React.useEffect(() => {
    if (!enabled || !channelName) return;
    const channel = realtimeService.getChannel(channelName);

    const handler = (payload) => {
      const { id, name } = payload || {};
      if (!id) return;
      const until = Date.now() + timeoutMs;
      setTypingUsers((prev) => ({ ...prev, [id]: { name: name || 'User', until } }));
    };

    channel.on('broadcast', { event: 'typing' }, ({ payload }) => handler(payload));
    if (channel.state !== 'joined' && channel.state !== 'joining') {
      channel.subscribe();
    }

    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers((prev) => {
        const next = { ...prev };
        for (const [k, v] of Object.entries(next)) {
          if (!v || v.until < now) delete next[k];
        }
        return next;
      });
    }, 500);

    return () => {
      try {
        clearInterval(interval);
        channel.unsubscribe();
      } catch {
        // ignore
      }
    };
  }, [enabled, channelName, timeoutMs]);

  React.useEffect(() => {
    if (!enabled) return;
    if (!inputSelector) return;

    const el = document.querySelector(inputSelector);
    if (!el) return;

    const onInput = () => {
      const name = user?.user_metadata?.full_name || user?.email || 'You';
      realtimeService.sendBroadcast(channelName, 'typing', { id: user?.id || 'anon', name });
    };

    el.addEventListener('input', onInput);
    return () => el.removeEventListener('input', onInput);
  }, [enabled, inputSelector, channelName, user?.id, user?.email, user?.user_metadata]);

  const active = Object.values(typingUsers);
  if (!enabled || active.length === 0) return null;

  const label = active.length === 1
    ? `${active[0].name} is typing…`
    : `${active[0].name} and ${active.length - 1} others are typing…`;

  return (
    <div aria-live="polite" style={{ fontSize: 12, opacity: 0.75, color: 'var(--color-primary)' }}>
      {label}
    </div>
  );
}
