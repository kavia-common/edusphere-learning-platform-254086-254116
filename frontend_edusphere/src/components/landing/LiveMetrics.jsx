import React from 'react';
import { getLogger } from '../../shared/utils/logger';

/**
 * PUBLIC_INTERFACE
 * MetricCard shows a label, animated value, and optional delta indicator.
 */
export function MetricCard({ label, value = 0, prefix = '', suffix = '', delta = 0, icon = null }) {
  return (
    <div className="metric-card app-surface" role="status" aria-live="polite">
      <div className="metric-top">
        <div className="metric-icon" aria-hidden="true">{icon}</div>
        <div className="metric-label">{label}</div>
      </div>
      <div className="metric-value">
        {prefix}{value.toLocaleString()}{suffix}
      </div>
      <div className={`metric-delta ${delta >= 0 ? 'up' : 'down'}`}>
        {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}%
      </div>
      <style>{`
        .metric-card {
          padding: 1rem;
          border-radius: 14px;
          border: 1px solid rgba(37,99,235,0.12);
          box-shadow: 0 10px 30px rgba(37,99,235,0.08);
          background: linear-gradient(180deg, rgba(255,255,255,0.7), rgba(255,255,255,0.45));
          backdrop-filter: blur(10px);
          transition: transform .2s ease, box-shadow .2s ease;
        }
        [data-theme="dark"] .metric-card {
          background: linear-gradient(180deg, rgba(16,24,40,0.65), rgba(16,24,40,0.4));
          border-color: rgba(59,130,246,0.2);
        }
        .metric-card:hover { transform: translateY(-2px); box-shadow: 0 14px 40px rgba(37,99,235,0.16); }
        .metric-top { display: flex; align-items: center; gap: .5rem; }
        .metric-icon { width: 28px; height: 28px; display: grid; place-items: center; border-radius: 8px; background: rgba(37,99,235,0.12); }
        .metric-label { font-size: 12px; opacity: .8; }
        .metric-value { font-size: 28px; font-weight: 800; color: var(--color-primary); margin-top: .25rem; }
        .metric-delta { font-size: 12px; margin-top: .25rem; opacity: .8; }
        .metric-delta.up { color: #059669; } /* emerald-600 */
        .metric-delta.down { color: var(--color-error); }
      `}</style>
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * LiveMetrics renders a grid of animated counters. Accepts optional onFetch callback
 * to load live metrics from an API/Supabase. Falls back to sample incremental animation.
 *
 * TODO: Replace sample update loop with Supabase/WS updates:
 * - Use useRealtimeUpdates({ table: 'metrics' }) and aggregate values
 * - Or poll via analyticsService.getLandingMetrics()
 */
export function LiveMetrics({ initial = null, onFetch = null }) {
  const logger = getLogger('LiveMetrics');
  const [metrics, setMetrics] = React.useState(() => initial || {
    learners: 12450,
    courses: 320,
    liveSessions: 58,
    completionRate: 87,
  });

  // Incremental animation: smooth numbers toward target
  React.useEffect(() => {
    let mounted = true;
    const tick = () => {
      setMetrics(m => {
        const target = {
          learners: Math.max(m.learners, 12450) + Math.round(Math.random() * 3),
          courses: Math.max(m.courses, 320) + (Math.random() > 0.98 ? 1 : 0),
          liveSessions: Math.max(m.liveSessions, 58) + (Math.random() > 0.9 ? 1 : 0),
          completionRate: Math.min(99, Math.max(50, m.completionRate + (Math.random() - 0.48))),
        };
        return { ...target };
      });
    };
    const id = setInterval(tick, 1200);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  // Optional live fetch hook
  React.useEffect(() => {
    let cancelled = false;
    const fetchNow = async () => {
      if (!onFetch) return;
      try {
        const data = await onFetch();
        if (!cancelled && data) setMetrics(prev => ({ ...prev, ...data }));
      } catch (e) {
        logger.info('LiveMetrics fetch fallback', { error: String(e) });
      }
    };
    fetchNow();
    const refresh = setInterval(fetchNow, 15000);
    return () => { cancelled = true; clearInterval(refresh); };
  }, [onFetch, logger]);

  const items = [
    { key: 'learners', label: 'Active Learners', icon: '👩‍🎓' },
    { key: 'courses', label: 'Courses', icon: '📚' },
    { key: 'liveSessions', label: 'Live Sessions', icon: '🛰️' },
    { key: 'completionRate', label: 'Avg. Completion', suffix: '%', icon: '✅' },
  ];

  return (
    <div className="metrics-grid">
      {items.map(item => (
        <MetricCard
          key={item.key}
          label={item.label}
          value={Math.round(metrics[item.key] || 0)}
          suffix={item.suffix || ''}
          icon={<span aria-hidden="true">{item.icon}</span>}
          delta={(Math.random() * 4 - 1).toFixed(1)}
        />
      ))}
      <style>{`
        .metrics-grid {
          display: grid;
          gap: .75rem;
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
        @media (max-width: 1024px) { .metrics-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 560px) { .metrics-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}

export default LiveMetrics;
