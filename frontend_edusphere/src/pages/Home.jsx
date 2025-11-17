import React from 'react';
import { getLogger } from '../shared/utils/logger';

const logger = getLogger('Home');

/**
 * PUBLIC_INTERFACE
 * Home page placeholder for EduSphere LMS.
 */
export function Home() {
  React.useEffect(() => {
    logger.info('Home mounted');
  }, []);
  return (
    <div>
      <h1>Welcome to EduSphere</h1>
      <p>Modern LMS with glassmorphism and real-time capabilities.</p>
      <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginTop: '1rem' }}>
        <div className="app-surface card">
          <h3 style={{ marginTop: 0 }}>Courses</h3>
          <p>Browse catalog, enroll, and track progress.</p>
        </div>
        <div className="app-surface card">
          <h3 style={{ marginTop: 0 }}>Live Sessions</h3>
          <p>Collaborate in real-time with peers and instructors.</p>
        </div>
        <div className="app-surface card">
          <h3 style={{ marginTop: 0 }}>Analytics</h3>
          <p>Insights powered by events and engagement metrics.</p>
        </div>
      </div>
    </div>
  );
}
