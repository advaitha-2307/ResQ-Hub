import React, { useState, useEffect } from 'react';
import { ambulanceAPI } from '../services/api';
import AmbulanceCard from '../components/AmbulanceCard';
import { useAuth } from '../context/AuthContext';
import { Truck, Plus, RefreshCw, Filter, X, CheckCircle2 } from 'lucide-react';

export const Ambulances = () => {
  const { user } = useAuth();
  const [ambulances, setAmbulances] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingAmbulance, setEditingAmbulance] = useState(null);
  const [formData, setFormData] = useState({
    vehicle_number: '',
    driver: '',
    status: 'AVAILABLE',
    latitude: 17.485,
    longitude: 78.414,
    phone: '',
    base_location: 'Central Base',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAmbulances = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await ambulanceAPI.getAmbulances(params);
      setAmbulances(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmbulances();

    const handleWs = () => {
      fetchAmbulances();
    };
    window.addEventListener('resq_ws_event', handleWs);
    return () => window.removeEventListener('resq_ws_event', handleWs);
  }, [statusFilter]);

  const handleOpenAdd = () => {
    setEditingAmbulance(null);
    setFormData({
      vehicle_number: 'TS 09 EQ ' + Math.floor(1000 + Math.random() * 9000),
      driver: '',
      status: 'AVAILABLE',
      latitude: 17.485,
      longitude: 78.414,
      phone: '+91 98765 00000',
      base_location: 'Kukatpally Base Station',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (amb) => {
    setEditingAmbulance(amb);
    setFormData({
      vehicle_number: amb.vehicle_number,
      driver: amb.driver,
      status: amb.status,
      latitude: amb.latitude,
      longitude: amb.longitude,
      phone: amb.phone || '',
      base_location: amb.base_location || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingAmbulance) {
        await ambulanceAPI.updateAmbulance(editingAmbulance.id, formData);
      } else {
        await ambulanceAPI.createAmbulance(formData);
      }
      setShowModal(false);
      fetchAmbulances();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save ambulance data');
    } finally {
      setSubmitting(false);
    }
  };

  const canManage = ['ADMIN', 'DISPATCHER'].includes(user?.role);

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem' }}>Emergency Fleet Operations</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Monitor real-time GPS locations, driver status, and field unit readiness
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchAmbulances} className="btn btn-outline btn-sm">
            <RefreshCw size={14} />
            <span>Sync</span>
          </button>
          {canManage && (
            <button onClick={handleOpenAdd} className="btn btn-primary">
              <Plus size={16} />
              <span>Add Ambulance</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['', 'AVAILABLE', 'ASSIGNED', 'BUSY', 'MAINTENANCE'].map((statusKey) => (
          <button
            key={statusKey}
            onClick={() => setStatusFilter(statusKey)}
            className={`btn btn-sm ${statusFilter === statusKey ? 'btn-primary' : 'btn-outline'}`}
          >
            {statusKey === '' ? 'All Units' : statusKey}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Syncing ambulance telemetry...
        </div>
      ) : ambulances.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          No ambulances found for selected filter.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {ambulances.map((amb) => (
            <AmbulanceCard
              key={amb.id}
              ambulance={amb}
              onEdit={canManage ? handleOpenEdit : null}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>
                {editingAmbulance ? `Update ${editingAmbulance.id}` : 'Deploy New Ambulance Unit'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Vehicle Plate Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="TS 09 EQ 1234"
                  value={formData.vehicle_number}
                  onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Driver Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Suresh Kumar"
                  value={formData.driver}
                  onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Operational Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="BUSY">BUSY</option>
                    <option value="MAINTENANCE">MAINTENANCE</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Driver Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Base Location Station
                </label>
                <input
                  type="text"
                  value={formData.base_location}
                  onChange={(e) => setFormData({ ...formData, base_location: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving...' : 'Save Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ambulances;
