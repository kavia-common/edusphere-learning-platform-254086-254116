import React from 'react';
import { NavLinks } from './NavLinks';

/**
 * PUBLIC_INTERFACE
 * GlassNav renders a sticky, glassmorphism navigation bar with a mobile menu.
 * Use inside Layout header to replace the simple nav if desired.
 */
export function GlassNav({ right = null, brand = 'EduSphere' }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="glassnav">
      <div className="glassnav-inner container">
        <div className="brand">{brand}</div>
        <nav className="links desktop">
          <NavLinks />
        </nav>
        <div className="spacer" />
        {right}
        <button className="menu-btn mobile" aria-label="Menu" onClick={() => setOpen((v) => !v)}>
          ☰
        </button>
      </div>
      {open && (
        <div className="mobile-menu app-surface">
          <NavLinks />
        </div>
      )}
      <style>{`
        .glassnav {
          position: sticky; top: 0; z-index: 30;
          backdrop-filter: saturate(180%) blur(12px);
          background: rgba(255,255,255,0.55);
          border-bottom: 1px solid rgba(37,99,235,0.12);
        }
        [data-theme="dark"] .glassnav {
          background: rgba(16,24,40,0.55);
        }
        .glassnav-inner { display: flex; align-items: center; gap: .75rem; padding: .6rem 1rem; }
        .brand { font-weight: 800; letter-spacing: .2px; }
        .spacer { flex: 1; }
        .links.desktop :global(.nav-link) { position: relative; }
        .links.desktop :global(.nav-link)::after {
          content: ""; position: absolute; left: .5rem; right: .5rem; bottom: 4px; height: 2px;
          background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
          transform: scaleX(0); transform-origin: left; transition: transform .18s ease;
        }
        .links.desktop :global(.nav-link:hover)::after, .links.desktop :global(.nav-link.active)::after { transform: scaleX(1); }
        .menu-btn { border: 1px solid rgba(37,99,235,0.2); border-radius: 10px; background: transparent; padding: .45rem .6rem; }
        .mobile-menu { display: none; }
        @media (max-width: 900px) {
          .desktop { display: none; }
          .mobile { display: inline-flex; }
          .mobile-menu { display: grid; gap: .25rem; padding: .5rem; }
        }
        @media (min-width: 901px) {
          .mobile { display: none; }
        }
      `}</style>
    </div>
  );
}

export default GlassNav;
