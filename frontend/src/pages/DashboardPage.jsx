import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  PlusCircle, 
  Database, 
  ArrowRight,
  RefreshCw,
  Activity,
  Layers
} from 'lucide-react';
import apiService from '../services/api';

export default function DashboardPage() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getIncidents();
      setIncidents(data);
    } catch (err) {
      setError('Unable to load incidents from backend database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Metric Calculations
  const totalCount = incidents.length;
  const pendingCount = incidents.filter(i => i.status === 'Pending').length;
  const criticalCount = incidents.filter(i => i.priority === 'Critical' || i.priority === 'High').length;
  const resolvedCount = incidents.filter(i => i.status === 'Resolved').length;

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Emergency Command Center</h1>
          <p className="page-subtitle">Real-time emergency incident monitoring and resource management</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchDashboardData} className="btn btn-secondary" disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            Sync DB
          </button>
          <Link to="/register" className="btn btn-primary">
            <PlusCircle size={17} />
            Register Emergency
          </Link>
        </div>
      </div>

      {error && (
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderColor: 'var(--primary-red)', color: '#fca5a5', marginBottom: '1.5rem' }}>
          {error} Verify FastAPI server is active on http://localhost:8000
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="stats-grid">
        <div className="glass-panel stat-card card-total">
          <div>
            <div className="stat-label">Total Incidents</div>
            <div className="stat-val">{loading ? '-' : totalCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.3rem', fontWeight: 600 }}>
              Recorded in Database
            </div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)' }}>
            <Database size={24} />
          </div>
        </div>

        <div className="glass-panel stat-card card-pending">
          <div>
            <div className="stat-label">Pending Response</div>
            <div className="stat-val" style={{ color: 'var(--accent-amber)' }}>{loading ? '-' : pendingCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.3rem', fontWeight: 600 }}>
              Awaiting Dispatch
            </div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}>
            <Clock size={24} />
          </div>
        </div>

        <div className="glass-panel stat-card card-critical">
          <div>
            <div className="stat-label">Critical Alerts</div>
            <div className="stat-val" style={{ color: 'var(--primary-red)' }}>{loading ? '-' : criticalCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.3rem', fontWeight: 600 }}>
              High & Critical Priority
            </div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--primary-red)' }}>
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="glass-panel stat-card card-resolved">
          <div>
            <div className="stat-label">Resolved</div>
            <div className="stat-val" style={{ color: 'var(--accent-emerald)' }}>{loading ? '-' : resolvedCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.3rem', fontWeight: 600 }}>
              Successfully Handled
            </div>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
            <CheckCircle2 size={24} />
          </div>
        </div>
      </div>

      {/* Recent Incidents Table */}
      <div className="glass-panel" style={{ padding: '1.6rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Active Incident Feed</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Latest emergency events stored in database</p>
          </div>
          <Link to="/incidents" style={{ color: 'var(--accent-cyan)', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            View Full Registry <ArrowRight size={16} />
          </Link>
        </div>

        {incidents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
            No incidents found in database. Click "Register Emergency" to submit the first record!
          </div>
        ) : (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Incident Type</th>
                  <th>Location</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Reported Time</th>
                </tr>
              </thead>
              <tbody>
                {incidents.slice(0, 6).map((inc) => (
                  <tr key={inc.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>#{inc.id}</td>
                    <td style={{ fontWeight: 700 }}>{inc.incident_type}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{inc.location}</td>
                    <td>
                      <span className={`badge badge-${inc.priority.toLowerCase()}`}>
                        {inc.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${inc.status.toLowerCase().replace(' ', '-')}`}>
                        {inc.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(inc.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
