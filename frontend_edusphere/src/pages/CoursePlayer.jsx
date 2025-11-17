import React from 'react';
import { useNavigate, useSearchParams, useParams, Link } from 'react-router-dom';
import { fetchCourseById, fetchLessons, fetchNotes, saveNote, fetchProgress, markLessonComplete } from '../services/courseService';
import { ResourcePanel } from '../components/ResourcePanel';
import { NotesPanel } from '../components/NotesPanel';
import { ProgressBar } from '../components/ProgressBar';
import { useAuth } from '../auth/AuthProvider';
import { getLogger } from '../shared/utils/logger';
import { Skeleton } from '../components/state/Skeleton';

// Optionally import collab components when the feature flag is enabled in env.
// Example usage (uncomment to render in the player surface or panels):
//   import { PresenceAvatars } from '../components/collab/PresenceAvatars';
//   import { TypingIndicator } from '../components/collab/TypingIndicator';
//   import { LiveCursor } from '../components/collab/LiveCursor';
// Then place them in JSX where appropriate:
//   <PresenceAvatars roomId={`course:${id}:lesson:${activeLesson?.id || ''}`} />
//   <TypingIndicator roomId={`course:${id}:lesson:${activeLesson?.id || ''}`} inputSelector="textarea" />
//   <LiveCursor roomId={`course:${id}:lesson:${activeLesson?.id || ''}`} containerRef={someRef} />

const logger = getLogger('CoursePlayer');

/**
 * PUBLIC_INTERFACE
 * Course Player page with video area and side panels for resources, notes, progress.
 */
export function CoursePlayer() {
  /** Renders player UI and handles progress and notes. */
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = React.useState(true);
  const [course, setCourse] = React.useState(null);
  const [lessons, setLessons] = React.useState([]);
  const [activeLesson, setActiveLesson] = React.useState(null);
  const [notes, setNotes] = React.useState([]);
  const [progress, setProgress] = React.useState({ percent: 0, completedLessonIds: [] });
  const [error, setError] = React.useState('');

  const lessonQuery = searchParams.get('lesson');

  React.useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      setError('');
      const [c, l] = await Promise.all([fetchCourseById(id), fetchLessons(id)]);
      if (!alive) return;
      if (c.error) setError(c.error);
      setCourse(c.course);
      const ls = l.lessons || [];
      setLessons(ls);
      let targetLesson = ls.find((x) => String(x.id) === String(lessonQuery)) || ls[0] || null;
      setActiveLesson(targetLesson);
      setLoading(false);
    }
    load();
    return () => { alive = false; };
  }, [id, lessonQuery]);

  React.useEffect(() => {
    let alive = true;
    async function loadMeta() {
      if (!activeLesson) return;
      const [nt, pg] = await Promise.all([
        fetchNotes({ courseId: id, lessonId: activeLesson.id, userId: user?.id }),
        fetchProgress(id, user?.id)
      ]);
      if (!alive) return;
      setNotes(nt.notes || []);
      setProgress(pg.progress || { percent: 0, completedLessonIds: [] });
    }
    loadMeta();
    return () => { alive = false; };
  }, [id, activeLesson, user?.id]);

  const switchLesson = (lessonId) => {
    setSearchParams({ lesson: String(lessonId) }, { replace: true });
  };

  const onNoteAdd = async (content) => {
    if (!user?.id || !activeLesson) return;
    const res = await saveNote({ courseId: id, lessonId: activeLesson.id, userId: user.id, content });
    if (res.success) {
      const updated = await fetchNotes({ courseId: id, lessonId: activeLesson.id, userId: user.id });
      setNotes(updated.notes || []);
    }
  };

  const onComplete = async () => {
    if (!user?.id || !activeLesson) return;
    const res = await markLessonComplete({ courseId: id, lessonId: activeLesson.id, userId: user.id });
    if (res.success) {
      const pg = await fetchProgress(id, user.id);
      setProgress(pg.progress || { percent: 0, completedLessonIds: [] });
      // Go to next lesson if exists
      const idx = lessons.findIndex((l) => l.id === activeLesson.id);
      if (idx >= 0 && idx < lessons.length - 1) {
        switchLesson(lessons[idx + 1].id);
      }
    } else if (res.error === 'Unauthorized') {
      navigate('/login', { replace: true, state: { from: { pathname: `/courses/${id}/learn`, search: `?lesson=${activeLesson.id}` } } });
    }
  };

  if (loading) return (
    <div className="app-surface card">
      <Skeleton lines={8} height={18} />
    </div>
  );
  if (error) return <div role="alert" style={{ color: 'var(--color-error)' }}>{error}</div>;
  if (!course) return <div className="app-surface card">Course not found.</div>;

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h1 style={{ marginBottom: 0 }}>{course.title}</h1>
        <Link className="btn btn-ghost" to={`/courses/${course.id}`}>Back to details</Link>
      </div>
      <ProgressBar percent={progress.percent || 0} />

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.75rem', alignItems: 'start' }}>
        <section className="app-surface card" style={{ minHeight: 320 }}>
          <h3 style={{ marginTop: 0 }}>{activeLesson?.title || 'Lesson'}</h3>
          <div style={{
            width: '100%',
            aspectRatio: '16/9',
            background: 'linear-gradient(135deg, rgba(59,130,246,0.16), rgba(249,250,251,1))',
            border: '1px solid rgba(37,99,235,0.12)',
            borderRadius: 12,
            display: 'grid',
            placeItems: 'center',
            color: 'rgba(17,24,39,0.7)'
          }}>
            {activeLesson?.videoUrl ? (
              <video src={activeLesson.videoUrl} controls style={{ width: '100%', height: '100%', borderRadius: 12 }} />
            ) : (
              <div>Video player placeholder</div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            <button className="btn btn-primary" onClick={onComplete} disabled={!user}>Mark complete</button>
            {!user && <span style={{ fontSize: 12, opacity: 0.8, alignSelf: 'center' }}>Sign in to track progress.</span>}
          </div>
          <div className="app-surface card" style={{ marginTop: '0.75rem' }}>
            <h4 style={{ marginTop: 0 }}>Lessons</h4>
            <ol style={{ paddingLeft: 18, margin: 0 }}>
              {lessons.map((lsn) => {
                const isActive = activeLesson?.id === lsn.id;
                return (
                  <li key={lsn.id} style={{ marginBottom: 6 }}>
                    <button
                      className="btn btn-ghost"
                      onClick={() => switchLesson(lsn.id)}
                      aria-current={isActive ? 'true' : 'false'}
                      style={{ background: isActive ? 'rgba(37,99,235,0.12)' : undefined }}
                    >
                      {lsn.title}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <aside style={{ display: 'grid', gap: '0.75rem' }}>
          <ResourcePanel resources={activeLesson?.resources || []} />
          <NotesPanel notes={notes} onAdd={onNoteAdd} disabled={!user} />
        </aside>
      </div>
    </div>
  );
}
