import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { incidentAPI } from '../services/api';
import IncidentTable from '../components/IncidentTable';
import { 
  AlertOctagon, PlusCircle, Search, Filter, RefreshCw 
} from 'lucide-react';

export const Incidents = () => {
  const { user } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [onlyMyIncidents, setOnlyMyIncidents] = useState(user?.role === 'CITIZEN');

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (priorityFilter) params.priority = priorityFilter;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.emergency_type = typeFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (onlyMyIncidents) params.my_incidents = true;

      const res = await incidentAPI.getIncidents(params);
      setIncidents(res.data);
    } catch (err) {
      console.error('Error fetching incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();

    const handleWs = () => {
      fetchIncidents();
    };
    window.addEventListener('resq_ws_event', handleWs);
    return () => window.removeEventListener('resq_ws_event', handleWs);
  }, [priorityFilter, statusFilter, typeFilter, onlyMyIncidents]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchIncidents();
  };

  const handleClearFilters = () => {
    setPriorityFilter('');
    setStatusFilter('');
    setTypeFilter('');
    setSearchTerm('');
    setOnlyMyIncidents(false);
  };

  return (
    <div className="page-body">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem' }}>Emergency Incident Operations</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Monitor, triage, and dispatch response units across all logged emergencies
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchIncidents} className="btn btn-outline btn-sm">
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          <Link to="/incidents/new" className="btn btn-danger">
            <PlusCircle size={16} />
            <span>Report Emergency</span>
          </Link>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <form onSubmit={handleSearchSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Search Query
              </label>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="ID, Area, Type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '2.25rem', height: '38px', fontSize: '0.875rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Priority Severity
              </label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                style={{ height: '38px', fontSize: '0.875rem' }}
              >
                <option value="">All Priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Lifecycle Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ height: '38px', fontSize: '0.875rem' }}
              >
                <option value="">All Statuses</option>
                <option value="REPORTED">Reported</option>
                <option value="VERIFIED">Verified</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="HOSPITAL_REACHED">Hospital Reached</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Emergency Category
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{ height: '38px', fontSize: '0.875rem' }}
              >
                <option value="">All Categories</option>
                <option value="Accident">Accident</option>
                <option value="Fire">Fire</option>
                <option value="Medical Emergency">Medical Emergency</option>
                <option value="Cardiac Emergency">Cardiac Emergency</option>
                <option value="Natural Disaster">Natural Disaster</option>
                <option value="Crime">Crime</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, height: '38px' }}>
                <Filter size={15} />
                <span>Filter</span>
              </button>
              <button
                type="button"
                onClick={handleClearFilters}
                className="btn btn-outline"
                style={{ height: '38px', padding: '0 0.75rem' }}
                title="Clear Filters"
              >
                Reset
              </button>
            </div>
          </div>

          {user?.role === 'CITIZEN' && (
            <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                id="onlyMyIncidents"
                checked={onlyMyIncidents}
                onChange={(e) => setOnlyMyIncidents(e.target.checked)}
                style={{ width: 'auto' }}
              />
              <label htmlFor="onlyMyIncidents" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Show only emergencies reported by me
              </label>
            </div>
          )}
        </form>
      </div>

      {/* Incidents Table */}
      <IncidentTable incidents={incidents} loading={loading} />
    </div>
  );
};

export default Incidents;
