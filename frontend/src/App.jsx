import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Incidents from './pages/Incidents';
import CreateIncident from './pages/CreateIncident';
import IncidentDetails from './pages/IncidentDetails';
import Ambulances from './pages/Ambulances';
import Hospitals from './pages/Hospitals';
import Resources from './pages/Resources';
import Notifications from './pages/Notifications';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Users from './pages/Users';
import NotFound from './pages/NotFound';

import { X, AlertOctagon, Info, AlertTriangle } from 'lucide-react';

// Toast Container for live real-time notifications
const ToastContainer = () => {
  const { toasts, dismissToast } = useAuth();
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="live-toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`live-toast ${t.type || 'info'}`}>
          <div style={{ marginTop: '0.1rem' }}>
            {t.type === 'critical' ? (
              <AlertOctagon size={18} color="#ef4444" />
            ) : t.type === 'high' ? (
              <AlertTriangle size={18} color="#f97316" />
            ) : (
              <Info size={18} color="#3b82f6" />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{t.title}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.85, marginTop: '0.15rem' }}>{t.message}</div>
          </div>
          <button
            onClick={() => dismissToast(t.id)}
            style={{ background: 'none', color: '#94a3b8', padding: '0.1rem' }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

// Authenticated layout shell
const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main style={{ flex: 1 }}>{children}</main>
      </div>
      <ToastContainer />
    </div>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected authenticated routes */}
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/incidents"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Incidents />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/incidents/new"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <CreateIncident />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/incidents/:id"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <IncidentDetails />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ambulances"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'DISPATCHER']}>
                <AppLayout>
                  <Ambulances />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/hospitals"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'DISPATCHER', 'HOSPITAL_STAFF']}>
                <AppLayout>
                  <Hospitals />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'DISPATCHER', 'HOSPITAL_STAFF']}>
                <AppLayout>
                  <Resources />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Notifications />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'DISPATCHER']}>
                <AppLayout>
                  <Analytics />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Profile />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AppLayout>
                  <Users />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* 404 fallback */}
          <Route
            path="*"
            element={
              <AppLayout>
                <NotFound />
              </AppLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
