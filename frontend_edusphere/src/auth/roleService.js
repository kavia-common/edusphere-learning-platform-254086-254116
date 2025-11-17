import { supabase } from '../lib/supabaseClient';
import { getLogger } from '../shared/utils/logger';
import { ROLES } from '../shared/utils/roles';

const logger = getLogger('roleService');

/**
 * PUBLIC_INTERFACE
 * getCurrentUserRole resolves the authenticated user's role using multiple strategies.
 *
 * Strategy order:
 *  1) user.user_metadata.role (string) or user.user_metadata.roles (array) if present
 *  2) public profiles table column 'role' (if available)
 *  3) default fallback 'student'
 *
 * This function is resilient: it will not throw if profiles table/column doesn't exist.
 * A TODO is included for wiring to the actual roles data model once available.
 *
 * @returns {Promise<'student'|'instructor'|'admin'>}
 */
export async function getCurrentUserRole() {
  try {
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr) {
      logger.warn('getUser error during role resolution', { error: String(userErr) });
      return ROLES.STUDENT;
    }
    const user = userData?.user;
    if (!user) {
      return ROLES.STUDENT;
    }

    // 1) Check user metadata
    const meta = user.user_metadata || user.app_metadata || {};
    const metaRole = typeof meta.role === 'string' ? meta.role : null;
    const metaRoles = Array.isArray(meta.roles) ? meta.roles : null;

    if (metaRole && [ROLES.STUDENT, ROLES.INSTRUCTOR, ROLES.ADMIN].includes(metaRole)) {
      return metaRole;
    }
    if (metaRoles && metaRoles.length > 0) {
      const candidate = metaRoles[0];
      if ([ROLES.STUDENT, ROLES.INSTRUCTOR, ROLES.ADMIN].includes(candidate)) {
        return candidate;
      }
    }

    // 2) Try reading from a public profiles table if present
    //    Non-breaking: wrapped in try/catch and returns default if fails or missing.
    try {
      // Attempt common schema: public.profiles with role column
      const { data: profiles, error: profErr } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .limit(1);

      if (!profErr && Array.isArray(profiles) && profiles.length > 0) {
        const dbRole = profiles[0]?.role;
        if (typeof dbRole === 'string' && [ROLES.STUDENT, ROLES.INSTRUCTOR, ROLES.ADMIN].includes(dbRole)) {
          return dbRole;
        }
      } else if (profErr) {
        // Likely table/column not present or RLS denial; log at info to avoid noise
        logger.info('profiles role fetch skipped/failure', { error: String(profErr) });
      }
    } catch (err) {
      logger.info('profiles role fetch exception (likely table/column missing)', { error: String(err) });
    }

    // 3) Default fallback
    return ROLES.STUDENT;
  } catch (e) {
    logger.warn('getCurrentUserRole unexpected failure', { error: String(e) });
    return ROLES.STUDENT;
  }
}

/**
 * PUBLIC_INTERFACE
 * getRoleLabel builds a friendly label for the current user role.
 * @param {'student'|'instructor'|'admin'|string} role
 * @returns {string}
 */
export function getRoleLabel(role) {
  if (role === ROLES.ADMIN) return 'admin';
  if (role === ROLES.INSTRUCTOR) return 'instructor';
  return 'student';
}

/*
  TODO (Roles Data Model Wiring):
  - Replace the profiles query with the actual roles data model when available.
  - Consider a dedicated table (e.g., user_roles) with RLS policies and a view for minimal exposure.
  - Optionally cache the role in user_metadata upon login/signup for faster reads.
*/
