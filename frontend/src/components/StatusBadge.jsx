import React from 'react';
import { 
  AlertCircle, CheckCircle2, Clock, Truck, 
  Building2, Activity, XCircle 
} from 'lucide-react';

const STATUS_CONFIG = {
  REPORTED: { label: 'Reported', class: 'badge-status-reported', icon: Clock },
  VERIFIED: { label: 'Verified', class: 'badge-status-verified', icon: AlertCircle },
  ASSIGNED: { label: 'Assigned', class: 'badge-status-assigned', icon: Truck },
  IN_PROGRESS: { label: 'In Progress', class: 'badge-status-in_progress', icon: Activity },
  HOSPITAL_REACHED: { label: 'Hospital Reached', class: 'badge-status-hospital_reached', icon: Building2 },
  RESOLVED: { label: 'Resolved', class: 'badge-status-resolved', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelled', class: 'badge-status-cancelled', icon: XCircle },
};

export const StatusBadge = ({ status }) => {
  const normalized = (status || 'REPORTED').toUpperCase();
  const config = STATUS_CONFIG[normalized] || {
    label: status,
    class: 'badge-status-reported',
    icon: Clock,
  };
  const Icon = config.icon;

  return (
    <span className={`badge ${config.class}`}>
      <Icon size={12} strokeWidth={2.5} />
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
