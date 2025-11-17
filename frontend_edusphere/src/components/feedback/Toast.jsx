import React from 'react';
import { getLogger } from '../../shared/utils/logger';

const logger = getLogger('Toast');

/**
 * PUBLIC_INTERFACE
 * ToastProvider renders a portal-like region with transient toasts and exposes context to push toasts.
 *
 * Usage:
 *  <ToastProvider>
 *    <App />
 *  </ToastProvider>
 *
 * Use the hook useToast() from ./useToast to trigger:
 *   const { notify } = useToast();
 *   notify({ title: 'Saved', description: 'Changes saved', type: 'success' });
 */
export function ToastProvider({ children, max = 5, duration = 4000 }) {
  const [toasts, setToasts] = React.useState([]);

  const remove = React.useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = React.useCallback(
    ({ title, description = '', type = 'info', dismissible = true, ttl = duration }) => {
      const id = Math.random().toString(36).slice(2);
      const item = { id, title, description, type, dismissible, createdAt: Date.now(), ttl };
      setToasts((prev) => {
        const next = prev.concat(item);
        if (next.length > max) next.shift();
        return next;
      });
      if (ttl > 0) {
        setTimeout(() => remove(id), ttl);
      }
      logger.debug('Toast notified', { type, title });
      return id;
    },
    [duration, max, remove]
  );

  const contextValue = React.useMemo(() => ({ notify, remove }), [notify, remove]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          zIndex: 1000,
          display: 'grid',
          gap: 8,
          maxWidth: 'min(420px, 90vw)'
        }}
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const ToastContext = React.createContext(null);

/**
 * PUBLIC_INTERFACE
 * Internal component: visual for a single toast.
 */
function ToastItem({ toast, onClose }) {
  const colors = {
    info: { bg: 'rgba(37,99,235,0.12)', border: 'rgba(37,99,235,0.25)', icon: 'ℹ️' },
    success: { bg: 'rgba(16,185,129,0.14)', border: 'rgba(16,185,129,0.3)', icon: '✅' },
    error: { bg: 'rgba(239,68,68,0.14)', border: 'rgba(239,68,68,0.3)', icon: '⛔' },
    warning: { bg: 'rgba(245,158,11,0.14)', border: 'rgba(245,158,11,0.3)', icon: '⚠️' }
  };
  const c = colors[toast.type] || colors.info;

  return (
    <div
      role="status"
      className="app-surface"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        boxShadow: 'var(--shadow-md)',
        padding: '0.75rem',
        borderRadius: 12,
        backdropFilter: 'blur(8px)',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: 8,
        alignItems: 'start'
      }}
    >
      <div aria-hidden="true" style={{ fontSize: 18, lineHeight: '18px' }}>{c.icon}</div>
      <div>
        <div style={{ fontWeight: 700, marginBottom: 2 }}>{toast.title}</div>
        {toast.description ? (
          <div style={{ fontSize: 13, opacity: 0.85 }}>{toast.description}</div>
        ) : null}
      </div>
      {toast.dismissible && (
        <button
          aria-label="Dismiss notification"
          className="btn btn-ghost"
          onClick={onClose}
          style={{ padding: '0.25rem 0.5rem' }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

/**
 * PUBLIC_INTERFACE
 * Access the toast context. Prefer using useToast from './useToast' which wraps this.
 */
export function useToastContext() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
