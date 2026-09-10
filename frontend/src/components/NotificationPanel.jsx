import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import { Bell, Check, Clock, AlertTriangle, Info, ShieldAlert, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationPanel = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getNotifications();
      setNotifications(res.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleWsEvent = (e) => {
      fetchNotifications();
    };
    window.addEventListener('resq_ws_event', handleWsEvent);
    return () => window.removeEventListener('resq_ws_event', handleWsEvent);
  }, []);

  const handleMarkRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'CRITICAL':
        return <AlertTriangle size={16} color="#ef4444" />;
      case 'WARNING':
        return <ShieldAlert size={16} color="#f97316" />;
      default:
        return <Info size={16} color="#2563eb" />;
    }
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: '0.5rem',
        width: '380px',
        maxWidth: '90vw',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-xl)',
        zIndex: 1000,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '0.85rem 1rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={18} color="var(--primary)" />
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Notifications</span>
        </div>
        <button
          onClick={handleMarkAllRead}
          style={{
            background: 'none',
            fontSize: '0.775rem',
            color: 'var(--primary)',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          <CheckCheck size={14} /> Mark all read
        </button>
      </div>

      <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading updates...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No notifications at this time
          </div>
        ) : (
          notifications.slice(0, 10).map((n) => (
            <div
              key={n.id}
              style={{
                padding: '0.85rem 1rem',
                borderBottom: '1px solid var(--border-color)',
                backgroundColor: n.is_read ? '#ffffff' : '#f0fdf4',
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start',
                transition: 'background 0.15s ease',
              }}
            >
              <div style={{ marginTop: '0.2rem' }}>{getTypeIcon(n.type)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {n.title}
                  </span>
                  {!n.is_read && (
                    <button
                      onClick={(e) => handleMarkRead(n.id, e)}
                      title="Mark as read"
                      style={{ background: 'none', color: 'var(--text-muted)' }}
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {n.message}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <Clock size={12} />
                  <span>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {n.incident_id && (
                    <Link
                      to={`/incidents/${n.incident_id}`}
                      onClick={onClose}
                      style={{ fontWeight: 600, color: 'var(--primary)', marginLeft: 'auto' }}
                    >
                      View Incident →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div
        style={{
          padding: '0.75rem',
          textAlign: 'center',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: '#f8fafc',
        }}
      >
        <Link
          to="/notifications"
          onClick={onClose}
          style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
};

export default NotificationPanel;
