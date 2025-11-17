import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../utils/routes';

/**
 * PUBLIC_INTERFACE
 * Breadcrumbs renders a simple breadcrumb trail based on the current URL path.
 * It avoids very dynamic segments labels (like ids) beyond showing "Course" or "Player".
 */
export function Breadcrumbs() {
  const location = useLocation();
  const parts = location.pathname.split('/').filter(Boolean);

  const segments = [];
  let pathAcc = '';
  parts.forEach((p, idx) => {
    pathAcc += `/${p}`;
    let label = p;
    // Basic aliasing for dynamic paths
    if (p === 'course' || p === 'courses') label = 'Course';
    if (/^[0-9a-fA-F-]{6,}$/.test(p)) label = 'Detail';
    if (p === 'player' || p === 'learn') label = 'Player';
    if (p === 'dashboard' || p === 'dash') label = 'Dashboard';
    segments.push({
      label,
      to: idx < parts.length - 1 ? pathAcc : null
    });
  });

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs" style={{ marginBottom: 12 }}>
      <Link to={ROUTES.HOME} className="crumb">Home</Link>
      {segments.map((seg, i) => (
        <span key={i} className="crumb">
          <span className="sep" aria-hidden="true"> / </span>
          {seg.to ? <Link to={seg.to}>{seg.label}</Link> : <span aria-current="page">{seg.label}</span>}
        </span>
      ))}
    </nav>
  );
}
