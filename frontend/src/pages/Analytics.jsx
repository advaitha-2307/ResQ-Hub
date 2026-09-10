import React, { useState, useEffect } from 'react';
import { analyticsAPI, hospitalAPI } from '../services/api';
import StatCard from '../components/StatCard';
import {
  Activity, Clock, CheckCircle, AlertTriangle, Truck, 
  BarChart3, RefreshCw 
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

export const Analytics = () => {
  const [overview, setOverview] = useState(null);
  const [emergencyTypes, setEmergencyTypes] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [trends, setTrends] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [
        overviewRes, typesRes, prioRes, statusRes, trendRes, hospRes
      ] = await Promise.all([
        analyticsAPI.getOverview(),
        analyticsAPI.getEmergencyTypes(),
        analyticsAPI.getPriority(),
        analyticsAPI.getStatus(),
        analyticsAPI.getTrends(),
        hospitalAPI.getHospitals(),
      ]);

      setOverview(overviewRes.data);
      setEmergencyTypes(typesRes.data);
      setPriorities(prioRes.data);
      setStatuses(statusRes.data);
      setTrends(trendRes.data);
      setHospitals(hospRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    const handleWs = () => {
      fetchAnalytics();
    };
    window.addEventListener('resq_ws_event', handleWs);
    return () => window.removeEventListener('resq_ws_event', handleWs);
  }, []);

  const PRIORITY_COLORS = {
    CRITICAL: '#ef4444',
    HIGH: '#f97316',
    MEDIUM: '#eab308',
    LOW: '#10b981',
  };

  const STATUS_COLORS = {
    REPORTED: '#64748b',
    VERIFIED: '#3b82f6',
    ASSIGNED: '#8b5cf6',
    IN_PROGRESS: '#f59e0b',
    HOSPITAL_REACHED: '#06b6d4',
    RESOLVED: '#10b981',
    CANCELLED: '#94a3b8',
  };

  const TYPE_PALETTE = ['#2563eb', '#7c3aed', '#0891b2', '#ea580c', '#059669', '#db2777', '#475569'];

  return (
    <div className="page-body">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem' }}>Response & Resource Analytics</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Operational metrics, response velocity, and capacity utilization analytics
          </p>
        </div>

        <button onClick={fetchAnalytics} className="btn btn-outline btn-sm">
          <RefreshCw size={14} />
          <span>Sync Analytics</span>
        </button>
      </div>

      {/* Top Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <StatCard
          title="Average Response Time"
          value={`${overview?.average_response_time_minutes ?? 0}m`}
          icon={Clock}
          color="green"
          subtitle="From report to on-scene"
          badge="Target < 8m"
        />
        <StatCard
          title="Total Emergencies"
          value={overview?.total_emergencies ?? '—'}
          icon={Activity}
          color="blue"
          subtitle="Cumulative logged calls"
        />
        <StatCard
          title="Resolved Emergencies"
          value={overview?.resolved_emergencies ?? '—'}
          icon={CheckCircle}
          color="cyan"
          subtitle="Completed patient handoffs"
        />
        <StatCard
          title="Critical Emergencies"
          value={overview?.critical_emergencies ?? '—'}
          icon={AlertTriangle}
          color="red"
          subtitle="Required immediate triage"
        />
        <StatCard
          title="Fleet Utilization"
          value={`${overview?.ambulance_utilization_rate ?? 0}%`}
          icon={Truck}
          color="purple"
          subtitle={`${overview?.busy_ambulances ?? 0} active / ${overview?.available_ambulances ?? 0} available`}
        />
      </div>

      {/* 6 Recharts Charts Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* 1. Daily Emergency Trend */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Daily Emergency Incident Volume</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Daily reported incidents vs resolved incidents over the past 7 days
          </p>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                <Area type="monotone" dataKey="emergencies" name="Reported" stroke="#2563eb" fill="#dbeafe" strokeWidth={2} />
                <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" fill="#d1fae5" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Emergency Types */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Incidents by Emergency Category</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Accidents, medical, fire, and trauma distribution
          </p>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={emergencyTypes} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" name="Incidents" radius={[4, 4, 0, 0]}>
                  {emergencyTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={TYPE_PALETTE[index % TYPE_PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Emergency Priority */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Priority Severity Distribution</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Proportion of triage priority ratings
          </p>
          <div style={{ width: '100%', height: 260, display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={priorities}
                  dataKey="count"
                  nameKey="priority"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  label={({ priority, percent }) => `${priority}: ${(percent * 100).toFixed(0)}%`}
                >
                  {priorities.map((entry, index) => (
                    <Cell key={`p-${index}`} fill={PRIORITY_COLORS[entry.priority] || '#3b82f6'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Emergency Status Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Active Lifecycle Stage Distribution</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Incidents across pipeline stages
          </p>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={statuses} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis dataKey="status" type="category" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" name="Incidents" radius={[0, 4, 4, 0]}>
                  {statuses.map((entry, index) => (
                    <Cell key={`status-${index}`} fill={STATUS_COLORS[entry.status] || '#2563eb'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. Hospital Capacity Telemetry */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Hospital Bed Availability Comparison</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Available general beds vs ICU beds across facilities
          </p>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={hospitals} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="available_beds" name="General Beds" fill="#0891b2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="icu_beds" name="ICU Beds" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. Fleet Readiness */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Ambulance Fleet Status</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Available vs Dispatched vs In-Maintenance Fleet Units
          </p>
          <div style={{ width: '100%', height: 260, display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Available', value: overview?.available_ambulances || 0, color: '#10b981' },
                    { name: 'Busy / Assigned', value: overview?.busy_ambulances || 0, color: '#f59e0b' },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#f59e0b" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
