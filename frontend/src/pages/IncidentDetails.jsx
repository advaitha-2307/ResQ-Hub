import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { incidentAPI } from '../services/api';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import AmbulanceCard from '../components/AmbulanceCard';
import HospitalCard from '../components/HospitalCard';
import {
  MapPin, Clock, Truck, Building2, User, Phone, 
  CheckCircle, ArrowLeft, RefreshCw, AlertCircle, X, ShieldAlert
} from 'lucide-react';

export const IncidentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [showAmbulanceModal, setShowAmbulanceModal] = useState(false);
  const [showHospitalModal, setShowHospitalModal] = useState(false);
  const [recommendedAmbulances, setRecommendedAmbulances] = useState([]);
  const [recommendedHospitals, setRecommendedHospitals] = useState([]);
  const [assignLoading, setAssignLoading] = useState(false);

  // Status update
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);

  const fetchIncidentData = async () => {
    try {
      const res = await incidentAPI.getIncident(id);
      setIncident(res.data);
      setNewStatus(res.data.status);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load incident details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidentData();

    const handleWs = (event) => {
      const data = event.detail;
      if (
        (data.incident_id === id) ||
        (data.incident && data.incident.id === id)
      ) {
        fetchIncidentData();
      }
    };
    window.addEventListener('resq_ws_event', handleWs);
    return () => window.removeEventListener('resq_ws_event', handleWs);
  }, [id]);

  const handleOpenAmbulanceModal = async () => {
    setShowAmbulanceModal(true);
    try {
      const res = await incidentAPI.getRecommendedAmbulances(id);
      setRecommendedAmbulances(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenHospitalModal = async () => {
    setShowHospitalModal(true);
    try {
      const res = await incidentAPI.getRecommendedHospitals(id);
      setRecommendedHospitals(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignAmbulance = async (ambulance) => {
    setAssignLoading(true);
    try {
      await incidentAPI.assignAmbulance(id, ambulance.id);
      setShowAmbulanceModal(false);
      fetchIncidentData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to assign ambulance');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleAssignHospital = async (hospital) => {
    setAssignLoading(true);
    try {
      await incidentAPI.assignHospital(id, hospital.id);
      setShowHospitalModal(false);
      fetchIncidentData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to assign hospital');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setAssignLoading(true);
    try {
      await incidentAPI.updateIncident(id, {
        status: newStatus,
        notes: statusNotes,
      });
      setShowStatusModal(false);
      setStatusNotes('');
      fetchIncidentData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update status');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleQuickResolve = async () => {
    if (!window.confirm('Mark this incident as RESOLVED? Assigned resources will be freed.')) return;
    try {
      await incidentAPI.updateIncident(id, {
        status: 'RESOLVED',
        notes: 'Marked resolved by operator.',
      });
      fetchIncidentData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to resolve incident');
    }
  };

  if (loading) {
    return (
      <div className="page-body" style={{ textAlign: 'center', padding: '4rem' }}>
        Loading incident telemetry...
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="page-body">
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <AlertCircle size={40} color="#dc2626" style={{ margin: '0 auto 1rem auto' }} />
          <h2>Incident Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error || 'The requested incident could not be found.'}</p>
          <Link to="/incidents" className="btn btn-primary">
            Return to Incidents
          </Link>
        </div>
      </div>
    );
  }

  const canDispatch = ['ADMIN', 'DISPATCHER'].includes(user?.role);
  const canUpdateStatus = ['ADMIN', 'DISPATCHER', 'HOSPITAL_STAFF'].includes(user?.role);

  return (
    <div className="page-body">
      {/* Back button & Title Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/incidents" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Emergencies Queue</span>
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontFamily: 'monospace' }}>{incident.id}</h1>
            <PriorityBadge priority={incident.priority} />
            <StatusBadge status={incident.status} />
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={fetchIncidentData} className="btn btn-outline btn-sm" title="Refresh">
              <RefreshCw size={14} />
            </button>

            {canDispatch && incident.status !== 'RESOLVED' && (
              <>
                <button onClick={handleOpenAmbulanceModal} className="btn btn-primary btn-sm">
                  <Truck size={14} />
                  <span>{incident.assigned_ambulance_id ? 'Reassign Ambulance' : 'Assign Ambulance'}</span>
                </button>
                <button onClick={handleOpenHospitalModal} className="btn btn-outline btn-sm" style={{ borderColor: '#0891b2', color: '#0891b2' }}>
                  <Building2 size={14} />
                  <span>{incident.assigned_hospital_name ? 'Reassign Hospital' : 'Assign Hospital'}</span>
                </button>
              </>
            )}

            {canUpdateStatus && incident.status !== 'RESOLVED' && (
              <button onClick={() => setShowStatusModal(true)} className="btn btn-outline btn-sm">
                Update Status
              </button>
            )}

            {canUpdateStatus && incident.status !== 'RESOLVED' && (
              <button onClick={handleQuickResolve} className="btn btn-primary btn-sm" style={{ backgroundColor: '#10b981' }}>
                <CheckCircle size={14} />
                <span>Resolve</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Core details card */}
        <div className="card">
          <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Incident Overview
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Emergency Type</span>
              <div style={{ fontSize: '1rem', fontWeight: 700 }}>{incident.emergency_type}</div>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Location</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                <MapPin size={16} color="#ef4444" />
                <span>{incident.location}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontFamily: 'monospace' }}>
                Coordinates: {incident.latitude}, {incident.longitude}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Description / Symptoms</span>
              <p style={{ fontSize: '0.9rem', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginTop: '0.25rem' }}>
                {incident.description}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reported By</span>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{incident.reported_by_name || 'Anonymous'}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Caller Phone</span>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{incident.caller_phone || 'N/A'}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Logged At</span>
                <div style={{ fontSize: '0.85rem' }}>{new Date(incident.created_at).toLocaleString()}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Response Time</span>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#059669' }}>
                  {incident.response_time_minutes ? `${incident.response_time_minutes} mins` : 'Active dispatch'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Units Card */}
        <div className="card">
          <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Resource Allocations
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Ambulance Info */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                  <Truck size={18} color="#8b5cf6" />
                  <span>Assigned Ambulance Unit</span>
                </div>
                {canDispatch && incident.status !== 'RESOLVED' && (
                  <button onClick={handleOpenAmbulanceModal} style={{ background: 'none', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}>
                    Change
                  </button>
                )}
              </div>

              {incident.assigned_ambulance_id ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Unit ID:</span>
                    <div style={{ fontWeight: 700 }}>{incident.assigned_ambulance_id}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Plate:</span>
                    <div style={{ fontWeight: 700 }}>{incident.assigned_ambulance_vehicle}</div>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Driver in charge:</span>
                    <div style={{ fontWeight: 600 }}>{incident.assigned_ambulance_driver}</div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '0.75rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No ambulance assigned yet.
                </div>
              )}
            </div>

            {/* Hospital Info */}
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem', backgroundColor: '#f8fafc' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}>
                  <Building2 size={18} color="#0891b2" />
                  <span>Assigned Destination Hospital</span>
                </div>
                {canDispatch && incident.status !== 'RESOLVED' && (
                  <button onClick={handleOpenHospitalModal} style={{ background: 'none', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600 }}>
                    Change
                  </button>
                )}
              </div>

              {incident.assigned_hospital_name ? (
                <div style={{ fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Hospital Facility:</span>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{incident.assigned_hospital_name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Tracking ID: {incident.assigned_hospital_id}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '0.75rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No destination hospital assigned yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Response Timeline */}
      <div className="card">
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          Response Lifecycle Activity Log
        </h2>

        <div style={{ position: 'relative', paddingLeft: '2rem' }}>
          {/* Vertical line */}
          <div
            style={{
              position: 'absolute',
              left: '9px',
              top: '8px',
              bottom: '8px',
              width: '2px',
              backgroundColor: '#e2e8f0',
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {incident.timeline && incident.timeline.map((step, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                {/* Bullet */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-2rem',
                    top: '3px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: idx === incident.timeline.length - 1 ? '#2563eb' : '#94a3b8',
                    border: '3px solid #ffffff',
                    boxShadow: '0 0 0 1px #cbd5e1',
                  }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>
                      {step.title}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={12} />
                      {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {step.updated_by && (
                      <span style={{ fontSize: '0.75rem', color: '#475569', backgroundColor: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                        by {step.updated_by}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ambulance Modal */}
      {showAmbulanceModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '750px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem' }}>Dispatch Nearest Ambulance</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Ranked by proximity to incident GPS coordinates ({incident.latitude}, {incident.longitude})
                </p>
              </div>
              <button onClick={() => setShowAmbulanceModal(false)} style={{ background: 'none' }}>
                <X size={20} />
              </button>
            </div>

            {recommendedAmbulances.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No available ambulances currently in service.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                {recommendedAmbulances.map((amb, index) => (
                  <AmbulanceCard
                    key={amb.id}
                    ambulance={amb}
                    isRecommendation={index === 0}
                    onAssign={handleAssignAmbulance}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hospital Modal */}
      {showHospitalModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '750px', width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem' }}>Allocate Destination Hospital</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Scored dynamically by distance, bed capacity, and emergency readiness
                </p>
              </div>
              <button onClick={() => setShowHospitalModal(false)} style={{ background: 'none' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {recommendedHospitals.map((hosp, index) => (
                <HospitalCard
                  key={hosp.id}
                  hospital={hosp}
                  isRecommendation={index === 0}
                  onAssign={handleAssignHospital}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '450px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Update Incident Lifecycle</h3>
              <button onClick={() => setShowStatusModal(false)} style={{ background: 'none' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Target Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  required
                >
                  <option value="REPORTED">Reported</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="HOSPITAL_REACHED">Hospital Reached</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Operational Notes / Update Log
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Paramedics reached scene, vitals stabilized..."
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setShowStatusModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={assignLoading} className="btn btn-primary">
                  {assignLoading ? 'Saving...' : 'Confirm Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentDetails;
