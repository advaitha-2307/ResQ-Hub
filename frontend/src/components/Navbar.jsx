import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, PlusCircle, List, LayoutDashboard, LogOut, UserCheck } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <div className="nav-brand-icon">
          <ShieldAlert size={22} color="#ef4444" />
        </div>
        <div>
          <span className="highlight">ResQ</span> Hub
        </div>
      </div>

      <div className="nav-links">
        <Link 
          to="/dashboard" 
          className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
        >
          <LayoutDashboard size={17} />
          Dashboard
        </Link>

        <Link 
          to="/register" 
          className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`}
        >
          <PlusCircle size={17} />
          Register Emergency
        </Link>

        <Link 
          to="/incidents" 
          className={`nav-link ${location.pathname === '/incidents' ? 'active' : ''}`}
        >
          <List size={17} />
          Incident List
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.8rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              fontSize: '0.82rem',
              fontWeight: 600
            }}>
              <UserCheck size={15} color="var(--accent-cyan)" />
              <span>{user.username}</span>
            </div>

            <button 
              onClick={onLogout}
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.82rem' }}
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
