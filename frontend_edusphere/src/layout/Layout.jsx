import React from 'react';
import { isSupabaseEnabled } from '../config/env';
import { NavLinks } from '../components/layout/NavLinks';

/**
 * PUBLIC_INTERFACE
 * Layout component providing app chrome: header, nav, and main content container.
 */
export function Layout({ children, onToggleTheme, theme }) {
  const supabaseOk = isSupabaseEnabled();
  return (
    <>
      <header className="app-header">
        <nav className="navbar container">
          <div className="nav-brand">EduSphere</div>
          <NavLinks />
          <div className="nav-spacer" />
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </nav>
      </header>
      {!supabaseOk && (
        <div className="container" style={{ paddingTop: 8 }}>
          <div
            className="app-surface card"
            role="status"
            style={{
              background: 'rgba(245,158,11,0.14)',
              border: '1px solid rgba(245,158,11,0.3)',
            }}
          >
            Supabase is not configured. Some features are disabled. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY.
          </div>
        </div>
      )}
      <main className="container" style={{ paddingTop: '1.25rem' }}>
        <section className="app-surface card">
          {children}
        </section>
      </main>
      <footer className="app-footer">
        © {new Date().getFullYear()} EduSphere · Ocean Professional Theme
      </footer>
    </>
  );
}
