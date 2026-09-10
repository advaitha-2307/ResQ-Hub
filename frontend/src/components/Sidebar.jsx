import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  AlertOctagon,
  Truck,
  Building2,
  Package,
  Bell,
  BarChart3,
  User,
  Users,
  PlusCircle,
  Shield,
  LifeBuoy,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'DISPATCHER', 'HOSPITAL_STAFF', 'CITIZEN'] },
    { label: 'Emergencies', path: '/incidents', icon: AlertOctagon, roles: ['ADMIN', 'DISPATCHER', 'HOSPITAL_STAFF', 'CITIZEN'] },
    { label: 'Ambulances', path: '/ambulances', icon: Truck, roles: ['ADMIN', 'DISPATCHER'] },
    { label: 'Hospitals', path: '/hospitals', icon: Building2, roles: ['ADMIN', 'DISPATCHER', 'HOSPITAL_STAFF'] },
    { label: 'Resources', path: '/resources', icon: Package, roles: ['ADMIN', 'DISPATCHER', 'HOSPITAL_STAFF'] },
    { label: 'Notifications', path: '/notifications', icon: Bell, roles: ['ADMIN', 'DISPATCHER', 'HOSPITAL_STAFF', 'CITIZEN'] },
    { label: 'Analytics', path: '/analytics', icon: BarChart3, roles: ['ADMIN', 'DISPATCHER'] },
    { label: 'Users', path: '/users', icon: Users, roles: ['ADMIN'] },
    { label: 'Profile', path: '/profile', icon: User, roles: ['ADMIN', 'DISPATCHER', 'HOSPITAL_STAFF', 'CITIZEN'] },
  ];

  const filteredItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            zIndex: 45,
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      <aside
        style={{
          width: '260px',
          backgroundColor: '#0f172a',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          minHeight: 'calc(100vh - 68px)',
          borderRight: '1px solid #1e293b',
          transition: 'transform 0.25s ease',
          zIndex: 50,
          position: isOpen ? 'fixed' : 'relative',
          top: isOpen ? 0 : 'auto',
          bottom: isOpen ? 0 : 'auto',
          left: 0,
          height: isOpen ? '100vh' : 'auto',
        }}
      >
        {/* Quick Emergency Action */}
        <div style={{ padding: '1.25rem 1rem 0.75rem 1rem' }}>
          <NavLink
            to="/incidents/new"
            onClick={onClose}
            className="btn btn-danger"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 700,
              fontSize: '0.925rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.35)',
            }}
          >
            <PlusCircle size={18} />
            <span>REPORT EMERGENCY</span>
          </NavLink>
        </div>

        {/* Navigation list */}
        <div style={{ padding: '0.5rem 0.75rem', flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', padding: '0.5rem 0.75rem 0.25rem' }}>
            Main Menu
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.925rem',
                    fontWeight: 600,
                    color: isActive ? '#ffffff' : '#94a3b8',
                    backgroundColor: isActive ? '#1e293b' : 'transparent',
                    borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                    transition: 'all 0.15s ease',
                  })}
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Operational Status Footer */}
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid #1e293b',
            backgroundColor: '#090d16',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Shield size={16} color="#3b82f6" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0' }}>Hyderabad Grid Live</span>
          </div>
          <p style={{ fontSize: '0.725rem', color: '#64748b', lineHeight: 1.3 }}>
            Telemetry stream active. GPS positioning synchronized.
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
