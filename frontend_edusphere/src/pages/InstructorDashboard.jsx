import React from 'react';
import { useAuth } from '../auth/AuthProvider';
import { KPI } from '../components/dashboard/KPI';
import { ChartCard } from '../components/dashboard/ChartCard';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { TaskList } from '../components/dashboard/TaskList';
import { fetchInstructorOverview } from '../services/dashboardService';
import { getLogger } from '../shared/utils/logger';

/**
 * PUBLIC_INTERFACE
 * InstructorDashboard shows creator-centric KPIs and charts.
 */
export function InstructorDashboard() {
  const { user, initializing } = useAuth();
  const logger = React.useMemo(() => getLogger('InstructorDashboard'), []);
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState({
    kpis: { coursesAuthored: 0, activeStudents: 0, reviews: 0, estRevenue: 0 },
    charts: { enrollmentsByCourse: [] },
    recentActivity: [],
    tasks: []
  });

  React.useEffect(() => {
    let alive = true;
    async function load() {
      if (initializing) return;
      setLoading(true);
      const res = await fetchInstructorOverview(user?.id);
      if (!alive) return;
      setData(res);
      setLoading(false);
    }
    load();
    return () => { alive = false; };
  }, [user?.id, initializing]);

  React.useEffect(() => {
    logger.info('Instructor dashboard mounted', { userId: user?.id });
  }, [logger, user?.id]);

  return (
    <div>
      <h1>Instructor Dashboard</h1>
      {!user && <p style={{ fontSize: 12, opacity: 0.75 }}>Sign in to see creator analytics.</p>}

      <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <KPI label="Courses Authored" value={data.kpis.coursesAuthored} icon="🧑‍🏫" loading={loading} />
        <KPI label="Active Students" value={data.kpis.activeStudents} icon="👥" loading={loading} />
        <KPI label="Reviews" value={data.kpis.reviews} icon="⭐" loading={loading} />
        <KPI label="Est. Revenue" value={data.kpis.estRevenue} icon="💸" loading={loading} accent="secondary" />
      </div>

      <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: '1fr 1fr', marginTop: '0.75rem', alignItems: 'start' }}>
        <ChartCard
          title="Enrollments by Course"
          data={data.charts.enrollmentsByCourse.map((c) => ({ label: c.title, value: c.count }))}
          loading={loading}
        />
        <ActivityFeed items={data.recentActivity} loading={loading} />
      </div>

      <div style={{ marginTop: '0.75rem' }}>
        <TaskList tasks={data.tasks} loading={loading} />
      </div>
    </div>
  );
}
