/**
 * PUBLIC_INTERFACE
 * HealthCheck page pings REACT_APP_HEALTHCHECK_PATH if set (joined with API_BASE),
 * displays status, supports manual retry, and uses AbortController for timeout.
 */

import React from 'react';
import { getHealthcheckUrl } from '../../config/env';
import { httpClient } from '../../services/httpClient';

function StatusBadge({ healthy }) {
  const color = healthy ? 'rgba(16,185,129,0.14)' : 'rgba(239,68,68,0.14)';
  const border = healthy ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)';
  const icon = healthy ? '✅' : '⛔';
  const label = healthy ? 'Healthy' : 'Unhealthy';
  return (
    <span
      className="app-surface"
      style={{
        background: color,
        border: `1px solid ${border}`,
        borderRadius: 999,
        padding: '4px 10px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
      }}
      aria-label={`Health status: ${label}`}
    >
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </span>
  );
}

export function HealthCheck() {
  const [state, setState] = React.useState({ checking: false, error: '', healthy: false, status: 0, ts: null });
  const healthUrl = getHealthcheckUrl();

  const runCheck = React.useCallback(async () => {
    if (!healthUrl) {
      setState({ checking: false, error: '', healthy: true, status: 200, ts: new Date().toISOString() });
      return;
    }
    setState((s) => ({ ...s, checking: true, error: '' }));
    try {
      const res = await httpClient.get(healthUrl, { timeoutMs: 5000, retries: 1 });
      const healthy = res.ok && (res.status >= 200 && res.status < 300);
      setState({ checking: false, error: '', healthy, status: res.status, ts: new Date().toISOString() });
    } catch (err) {
      setState({
        checking: false,
        error: err?.error || 'Unable to reach health endpoint',
        healthy: false,
        status: err?.status || 0,
        ts: new Date().toISOString(),
      });
    }
  }, [healthUrl]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await runCheck();
    })();
    return () => { mounted = false; };
  }, [runCheck]);

  return (
    <div>
      <h1>System Health</h1>
      {!healthUrl && (
        <p style={{ opacity: 0.8 }}>
          No healthcheck path configured. Set REACT_APP_HEALTHCHECK_PATH to enable endpoint checks.
        </p>
      )}
      <div className="app-surface card" style={{ display: 'grid', gap: 8, maxWidth: 680 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 700 }}>Health endpoint</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{healthUrl || '(not configured)'}</div>
          </div>
          <StatusBadge healthy={state.healthy} />
        </div>

        <div style={{ fontSize: 12, opacity: 0.8 }}>
          Last check: {state.ts ? new Date(state.ts).toLocaleString() : '—'}
          {' · '}
          HTTP status: {state.status || '—'}
        </div>

        {state.error && (
          <div role="alert" style={{ color: 'var(--color-error)' }}>
            {state.error}
          </div>
        )}

        <div>
          <button className="btn btn-primary" onClick={runCheck} disabled={state.checking} aria-busy={state.checking}>
            {state.checking ? 'Checking…' : 'Run health check'}
          </button>
        </div>
      </div>
    </div>
  );
}
