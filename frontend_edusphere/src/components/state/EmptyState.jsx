import React from 'react';

/**
 * PUBLIC_INTERFACE
 * EmptyState shows a friendly, themed message with optional action.
 */
export function EmptyState({ title = 'Nothing here yet', description = '', action }) {
  return (
    <div
      className="app-surface card"
      style={{
        textAlign: 'center',
        border: '1px dashed rgba(37,99,235,0.25)',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(249,250,251,0.9))'
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 6 }}>📭</div>
      <h3 style={{ margin: 0 }}>{title}</h3>
      {description ? <p style={{ opacity: 0.8 }}>{description}</p> : null}
      {action ? <div style={{ marginTop: 8 }}>{action}</div> : null}
    </div>
  );
}
