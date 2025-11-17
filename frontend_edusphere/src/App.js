import React from 'react';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './layout/Layout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { NotFound } from './pages/NotFound';
import { useUIStore } from './state/uiStore';
import { getLogger } from './shared/utils/logger';
import { useFeatureFlag } from './shared/featureFlags/featureFlags';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { VerifyEmail } from './pages/auth/VerifyEmail';
import { OAuthCallback } from './pages/auth/OAuthCallback';
import { ProtectedRoute } from './auth/ProtectedRoute';

const logger = getLogger('App');

// PUBLIC_INTERFACE
function App() {
  /** Root application with routes and layout. */
  const theme = useUIStore(s => s.theme);
  const setTheme = useUIStore(s => s.setTheme);
  const experiments = useFeatureFlag('experiments');

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    logger.info('Theme applied', { theme });
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const ProtectedDashboard = (
    <ProtectedRoute>
      <div>
        <h1>Dashboard (Protected)</h1>
        <p>This is a placeholder for authenticated users only.</p>
      </div>
    </ProtectedRoute>
  );

  return (
    <div className="App">
      <Layout onToggleTheme={toggleTheme} theme={theme}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About experiments={experiments} />} />
          <Route path="/health" element={<Navigate to="/" replace />} />

          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify" element={<VerifyEmail />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />

          {/* Example protected route */}
          <Route path="/dashboard" element={ProtectedDashboard} />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;
