import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Filter controls for catalog (category and level).
 */
export function Filters({ category, level, onChange }) {
  /** Calls onChange({category, level}) when filters update. */
  const handle = (key) => (e) => {
    onChange?.({ category, level, [key]: e.target.value });
  };
  return (
    <div className="app-surface card" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 12, opacity: 0.8 }}>Category</span>
        <select value={category} onChange={handle('category')} style={{ padding: '0.5rem', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)' }}>
          <option value="">All</option>
          <option value="Development">Development</option>
          <option value="Design">Design</option>
          <option value="Data">Data</option>
          <option value="Business">Business</option>
        </select>
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 12, opacity: 0.8 }}>Level</span>
        <select value={level} onChange={handle('level')} style={{ padding: '0.5rem', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)' }}>
          <option value="">All</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </label>
    </div>
  );
}
