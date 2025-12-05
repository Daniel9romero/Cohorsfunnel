import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

export const Header: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="app-header">
      <div className="header-content">
        <Link to="/" className="header-logo">
          <span className="logo-text">Cohort Dashboard</span>
        </Link>

        <nav className="header-nav">
          <Link
            to="/"
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            Inicio
          </Link>
          <Link
            to="/cohorts"
            className={`nav-link ${isActive('/cohorts') ? 'active' : ''}`}
          >
            Cohorts
          </Link>
          <Link
            to="/funnel"
            className={`nav-link ${isActive('/funnel') ? 'active' : ''}`}
          >
            Funnel
          </Link>
          <Link
            to="/map"
            className={`nav-link ${isActive('/map') ? 'active' : ''}`}
          >
            Mapa
          </Link>
          <Link
            to="/methodology"
            className={`nav-link ${isActive('/methodology') ? 'active' : ''}`}
          >
            Metodologia
          </Link>
        </nav>
      </div>
    </header>
  );
};
