import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import IncidentTable from '../components/IncidentTable';
import { 
  analyticsAPI, incidentAPI, hospitalAPI 
} from '../services/api';
import {
  AlertOctagon, AlertTriangle, Truck, Building2, 
  Activity, CheckCircle, PlusCircle, RefreshCw, Clock
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [emergencyTypes, setEmergencyTypes] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [
        statsRes, trendsRes, typesRes, prioRes, hospRes, incRes
      ] = await Promise.all([
        analyticsAPI.getOverview(),
        analyticsAPI.getTrends(),
        analyticsAPI.getEmergencyTypes(),
        analyticsAPI.getPriority(),
        hospitalAPI.getHospitals(),
        incidentAPI.getIncidents({ my_incidents: user?.role === 'CITIZEN' }),
      ]);

      setStats(statsRes.data);
      setTrends(trendsRes.data);
      setEmergencyTypes(typesRes.data);
      setPriorities(prioRes.data);
      setHospitals(hospRes.data);
      setRecentIncidents(incRes.data.slice(0, 6));
    } catch (err) {
      console.error('Failed to load dashboard telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Listen to real-time events from websocket
    const handleWs = (event) => {
      fetchDashboardData();
    };
    window.addEventListener('resq_ws_event', handleWs);
    return () => window.removeEventListener('resq_ws_event', handleWs);
  }, [user]);

  // Color constants for charts
  const PRIORITY_COLORS = {
    CRITICAL: '#ef4444',
    HIGH: '#f97316',
    MEDIUM: '#eab308',
    LOW: '#10b981',
  };

  const TYPE_PALETTE = ['#2563eb', '#7c3aed', '#0891b2', '#ea580c', '#059669', '#db2777', '#475569'];

  return (
    <div className="page-body">
      {/* Top Banner & Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.75rem', color: '#0f172a' }}>
              Command Operations Center
            </h1>
            <span
              style={{
                fontSize: '0.75rem',
                backgroundColor: '#dbeafe',
                color: '#1e40af',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
              }}
            >
              HYD SECTOR 1
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Welcome, <strong>{user?.name}</strong>. Real-time emergency dispatch and hospital bed telemetry.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={fetchDashboardData}
            className="btn btn-outline btn-sm"
            title="Refresh Telemetry"
          >
            <RefreshCw size={14} />
            <span>Sync</span>
          </button>

          <Link to="/incidents/new" className="btn btn-danger" style={{ fontWeight: 700 }}>
            <PlusCircle size={18} />
            <span>Report Emergency</span>
          </Link>
        </div>
      </div>

      {/* Six Key Operational Statistics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <StatCard
          title="Total Emergencies"
          value={stats?.total_emergencies ?? '—'}
          icon={Activity}
          color="blue"
          subtitle="All reported incidents"
        />
        <StatCard
          title="Active Emergencies"
          value={stats?.active_emergencies ?? '—'}
          icon={AlertOctagon}
          color="orange"
          subtitle="In response/coordination"
        />
        <StatCard
          title="Critical Emergencies"
          value={stats?.critical_emergencies ?? '—'}
          icon={AlertTriangle}
          color="red"
          badge="High Priority"
          subtitle="Immediate dispatch needed"
        />
        <StatCard
          title="Available Ambulances"
          value={stats?.available_ambulances ?? '—'}
          icon={Truck}
          color="green"
          subtitle="Ready for deployment"
        />
        <StatCard
          title="Busy Ambulances"
          value={stats?.busy_ambulances ?? '—'}
          icon={Truck}
          color="purple"
          subtitle={`${stats?.ambulance_utilization_rate ?? 0}% Fleet Utilization`}
        />
        <StatCard
          title="Available Beds"
          value={stats?.available_hospital_beds ?? '—'}
          icon={Building2}
          color="cyan"
          subtitle="Across network hospitals"
        />
      </div>

      {/* Charts Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        {/* Daily Trend Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Emergency Incident Trends</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Daily volume and resolution progress</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <Clock size={14} />
              <span>Past 7 Days</span>
            </div>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '0.85rem',
                  }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Area type="monotone" dataKey="emergencies" name="Reported" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorInc)" />
                <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Emergency Type Breakdown */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Emergency Categories</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Incident classifications breakdown</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={emergencyTypes} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '0.85rem',
                  }}
                />
                <Bar dataKey="count" name="Incidents" radius={[4, 4, 0, 0]}>
                  {emergencyTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={TYPE_PALETTE[index % TYPE_PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Incident Priority Severity</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Distribution of triage priority levels</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 260, display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={priorities}
                  dataKey="count"
                  nameKey="priority"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  label={({ priority, percent }) => `${priority} ${(percent * 100).toFixed(0)}%`}
                >
                  {priorities.map((entry, index) => (
                    <Cell
                      key={`prio-${index}`}
                      fill={PRIORITY_COLORS[entry.priority] || '#3b82f6'}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hospital Capacity Status */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Hospital Bed Availability</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Emergency vs ICU capacity across hospitals</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={hospitals.slice(0, 5)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '0.85rem',
                  }}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="available_beds" name="General Beds" fill="#0891b2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="icu_beds" name="ICU Beds" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Emergencies Table Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem' }}>Recent Emergency Incidents</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Live response queue and field assignments</p>
          </div>
          <Link to="/incidents" className="btn btn-outline btn-sm">
            View All Emergencies →
          </Link>
        </div>

        <IncidentTable incidents={recentIncidents} loading={loading} />
      </div>
    </div>
  );
};

export default Dashboard;
