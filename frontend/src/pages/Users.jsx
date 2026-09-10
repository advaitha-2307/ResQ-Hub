import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { Users as UsersIcon, Shield, RefreshCw, Edit3, X, Check } from 'lucide-react';

export const Users = () => {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');

  // Edit Role Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('CITIZEN');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getUsers();
      setUsersList(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenEdit = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      await userAPI.updateRole(selectedUser.id, newRole);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update user role');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = roleFilter
    ? usersList.filter((u) => u.role === roleFilter)
    : usersList;

  const getRoleStyle = (role) => {
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

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem' }}>User Authorization & Access Control</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Manage staff credentials, operational roles, and platform permissions
          </p>
        </div>

        <button onClick={fetchUsers} className="btn btn-outline btn-sm">
          <RefreshCw size={14} />
          <span>Sync Users</span>
        </button>
      </div>

      {/* Role Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['', 'ADMIN', 'DISPATCHER', 'HOSPITAL_STAFF', 'CITIZEN'].map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`btn btn-sm ${roleFilter === r ? 'btn-primary' : 'btn-outline'}`}
          >
            {r === '' ? 'All Accounts' : r}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading user records...
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Assigned Role</th>
                <th>Contact</th>
                <th>Registered</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const rStyle = getRoleStyle(u.role);
                return (
                  <tr key={u.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{u.id}</td>
                    <td style={{ fontWeight: 700 }}>{u.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: rStyle.bg,
                          color: rStyle.text,
                          padding: '0.2rem 0.55rem',
                          borderRadius: '999px',
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{u.phone || '—'}</td>
                    <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="btn btn-outline btn-sm"
                        style={{ gap: '0.25rem' }}
                      >
                        <Edit3 size={13} />
                        <span>Edit Role</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Role Modal */}
      {selectedUser && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card" style={{ maxWidth: '420px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem' }}>Modify User Role</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedUser.name}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'none' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveRole} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Select Operational Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <option value="CITIZEN">CITIZEN</option>
                  <option value="DISPATCHER">DISPATCHER</option>
                  <option value="HOSPITAL_STAFF">HOSPITAL_STAFF</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setSelectedUser(null)} className="btn btn-outline">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Saving...' : 'Update Authorization'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
