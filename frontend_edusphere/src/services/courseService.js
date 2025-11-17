import { supabase } from '../lib/supabaseClient';
import { getLogger } from '../shared/utils/logger';

const logger = getLogger('courseService');

/**
 * Shape helpers
 */
function mapCourse(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    thumbnailUrl: row.thumbnail_url || row.thumbnailUrl || '',
    category: row.category || 'General',
    level: row.level || 'Beginner',
    rating: typeof row.rating === 'number' ? row.rating : null,
    lessonsCount: row.lessons_count ?? row.lessonsCount ?? null,
    durationMinutes: row.duration_minutes ?? row.durationMinutes ?? null,
    updatedAt: row.updated_at ?? row.updatedAt ?? null
  };
}

function mapLesson(row) {
  if (!row) return null;
  return {
    id: row.id,
    courseId: row.course_id ?? row.courseId,
    title: row.title,
    order: row.order_index ?? row.order ?? 0,
    videoUrl: row.video_url ?? row.videoUrl ?? '',
    resources: row.resources || [],
    durationMinutes: row.duration_minutes ?? null,
  };
}

function mapProgress(row) {
  if (!row) return { completedLessonIds: [], percent: 0 };
  const total = row.total_lessons ?? row.totalLessons ?? 0;
  const completed = row.completed_lessons ?? row.completedLessons ?? 0;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return {
    completedLessonIds: row.completed_lesson_ids ?? row.completedLessonIds ?? [],
    percent
  };
}

/**
 * Error guard for unauthorized
 */
function isUnauthorized(error) {
  if (!error) return false;
  const msg = String(error?.message || '').toLowerCase();
  return msg.includes('jwt') || msg.includes('auth') || error?.status === 401 || error?.code === '401';
}

/**
 * PUBLIC_INTERFACE
 * Fetch a paged catalog of courses with optional filters/search/sort.
 */
export async function fetchCourses({ page = 1, pageSize = 12, search = '', category = '', level = '', sortBy = 'updated_at', sortDir = 'desc' } = {}) {
  /** Returns { items: [], total: number, page, pageSize } for the courses catalog. */
  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('courses')
      .select('*', { count: 'exact' });

    if (search) {
      // Use ilike for case-insensitive match
      query = query.ilike('title', `%${search}%`);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (level) {
      query = query.eq('level', level);
    }
    if (sortBy) {
      query = query.order(sortBy, { ascending: sortDir === 'asc' });
    }
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) {
      if (isUnauthorized(error)) {
        logger.warn('fetchCourses unauthorized', {});
        return { items: [], total: 0, page, pageSize, unauthorized: true };
      }
      logger.warn('fetchCourses error', { error: String(error) });
      return { items: [], total: 0, page, pageSize, error: 'Unable to load catalog' };
    }
    const items = Array.isArray(data) ? data.map(mapCourse).filter(Boolean) : [];
    return { items, total: count || 0, page, pageSize };
  } catch (err) {
    logger.error('fetchCourses exception', { error: String(err) });
    return { items: [], total: 0, page, pageSize, error: 'Unexpected error' };
  }
}

/**
 * PUBLIC_INTERFACE
 * Fetch detail for a single course.
 */
export async function fetchCourseById(courseId) {
  /** Returns a single course or null if not found, with unauthorized flag if needed. */
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (error) {
      if (isUnauthorized(error)) return { course: null, unauthorized: true };
      if (String(error?.message || '').toLowerCase().includes('row not found')) {
        return { course: null };
      }
      return { course: null, error: 'Unable to load course' };
    }
    return { course: mapCourse(data) };
  } catch (err) {
    logger.error('fetchCourseById exception', { error: String(err) });
    return { course: null, error: 'Unexpected error' };
  }
}

/**
 * PUBLIC_INTERFACE
 * Fetch lessons for a course.
 */
export async function fetchLessons(courseId) {
  /** Returns lessons[] sorted by order. */
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    if (error) {
      if (isUnauthorized(error)) return { lessons: [], unauthorized: true };
      return { lessons: [], error: 'Unable to load lessons' };
    }
    const lessons = Array.isArray(data) ? data.map(mapLesson).filter(Boolean) : [];
    return { lessons };
  } catch (err) {
    logger.error('fetchLessons exception', { error: String(err) });
    return { lessons: [], error: 'Unexpected error' };
  }
}

/**
 * PUBLIC_INTERFACE
 * Fetch user progress for a course.
 */
export async function fetchProgress(courseId, userId) {
  /** Returns { progress } with percent and completedLessonIds; handles anonymous by returning empty progress. */
  if (!userId) {
    return { progress: mapProgress(null) };
  }
  try {
    const { data, error } = await supabase
      .from('course_progress')
      .select('*')
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (isUnauthorized(error)) return { progress: mapProgress(null), unauthorized: true };
      return { progress: mapProgress(null) };
    }
    return { progress: mapProgress(data) };
  } catch (err) {
    logger.error('fetchProgress exception', { error: String(err) });
    return { progress: mapProgress(null) };
  }
}

/**
 * PUBLIC_INTERFACE
 * Save a user note for a lesson (upsert).
 */
export async function saveNote({ courseId, lessonId, userId, content }) {
  /** Returns { success: boolean } and fails gracefully for anonymous users. */
  if (!userId) return { success: false, error: 'Unauthorized' };
  try {
    const { error } = await supabase
      .from('lesson_notes')
      .upsert({
        course_id: courseId,
        lesson_id: lessonId,
        user_id: userId,
        content
      }, { onConflict: 'lesson_id,user_id' });

    if (error) {
      if (isUnauthorized(error)) return { success: false, error: 'Unauthorized' };
      logger.warn('saveNote error', { error: String(error) });
      return { success: false, error: 'Could not save note' };
    }
    return { success: true };
  } catch (err) {
    logger.error('saveNote exception', { error: String(err) });
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * PUBLIC_INTERFACE
 * Fetch user notes for a lesson.
 */
export async function fetchNotes({ courseId, lessonId, userId }) {
  /** Returns { notes: [] } or empty for anonymous users. */
  if (!userId) return { notes: [] };
  try {
    const { data, error } = await supabase
      .from('lesson_notes')
      .select('*')
      .eq('course_id', courseId)
      .eq('lesson_id', lessonId)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      if (isUnauthorized(error)) return { notes: [], unauthorized: true };
      return { notes: [] };
    }
    const notes = (data || []).map((n) => ({
      id: n.id,
      content: n.content,
      updatedAt: n.updated_at
    }));
    return { notes };
  } catch (err) {
    logger.error('fetchNotes exception', { error: String(err) });
    return { notes: [] };
  }
}

/**
 * PUBLIC_INTERFACE
 * Mark a lesson as completed for progress tracking.
 */
export async function markLessonComplete({ courseId, lessonId, userId }) {
  /** Returns { success: boolean } and fails gracefully for anonymous users. */
  if (!userId) return { success: false, error: 'Unauthorized' };
  try {
    const { error } = await supabase.rpc('mark_lesson_complete', {
      p_course_id: courseId,
      p_lesson_id: lessonId,
      p_user_id: userId
    });
    if (error) {
      if (isUnauthorized(error)) return { success: false, error: 'Unauthorized' };
      logger.warn('markLessonComplete error', { error: String(error) });
      return { success: false, error: 'Could not update progress' };
    }
    return { success: true };
  } catch (err) {
    logger.error('markLessonComplete exception', { error: String(err) });
    return { success: false, error: 'Unexpected error' };
  }
}
