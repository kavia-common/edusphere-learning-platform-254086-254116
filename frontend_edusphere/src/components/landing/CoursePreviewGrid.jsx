import React from 'react';
import { Skeleton } from '../state/Skeleton';

/**
 * PUBLIC_INTERFACE
 * PreviewCard renders a single course preview with hover lift and subtle gradient border.
 */
export function PreviewCard({ title, instructor, duration, rating, imageUrl }) {
  return (
    <article className="preview-card app-surface" role="article">
      <div className="preview-media">
        <img src={imageUrl} alt="" loading="lazy" />
        <div className="shimmer" aria-hidden="true" />
      </div>
      <div className="preview-body">
        <h3 className="preview-title">{title}</h3>
        <div className="preview-meta">
          <span>{instructor}</span>
          <span>·</span>
          <span>{duration}</span>
        </div>
        <div className="preview-rating">⭐ {rating}</div>
      </div>
      <style>{`
        .preview-card {
          padding: .75rem;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(37,99,235,0.12);
          background: linear-gradient(180deg, rgba(255,255,255,0.7), rgba(255,255,255,0.5));
          transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
          box-shadow: 0 10px 30px rgba(37,99,235,0.07);
          position: relative;
        }
        [data-theme="dark"] .preview-card {
          background: linear-gradient(180deg, rgba(16,24,40,0.65), rgba(16,24,40,0.45));
          border-color: rgba(59,130,246,0.2);
        }
        .preview-card::after {
          content: "";
          position: absolute; inset: 0;
          border-radius: 16px;
          padding: 1px;
          background: linear-gradient(135deg, rgba(59,130,246,0.2), rgba(245,158,11,0.2));
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
                  mask-composite: exclude;
          opacity: 0.6;
          pointer-events: none;
        }
        .preview-card:hover { transform: translateY(-4px); box-shadow: 0 18px 40px rgba(37,99,235,0.18); }
        .preview-media { position: relative; border-radius: 12px; overflow: hidden; aspect-ratio: 16/9; }
        .preview-media img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .shimmer {
          position: absolute; inset: 0;
          background: linear-gradient(120deg, transparent 20%, rgba(255,255,255,0.6) 50%, transparent 80%);
          transform: translateX(-100%);
          animation: shimmer 2.2s infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .preview-body { padding: .6rem .1rem .1rem; display: grid; gap: .25rem; }
        .preview-title { margin: 0; font-size: 1rem; line-height: 1.25rem; }
        .preview-meta { display: flex; gap: .35rem; font-size: .8rem; opacity: .75; }
        .preview-rating { font-size: .85rem; color: var(--color-secondary); }
      `}</style>
    </article>
  );
}

/**
 * PUBLIC_INTERFACE
 * CoursePreviewGrid renders a responsive grid of preview cards.
 * Accepts items or loads sample data. Use onFetch to source real data.
 *
 * TODO: Integrate with courseService (e.g., fetchCourses({ pageSize: 8 })) or a Supabase channel.
 */
export function CoursePreviewGrid({ items = null, onFetch = null, loading = false }) {
  const [data, setData] = React.useState(() => items || []);
  const [busy, setBusy] = React.useState(loading);

  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (items) return; // controlled
      if (!onFetch) {
        // Sample data
        setData([
          { id: 'c1', title: 'Modern React Patterns', instructor: 'A. Lee', duration: '6h', rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop' },
          { id: 'c2', title: 'Data Visualization with D3', instructor: 'M. Khan', duration: '4h', rating: 4.6, imageUrl: 'https://images.unsplash.com/photo-1534759846116-5797a4d31b89?q=80&w=1200&auto=format&fit=crop' },
          { id: 'c3', title: 'Design Systems & UX', instructor: 'J. Patel', duration: '5h', rating: 4.7, imageUrl: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?q=80&w=1200&auto=format&fit=crop' },
          { id: 'c4', title: 'Intro to Machine Learning', instructor: 'C. Zhao', duration: '7h', rating: 4.9, imageUrl: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?q=80&w=1200&auto=format&fit=crop' },
        ]);
        return;
      }
      try {
        setBusy(true);
        const res = await onFetch();
        if (!cancelled && res) setData(res);
      } finally {
        if (!cancelled) setBusy(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [items, onFetch]);

  return (
    <div>
      {busy && <Skeleton lines={3} height={24} />}
      <div className="preview-grid">
        {data.map((c) => (
          <PreviewCard key={c.id} {...c} />
        ))}
      </div>
      <style>{`
        .preview-grid {
          display: grid;
          gap: .75rem;
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
        @media (max-width: 1200px) { .preview-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        @media (max-width: 900px) { .preview-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 560px) { .preview-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}

export default CoursePreviewGrid;
