import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchCourseById, fetchLessons } from '../services/courseService';
import { ProgressBar } from '../components/ProgressBar';
import { getLogger } from '../shared/utils/logger';
import { Skeleton } from '../components/state/Skeleton';

const logger = getLogger('CourseDetail');

/**
 * PUBLIC_INTERFACE
 * Course detail page showing metadata and lesson list.
 */
export function CourseDetail() {
  /** Loads course information and renders list of lessons. */
  const { id } = useParams();
  const [loading, setLoading] = React.useState(true);
  const [course, setCourse] = React.useState(null);
  const [lessons, setLessons] = React.useState([]);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      const [c, l] = await Promise.all([fetchCourseById(id), fetchLessons(id)]);
      if (!active) return;
      if (c.error) setError(c.error);
      setCourse(c.course);
      if (l.error) logger.warn('lessons error', { error: l.error });
      setLessons(l.lessons || []);
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, [id]);

  if (loading) return (
    <div className="app-surface card">
      <Skeleton lines={6} height={18} />
    </div>
  );
  if (error) return <div role="alert" style={{ color: 'var(--color-error)' }}>{error}</div>;
  if (!course) return <div className="app-surface card">Course not found.</div>;

  return (
    <div>
      <h1>{course.title}</h1>
      <div style={{ fontSize: 13, opacity: 0.8, display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span>Category: {course.category}</span>
        <span>•</span>
        <span>Level: {course.level}</span>
        {typeof course.rating === 'number' && (<><span>•</span><span>⭐ {course.rating.toFixed(1)}</span></>)}
      </div>
      <p style={{ marginTop: '0.5rem' }}>{course.description}</p>

      <ProgressBar percent={0} />

      <div className="app-surface card" style={{ marginTop: '0.75rem' }}>
        <h3 style={{ marginTop: 0 }}>Lessons</h3>
        {lessons.length === 0 && <p style={{ opacity: 0.7 }}>No lessons yet.</p>}
        <ol style={{ paddingLeft: 18, margin: 0 }}>
          {lessons.map((lsn) => (
            <li key={lsn.id} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{lsn.title}</div>
                  {lsn.durationMinutes && <div style={{ fontSize: 12, opacity: 0.7 }}>{lsn.durationMinutes} min</div>}
                </div>
                <Link className="btn btn-ghost" to={`/courses/${course.id}/learn?lesson=${lsn.id}`}>Play</Link>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
