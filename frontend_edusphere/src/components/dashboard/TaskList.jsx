import React from 'react';

/**
 * PUBLIC_INTERFACE
 * TaskList renders tasks with completion toggle. Interaction is local state by default.
 */
export function TaskList({ tasks = [], loading = false, onToggle }) {
  /** Checklist style panel. */
  const [local, setLocal] = React.useState(tasks);
  React.useEffect(() => setLocal(tasks), [tasks]);

  const toggle = (id) => {
    const updated = local.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    setLocal(updated);
    onToggle?.(id, updated.find((t) => t.id === id)?.done);
  };

  return (
    <div className="app-surface card">
      <h3 style={{ marginTop: 0 }}>Tasks</h3>
      {loading ? (
        <div style={{ display: 'grid', gap: 8 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: 38, borderRadius: 8, background: 'rgba(37,99,235,0.08)', animation: 'pulse 1.2s infinite' }} />
          ))}
        </div>
      ) : local.length === 0 ? (
        <p style={{ opacity: 0.7 }}>No tasks. Enjoy your day!</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }}>
          {local.map((t) => (
            <li key={t.id} className="app-surface" style={{ display: 'flex', gap: 8, alignItems: 'center', padding: 8, borderRadius: 10, border: '1px solid rgba(37,99,235,0.12)' }}>
              <input
                type="checkbox"
                checked={!!t.done}
                onChange={() => toggle(t.id)}
                aria-label={`Mark ${t.title} ${t.done ? 'incomplete' : 'complete'}`}
              />
              <div style={{ flex: 1 }}>
                <div style={{ textDecoration: t.done ? 'line-through' : 'none' }}>{t.title}</div>
                {t.dueAt && <div style={{ fontSize: 11, opacity: 0.7 }}>Due {new Date(t.dueAt).toLocaleDateString()}</div>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
