import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Skeleton renders animated placeholder blocks.
 *
 * @param {object} props
 * @param {number} props.lines - number of lines to render
 * @param {string|number} props.height - height for each line
 */
export function Skeleton({ lines = 3, height = 16, radius = 10 }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          style={{
            height,
            borderRadius: radius,
            background: 'rgba(37,99,235,0.12)',
            animation: 'pulse 1.2s infinite'
          }}
        />
      ))}
    </div>
  );
}
