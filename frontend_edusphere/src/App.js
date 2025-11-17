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

  return (
    <div className="App">
      <Layout onToggleTheme={toggleTheme} theme={theme}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About experiments={experiments} />} />
          <Route path="/health" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;
