import React from 'react';
import { usePresence } from '../../hooks/usePresence';
import { useFeatureFlag } from '../../shared/featureFlags/featureFlags';

/**
 * PUBLIC_INTERFACE
 * PresenceAvatars renders small avatar bubbles for users present in a room.
 *
 * @param {{ roomId: string, showCount?: boolean }} props
 */
export function PresenceAvatars({ roomId, showCount = true }) {
  const flag = useFeatureFlag('realtime_collab', false);
  const { others } = usePresence(roomId);

  if (!flag) return null;

  const first = others.slice(0, 5);
  const extra = Math.max(0, others.length - first.length);

  return (
    <div aria-label="Live presence" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {first.map((p) => {
        const name = p.meta?.displayName || 'User';
        const url = p.meta?.avatarUrl || '';
        return (
          <div key={p.id} title={name} aria-label={name}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              overflow: 'hidden',
              border: '1px solid rgba(37,99,235,0.25)',
              background: 'rgba(37,99,235,0.08)',
              display: 'grid',
              placeItems: 'center',
            }}>
            {url ? (
              <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: 12, color: 'var(--color-primary)' }}>{name.slice(0, 1).toUpperCase()}</span>
            )}
          </div>
        );
      })}
      {extra > 0 && (
        <div aria-label={`${extra} more`} style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'rgba(37,99,235,0.14)',
          color: 'var(--color-primary)',
          fontSize: 12,
          display: 'grid',
          placeItems: 'center',
          border: '1px solid rgba(37,99,235,0.25)'
        }}>
          +{extra}
        </div>
      )}
      {showCount && (
        <div style={{ fontSize: 12, opacity: 0.75 }}>
          {others.length} online
        </div>
      )}
    </div>
  );
}
