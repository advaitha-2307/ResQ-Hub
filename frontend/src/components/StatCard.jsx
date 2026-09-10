import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle, badge }) => {
  const colorMap = {
    blue: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
    red: { bg: '#fef2f2', text: '#ef4444', border: '#fecaca' },
    orange: { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' },
    green: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
    purple: { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe' },
    cyan: { bg: '#ecfeff', text: '#0891b2', border: '#a5f3fc' },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem 1.5rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            {title}
          </span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.25rem', lineHeight: 1.1 }}>
            {value}
          </div>
        </div>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: c.bg,
            color: c.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `1px solid ${c.border}`,
          }}
        >
          {Icon && <Icon size={22} />}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.825rem' }}>
        {subtitle && (
          <span style={{ color: 'var(--text-muted)' }}>
            {subtitle}
          </span>
        )}
        {badge && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.15rem 0.5rem',
              borderRadius: '999px',
              backgroundColor: c.bg,
              color: c.text,
            }}
          >
            {badge}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
