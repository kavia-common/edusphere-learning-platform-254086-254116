import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * AccessDenied page for 403-level errors.
 */
export function AccessDenied() {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 56, lineHeight: '56px' }}>🔒</div>
      <h1 style={{ marginBottom: 6 }}>Access denied</h1>
      <p style={{ opacity: 0.8 }}>You don’t have permission to view this page.</p>
      <div style={{ marginTop: 10 }}>
        <Link to="/login" className="btn btn-primary">Sign in</Link>
      </div>
    </div>
  );
}
