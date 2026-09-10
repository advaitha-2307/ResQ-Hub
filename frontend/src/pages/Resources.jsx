import React, { useState, useEffect } from 'react';
import { resourceAPI, hospitalAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Package, Plus, RefreshCw, AlertTriangle, CheckCircle, 
  Clock, Edit3, X 
} from 'lucide-react';

const CATEGORIES = [
  'Medical Supplies',
  'Oxygen',
  'Blood Units',
  'Emergency Kits',
  'Ventilators',
  'First Aid Kits',
];

export const Resources = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Edit / Add Modal state
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Oxygen',
    quantity: 10,
    unit: 'Cylinders',
    hospital_id: '',
    hospital_name: '',
    status: 'ADEQUATE',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = {};
      if (categoryFilter) params.category = categoryFilter;
      const [resRes, hospRes] = await Promise.all([
        resourceAPI.getResources(params),
        hospitalAPI.getHospitals(),
      ]);
      setResources(resRes.data);
      setHospitals(hospRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();

    const handleWs = () => {
      fetchResources();
    };
    window.addEventListener('resq_ws_event', handleWs);
    return () => window.removeEventListener('resq_ws_event', handleWs);
  }, [categoryFilter]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setSelectedResource(null);
    setFormData({
      name: '',
      category: 'Oxygen',
      quantity: 25,
      unit: 'Cylinders',
      hospital_id: hospitals[0]?.id || 'HOSP-201',
      hospital_name: hospitals[0]?.name || 'Apollo Emergency',
      status: 'ADEQUATE',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (res) => {
    setIsEditing(true);
    setSelectedResource(res);
    setFormData({
      name: res.name,
      category: res.category,
      quantity: res.quantity,
      unit: res.unit,
      hospital_id: res.hospital_id,
      hospital_name: res.hospital_name,
      status: res.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing && selectedResource) {
        await resourceAPI.updateResource(selectedResource.id, {
          quantity: formData.quantity,
          status: formData.status,
        });
      } else {
        await resourceAPI.createResource(formData);
      }
      setShowModal(false);
      fetchResources();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save resource entry');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'CRITICAL_LOW') {
      return (
        <span className="badge badge-priority-critical">
          <AlertTriangle size={12} /> CRITICAL LOW
        </span>
      );
    }
    if (status === 'LOW') {
      return (
        <span className="badge badge-priority-high">
          <AlertTriangle size={12} /> LOW STOCK
        </span>
      );
    }
    return (
      <span className="badge badge-priority-low">
        <CheckCircle size={12} /> ADEQUATE
      </span>
    );
  };

  const canManage = ['ADMIN', 'HOSPITAL_STAFF'].includes(user?.role);

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem' }}>Medical & Trauma Resources</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Coordinate ventilators, blood banks, oxygen cylinders, and resuscitation kits
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchResources} className="btn btn-outline btn-sm">
            <RefreshCw size={14} />
            <span>Sync</span>
          </button>
          {canManage && (
            <button onClick={handleOpenAdd} className="btn btn-primary">
              <Plus size={16} />
              <span>Add Resource</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setCategoryFilter('')}
          className={`btn btn-sm ${categoryFilter === '' ? 'btn-primary' : 'btn-outline'}`}
        >
          All Categories
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`btn btn-sm ${categoryFilter === cat ? 'btn-primary' : 'btn-outline'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading resource inventory...
        </div>
      ) : resources.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          No resources found matching filter.
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Resource Item</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Hospital Facility</th>
                <th>Stock Level</th>
                <th>Last Synchronized</th>
                {canManage && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {resources.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 700 }}>{item.name}</td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.category}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: item.quantity <= 5 ? '#dc2626' : '#0f172a' }}>
                      {item.quantity}
                    </span>{' '}
                    <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{item.unit}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{item.hospital_name}</td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      <Clock size={12} />
                      <span>{new Date(item.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                  {canManage && (
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="btn btn-outline btn-sm"
                        style={{ gap: '0.25rem' }}
                      >
                        <Edit3 size={13} />
                        <span>Update</span>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>
                {isEditing ? `Update ${formData.name}` : 'Add Medical Resource'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {!isEditing && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Resource Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. O-Negative Blood Units"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                        Unit Measure
                      </label>
                      <input
                        type="text"
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Hospital Facility *
                    </label>
                    <select
                      value={formData.hospital_id}
                      onChange={(e) => {
                        const hosp = hospitals.find((h) => h.id === e.target.value);
                        setFormData({
                          ...formData,
                          hospital_id: e.target.value,
                          hospital_name: hosp?.name || '',
                        });
                      }}
                    >
                      {hospitals.map((h) => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Available Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>

              {isEditing && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Stock Level Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="ADEQUATE">ADEQUATE</option>
                    <option value="LOW">LOW</option>
                    <option value="CRITICAL_LOW">CRITICAL_LOW</option>
                  </select>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;
