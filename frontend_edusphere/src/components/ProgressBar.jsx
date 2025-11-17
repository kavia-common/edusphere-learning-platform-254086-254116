import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Simple progress bar component.
 */
export function ProgressBar({ percent = 0 }) {
  /** Renders a rounded progress bar based on percent 0-100. */
  const p = Math.max(0, Math.min(100, Number(percent) || 0));
  return (
    <div className="app-surface card" style={{ padding: '0.75rem' }}>
      <div style={{
        background: 'rgba(37,99,235,0.15)',
        borderRadius: 999,
        height: 10,
        overflow: 'hidden',
        border: '1px solid rgba(37,99,235,0.2)'
      }}>
        <div style={{
          width: `${p}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #2563EB, #60A5FA)',
          boxShadow: '0 6px 16px rgba(37,99,235,0.25)'
        }} />
      </div>
      <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>{p}% complete</div>
    </div>
  );
}
