import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, KeyRound, User, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin({ username, role: 'System Administrator' });
      navigate('/dashboard');
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <ShieldAlert size={36} color="#ef4444" />
          </div>
          <h1 className="page-title" style={{ fontSize: '1.75rem' }}>ResQ Hub</h1>
          <p className="page-subtitle">Emergency Response & Resource Coordination Platform</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Admin Username</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                className="form-control" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                style={{ paddingLeft: '2.5rem' }}
                required
              />
              <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="form-control" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                required
              />
              <KeyRound size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
              
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                style={{
                  position: 'absolute',
                  right: '0.85rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0
                }}
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
            Sign In as Administrator
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
