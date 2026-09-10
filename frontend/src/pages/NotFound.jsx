import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div className="card" style={{ maxWidth: '480px', textAlign: 'center', padding: '3rem' }}>
        <AlertOctagon size={56} color="#dc2626" style={{ margin: '0 auto 1.25rem auto' }} />
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>404</h1>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#334155' }}>
          Page Not Found
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginBottom: '1.75rem' }}>
          The requested emergency coordinate or resource route does not exist on the network.
        </p>
        <Link to="/dashboard" className="btn btn-primary" style={{ display: 'inline-flex' }}>
          <ArrowLeft size={16} />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
