import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * Layout component providing app chrome: header, nav, and main content container.
 */
export function Layout({ children, onToggleTheme, theme }) {
  return (
    <>
      <header className="app-header">
        <nav className="navbar container">
          <div className="nav-brand">EduSphere</div>
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Home</NavLink>
          <NavLink to="/catalog" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Catalog</NavLink>
          <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>About</NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink>
          <div className="nav-spacer" />
          <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Profile</NavLink>
          <NavLink to="/login" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Login</NavLink>
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
