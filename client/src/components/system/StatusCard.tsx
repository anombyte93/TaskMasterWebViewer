import React from 'react';
import { cn } from '@/lib/utils';

export interface StatusCardProps {
  title: string;
  status: 'healthy' | 'active' | 'running' | 'error' | 'unknown';
  value: string | number;
  label: string;
  className?: string;
}

const statusColors = {
  healthy: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  active: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  running: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  unknown: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

/**
 * StatusCard Component
 * 
 * Displays a system health status card with title, status badge, value, and label.
 * Used in the System Monitoring Dashboard to show real-time system metrics.
 * 
 * @example
 * <StatusCard
 *   title="API Server"
 *   status="healthy"
 *   value="2ms"
 *   label="Avg Latency"
 * />
 */
export function StatusCard({ title, status, value, label, className }: StatusCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md',
        className
      )}
    >
      {/* Header with title and status badge */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </h3>
        <span
          className={cn(
            'rounded-full px-2 py-1 text-xs font-semibold uppercase',
            statusColors[status]
          )}
        >
          {status}
        </span>
      </div>

      {/* Value */}
      <div className="mb-1 text-3xl font-bold tracking-tight">{value}</div>

      {/* Label */}
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
