import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Shield, CheckCircle, LogOut, Key } from 'lucide-react';

export const Profile = () => {
  const { user, logout } = useAuth();

  const getRolePermissions = (role) => {
    switch (role) {
      case 'ADMIN':
        return [
          'Full operational command dashboard',
          'Manage user roles and staff authorizations',
          'Deploy, edit, and decommission ambulances',
          'Register and update network hospital capacity',
          'Allocate medical supplies and inventory',
          'View and export cross-network analytics',
        ];
      case 'DISPATCHER':
        return [
          'Real-time emergency incident monitoring',
          'Proximity-based ambulance triage & assignment',
          'Emergency hospital destination selection',
          'Update emergency response lifecycle stages',
          'Broadcast alerts to ambulance field units',
          'Review resource and bed telemetry',
        ];
      case 'HOSPITAL_STAFF':
        return [
          'Monitor assigned and incoming emergencies',
          'Real-time available bed & ICU capacity adjustments',
          'Triage trauma capacity and medical supplies',
          'Update hospital diversion status (Available, Limited, Full)',
        ];
      default:
        return [
          'Report emergency incidents with GPS coordinates',
          'Track live response status of reported emergencies',
          'Receive status updates and dispatcher alerts',
        ];
    }
  };

  return (
    <div className="page-body">
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.65rem' }}>User Profile & Authorization</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Active credentials, role permissions, and access privileges
          </p>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                fontWeight: 800,
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h2 style={{ fontSize: '1.35rem', color: '#0f172a' }}>{user?.name}</h2>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '999px',
                    backgroundColor: '#dbeafe',
                    color: '#1e40af',
                  }}
                >
                  {user?.role}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem', fontFamily: 'monospace' }}>
                System ID: {user?.id}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.75rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email Address</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, marginTop: '0.2rem' }}>
                <Mail size={16} color="#64748b" />
                <span>{user?.email}</span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Phone Number</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, marginTop: '0.2rem' }}>
                <Phone size={16} color="#64748b" />
                <span>{user?.phone || '+91 98765 00000'}</span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Account Status</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#059669', marginTop: '0.2rem' }}>
                <CheckCircle size={16} />
                <span>Active / Verified</span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Member Since</span>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'August 2026'}
              </div>
            </div>
          </div>

          {/* Role Permissions */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Shield size={16} color="#2563eb" />
              <span>Assigned Role Privileges</span>
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {getRolePermissions(user?.role).map((perm, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <CheckCircle size={14} color="#10b981" />
                  <span>{perm}</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={logout} className="btn btn-outline" style={{ color: '#dc2626', borderColor: '#fecaca' }}>
              <LogOut size={16} />
              <span>Sign Out of Console</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
