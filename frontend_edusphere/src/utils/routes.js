//
// Route path constants and helpers
//

// PUBLIC_INTERFACE
export const ROUTES = Object.freeze({
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  VERIFY_EMAIL: '/verify',
  OAUTH_CALLBACK: '/auth/callback',
  CATALOG: '/catalog',
  COURSE_DETAIL: '/course/:id',
  COURSE_PLAYER: '/player/:id',
  DASHBOARD: '/dashboard',
  DASH_STUDENT: '/dashboard/student',
  DASH_INSTRUCTOR: '/dashboard/instructor',
  DASH_ADMIN: '/dashboard/admin',
  PROFILE: '/profile',
  HEALTH: '/health',
  NOT_FOUND: '*',
});

// PUBLIC_INTERFACE
export function buildCourseDetailPath(id) {
  /** Returns a concrete Course Detail route for the given course id. */
  return `/course/${encodeURIComponent(id)}`;
}

// PUBLIC_INTERFACE
export function buildCoursePlayerPath(id) {
  /** Returns a concrete Course Player route for the given course id. */
  return `/player/${encodeURIComponent(id)}`;
}
