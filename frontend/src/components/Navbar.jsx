import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, Search, LogOut, User as UserIcon, 
  Radio, Shield, Menu, X 
} from 'lucide-react';
import NotificationPanel from './NotificationPanel';
import { notificationAPI } from '../services/api';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const notifRef = useRef(null);

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationAPI.getNotifications({ unread_only: true });
      setUnreadCount(res.data.length);
    } catch (err) {
      // silent
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    const handleWs = () => {
      fetchUnreadCount();
    };
    window.addEventListener('resq_ws_event', handleWs);
    return () => window.removeEventListener('resq_ws_event', handleWs);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/incidents?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'ADMIN':
        return { bg: '#fee2e2', text: '#dc2626' };
      case 'DISPATCHER':
        return { bg: '#ede9fe', text: '#7c3aed' };
      case 'HOSPITAL_STAFF':
        return { bg: '#e0f2fe', text: '#0284c7' };
      default:
        return { bg: '#dcfce7', text: '#16a34a' };
    }
  };

  const roleStyle = getRoleBadgeStyle(user?.role);

  return (
    <header
      style={{
        height: '68px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.75rem',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Left section: mobile toggle & branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onToggleSidebar}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            color: 'var(--text-secondary)',
            padding: '0.4rem',
            borderRadius: 'var(--radius-sm)',
          }}
          aria-label="Toggle navigation"
        >
          <Menu size={22} />
        </button>

        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              backgroundColor: '#dc2626',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '1.25rem',
              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.35)',
            }}
          >
            +
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>ResQ<span style={{ color: '#2563eb' }}>Hub</span></span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '999px',
                }}
              >
                LIVE
              </span>
            </div>
          </div>
        </Link>
      </div>

      {/* Middle search */}
      <form
        onSubmit={handleSearchSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          maxWidth: '420px',
          width: '100%',
          margin: '0 1.5rem',
        }}
      >
        <div style={{ position: 'relative', width: '100%' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Search incident ID, location (e.g. Miyapur)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              paddingLeft: '2.4rem',
              height: '38px',
              fontSize: '0.875rem',
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: '999px',
            }}
          />
        </div>
      </form>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Real-time telemetry pulse */}
        <div
          title="Telemetry WebSocket Connected"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.775rem',
            color: '#16a34a',
            fontWeight: 600,
            padding: '0.3rem 0.6rem',
            borderRadius: '999px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
          }}
        >
          <Radio size={13} className="animate-pulse" />
          <span style={{ display: 'none', md: 'inline' }}>Connected</span>
        </div>

        {/* Notifications */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) fetchUnreadCount();
            }}
            style={{
              position: 'relative',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.15s ease',
            }}
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff',
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <NotificationPanel
              onClose={() => {
                setShowNotifications(false);
                fetchUnreadCount();
              }}
            />
          )}
        </div>

        {/* User Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Link
            to="/profile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              transition: 'background 0.15s ease',
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {user?.name || 'User'}
              </span>
              <span
                style={{
                  fontSize: '0.675rem',
                  fontWeight: 700,
                  backgroundColor: roleStyle.bg,
                  color: roleStyle.text,
                  padding: '0.05rem 0.4rem',
                  borderRadius: '4px',
                  marginTop: '0.15rem',
                  display: 'inline-block',
                  width: 'fit-content',
                }}
              >
                {user?.role || 'CITIZEN'}
              </span>
            </div>
          </Link>

          <button
            onClick={logout}
            title="Logout"
            style={{
              background: 'none',
              padding: '0.5rem',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
