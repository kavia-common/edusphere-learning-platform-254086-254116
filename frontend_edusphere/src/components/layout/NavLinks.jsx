import React from 'react';
import { NavLink } from 'react-router-dom';
import { ROUTES } from '../../utils/routes';

/**
 * PUBLIC_INTERFACE
 * NavLinks centralizes top navigation links so Layout can stay lean.
 */
export function NavLinks() {
  const linkClass = ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`;
  return (
    <>
      <NavLink to={ROUTES.HOME} className={linkClass}>Home</NavLink>
      <NavLink to={ROUTES.CATALOG} className={linkClass}>Catalog</NavLink>
      <NavLink to="/about" className={linkClass}>About</NavLink>
      <NavLink to={ROUTES.HEALTH} className={linkClass}>Health</NavLink>
      <NavLink to={ROUTES.DASHBOARD} className={linkClass}>Dashboard</NavLink>
      <NavLink to={ROUTES.DASH_STUDENT} className={linkClass}>Student</NavLink>
      <NavLink to={ROUTES.DASH_INSTRUCTOR} className={linkClass}>Instructor</NavLink>
      <NavLink to={ROUTES.DASH_ADMIN} className={linkClass}>Admin</NavLink>
      <NavLink to={ROUTES.PROFILE} className={linkClass}>Profile</NavLink>
      <NavLink to={ROUTES.LOGIN} className={linkClass}>Login</NavLink>
    </>
  );
}
