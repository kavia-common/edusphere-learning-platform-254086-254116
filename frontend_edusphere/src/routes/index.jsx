import React from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '../layout/Layout';
import { Home } from '../pages/Home';
import { About } from '../pages/About';
import { NotFound } from '../pages/NotFound';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { VerifyEmail } from '../pages/auth/VerifyEmail';
import { OAuthCallback } from '../pages/auth/OAuthCallback';
import { Catalog } from '../pages/Catalog';
import { CourseDetail } from '../pages/CourseDetail';
import { CoursePlayer } from '../pages/CoursePlayer';
import { Profile } from '../pages/Profile';
import { StudentDashboard } from '../pages/StudentDashboard';
import { InstructorDashboard } from '../pages/InstructorDashboard';
import { AdminDashboard } from '../pages/AdminDashboard';
import { HealthCheck } from '../pages/health/HealthCheck';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { useAuth } from '../auth/AuthProvider';
import { AccessDenied } from '../pages/error/AccessDenied';
import { ROLES, getPrimaryRole, hasRole } from '../shared/utils/roles';
import { ROUTES } from '../utils/routes';

/**
 * PUBLIC_INTERFACE
 * RoleProtectedRoute wraps ProtectedRoute and ensures the user has one of the required roles.
 */
export function RoleProtectedRoute({ children, roles }) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <div aria-busy="true" aria-live="polite">Loading...</div>;
  }
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }
  const ok = roles?.some(r => hasRole(user, r));
  if (!ok) {
    return <AccessDenied />;
  }
  return children;
}

/**
 * PUBLIC_INTERFACE
 * DashboardRoleRedirect decides which dashboard route to send the user to based on role.
 */
export function DashboardRoleRedirect() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = getPrimaryRole(user) || ROLES.STUDENT;

  React.useEffect(() => {
    if (role === ROLES.ADMIN) navigate(ROUTES.DASH_ADMIN, { replace: true });
    else if (role === ROLES.INSTRUCTOR) navigate(ROUTES.DASH_INSTRUCTOR, { replace: true });
    else navigate(ROUTES.DASH_STUDENT, { replace: true });
  }, [role, navigate]);

  return <div aria-busy="true">Loading dashboard...</div>;
}

/**
 * PUBLIC_INTERFACE
 * AppRoutes renders the route tree inside the shared Layout shell.
 */
export function AppRoutes({ onToggleTheme, theme, aboutProps }) {
  return (
    <div className="App">
      <Layout onToggleTheme={onToggleTheme} theme={theme}>
        <Routes>
          {/* Public */}
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path="/about" element={<About {...aboutProps} />} />
          <Route path={ROUTES.HEALTH} element={<HealthCheck />} />
          <Route path={ROUTES.CATALOG} element={<Catalog />} />
          <Route path={ROUTES.COURSE_DETAIL} element={<CourseDetail />} />
          <Route path={ROUTES.COURSE_PLAYER} element={<CoursePlayer />} />

          {/* Auth */}
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.REGISTER} element={<Register />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
          <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmail />} />
          <Route path={ROUTES.OAUTH_CALLBACK} element={<OAuthCallback />} />

          {/* Dashboards - top-level redirect */}
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <ProtectedRoute>
                <DashboardRoleRedirect />
              </ProtectedRoute>
            }
          />
          {/* Student */}
          <Route
            path={ROUTES.DASH_STUDENT}
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          {/* Instructor */}
          <Route
            path={ROUTES.DASH_INSTRUCTOR}
            element={
              <RoleProtectedRoute roles={[ROLES.INSTRUCTOR, ROLES.ADMIN]}>
                <InstructorDashboard />
              </RoleProtectedRoute>
            }
          />
          {/* Admin */}
          <Route
            path={ROUTES.DASH_ADMIN}
            element={
              <RoleProtectedRoute roles={[ROLES.ADMIN]}>
                <AdminDashboard />
              </RoleProtectedRoute>
            }
          />

          {/* Profile */}
          <Route
            path={ROUTES.PROFILE}
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
        </Routes>
      </Layout>
    </div>
  );
}
