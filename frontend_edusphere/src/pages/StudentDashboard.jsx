import React from 'react';
import { useAuth } from '../auth/AuthProvider';
import { KPI } from '../components/dashboard/KPI';
import { ChartCard } from '../components/dashboard/ChartCard';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { TaskList } from '../components/dashboard/TaskList';
import { fetchStudentOverview } from '../services/dashboardService';
import { getLogger } from '../shared/utils/logger';

/**
 * PUBLIC_INTERFACE
 * StudentDashboard shows learner-centric KPIs, charts, activity, and tasks.
 */
export function StudentDashboard() {
  /** Aggregates Supabase data with graceful fallback. */
  const { user, initializing } = useAuth();
  const logger = React.useMemo(() => getLogger('StudentDashboard'), []);
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState({
    kpis: { enrolledCourses: 0, lessonsCompleted: 0, hoursLearned: 0, streakDays: 0 },
    charts: { weeklyLearningMinutes: [], courseProgress: [] },
    recentActivity: [],
    tasks: []
  });

  React.useEffect(() => {
    let alive = true;
    async function load() {
      if (initializing) return;
      setLoading(true);
      const res = await fetchStudentOverview(user?.id);
      if (!alive) return;
      setData(res);
      setLoading(false);
    }
    load();
    return () => { alive = false; };
  }, [user?.id, initializing]);

  React.useEffect(() => {
    logger.info('Student dashboard mounted', { userId: user?.id });
  }, [logger, user?.id]);

  return (
    <div>
      <h1>Student Dashboard</h1>
      {!user && <p style={{ fontSize: 12, opacity: 0.75 }}>Sign in to see personalized insights.</p>}

      <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <KPI label="Enrolled Courses" value={data.kpis.enrolledCourses} icon="📚" loading={loading} />
        <KPI label="Lessons Completed" value={data.kpis.lessonsCompleted} icon="✅" loading={loading} />
        <KPI label="Hours Learned" value={data.kpis.hoursLearned} icon="⏱️" loading={loading} />
        <KPI label="Streak (days)" value={data.kpis.streakDays} icon="🔥" loading={loading} accent="secondary" />
      </div>

      <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: '1.2fr 1fr', marginTop: '0.75rem', alignItems: 'start' }}>
        <ChartCard
          title="Weekly Learning (minutes)"
          data={data.charts.weeklyLearningMinutes}
          loading={loading}
        />
        <ChartCard
          title="Course Progress (%)"
          data={data.charts.courseProgress.map((c) => ({ label: c.title, value: c.percent }))}
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
