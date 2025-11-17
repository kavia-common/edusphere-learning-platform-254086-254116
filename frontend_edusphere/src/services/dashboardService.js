import { supabase } from '../lib/supabaseClient';
import { getLogger } from '../shared/utils/logger';

const logger = getLogger('dashboardService');

function isUnauthorized(error) {
  if (!error) return false;
  const msg = String(error?.message || '').toLowerCase();
  return msg.includes('jwt') || msg.includes('auth') || error?.status === 401 || error?.code === '401';
}

// PUBLIC_INTERFACE
export async function fetchStudentOverview(userId) {
  /**
   * Returns aggregation for student dashboard:
   * { kpis: {...}, recentActivity: [...], tasks: [...], charts: {...} }
   * Gracefully falls back for anonymous users with sample placeholders.
   */
  if (!userId) {
    return {
      kpis: {
        enrolledCourses: 0,
        lessonsCompleted: 0,
        hoursLearned: 0,
        streakDays: 0
      },
      recentActivity: [],
      tasks: [],
      charts: {
        weeklyLearningMinutes: [0, 0, 0, 0, 0, 0, 0],
        courseProgress: []
      }
    };
  }

  try {
    const [enrolled, progressAgg, recentNotes, todoItems] = await Promise.all([
      supabase.from('enrollments').select('id, course_id').eq('user_id', userId),
      supabase.rpc('student_progress_aggregate', { p_user_id: userId }),
      supabase
        .from('lesson_notes')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(10),
      supabase.from('student_tasks').select('*').eq('user_id', userId).order('created_at', { ascending: true })
    ]);

    if (enrolled.error && !isUnauthorized(enrolled.error)) {
      logger.warn('enrollments error', { error: String(enrolled.error) });
    }
    if (progressAgg.error && !isUnauthorized(progressAgg.error)) {
      logger.warn('progress agg error', { error: String(progressAgg.error) });
    }
    if (recentNotes.error && !isUnauthorized(recentNotes.error)) {
      logger.warn('recent notes error', { error: String(recentNotes.error) });
    }
    if (todoItems.error && !isUnauthorized(todoItems.error)) {
      logger.warn('tasks error', { error: String(todoItems.error) });
    }

    const enrolledCourses = Array.isArray(enrolled.data) ? enrolled.data.length : 0;
    const lessonsCompleted = progressAgg.data?.lessons_completed ?? 0;
    const hoursLearned = Math.round((progressAgg.data?.minutes_learned ?? 0) / 60);
    const streakDays = progressAgg.data?.streak_days ?? 0;

    const recentActivity = (recentNotes.data || []).map((n) => ({
      id: `note-${n.id}`,
      type: 'note',
      title: 'New note added',
      description: (n.content || '').slice(0, 120),
      time: n.updated_at
    }));

    const tasks = (todoItems.data || []).map((t) => ({
      id: t.id,
      title: t.title || 'Task',
      done: !!t.completed,
      dueAt: t.due_at || null
    }));

    const charts = {
      weeklyLearningMinutes:
        progressAgg.data?.weekly_minutes ||
        [0, 0, 0, 0, 0, 0, 0],
      courseProgress:
        (progressAgg.data?.course_progress || []).map((r) => ({
          courseId: r.course_id,
          title: r.title,
          percent: r.percent
        }))
    };

    return {
      kpis: { enrolledCourses, lessonsCompleted, hoursLearned, streakDays },
      recentActivity,
      tasks,
      charts
    };
  } catch (err) {
    logger.error('fetchStudentOverview exception', { error: String(err) });
    return {
      kpis: {
        enrolledCourses: 0,
        lessonsCompleted: 0,
        hoursLearned: 0,
        streakDays: 0
      },
      recentActivity: [],
      tasks: [],
      charts: { weeklyLearningMinutes: [0, 0, 0, 0, 0, 0, 0], courseProgress: [] }
    };
  }
}

// PUBLIC_INTERFACE
export async function fetchInstructorOverview(userId) {
  /**
   * Aggregation for instructor dashboard: authored courses, students, revenue est.
   * Returns placeholders on missing/unauthorized.
   */
  if (!userId) {
    return {
      kpis: { coursesAuthored: 0, activeStudents: 0, reviews: 0, estRevenue: 0 },
      recentActivity: [],
      tasks: [],
      charts: { enrollmentsByCourse: [] }
    };
  }
  try {
    const [courses, enrollments, reviews, tasks] = await Promise.all([
      supabase.from('courses').select('id, title').eq('instructor_id', userId),
      supabase.rpc('instructor_active_students', { p_instructor_id: userId }),
      supabase.from('course_reviews').select('id').eq('instructor_id', userId),
      supabase.from('instructor_tasks').select('*').eq('user_id', userId).order('created_at', { ascending: true })
    ]);

    if (courses.error && !isUnauthorized(courses.error)) logger.warn('courses error', { error: String(courses.error) });
    if (enrollments.error && !isUnauthorized(enrollments.error))
      logger.warn('enrollments error', { error: String(enrollments.error) });
    if (reviews.error && !isUnauthorized(reviews.error)) logger.warn('reviews error', { error: String(reviews.error) });
    if (tasks.error && !isUnauthorized(tasks.error)) logger.warn('tasks error', { error: String(tasks.error) });

    const coursesAuthored = Array.isArray(courses.data) ? courses.data.length : 0;
    const activeStudents = enrollments.data?.active_students ?? 0;
    const reviewsCount = Array.isArray(reviews.data) ? reviews.data.length : 0;
    const estRevenue = enrollments.data?.estimated_revenue ?? 0;

    const recentActivity = (courses.data || []).slice(0, 10).map((c) => ({
      id: `course-${c.id}`,
      type: 'course',
      title: 'Course engagement update',
      description: c.title,
      time: new Date().toISOString()
    }));

    const todo = (tasks.data || []).map((t) => ({
      id: t.id,
      title: t.title || 'Task',
      done: !!t.completed,
      dueAt: t.due_at || null
    }));

    const charts = {
      enrollmentsByCourse: (enrollments.data?.course_breakdown || []).map((r) => ({
        courseId: r.course_id,
        title: r.title,
        count: r.enrollments
      }))
    };

    return {
      kpis: { coursesAuthored, activeStudents, reviews: reviewsCount, estRevenue },
      recentActivity,
      tasks: todo,
      charts
    };
  } catch (err) {
    logger.error('fetchInstructorOverview exception', { error: String(err) });
    return {
      kpis: { coursesAuthored: 0, activeStudents: 0, reviews: 0, estRevenue: 0 },
      recentActivity: [],
      tasks: [],
      charts: { enrollmentsByCourse: [] }
    };
  }
}

// PUBLIC_INTERFACE
export async function fetchAdminOverview() {
  /**
   * Aggregation for admin dashboard: platform-wide metrics.
   * Works without auth but expects RLS policies set appropriately; returns placeholders otherwise.
   */
  try {
    const [usersCount, coursesCount, enrollmentsCount, revenueAgg] = await Promise.all([
      supabase.from('users_public').select('id', { count: 'exact', head: true }),
      supabase.from('courses').select('id', { count: 'exact', head: true }),
      supabase.from('enrollments').select('id', { count: 'exact', head: true }),
      supabase.rpc('platform_revenue_aggregate')
    ]);

    const kpis = {
      users: usersCount.count ?? 0,
      courses: coursesCount.count ?? 0,
      enrollments: enrollmentsCount.count ?? 0,
      revenue: revenueAgg.data?.total_revenue ?? 0
    };

    const charts = {
      monthlyRevenue: revenueAgg.data?.monthly || [],
      topCourses: revenueAgg.data?.top_courses || []
    };

    return {
      kpis,
      recentActivity: [],
      tasks: [],
      charts
    };
  } catch (err) {
    logger.error('fetchAdminOverview exception', { error: String(err) });
    return {
      kpis: { users: 0, courses: 0, enrollments: 0, revenue: 0 },
      recentActivity: [],
      tasks: [],
      charts: { monthlyRevenue: [], topCourses: [] }
    };
  }
}
