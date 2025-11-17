import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Panel to view/add notes for current lesson.
 */
export function NotesPanel({ notes = [], onAdd, disabled }) {
  /** Renders notes and an editor; onAdd(content) to save. */
  const [value, setValue] = React.useState('');

  const handleAdd = () => {
    if (!value.trim()) return;
    onAdd?.(value.trim());
    setValue('');
  };

  return (
    <div className="app-surface card" style={{ display: 'grid', gap: '0.5rem' }}>
      <h3 style={{ marginTop: 0 }}>Notes</h3>
      <div style={{ display: 'grid', gap: '0.5rem' }}>
        {notes.length === 0 && <p style={{ opacity: 0.7 }}>No notes yet.</p>}
        {notes.map((n) => (
          <div key={n.id} style={{ padding: '0.5rem', borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)' }}>
            <div style={{ whiteSpace: 'pre-wrap' }}>{n.content}</div>
            {n.updatedAt && <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>Updated {new Date(n.updatedAt).toLocaleString()}</div>}
          </div>
        ))}
      </div>
      <textarea
        rows={3}
        placeholder={disabled ? 'Sign in to add notes' : 'Write a note...'}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '0.6rem',
          borderRadius: 10,
          border: '1px solid rgba(37,99,235,0.18)',
          resize: 'vertical'
        }}
      />
      <button className="btn btn-primary" onClick={handleAdd} disabled={disabled || !value.trim()}>
        Add note
      </button>
    </div>
  );
}
