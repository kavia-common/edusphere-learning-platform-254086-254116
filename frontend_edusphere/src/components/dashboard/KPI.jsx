import React from 'react';

/**
 * PUBLIC_INTERFACE
 * KPI component displays a prominent metric with a label and optional icon.
 */
export function KPI({ label, value, icon, loading = false, accent = 'primary' }) {
  /** Renders a glassmorphism KPI card with skeleton while loading. */
  return (
    <div className="app-surface card" style={{ display: 'grid', gap: 6, minWidth: 160 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {icon ? <span aria-hidden="true">{icon}</span> : null}
        <div style={{ fontSize: 12, opacity: 0.75 }}>{label}</div>
      </div>
      {loading ? (
        <div style={{ height: 28, borderRadius: 8, background: 'rgba(37,99,235,0.12)', animation: 'pulse 1.2s infinite' }} />
      ) : (
        <div style={{ fontSize: 24, fontWeight: 700, color: accent === 'secondary' ? 'var(--color-secondary)' : 'var(--color-primary)' }}>
          {typeof value === 'number' ? value.toLocaleString() : (value || '—')}
        </div>
      )}
    </div>
  );
}
