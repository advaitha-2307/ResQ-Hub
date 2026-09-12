import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RegisterIncidentPage from './pages/RegisterIncidentPage';
import IncidentListPage from './pages/IncidentListPage';

export default function App() {
  const [user, setUser] = useState({ username: 'admin', role: 'System Administrator' });
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    showToast(`Welcome back, ${userData.username}! Command Center active.`, 'success');
  };

  const handleLogout = () => {
    setUser(null);
    showToast('Logged out of ResQ Hub System.', 'success');
  };

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {user && <Navbar user={user} onLogout={handleLogout} />}

        <main style={{ flex: 1 }}>
          <Routes>
            <Route 
              path="/login" 
              element={user ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={handleLogin} />} 
            />
            <Route 
              path="/dashboard" 
              element={user ? <DashboardPage /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/register" 
              element={user ? <RegisterIncidentPage showToast={showToast} /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/incidents" 
              element={user ? <IncidentListPage showToast={showToast} /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="*" 
              element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
            />
          </Routes>
        </main>

        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </div>
    </BrowserRouter>
  );
}
