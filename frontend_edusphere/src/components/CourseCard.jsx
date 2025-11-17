import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * Card displaying a course summary.
 */
export function CourseCard({ course }) {
  /** Renders thumbnail, title, meta and link to detail. */
  if (!course) return null;
  return (
    <div className="app-surface card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{
        width: '100%',
        aspectRatio: '16 / 9',
        background: 'rgba(37,99,235,0.08)',
        borderRadius: 10,
        overflow: 'hidden',
        border: '1px solid rgba(37,99,235,0.12)'
      }}>
        {course.thumbnailUrl ? (
          <img src={course.thumbnailUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%' }} />
        )}
      </div>
      <h3 style={{ margin: '0.25rem 0 0 0' }}>{course.title}</h3>
      <div style={{ fontSize: 13, opacity: 0.8, display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span>Category: {course.category}</span>
        <span>•</span>
        <span>Level: {course.level}</span>
        {typeof course.rating === 'number' && (
          <>
            <span>•</span>
            <span>⭐ {course.rating.toFixed(1)}</span>
          </>
        )}
      </div>
      <Link to={`/courses/${course.id}`} className="btn btn-primary" style={{ marginTop: 'auto' }}>
        View details
      </Link>
    </div>
  );
}
