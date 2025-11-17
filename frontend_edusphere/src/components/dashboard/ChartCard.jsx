import React from 'react';

/**
 * PUBLIC_INTERFACE
 * ChartCard renders a simple comparative bar chart from a set of values or dataset entries.
 */
export function ChartCard({ title, data = [], valueKey = 'value', labelKey = 'label', loading = false, maxBars = 7 }) {
  /** Minimal bar visualization for dashboards. */
  let items = [];
  if (Array.isArray(data) && data.length && typeof data[0] === 'number') {
    items = data.map((v, idx) => ({ [labelKey]: `#${idx + 1}`, [valueKey]: v }));
  } else {
    items = (data || []);
  }
  const values = items.map((d) => Number(d[valueKey]) || 0).slice(0, maxBars);
  const max = Math.max(1, ...values);

  return (
    <div className="app-surface card">
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h3 style={{ marginTop: 0 }}>{title}</h3>
      </div>
      {loading ? (
        <div style={{ height: 140, borderRadius: 10, background: 'rgba(37,99,235,0.08)', animation: 'pulse 1.2s infinite' }} />
      ) : (
        <div style={{ display: 'flex', alignItems: 'end', gap: 8, height: 160 }}>
          {values.length === 0 && <div style={{ opacity: 0.7 }}>No data</div>}
          {values.map((v, i) => (
            <div key={i} style={{ flex: 1, minWidth: 8 }}>
              <div
                style={{
                  height: `${Math.round((v / max) * 100)}%`,
                  background: 'linear-gradient(180deg, #60A5FA, #2563EB)',
                  borderRadius: 8,
                  boxShadow: '0 8px 20px rgba(37,99,235,0.18)'
                }}
                aria-label={`${items[i]?.[labelKey] ?? ''}: ${v}`}
                role="img"
              />
              <div style={{ fontSize: 11, textAlign: 'center', marginTop: 4, opacity: 0.75 }}>
                {String(items[i]?.[labelKey] ?? '')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
