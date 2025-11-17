import React from 'react';
import { useAuth } from '../auth/AuthProvider';
import { getLogger } from '../shared/utils/logger';

/**
 * PUBLIC_INTERFACE
 * Basic user profile page; placeholder for future expansion.
 */
export function Profile() {
  /** Shows current user info or prompts to sign in. */
  const { user } = useAuth();
  const logger = React.useMemo(() => getLogger('Profile'), []);
  React.useEffect(() => { logger.info('Profile mounted'); }, [logger]);

  if (!user) {
    return (
      <div>
        <h1>Your Profile</h1>
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }
  return (
    <div>
      <h1>Your Profile</h1>
      <div className="app-surface card" style={{ display: 'grid', gap: '0.5rem', maxWidth: 520 }}>
        <div><strong>Email:</strong> {user.email}</div>
        <div><strong>User ID:</strong> {user.id}</div>
        <div style={{ fontSize: 12, opacity: 0.7 }}><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</div>
      </div>
    </div>
  );
}
