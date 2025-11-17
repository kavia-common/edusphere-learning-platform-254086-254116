import React from 'react';
import { getLogger } from '../../shared/utils/logger';
import { useFeatureFlag } from '../../shared/featureFlags/featureFlags';

const logger = getLogger('Charts');

/**
 * PUBLIC_INTERFACE
 * Sparkline renders a compact line chart using SVG from an array of numbers.
 */
export function Sparkline({ data = [], width = 160, height = 40, stroke = 'var(--color-primary)', strokeWidth = 2 }) {
  /** Minimal sparkline without external deps; handles empty data gracefully. */
  const values = Array.isArray(data) ? data.map((n) => Number(n) || 0) : [];
  if (!values.length) {
    return <svg width={width} height={height} aria-label="No data"></svg>;
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (width - 4) + 2;
    const y = height - 2 - ((v - min) / range) * (height - 4);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} role="img" aria-label="Sparkline">
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        points={points}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * PUBLIC_INTERFACE
 * KPIBlock shows a label, value and inline sparkline trend.
 */
export function KPIBlock({ label, value, trend = [] }) {
  /** Simple KPI with aggregate value and trend sparkline. */
  return (
    <div className="app-surface card" style={{ display: 'grid', gap: 6, minWidth: 160 }}>
      <div style={{ fontSize: 12, opacity: 0.75 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-primary)' }}>
        {typeof value === 'number' ? value.toLocaleString() : (value ?? '—')}
      </div>
      <Sparkline data={trend} />
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * TrendChart visualizes time series data with axes ticks. Intended for analytics dashboards.
 */
export function TrendChart({ series = [], width = 460, height = 160, color = 'var(--color-primary)' }) {
  /** Renders an SVG line chart with simple axes; if disabled via flag, renders null. */
  const enabled = useFeatureFlag('analytics_charts', true);
  const data = Array.isArray(series) ? series.map((n) => Number(n) || 0) : [];
  if (!enabled) return null;

  if (!data.length) {
    return <div className="app-surface card">No trend data</div>;
  }
  const padding = { left: 28, bottom: 18, right: 6, top: 6 };
  const w = width - padding.left - padding.right;
  const h = height - padding.top - padding.bottom;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const pathD = data.map((v, i) => {
    const x = padding.left + (i / (data.length - 1)) * w;
    const y = padding.top + (h - ((v - min) / range) * h);
    return `${i === 0 ? 'M' : 'L'}${x} ${y}`;
  }).join(' ');

  const ticks = 4;
  const yTicks = Array.from({ length: ticks + 1 }).map((_, i) => {
    const t = i / ticks;
    const value = Math.round((max - t * range) * 100) / 100;
    const y = padding.top + t * h;
    return { y, value };
  });

  return (
    <div className="app-surface card" style={{ overflow: 'hidden' }}>
      <svg width={width} height={height} role="img" aria-label="Trend chart">
        {/* Y axis ticks */}
        {yTicks.map((t, idx) => (
          <g key={idx}>
            <line x1={padding.left} y1={t.y} x2={width - padding.right} y2={t.y} stroke="rgba(37,99,235,0.15)" strokeWidth="1" />
            <text x={4} y={t.y + 4} fontSize="10" fill="currentColor">{t.value}</text>
          </g>
        ))}
        {/* Data path */}
        <path d={pathD} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}
