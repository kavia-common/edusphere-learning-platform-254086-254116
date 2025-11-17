import React from 'react';
import './App.css';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from './layout/Layout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { NotFound } from './pages/NotFound';
import { useUIStore } from './state/uiStore';
import { getLogger } from './shared/utils/logger';
import { usePageAnalytics } from './hooks/usePageAnalytics';
import { useFeatureFlag } from './shared/featureFlags/featureFlags';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { VerifyEmail } from './pages/auth/VerifyEmail';
import { OAuthCallback } from './pages/auth/OAuthCallback';
import { ProtectedRoute } from './auth/ProtectedRoute';

// New pages
import { Catalog } from './pages/Catalog';
import { CourseDetail } from './pages/CourseDetail';
import { CoursePlayer } from './pages/CoursePlayer';
import { Profile } from './pages/Profile';

// Dashboards
import { StudentDashboard } from './pages/StudentDashboard';
import { InstructorDashboard } from './pages/InstructorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { useAuth } from './auth/AuthProvider';
import { getPrimaryRole, ROLES } from './shared/utils/roles';

const logger = getLogger('App');

// PUBLIC_INTERFACE
function App() {
  /** Root application with routes and layout. */
  const theme = useUIStore(s => s.theme);
  const setTheme = useUIStore(s => s.setTheme);
  const experiments = useFeatureFlag('experiments');
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    logger.info('Theme applied', { theme });
  }, [theme]);

  // Track page views on route transitions
  usePageAnalytics();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // route helper for /dashboard -> role-based dashboards
  const DashboardRouter = (
    <ProtectedRoute>
      <RoleDashboardRedirect />
    </ProtectedRoute>
  );

  function RoleDashboardRedirect() {
    /** Decides which dashboard to render based on primary role; defaults to student. */
    const role = getPrimaryRole(user) || ROLES.STUDENT;
    React.useEffect(() => {
      if (role === ROLES.ADMIN) navigate('/dash/admin', { replace: true });
      else if (role === ROLES.INSTRUCTOR) navigate('/dash/instructor', { replace: true });
      else navigate('/dash/student', { replace: true });
    }, [role]);
    return <div aria-busy="true">Loading dashboard...</div>;
  }

  return (
    <div className="App">
      <Layout onToggleTheme={toggleTheme} theme={theme}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/courses/:id/learn" element={<CoursePlayer />} />

          <Route path="/about" element={<About experiments={experiments} />} />
          <Route path="/health" element={<Navigate to="/" replace />} />

          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify" element={<VerifyEmail />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />

          {/* Role-based dashboards */}
          <Route path="/dashboard" element={DashboardRouter} />
          <Route
            path="/dash/student"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dash/instructor"
            element={
              <ProtectedRoute>
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dash/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;
