import React, { useState, useEffect } from 'react';
import { 
  Search, 
  RefreshCw, 
  Trash2, 
  Eye, 
  X,
  Database
} from 'lucide-react';
import apiService from '../services/api';

export default function IncidentListPage({ showToast }) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected incident details modal
  const [selectedIncident, setSelectedIncident] = useState(null);

  const fetchIncidents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getIncidents({
        status: statusFilter,
        priority: priorityFilter
      });
      setIncidents(data);
    } catch (err) {
      setError('Failed to fetch emergency incidents from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [statusFilter, priorityFilter]);

  // Status update
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await apiService.updateIncident(id, { status: newStatus });
      showToast(`Incident #${id} status updated to '${newStatus}'!`, 'success');
      fetchIncidents();
      if (selectedIncident && selectedIncident.id === id) {
        setSelectedIncident(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      showToast(`Failed to update status.`, 'error');
    }
  };

  // Incident deletion
  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete Emergency Incident #${id} from PostgreSQL database?`)) {
      return;
    }
    try {
      await apiService.deleteIncident(id);
      showToast(`Incident #${id} permanently removed from database!`, 'success');
      fetchIncidents();
      if (selectedIncident && selectedIncident.id === id) {
        setSelectedIncident(null);
      }
    } catch (err) {
      showToast(`Failed to delete incident #${id}.`, 'error');
    }
  };

  // Search filtering
  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch = 
      inc.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.incident_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.id.toString().includes(searchTerm);
    return matchesSearch;
  });

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Emergency Incident Registry</h1>
          <p className="page-subtitle">Interactive database records fetched via GET /incidents REST API</p>
        </div>
        <button onClick={fetchIncidents} className="btn btn-secondary" disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          Sync Database
        </button>
      </div>

      {error && (
        <div className="glass-panel" style={{ padding: '1rem', borderColor: 'var(--primary-red)', color: '#fca5a5', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search by ID, type, location or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.6rem' }}
            />
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <div>
            <select 
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <select 
              className="form-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
            Loading records from database...
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
            No emergency records found matching search filters.
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
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncidents.map((inc) => (
                  <tr key={inc.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      #{inc.id}
                    </td>
                    <td style={{ fontWeight: 700 }}>{inc.incident_type}</td>
                    <td style={{ color: 'var(--text-muted)', maxWidth: '180px' }} className="text-truncate">
                      {inc.location}
                    </td>
                    <td>
                      <span className={`badge badge-${inc.priority.toLowerCase()}`}>
                        {inc.priority}
                      </span>
                    </td>
                    <td>
                      <select
                        className="form-select"
                        value={inc.status}
                        onChange={(e) => handleStatusUpdate(inc.id, e.target.value)}
                        style={{ 
                          padding: '0.3rem 0.6rem', 
                          fontSize: '0.8rem', 
                          fontWeight: 700,
                          width: 'auto'
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td style={{ color: 'var(--text-muted)', maxWidth: '240px' }} className="text-truncate">
                      {inc.description}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button 
                          onClick={() => setSelectedIncident(inc)}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem' }}
                          title="View Incident Details"
                        >
                          <Eye size={14} />
                          View
                        </button>
                        <button 
                          onClick={() => handleDelete(inc.id)}
                          className="btn btn-danger"
                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem' }}
                          title="Delete Record"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '620px', padding: '2.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <span className={`badge badge-${selectedIncident.priority.toLowerCase()}`} style={{ marginBottom: '0.4rem' }}>
                  Incident #{selectedIncident.id} • {selectedIncident.priority} Priority
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{selectedIncident.incident_type} Emergency</h2>
              </div>
              <button 
                onClick={() => setSelectedIncident(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <span className="form-label">Location</span>
                <p style={{ fontWeight: 600 }}>{selectedIncident.location}</p>
              </div>
              <div>
                <span className="form-label">Status</span>
                <p><span className={`badge badge-${selectedIncident.status.toLowerCase().replace(' ', '-')}`}>{selectedIncident.status}</span></p>
              </div>
              <div>
                <span className="form-label">Created At</span>
                <p style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {new Date(selectedIncident.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="form-label">Database Primary Key</span>
                <p style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                  id = {selectedIncident.id}
                </p>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <span className="form-label">Description</span>
              <div style={{ background: 'rgba(10, 15, 26, 0.7)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}>
                {selectedIncident.description}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                FastAPI: <code>GET /incidents/{selectedIncident.id}</code>
              </span>
              <button 
                onClick={() => handleDelete(selectedIncident.id)}
                className="btn btn-danger"
              >
                <Trash2 size={16} />
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
