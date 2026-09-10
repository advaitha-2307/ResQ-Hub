import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('resq_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('resq_token'));
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const wsRef = useRef(null);

  // Helper to add toast
  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    const newToast = { id, ...toast };
    setToasts((prev) => [newToast, ...prev].slice(0, 5));

    // Auto dismiss after 6s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Connect WebSocket for real-time alerts
  useEffect(() => {
    if (!token) return;

    let socket;
    let pingInterval;

    const connectWS = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        // Keep alive heartbeat ping every 25s
        pingInterval = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send('ping');
          }
        }, 25000);
      };

      socket.onmessage = (event) => {
        try {
          if (event.data === 'pong') return;
          const data = JSON.parse(event.data);

          // Dispatch window event so individual pages can refresh
          window.dispatchEvent(new CustomEvent('resq_ws_event', { detail: data }));

          // Trigger in-app toast based on event type
          if (data.type === 'INCIDENT_CREATED') {
            addToast({
              title: `New Emergency: ${data.incident.emergency_type}`,
              message: `${data.incident.id} reported at ${data.incident.location}. Priority: ${data.incident.priority}`,
              type: data.incident.priority === 'CRITICAL' ? 'critical' : 'high',
            });
          } else if (data.type === 'AMBULANCE_ASSIGNED') {
            addToast({
              title: 'Ambulance Assigned',
              message: `Ambulance ${data.ambulance_id} dispatched to incident ${data.incident_id}.`,
              type: 'info',
            });
          } else if (data.type === 'HOSPITAL_ASSIGNED') {
            addToast({
              title: 'Hospital Selected',
              message: `Destination confirmed: ${data.hospital_name} for incident ${data.incident_id}.`,
              type: 'info',
            });
          } else if (data.type === 'HOSPITAL_CAPACITY_UPDATED') {
            if (data.status === 'FULL') {
              addToast({
                title: 'Hospital Capacity Alert',
                message: `Hospital ${data.hospital_id} has reached maximum bed capacity!`,
                type: 'critical',
              });
            }
          }
        } catch (e) {
          // Non-JSON message, safely ignore
        }
      };

      socket.onclose = () => {
        clearInterval(pingInterval);
      };

      socket.onerror = () => {
        socket.close();
      };
    };

    connectWS();

    return () => {
      clearInterval(pingInterval);
      if (socket) socket.close();
    };
  }, [token, addToast]);

  // Check current user session on mount
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('resq_token');
      if (savedToken) {
        try {
          const res = await authAPI.getMe();
          setUser(res.data);
          localStorage.setItem('resq_user', JSON.stringify(res.data));
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();

    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('resq_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('resq_unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { access_token, user: loggedUser } = res.data;
    localStorage.setItem('resq_token', access_token);
    localStorage.setItem('resq_user', JSON.stringify(loggedUser));
    setToken(access_token);
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    const { access_token, user: registeredUser } = res.data;
    localStorage.setItem('resq_token', access_token);
    localStorage.setItem('resq_user', JSON.stringify(registeredUser));
    setToken(access_token);
    setUser(registeredUser);
    return registeredUser;
  };

  const logout = () => {
    localStorage.removeItem('resq_token');
    localStorage.removeItem('resq_user');
    setToken(null);
    setUser(null);
    if (wsRef.current) {
      wsRef.current.close();
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    toasts,
    addToast,
    dismissToast,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
