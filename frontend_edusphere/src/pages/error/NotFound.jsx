import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * Themed 404 Not Found page.
 */
export function NotFoundError() {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 56, lineHeight: '56px' }}>🧭</div>
      <h1 style={{ marginBottom: 6 }}>404 — Page not found</h1>
      <p style={{ opacity: 0.8 }}>The page you’re looking for doesn’t exist or was moved.</p>
      <div style={{ marginTop: 10 }}>
        <Link to="/" className="btn btn-primary">Go home</Link>
      </div>
    </div>
  );
}
