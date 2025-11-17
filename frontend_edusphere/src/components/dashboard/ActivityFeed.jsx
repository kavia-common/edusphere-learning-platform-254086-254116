import React from 'react';

/**
 * PUBLIC_INTERFACE
 * ActivityFeed lists recent activity items with timestamps.
 */
export function ActivityFeed({ items = [], loading = false }) {
  /** Displays a vertical list of activity events. */
  return (
    <div className="app-surface card">
      <h3 style={{ marginTop: 0 }}>Recent Activity</h3>
      {loading ? (
        <div style={{ display: 'grid', gap: 8 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: 42, borderRadius: 8, background: 'rgba(37,99,235,0.08)', animation: 'pulse 1.2s infinite' }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p style={{ opacity: 0.7 }}>No recent activity.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
          {items.map((it) => (
            <li key={it.id} className="app-surface" style={{ borderRadius: 10, padding: '0.5rem 0.75rem', border: '1px solid rgba(37,99,235,0.12)' }}>
              <div style={{ fontWeight: 600 }}>{it.title}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{it.description}</div>
              {it.time && <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>{new Date(it.time).toLocaleString()}</div>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
