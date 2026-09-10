import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { incidentAPI } from '../services/api';
import {
  AlertTriangle, MapPin, Phone, FileText, 
  Send, CheckCircle, Truck, ArrowRight, ShieldAlert
} from 'lucide-react';

const HYDERABAD_PRESETS = [
  { name: 'Kukatpally Housing Board', lat: 17.4849, lon: 78.4138 },
  { name: 'Miyapur Metro Station', lat: 17.4968, lon: 78.3614 },
  { name: 'Gachibowli Cyber Towers', lat: 17.4401, lon: 78.3489 },
  { name: 'Hitech City Mindspace', lat: 17.4474, lon: 78.3762 },
  { name: 'Bachupally Crossroads', lat: 17.5332, lon: 78.3756 },
  { name: 'Secunderabad Junction', lat: 17.4399, lon: 78.4983 },
];

export const CreateIncident = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    emergency_type: 'Medical Emergency',
    priority: 'HIGH',
    location: '',
    latitude: 17.4849,
    longitude: 78.4138,
    description: '',
    caller_phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'latitude' || name === 'longitude' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleApplyPreset = (preset) => {
    setFormData((prev) => ({
      ...prev,
      location: preset.name,
      latitude: preset.lat,
      longitude: preset.lon,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await incidentAPI.createIncident(formData);
      setResult(res.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Failed to dispatch emergency report. Check fields.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-body">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>Report an Emergency</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Instant dispatch telemetry triggers immediate dispatcher notifications and proximity-based fleet routing.
          </p>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.5rem',
              fontSize: '0.9rem',
            }}
          >
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        {result ? (
          /* Confirmation State with Nearest Ambulance */
          <div className="card" style={{ border: '2px solid #10b981', padding: '2rem', textAlign: 'center' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <CheckCircle size={36} />
            </div>

            <h2 style={{ fontSize: '1.5rem', color: '#0f172a' }}>Emergency Dispatched Successfully</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              Incident assigned tracking ticket: <strong style={{ color: '#2563eb' }}>{result.incident.id}</strong>
            </p>

            {result.recommended_ambulances && result.recommended_ambulances.length > 0 && (
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  marginTop: '1.5rem',
                  marginBottom: '1.5rem',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <Truck size={18} color="#2563eb" />
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    Nearest Available Ambulance Recommended:
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ambulance ID</div>
                    <div style={{ fontWeight: 700 }}>{result.recommended_ambulances[0].id}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vehicle Number</div>
                    <div style={{ fontWeight: 700 }}>{result.recommended_ambulances[0].vehicle_number}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Proximity Distance</div>
                    <div style={{ fontWeight: 700, color: '#059669' }}>
                      {result.recommended_ambulances[0].distance_km} km away
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Driver</div>
                    <div style={{ fontWeight: 700 }}>{result.recommended_ambulances[0].driver}</div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link to={`/incidents/${result.incident.id}`} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                <span>Track & Manage Incident</span>
                <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setFormData({
                    emergency_type: 'Medical Emergency',
                    priority: 'HIGH',
                    location: '',
                    latitude: 17.4849,
                    longitude: 78.4138,
                    description: '',
                    caller_phone: '',
                  });
                }}
                className="btn btn-outline"
              >
                Report Another
              </button>
            </div>
          </div>
        ) : (
          /* Input Form */
          <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Emergency Type *
                </label>
                <select
                  name="emergency_type"
                  value={formData.emergency_type}
                  onChange={handleChange}
                  required
                >
                  <option value="Accident">Accident</option>
                  <option value="Fire">Fire</option>
                  <option value="Medical Emergency">Medical Emergency</option>
                  <option value="Cardiac Emergency">Cardiac Emergency</option>
                  <option value="Natural Disaster">Natural Disaster</option>
                  <option value="Crime">Crime</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Severity Priority *
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  style={{
                    fontWeight: 700,
                    color: formData.priority === 'CRITICAL' ? '#dc2626' : formData.priority === 'HIGH' ? '#ea580c' : '#334155',
                  }}
                  required
                >
                  <option value="CRITICAL">CRITICAL (Life Threatening)</option>
                  <option value="HIGH">HIGH (Urgent Attention)</option>
                  <option value="MEDIUM">MEDIUM (Standard Emergency)</option>
                  <option value="LOW">LOW (Non-life threatening)</option>
                </select>
              </div>
            </div>

            {/* Quick Location Presets */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Quick Hyderabad Demonstration Presets:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {HYDERABAD_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.75rem' }}
                  >
                    <MapPin size={11} />
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Incident Location Address / Landmark *
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  name="location"
                  required
                  placeholder="e.g. Near Metro Pillar 142, Kukatpally Main Road"
                  value={formData.location}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  GPS Latitude *
                </label>
                <input
                  type="number"
                  step="0.0001"
                  name="latitude"
                  required
                  value={formData.latitude}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  GPS Longitude *
                </label>
                <input
                  type="number"
                  step="0.0001"
                  name="longitude"
                  required
                  value={formData.longitude}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Caller Contact Phone
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  name="caller_phone"
                  placeholder="+91 98765 43210"
                  value={formData.caller_phone}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Emergency Description & Patient Symptoms *
              </label>
              <textarea
                name="description"
                rows={4}
                required
                placeholder="Describe current status, casualties count, road obstacles, or medical symptoms..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <Link to="/incidents" className="btn btn-outline">
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-danger"
                style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}
              >
                <Send size={16} />
                <span>{loading ? 'Submitting...' : 'Dispatch Emergency'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateIncident;
