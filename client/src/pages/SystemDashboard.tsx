import React from 'react';
import { Loader2, Activity, Database, Server, Zap } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatusCard } from '@/components/system/StatusCard';
import { ActivityFeed } from '@/components/system/ActivityFeed';
import {
  useSystemHealth,
  useSystemStats,
  useSystemPerformance,
  useSystemActivity,
} from '@/hooks/useSystemMetrics';

/**
 * SystemDashboard Page
 *
 * Real-time system monitoring dashboard displaying:
 * - System health status (API, Database, MCP)
 * - TaskMaster statistics
 * - API performance metrics
 * - Recent activity feed
 *
 * Auto-refreshes every 5 seconds for live updates.
 * Mobile-first responsive design.
 */
export default function SystemDashboard() {
  const { data: health, isLoading: healthLoading } = useSystemHealth();
  const { data: stats, isLoading: statsLoading } = useSystemStats();
  const { data: performance, isLoading: performanceLoading } = useSystemPerformance();
  const { data: activity, isLoading: activityLoading } = useSystemActivity();

  const isLoading = healthLoading || statsLoading || performanceLoading || activityLoading;

  return (
    <MainLayout
      isSidebarOpen={false}
      onToggleSidebar={() => {}}
    >
      <div className="container mx-auto space-y-8 py-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">System Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time health and performance metrics
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Dashboard Content */}
        {!isLoading && (
          <>
            {/* Status Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <StatusCard
                title="API Server"
                status={health?.status.api === 'healthy' ? 'healthy' : 'error'}
                value={`${performance?.metrics.avgResponseTime || 0}ms`}
                label="Avg Response Time"
              />
              <StatusCard
                title="Database"
                status={health?.status.database === 'active' ? 'active' : 'error'}
                value={stats?.stats.totalTasks || 0}
                label="Total Tasks"
              />
              <StatusCard
                title="MCP Server"
                status={health?.status.mcp === 'running' ? 'running' : 'unknown'}
                value={performance?.metrics.requestsLastHour || 0}
                label="Requests (1h)"
              />
            </div>

            {/* TaskMaster Statistics */}
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">TaskMaster Statistics</h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{stats?.stats.totalTasks || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {stats?.stats.pendingTasks || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats?.stats.inProgressTasks || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats?.stats.completedTasks || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>

              <div className="mt-6 grid gap-6 border-t pt-6 md:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{stats?.stats.totalIssues || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Issues</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {stats?.stats.openIssues || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Open Issues</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {stats?.stats.criticalIssues || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Critical</p>
                </div>
              </div>
            </div>

            {/* API Performance */}
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">API Performance</h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{performance?.metrics.avgResponseTime || 0}ms</p>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{performance?.metrics.requestsLastHour || 0}</p>
                  <p className="text-sm text-muted-foreground">Requests (1h)</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {performance?.metrics.errorsLastHour || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Errors (1h)</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold">
                    {performance?.metrics.uptimePercentage.toFixed(1) || 0}%
                  </p>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Recent Activity</h2>
              </div>

              <ActivityFeed items={activity?.activity || []} />
            </div>

            {/* Live Update Indicator */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span>Live updates every 5 seconds</span>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
