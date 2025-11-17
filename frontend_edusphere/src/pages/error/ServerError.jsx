import React from 'react';

/**
 * PUBLIC_INTERFACE
 * ServerErrorFallback provides a branded 500-like error UI with retry.
 *
 * @param {{ errorId?: string, onRetry?: ()=>void }} props
 */
export function ServerErrorFallback({ errorId, onRetry }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 56, lineHeight: '56px' }}>🚧</div>
      <h1 style={{ marginBottom: 6 }}>Something went wrong</h1>
      <p style={{ opacity: 0.8 }}>
        We hit an unexpected error. Please try again in a moment.
      </p>
      {errorId ? (
        <p style={{ fontSize: 12, opacity: 0.7 }}>Error ID: {errorId}</p>
      ) : null}
      <div style={{ marginTop: 10 }}>
        <button className="btn btn-primary" onClick={onRetry}>Try again</button>
      </div>
    </div>
  );
}
