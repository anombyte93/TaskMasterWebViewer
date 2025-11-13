import { useQuery } from '@tanstack/react-query';

interface SystemHealth {
  success: boolean;
  status: {
    api: string;
    database: string;
    mcp: string;
  };
  timestamp: string;
  uptime: number;
}

interface SystemStats {
  success: boolean;
  stats: {
    totalTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    completedTasks: number;
    totalIssues: number;
    openIssues: number;
    criticalIssues: number;
  };
  timestamp: string;
}

interface SystemPerformance {
  success: boolean;
  metrics: {
    avgResponseTime: number;
    requestsLastHour: number;
    errorsLastHour: number;
    uptime: number;
    uptimePercentage: number;
    timestamp: string;
  };
}

interface ActivityItem {
  id: string;
  time: string;
  action: string;
  type: 'task' | 'issue';
  title?: string;
}

interface SystemActivity {
  success: boolean;
  activity: ActivityItem[];
  timestamp: string;
}

/**
 * useSystemHealth Hook
 * Fetches system health status (API, DB, MCP)
 * Auto-refreshes every 5 seconds
 */
export function useSystemHealth() {
  return useQuery<SystemHealth>({
    queryKey: ['system', 'health'],
    queryFn: async () => {
      const response = await fetch('/api/system/health');
      if (!response.ok) {
        throw new Error('Failed to fetch system health');
      }
      return response.json();
    },
    refetchInterval: 5000, // Refresh every 5 seconds
    staleTime: 4000,
  });
}

/**
 * useSystemStats Hook
 * Fetches TaskMaster and Issue statistics
 * Auto-refreshes every 5 seconds
 */
export function useSystemStats() {
  return useQuery<SystemStats>({
    queryKey: ['system', 'stats'],
    queryFn: async () => {
      const response = await fetch('/api/system/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch system stats');
      }
      return response.json();
    },
    refetchInterval: 5000,
    staleTime: 4000,
  });
}

/**
 * useSystemPerformance Hook
 * Fetches API performance metrics
 * Auto-refreshes every 5 seconds
 */
export function useSystemPerformance() {
  return useQuery<SystemPerformance>({
    queryKey: ['system', 'performance'],
    queryFn: async () => {
      const response = await fetch('/api/system/performance');
      if (!response.ok) {
        throw new Error('Failed to fetch system performance');
      }
      return response.json();
    },
    refetchInterval: 5000,
    staleTime: 4000,
  });
}

/**
 * useSystemActivity Hook
 * Fetches recent system activity feed
 * Auto-refreshes every 5 seconds
 */
export function useSystemActivity() {
  return useQuery<SystemActivity>({
    queryKey: ['system', 'activity'],
    queryFn: async () => {
      const response = await fetch('/api/system/activity');
      if (!response.ok) {
        throw new Error('Failed to fetch system activity');
      }
      return response.json();
    },
    refetchInterval: 5000,
    staleTime: 4000,
  });
}
