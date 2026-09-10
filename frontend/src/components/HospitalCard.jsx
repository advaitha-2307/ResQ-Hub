import React from 'react';
import { Building2, Bed, Phone, MapPin, Activity, Award, Navigation } from 'lucide-react';

const STATUS_STYLE = {
  AVAILABLE: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
  LIMITED: { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  FULL: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
};

export const HospitalCard = ({ hospital, onAssign, onUpdateCapacity, isRecommendation = false }) => {
  const statusStyle = STATUS_STYLE[hospital.status] || STATUS_STYLE.AVAILABLE;
  const occupancyRatio = hospital.total_beds
    ? Math.min(100, Math.round(((hospital.total_beds - hospital.available_beds) / hospital.total_beds) * 100))
    : 0;

  return (
    <div
      className="card card-hover"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        border: isRecommendation ? '2px solid #0891b2' : '1px solid var(--border-color)',
        position: 'relative',
      }}
    >
      {isRecommendation && (
        <div
          style={{
            position: 'absolute',
            top: '-10px',
            right: '16px',
            backgroundColor: '#0891b2',
            color: '#ffffff',
            fontSize: '0.7rem',
            fontWeight: 800,
            padding: '0.15rem 0.5rem',
            borderRadius: '999px',
            letterSpacing: '0.04em',
            boxShadow: '0 2px 5px rgba(8, 145, 178, 0.4)',
          }}
        >
          {hospital.match_score ? `MATCH SCORE: ${hospital.match_score}` : 'OPTIMAL CHOICE'}
        </div>
      )}

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {hospital.name}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
              <MapPin size={12} />
              <span>{hospital.location}</span>
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
            {hospital.status}
          </span>
        </div>

        {/* Distance if computed */}
        {hospital.distance_km !== undefined && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginBottom: '0.75rem',
              color: '#0891b2',
              fontWeight: 700,
              fontSize: '0.85rem',
              backgroundColor: '#ecfeff',
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <Navigation size={14} />
            <span>{hospital.distance_km} km away</span>
          </div>
        )}

        {/* Capacity bar */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '0.35rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Bed Occupancy</span>
            <span style={{ fontWeight: 700, color: occupancyRatio > 85 ? '#dc2626' : '#059669' }}>
              {occupancyRatio}% Occupied
            </span>
          </div>
          <div style={{ height: '8px', backgroundColor: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${occupancyRatio}%`,
                backgroundColor: occupancyRatio > 85 ? '#ef4444' : occupancyRatio > 60 ? '#f59e0b' : '#10b981',
                borderRadius: '999px',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
        </div>

        {/* Metrics Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem',
            backgroundColor: '#f8fafc',
            padding: '0.75rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1rem',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Available
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: hospital.available_beds > 0 ? '#059669' : '#dc2626' }}>
              {hospital.available_beds}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              ICU Beds
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#2563eb' }}>
              {hospital.icu_beds}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Capacity
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginTop: '0.2rem' }}>
              {hospital.emergency_capacity || 'MED'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        {onAssign && hospital.available_beds > 0 && hospital.status !== 'FULL' && (
          <button
            onClick={() => onAssign(hospital)}
            className="btn btn-primary"
            style={{ width: '100%', fontSize: '0.875rem', backgroundColor: '#0891b2' }}
          >
            <Building2 size={15} />
            <span>SELECT DESTINATION</span>
          </button>
        )}
        {onUpdateCapacity && (
          <button
            onClick={() => onUpdateCapacity(hospital)}
            className="btn btn-outline"
            style={{ width: onAssign ? 'auto' : '100%', fontSize: '0.875rem' }}
          >
            Update Capacity
          </button>
        )}
      </div>
    </div>
  );
};

export default HospitalCard;
