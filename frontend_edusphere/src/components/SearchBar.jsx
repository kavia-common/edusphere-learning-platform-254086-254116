import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Search input with Ocean Professional styling.
 */
export function SearchBar({ value, onChange, placeholder = 'Search courses...' }) {
  /** Controlled input for search queries. */
  return (
    <div className="app-surface card" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <span role="img" aria-hidden="true">🔎</span>
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        style={{
          flex: 1,
          padding: '0.6rem 0.75rem',
          borderRadius: 10,
          border: '1px solid rgba(37,99,235,0.18)',
          background: 'rgba(255,255,255,0.8)',
          outline: 'none'
        }}
      />
    </div>
  );
}
