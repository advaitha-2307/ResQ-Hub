import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div className="toast-container">
      <div 
        className="toast"
        style={{
          borderColor: isSuccess ? 'var(--accent-emerald)' : 'var(--primary-red)',
          background: isSuccess ? 'rgba(10, 25, 20, 0.95)' : 'rgba(30, 10, 15, 0.95)'
        }}
      >
        {isSuccess ? (
          <CheckCircle2 size={20} color="var(--accent-emerald)" />
        ) : (
          <AlertCircle size={20} color="var(--primary-red)" />
        )}
        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{message}</span>
        <button 
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: '0.5rem' }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
