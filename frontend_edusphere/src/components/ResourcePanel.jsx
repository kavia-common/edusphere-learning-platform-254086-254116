import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Panel displaying resources for a lesson (links/files).
 */
export function ResourcePanel({ resources = [] }) {
  /** Renders a list of resources or empty state. */
  return (
    <div className="app-surface card">
      <h3 style={{ marginTop: 0 }}>Resources</h3>
      {!resources.length && <p style={{ opacity: 0.7 }}>No resources available.</p>}
      <ul style={{ paddingLeft: 18, margin: 0 }}>
        {resources.map((r, idx) => {
          const label = r?.label || r?.name || `Resource ${idx + 1}`;
          const url = r?.url || '#';
          return (
            <li key={idx} style={{ marginBottom: 6 }}>
              <a href={url} target="_blank" rel="noreferrer">{label}</a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
