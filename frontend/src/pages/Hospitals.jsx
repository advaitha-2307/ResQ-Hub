import React, { useState, useEffect } from 'react';
import { hospitalAPI } from '../services/api';
import HospitalCard from '../components/HospitalCard';
import { useAuth } from '../context/AuthContext';
import { Building2, Plus, RefreshCw, X, Bed, Activity } from 'lucide-react';

export const Hospitals = () => {
  const { user } = useAuth();
  const [hospitals, setHospitals] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Capacity Modal state
  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [capacityData, setCapacityData] = useState({
    available_beds: 0,
    icu_beds: 0,
    emergency_capacity: 'HIGH',
    status: 'AVAILABLE',
  });
  const [submitting, setSubmitting] = useState(false);

  // Add Hospital Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: '',
    location: '',
    available_beds: 20,
    icu_beds: 6,
    total_beds: 100,
    emergency_capacity: 'HIGH',
    status: 'AVAILABLE',
    latitude: 17.44,
    longitude: 78.38,
    contact_number: '+91 40 2345 6789',
    medical_resources: ['Oxygen', 'ICU Ventilators', 'Trauma Ward'],
  });

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await hospitalAPI.getHospitals(params);
      setHospitals(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();

    const handleWs = () => {
      fetchHospitals();
    };
    window.addEventListener('resq_ws_event', handleWs);
    return () => window.removeEventListener('resq_ws_event', handleWs);
  }, [statusFilter]);

  const handleOpenCapacity = (hosp) => {
    setSelectedHospital(hosp);
    setCapacityData({
      available_beds: hosp.available_beds,
      icu_beds: hosp.icu_beds,
      emergency_capacity: hosp.emergency_capacity,
      status: hosp.status,
    });
    setShowCapacityModal(true);
  };

  const handleUpdateCapacitySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await hospitalAPI.updateCapacity(selectedHospital.id, capacityData);
      setShowCapacityModal(false);
      fetchHospitals();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update hospital capacity');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await hospitalAPI.createHospital(addFormData);
      setShowAddModal(false);
      fetchHospitals();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to register hospital');
    } finally {
      setSubmitting(false);
    }
  };

  const canEditCapacity = ['ADMIN', 'HOSPITAL_STAFF'].includes(user?.role);
  const canAddHospital = user?.role === 'ADMIN';

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem' }}>Hospital Emergency Network</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Live emergency beds, ICU telemetry, and casualty intake readiness
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchHospitals} className="btn btn-outline btn-sm">
            <RefreshCw size={14} />
            <span>Sync</span>
          </button>
          {canAddHospital && (
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
              <Plus size={16} />
              <span>Register Hospital</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['', 'AVAILABLE', 'LIMITED', 'FULL'].map((statusKey) => (
          <button
            key={statusKey}
            onClick={() => setStatusFilter(statusKey)}
            className={`btn btn-sm ${statusFilter === statusKey ? 'btn-primary' : 'btn-outline'}`}
          >
            {statusKey === '' ? 'All Network Hospitals' : statusKey}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading hospital bed occupancy data...
        </div>
      ) : hospitals.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          No hospitals found matching filter.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {hospitals.map((hosp) => (
            <HospitalCard
              key={hosp.id}
              hospital={hosp}
              onUpdateCapacity={canEditCapacity ? handleOpenCapacity : null}
            />
          ))}
        </div>
      )}

      {/* Update Capacity Modal */}
      {showCapacityModal && selectedHospital && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '460px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem' }}>Update Bed Capacity</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedHospital.name}</p>
              </div>
              <button onClick={() => setShowCapacityModal(false)} style={{ background: 'none' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateCapacitySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Available Beds *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={capacityData.available_beds}
                    onChange={(e) => setCapacityData({ ...capacityData, available_beds: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    ICU Beds Available *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={capacityData.icu_beds}
                    onChange={(e) => setCapacityData({ ...capacityData, icu_beds: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Emergency Intake Status
                </label>
                <select
                  value={capacityData.status}
                  onChange={(e) => setCapacityData({ ...capacityData, status: e.target.value })}
                >
                  <option value="AVAILABLE">AVAILABLE (Normal Intake)</option>
                  <option value="LIMITED">LIMITED (Near Capacity)</option>
                  <option value="FULL">FULL (Diversion Active)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Emergency Capacity Level
                </label>
                <select
                  value={capacityData.emergency_capacity}
                  onChange={(e) => setCapacityData({ ...capacityData, emergency_capacity: e.target.value })}
                >
                  <option value="HIGH">HIGH (Full Staff & Resuscitation bays)</option>
                  <option value="MEDIUM">MEDIUM (Standard Intake)</option>
                  <option value="LOW">LOW (Restricted triage only)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowCapacityModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Updating...' : 'Publish Bed Telemetry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Hospital Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '520px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Register Network Hospital</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Hospital Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apollo Health City Emergency"
                  value={addFormData.name}
                  onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Location / Area *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jubilee Hills, Hyderabad"
                  value={addFormData.location}
                  onChange={(e) => setAddFormData({ ...addFormData, location: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Available Beds
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={addFormData.available_beds}
                    onChange={(e) => setAddFormData({ ...addFormData, available_beds: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    ICU Beds
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={addFormData.icu_beds}
                    onChange={(e) => setAddFormData({ ...addFormData, icu_beds: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Total Beds
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={addFormData.total_beds}
                    onChange={(e) => setAddFormData({ ...addFormData, total_beds: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={addFormData.latitude}
                    onChange={(e) => setAddFormData({ ...addFormData, latitude: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={addFormData.longitude}
                    onChange={(e) => setAddFormData({ ...addFormData, longitude: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Registering...' : 'Register Hospital'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hospitals;
