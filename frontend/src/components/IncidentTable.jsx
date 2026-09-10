import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { ExternalLink, Truck, Building2, MapPin, Clock } from 'lucide-react';

export const IncidentTable = ({ incidents, loading, emptyMessage = 'No incidents recorded.' }) => {
  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading incident records...
      </div>
    );
  }

  if (!incidents || incidents.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Incident ID</th>
            <th>Type</th>
            <th>Location</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Assigned Unit</th>
            <th>Hospital</th>
            <th>Reported Time</th>
            <th style={{ textAlign: 'right' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((inc) => (
            <tr key={inc.id}>
              <td style={{ fontWeight: 700, fontFamily: 'monospace', color: '#1e293b' }}>
                <Link to={`/incidents/${inc.id}`} style={{ color: 'var(--primary)', textDecoration: 'underline' }}>
                  {inc.id}
                </Link>
              </td>
              <td>
                <span style={{ fontWeight: 600 }}>{inc.emergency_type}</span>
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                  <MapPin size={14} color="#64748b" />
                  <span>{inc.location}</span>
                </div>
              </td>
              <td>
                <PriorityBadge priority={inc.priority} />
              </td>
              <td>
                <StatusBadge status={inc.status} />
              </td>
              <td>
                {inc.assigned_ambulance_id ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                    <Truck size={14} color="#8b5cf6" />
                    <span>{inc.assigned_ambulance_id}</span>
                  </div>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                )}
              </td>
              <td>
                {inc.assigned_hospital_name ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                    <Building2 size={14} color="#0891b2" />
                    <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {inc.assigned_hospital_name}
                    </span>
                  </div>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                )}
              </td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                  <Clock size={13} />
                  <span>
                    {new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </td>
              <td style={{ textAlign: 'right' }}>
                <Link
                  to={`/incidents/${inc.id}`}
                  className="btn btn-outline btn-sm"
                  style={{ gap: '0.25rem' }}
                >
                  <span>Manage</span>
                  <ExternalLink size={13} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IncidentTable;
