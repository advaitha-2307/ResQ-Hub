import React from 'react';
import { Truck, Phone, MapPin, User, Navigation } from 'lucide-react';

const STATUS_STYLE = {
  AVAILABLE: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
  ASSIGNED: { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe' },
  BUSY: { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  MAINTENANCE: { bg: '#f1f5f9', text: '#64748b', border: '#cbd5e1' },
};

export const AmbulanceCard = ({ ambulance, onAssign, onEdit, isRecommendation = false }) => {
  const statusStyle = STATUS_STYLE[ambulance.status] || STATUS_STYLE.AVAILABLE;

  return (
    <div
      className="card card-hover"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        border: isRecommendation ? '2px solid #2563eb' : '1px solid var(--border-color)',
        position: 'relative',
      }}
    >
      {isRecommendation && (
        <div
          style={{
            position: 'absolute',
            top: '-10px',
            right: '16px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            fontSize: '0.7rem',
            fontWeight: 800,
            padding: '0.15rem 0.5rem',
            borderRadius: '999px',
            letterSpacing: '0.04em',
            boxShadow: '0 2px 5px rgba(37, 99, 235, 0.4)',
          }}
        >
          RECOMMENDED UNIT
        </div>
      )}

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {ambulance.id}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                }}
              >
                {ambulance.vehicle_number}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
              <MapPin size={12} />
              <span>{ambulance.base_location || 'Base Station'}</span>
            </div>
          </div>

          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              backgroundColor: statusStyle.bg,
              color: statusStyle.text,
              border: `1px solid ${statusStyle.border}`,
            }}
          >
            {ambulance.status}
          </span>
        </div>

        <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
              <User size={14} color="#64748b" />
              <span>Driver:</span>
            </div>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ambulance.driver}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
              <Phone size={14} color="#64748b" />
              <span>Contact:</span>
            </div>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ambulance.phone || 'N/A'}</span>
          </div>
        </div>

        {ambulance.distance_km !== undefined && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginBottom: '1rem',
              color: '#2563eb',
              fontWeight: 700,
              fontSize: '0.9rem',
              backgroundColor: '#eff6ff',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <Navigation size={15} />
            <span>Estimated Distance: {ambulance.distance_km} km</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        {onAssign && ambulance.status === 'AVAILABLE' && (
          <button
            onClick={() => onAssign(ambulance)}
            className="btn btn-primary"
            style={{ width: '100%', fontSize: '0.875rem' }}
          >
            <Truck size={15} />
            <span>ASSIGN UNIT</span>
          </button>
        )}
        {onEdit && (
          <button
            onClick={() => onEdit(ambulance)}
            className="btn btn-outline"
            style={{ width: onAssign ? 'auto' : '100%', fontSize: '0.875rem' }}
          >
            Update
          </button>
        )}
      </div>
    </div>
  );
};

export default AmbulanceCard;
