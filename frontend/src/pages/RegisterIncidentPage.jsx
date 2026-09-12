import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertCircle, 
  Send, 
  MapPin, 
  Flame, 
  Ambulance, 
  Car, 
  Waves, 
  AlertTriangle,
  Code
} from 'lucide-react';
import apiService from '../services/api';

export default function RegisterIncidentPage({ showToast }) {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    incident_type: 'Fire',
    location: '',
    priority: 'High',
    description: '',
    status: 'Pending'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const incidentTypes = [
    { id: 'Fire', label: 'Fire Emergency', icon: Flame, color: '#ef4444' },
    { id: 'Medical', label: 'Medical Emergency', icon: Ambulance, color: '#10b981' },
    { id: 'Accident', label: 'Traffic Collision', icon: Car, color: '#06b6d4' },
    { id: 'Flood', label: 'Flood / Disaster', icon: Waves, color: '#3b82f6' },
    { id: 'Hazard', label: 'General Hazard', icon: AlertTriangle, color: '#f59e0b' }
  ];

  const priorities = ['Low', 'Medium', 'High', 'Critical'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.location.trim() || !formData.description.trim()) {
      setError('Please provide incident location and description.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // POST request to FastAPI Backend -> PostgreSQL DB
      const response = await apiService.createIncident(formData);
      
      showToast(`Emergency incident #${response.id} registered & stored in PostgreSQL!`, 'success');
      navigate('/incidents');
    } catch (err) {
      console.error('Registration failed:', err);
      setError(err.response?.data?.detail || 'Failed to connect to FastAPI backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Register Emergency Incident</h1>
          <p className="page-subtitle">Submit incident payload directly to FastAPI backend and PostgreSQL database</p>
        </div>
      </div>

      {error && (
        <div className="glass-panel" style={{ padding: '1rem', borderColor: 'var(--primary-red)', color: '#fca5a5', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={20} color="var(--primary-red)" />
          <span>{error}</span>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '2.2rem' }}>
        <form onSubmit={handleSubmit}>
          
          {/* 1. Incident Type Visual Cards */}
          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">Select Incident Type *</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '0.85rem'
            }}>
              {incidentTypes.map((t) => {
                const IconComponent = t.icon;
                const isSelected = formData.incident_type === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setFormData(prev => ({ ...prev, incident_type: t.id }))}
                    style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      background: isSelected ? 'rgba(30, 41, 59, 0.9)' : 'rgba(15, 23, 42, 0.5)',
                      border: `1px solid ${isSelected ? t.color : 'var(--border-color)'}`,
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? `0 0 16px ${t.color}33` : 'none'
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: `${t.color}1a`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 0.6rem'
                    }}>
                      <IconComponent size={22} color={t.color} />
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isSelected ? '#ffffff' : 'var(--text-muted)' }}>
                      {t.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Priority Level Chips */}
          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">Priority Severity Level *</label>
            <div className="priority-chips">
              {priorities.map((p) => (
                <div
                  key={p}
                  className={`priority-chip ${formData.priority === p ? `selected-${p.toLowerCase()}` : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, priority: p }))}
                >
                  {p === 'Critical' ? '🚨 Critical' : p}
                </div>
              ))}
            </div>
          </div>

          {/* 3. Location */}
          <div className="form-group">
            <label className="form-label">Incident Location *</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                name="location"
                className="form-control" 
                placeholder="e.g., Tech Park Gate 4, Sector 62, Main Boulevard"
                value={formData.location}
                onChange={handleChange}
                style={{ paddingLeft: '2.6rem' }}
                required
              />
              <MapPin size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {/* 4. Status */}
          <div className="form-group">
            <label className="form-label">Initial Dispatch Status</label>
            <select 
              name="status" 
              className="form-select"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Pending">Pending Dispatch</option>
              <option value="In Progress">In Progress</option>
            </select>
          </div>

          {/* 5. Description */}
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Emergency Description *</label>
            <textarea 
              name="description"
              className="form-control" 
              placeholder="Describe emergency details, casualties, hazards, or immediate resources required..."
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          {/* Live JSON Payload Preview */}
          <div style={{
            background: 'rgba(10, 15, 26, 0.8)',
            padding: '1rem 1.25rem',
            borderRadius: '10px',
            border: '1px solid var(--border-color)',
            marginBottom: '2rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.78rem'
          }}>
            <div style={{ color: 'var(--accent-cyan)', fontWeight: 700, marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Code size={14} />
              JSON Payload Preview (sent via POST http://localhost:8000/incidents):
            </div>
            <pre style={{ color: 'var(--text-muted)', margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate('/incidents')}
              disabled={loading}
            >
              Cancel
            </button>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
              style={{ minWidth: '220px' }}
            >
              {loading ? (
                <span>Sending to PostgreSQL...</span>
              ) : (
                <>
                  <Send size={17} />
                  Register Emergency
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
