import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import { Link } from 'react-router-dom';
import {
  Bell, CheckCheck, Clock, AlertTriangle, 
  Info, ShieldAlert, Check, RefreshCw
} from 'lucide-react';

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationAPI.getNotifications({ unread_only: unreadOnly });
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleWs = () => {
      fetchNotifications();
    };
    window.addEventListener('resq_ws_event', handleWs);
    return () => window.removeEventListener('resq_ws_event', handleWs);
  }, [unreadOnly]);

  const handleMarkRead = async (id) => {
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
        return <AlertTriangle size={18} color="#ef4444" />;
      case 'WARNING':
        return <ShieldAlert size={18} color="#f97316" />;
      default:
        return <Info size={18} color="#2563eb" />;
    }
  };

  return (
    <div className="page-body">
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.65rem' }}>Notification Dispatch Center</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
              Broadcast alerts, hospital status logs, and ambulance dispatch updates
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={fetchNotifications} className="btn btn-outline btn-sm">
              <RefreshCw size={14} />
              <span>Sync</span>
            </button>
            <button onClick={handleMarkAllRead} className="btn btn-outline btn-sm">
              <CheckCheck size={14} />
              <span>Mark All Read</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <button
            onClick={() => setUnreadOnly(false)}
            className={`btn btn-sm ${!unreadOnly ? 'btn-primary' : 'btn-outline'}`}
          >
            All Updates
          </button>
          <button
            onClick={() => setUnreadOnly(true)}
            className={`btn btn-sm ${unreadOnly ? 'btn-primary' : 'btn-outline'}`}
          >
            Unread Only
          </button>
        </div>

        {/* Notification Feed */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Retrieving notification logs...
          </div>
        ) : notifications.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No notifications to display.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                className="card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start',
                  backgroundColor: n.is_read ? '#ffffff' : '#f0fdf4',
                  borderLeft: n.type === 'CRITICAL' ? '4px solid #ef4444' : n.type === 'WARNING' ? '4px solid #f97316' : '4px solid #2563eb',
                }}
              >
                <div style={{ marginTop: '0.15rem' }}>{getTypeIcon(n.type)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{n.title}</h3>
                    {!n.is_read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="btn btn-outline btn-sm"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        <Check size={12} /> Mark Read
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {n.message}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={13} />
                      <span>{new Date(n.created_at).toLocaleString()}</span>
                    </div>
                    {n.incident_id && (
                      <Link to={`/incidents/${n.incident_id}`} style={{ fontWeight: 600, color: 'var(--primary)' }}>
                        View Incident Details →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
