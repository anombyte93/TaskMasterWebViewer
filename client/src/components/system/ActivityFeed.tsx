import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { FileText, AlertCircle, Clock } from 'lucide-react';

export interface ActivityItem {
  id: string;
  time: string;
  action: string;
  type: 'task' | 'issue';
  title?: string;
}

export interface ActivityFeedProps {
  items: ActivityItem[];
  className?: string;
}

/**
 * ActivityFeed Component
 * 
 * Displays a chronological feed of recent system activity (task updates, issue changes).
 * Shows relative timestamps and icons based on activity type.
 * 
 * @example
 * <ActivityFeed items={[
 *   { id: 'task-1', time: '2024-01-01T12:00:00Z', action: 'Task #1: completed', type: 'task' }
 * ]} />
 */
export function ActivityFeed({ items, className }: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <div className={cn('rounded-lg border bg-card p-6', className)}>
        <p className="text-center text-sm text-muted-foreground">
          No recent activity
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-start gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
        >
          {/* Icon */}
          <div className="mt-0.5">
            {item.type === 'task' ? (
              <FileText className="h-4 w-4 text-blue-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-500" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium">{item.action}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {formatDistanceToNow(new Date(item.time), { addSuffix: true })}
                </span>
              </div>
            </div>
            {item.title && (
              <p className="text-xs text-muted-foreground line-clamp-1">{item.title}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
