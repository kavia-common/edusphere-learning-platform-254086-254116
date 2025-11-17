import React from 'react';
import { KPI } from '../components/dashboard/KPI';
import { ChartCard } from '../components/dashboard/ChartCard';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { TaskList } from '../components/dashboard/TaskList';
import { fetchAdminOverview } from '../services/dashboardService';
import { getLogger } from '../shared/utils/logger';

/**
 * PUBLIC_INTERFACE
 * AdminDashboard shows platform-wide metrics and summaries.
 */
export function AdminDashboard() {
  const logger = React.useMemo(() => getLogger('AdminDashboard'), []);
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState({
    kpis: { users: 0, courses: 0, enrollments: 0, revenue: 0 },
    charts: { monthlyRevenue: [], topCourses: [] },
    recentActivity: [],
    tasks: []
  });

  React.useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      const res = await fetchAdminOverview();
      if (!alive) return;
      setData(res);
      setLoading(false);
    }
    load();
    return () => { alive = false; };
  }, []);

  React.useEffect(() => {
    logger.info('Admin dashboard mounted');
  }, [logger]);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <KPI label="Users" value={data.kpis.users} icon="👤" loading={loading} />
        <KPI label="Courses" value={data.kpis.courses} icon="📘" loading={loading} />
        <KPI label="Enrollments" value={data.kpis.enrollments} icon="🧾" loading={loading} />
        <KPI label="Revenue" value={data.kpis.revenue} icon="💰" loading={loading} accent="secondary" />
      </div>

      <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: '1fr 1fr', marginTop: '0.75rem' }}>
        <ChartCard
          title="Monthly Revenue"
          data={data.charts.monthlyRevenue.map((r) => ({ label: r.month, value: r.amount }))}
          loading={loading}
        />
        <ChartCard
          title="Top Courses"
          data={data.charts.topCourses.map((r) => ({ label: r.title, value: r.revenue }))}
          loading={loading}
        />
      </div>

      <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: '1fr 1fr', marginTop: '0.75rem' }}>
        <ActivityFeed items={data.recentActivity} loading={loading} />
        <TaskList tasks={data.tasks} loading={loading} />
      </div>
    </div>
  );
}
