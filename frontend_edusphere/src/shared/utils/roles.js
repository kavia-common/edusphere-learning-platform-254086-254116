//
// Role utilities and helpers
//

/**
 * PUBLIC_INTERFACE
 * Role constants used across the app for RBAC checks.
 */
export const ROLES = Object.freeze({
  STUDENT: 'student',
  INSTRUCTOR: 'instructor',
  ADMIN: 'admin'
});

// PUBLIC_INTERFACE
export function hasRole(user, role) {
  /** Returns true if the given user metadata includes the specified role. */
  if (!user) return false;
  const meta = user.user_metadata || user.app_metadata || {};
  const roles = meta.roles || meta.role || meta.groups || [];
  if (Array.isArray(roles)) {
    return roles.includes(role);
  }
  if (typeof roles === 'string') {
    return roles === role;
  }
  return false;
}

// PUBLIC_INTERFACE
export function getPrimaryRole(user) {
  /** Returns the user's primary role string if available, otherwise null. */
  if (!user) return null;
  const meta = user.user_metadata || user.app_metadata || {};
  if (typeof meta.role === 'string') return meta.role;
  const roles = meta.roles;
  if (Array.isArray(roles) && roles.length > 0) return roles[0];
  return null;
}
