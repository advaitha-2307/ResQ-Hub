import React from 'react';
import { AlertOctagon, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

const PRIORITY_CONFIG = {
  CRITICAL: { label: 'Critical', class: 'badge-priority-critical', icon: AlertOctagon },
  HIGH: { label: 'High', class: 'badge-priority-high', icon: ShieldAlert },
  MEDIUM: { label: 'Medium', class: 'badge-priority-medium', icon: AlertTriangle },
  LOW: { label: 'Low', class: 'badge-priority-low', icon: Info },
};

export const PriorityBadge = ({ priority }) => {
  const normalized = (priority || 'LOW').toUpperCase();
  const config = PRIORITY_CONFIG[normalized] || {
    label: priority,
    class: 'badge-priority-low',
    icon: Info,
  };
  const Icon = config.icon;

  return (
    <span className={`badge ${config.class}`}>
      <Icon size={12} strokeWidth={2.5} />
      <span>{config.label}</span>
    </span>
  );
};

export default PriorityBadge;
