import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

/**
 * PUBLIC_INTERFACE
 * Protects routes by requiring an authenticated session.
 * While initializing, renders a minimal loader to avoid flicker.
 */
export function ProtectedRoute({ children }) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <div aria-busy="true" aria-live="polite">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
